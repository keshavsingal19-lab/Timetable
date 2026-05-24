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
    const { accessToken, spreadsheetId } = await getValidToken(env, rollNo);

    // Get the sheet ID to clear
    const getRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!getRes.ok) {
      throw new Error('Failed to fetch spreadsheet details');
    }

    const sheetData = await getRes.json();
    const attendanceSheet = sheetData.sheets.find((s) => s.properties.title === 'Attendance Log');
    
    if (!attendanceSheet) {
      throw new Error('Attendance Log sheet not found');
    }

    // Determine how many rows exist so we can clear them (except header)
    const rowCount = attendanceSheet.properties.gridProperties.rowCount;

    if (rowCount > 1) {
      // Clear all rows from row 2 onwards in Attendance Log
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Attendance%20Log!A2:I:clear`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      // Also clear Subject Summary (except header)
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Subject%20Summary!A2:H:clear`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      // Also clear Projections (except header)
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Projections!A2:J:clear`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
