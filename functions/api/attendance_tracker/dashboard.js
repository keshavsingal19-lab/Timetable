import jwt from '@tsndr/cloudflare-worker-jwt';
import { getValidToken } from './_helpers.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const isValid = await jwt.verify(token, env.JWT_SECRET || 'secret-key-fallback');
  if (!isValid) return new Response(JSON.stringify({ error: "Invalid session" }), { status: 401 });

  const { payload } = jwt.decode(token);
  const rollNo = payload.rollNo;

  if (!rollNo) return new Response(JSON.stringify({ error: "Missing roll no" }), { status: 400 });

  try {
    const { accessToken, spreadsheetId } = await getValidToken(env, rollNo);

    // Get all rows
    const getRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Attendance Log!A:I`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!getRes.ok) throw new Error('Failed to fetch from Google Sheets');
    
    const sheetData = await getRes.json();
    const values = sheetData.values || [];

    // Compute metrics
    const dataRows = values.slice(1); // skip header
    let present = 0;
    let absent = 0;
    let cancelled = 0;
    
    const subjectStats = {};
    const recentEntries = [];

    // We want to sort the data rows by marked_at descending for recent entries,
    // but the spreadsheet is usually chronological by date. 
    // We'll just reverse the array for recent entries.
    for (const row of dataRows) {
      const subj = row[3];
      const stat = row[7];
      
      if (stat === 'Present') present++;
      if (stat === 'Absent') absent++;
      if (stat === 'Cancelled') cancelled++;

      if (subj) {
        if (!subjectStats[subj]) subjectStats[subj] = { name: subj, total: 0, present: 0, cancelled: 0 };
        subjectStats[subj].total++;
        if (stat === 'Present') subjectStats[subj].present++;
        if (stat === 'Cancelled') subjectStats[subj].cancelled++;
      }
    }

    // Top 5 recent
    for (let i = dataRows.length - 1; i >= Math.max(0, dataRows.length - 10); i--) {
      recentEntries.push({
        date: dataRows[i][0],
        timeSlot: dataRows[i][2],
        subject: dataRows[i][3],
        status: dataRows[i][7]
      });
    }

    // Convert subject stats to array
    const subjects = Object.values(subjectStats).map(s => {
      const validClasses = s.total - s.cancelled;
      return {
        ...s,
        percentage: validClasses > 0 ? ((s.present / validClasses) * 100).toFixed(1) : 0
      };
    });

    const validTotal = present + absent; // excluding cancelled
    const overallPercentage = validTotal > 0 ? ((present / validTotal) * 100).toFixed(1) : 0;

    return new Response(JSON.stringify({
      totalClasses: dataRows.length,
      present,
      absent,
      cancelled,
      overallPercentage,
      subjects,
      recentEntries
    }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
