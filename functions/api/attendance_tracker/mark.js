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
    // skip header row — find existing entry for same date + timeSlot + subject
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (row[0] === date && row[2] === timeSlot) {
        rowIdx = i + 1; // 1-based index for Sheets API
        break;
      }
    }

    const nowStr = new Date().toISOString();
    const effectiveType = classType || 'Lecture';
    const rowValues = [date, day, timeSlot, subject, room, teacher || '', effectiveType, status, nowStr];

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
    // Get unique subject+type pairs from the log
    const updatedRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Attendance%20Log!D2:G`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const updatedData = await updatedRes.json();
    const pairsMap = new Map();
    
    // Fetch actual timetable frequency to pre-populate pairsMap
    // This ensures even subjects with 0 marked classes get Summary/Projection rows
    let timetableFreq = {};
    try {
      const freqRes = await env.DB.prepare(`
        SELECT s.subject_name, s.type as class_type, count(*) as count
        FROM student_sections ss
        JOIN sections s ON ss.section_id = s.id
        JOIN timetable t ON t.section_id = s.id
        WHERE ss.roll_no = ?
        GROUP BY s.subject_name, s.type
      `).bind(rollNo).all();
      
      if (freqRes && freqRes.results) {
        freqRes.results.forEach(row => {
          const key = `${row.subject_name}|${row.class_type}`;
          timetableFreq[`${row.subject_name} (${row.class_type})`] = row.count;
          if (!pairsMap.has(key)) pairsMap.set(key, { subject: row.subject_name, type: row.class_type });
        });
      }
    } catch (e) {
      console.warn("Failed to fetch timetable freq", e);
    }

    // Add subjects actually marked in the log (e.g. Extra classes not in timetable)
    for (const row of (updatedData.values || [])) {
      const subj = row[0];
      const type = row[3] || 'Lecture'; // Column G is index 3 relative to D
      if (subj) {
        const key = `${subj}|${type}`;
        if (!pairsMap.has(key)) pairsMap.set(key, { subject: subj, type });
      }
    }
    const allPairs = [...pairsMap.values()].sort((a, b) => `${a.subject} ${a.type}`.localeCompare(`${b.subject} ${b.type}`));

    // Build Subject Summary rows with formulas — now grouped by Subject + Type
    const summaryRows = [
      ['Subject', 'Type', 'Total', 'Present', 'Absent', 'Cancelled', 'Attendance %', 'Status']
    ];
    
    allPairs.forEach(pair => {
      const rowNum = summaryRows.length + 1;
      summaryRows.push([
        pair.subject,
        pair.type,
        `=COUNTIFS('Attendance Log'!D:D, "${pair.subject}", 'Attendance Log'!G:G, "${pair.type}")`,
        `=COUNTIFS('Attendance Log'!D:D, "${pair.subject}", 'Attendance Log'!G:G, "${pair.type}", 'Attendance Log'!H:H, "Present")`,
        `=COUNTIFS('Attendance Log'!D:D, "${pair.subject}", 'Attendance Log'!G:G, "${pair.type}", 'Attendance Log'!H:H, "Absent")`,
        `=COUNTIFS('Attendance Log'!D:D, "${pair.subject}", 'Attendance Log'!G:G, "${pair.type}", 'Attendance Log'!H:H, "Cancelled")`,
        `=IF((C${rowNum}-F${rowNum})>0, ROUND(D${rowNum}/(C${rowNum}-F${rowNum})*100, 1)&"%", "N/A")`,
        `=IF(VALUE(SUBSTITUTE(G${rowNum}, "%", ""))>=66.67, "✅ On Track", "⚠️ Below Target")`
      ]);
    });

    // Clear and write Subject Summary
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Subject%20Summary!A:H:clear`, {
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

    // Default: 16 total weeks, 14 working weeks (minus 2 non-working)
    const WORKING_WEEKS = 14;
    const projRows = [
      ['Subject', 'Type', 'Current %', 'Freq/Wk', 'Total (Est.)', 'Attended', 'Remaining', 'Must Attend (66.67%)', 'Can Skip', 'Verdict']
    ];

    allPairs.forEach((pair, idx) => {
      const summaryRow = idx + 2; // row number in the summary sheet
      const projRow = projRows.length + 1;
      const key = `${pair.subject} (${pair.type})`;
      const exactFreq = timetableFreq[key];
      
      const freqFormula = exactFreq !== undefined ? 
        `${exactFreq}` : 
        `=MAX(1, ROUND('Subject Summary'!C${summaryRow}/${weeksElapsed}, 0))`;

      projRows.push([
        pair.subject,
        pair.type,
        `='Subject Summary'!G${summaryRow}`,
        freqFormula,
        `=D${projRow}*${WORKING_WEEKS}`,
        `='Subject Summary'!D${summaryRow}`,
        `=MAX(0, E${projRow}-F${projRow})`,
        `=MAX(0, CEILING(0.6667*(E${projRow}-'Subject Summary'!F${summaryRow})-F${projRow}, 1))`,
        `=MAX(0, G${projRow}-H${projRow})`,
        `=IF(H${projRow}<=G${projRow}, "✅ Safe", "⚠️ At Risk")`
      ]);
    });

    // Clear and write Projections
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Projections!A:J:clear`, {
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
