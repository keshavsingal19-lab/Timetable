import jwt from '@tsndr/cloudflare-worker-jwt';
import { getValidToken } from './_helpers.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const isValid = await jwt.verify(token, env.JWT_SECRET || 'secret-key-fallback');
  if (!isValid) return new Response(JSON.stringify({ error: "Invalid session" }), { status: 401 });

  const { payload } = jwt.decode(token);
  const rollNo = payload.rollNo;

  if (!rollNo) return new Response(JSON.stringify({ error: "Missing roll no" }), { status: 400 });

  try {
    const body = await request.json();
    const { date, day, timeSlot, subject, room, teacher, classType, status } = body;
    
    if (!date || !timeSlot || !subject || !status) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const { accessToken, spreadsheetId } = await getValidToken(env, rollNo);

    // 1. Get all rows to check if this slot is already marked
    const getRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Attendance%20Log!A:I`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const sheetData = await getRes.json();
    const values = sheetData.values || [];

    let rowIdx = -1;
    // skip header row — find existing entry for same date + timeSlot
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (row[0] === date && row[2] === timeSlot) {
        rowIdx = i + 1; // 1-based index for Sheets API
        break;
      }
    }

    const nowStr = new Date().toISOString();
    const rowValues = [date, day, timeSlot, subject, room, teacher || '', classType || '', status, nowStr];

    if (rowIdx > 0) {
      // Update existing row
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Attendance%20Log!A${rowIdx}:I${rowIdx}?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values: [rowValues] })
      });
    } else {
      // Append new row
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Attendance%20Log!A:A:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values: [rowValues] })
      });
    }

    // 2. Rebuild the Subject Summary tab with live formulas
    // First, re-read the updated data to get unique subjects
    const updatedRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Attendance%20Log!D2:D`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const updatedData = await updatedRes.json();
    const allSubjects = [...new Set((updatedData.values || []).map(r => r[0]).filter(Boolean))].sort();

    // Build Subject Summary rows with formulas
    const summaryRows = [
      ['Subject', 'Total', 'Present', 'Absent', 'Cancelled', 'Attendance %', 'Status']
    ];
    
    allSubjects.forEach(subj => {
      summaryRows.push([
        subj,
        `=COUNTIF('Attendance Log'!D:D, "${subj}")`,
        `=COUNTIFS('Attendance Log'!D:D, "${subj}", 'Attendance Log'!H:H, "Present")`,
        `=COUNTIFS('Attendance Log'!D:D, "${subj}", 'Attendance Log'!H:H, "Absent")`,
        `=COUNTIFS('Attendance Log'!D:D, "${subj}", 'Attendance Log'!H:H, "Cancelled")`,
        `=IF((B${summaryRows.length + 1}-E${summaryRows.length + 1})>0, ROUND(C${summaryRows.length + 1}/(B${summaryRows.length + 1}-E${summaryRows.length + 1})*100, 1)&"%", "N/A")`,
        `=IF(VALUE(SUBSTITUTE(F${summaryRows.length + 1}, "%", ""))>=66.67, "✅ On Track", "⚠️ Below Target")`
      ]);
    });

    // Clear and write Subject Summary
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Subject%20Summary!A:G:clear`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Subject%20Summary!A1?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: summaryRows })
    });

    // 3. Rebuild Projections tab
    const WEEKS_IN_SESSION = 16;
    // Calculate weeks elapsed from the data
    const allDatesRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Attendance%20Log!A2:A`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const allDatesData = await allDatesRes.json();
    const allDates = [...new Set((allDatesData.values || []).map(r => r[0]).filter(Boolean))].sort();
    
    let weeksElapsed = 1;
    if (allDates.length > 1) {
      const first = new Date(allDates[0]);
      const last = new Date(allDates[allDates.length - 1]);
      weeksElapsed = Math.max(1, Math.ceil((last - first) / (7 * 24 * 60 * 60 * 1000)));
    }

    const projRows = [
      ['Subject', 'Current %', 'Total (Session Est.)', 'Attended', 'Remaining', 'Must Attend (for 66.67%)', 'Can Skip', 'Verdict']
    ];

    allSubjects.forEach((subj, idx) => {
      const row = idx + 2; // row number in the summary sheet
      projRows.push([
        subj,
        `='Subject Summary'!F${row}`,
        `=MAX(1, ROUND('Subject Summary'!B${row}/${weeksElapsed}, 0))*${WEEKS_IN_SESSION}`,
        `='Subject Summary'!C${row}`,
        `=MAX(0, C${projRows.length + 1}-D${projRows.length + 1})`,
        `=MAX(0, CEILING(0.6667*(C${projRows.length + 1}-'Subject Summary'!E${row})-D${projRows.length + 1}, 1))`,
        `=MAX(0, E${projRows.length + 1}-F${projRows.length + 1})`,
        `=IF(F${projRows.length + 1}<=E${projRows.length + 1}, "✅ Safe", "⚠️ At Risk")`
      ]);
    });

    // Clear and write Projections
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Projections!A:H:clear`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Projections!A1?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: projRows })
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
