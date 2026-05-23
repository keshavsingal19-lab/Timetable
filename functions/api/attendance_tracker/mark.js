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

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
