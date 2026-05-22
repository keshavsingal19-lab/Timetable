export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state'); // This is the rollNo

  if (!code || !state) {
    return Response.redirect(url.origin + '/?error=missing_code_or_state', 302);
  }

  const rollNo = state;
  const redirectUri = `${url.origin}/api/auth/google_sheets_callback`;

  try {
    // 1. Exchange code for token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      })
    });
    
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return Response.redirect(url.origin + '/?error=token_exchange_failed', 302);
    }

    const { access_token, refresh_token, expires_in } = tokenData;

    // 2. Get user's email
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    const userInfo = await userInfoRes.json();
    const email = userInfo.email;

    // 3. Create Spreadsheet
    const createSheetRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          title: `SRCC Attendance Tracker — ${rollNo}`
        },
        sheets: [
          {
            properties: { title: "Attendance Log", sheetId: 0 },
            data: [{
              startRow: 0,
              startColumn: 0,
              rowData: [{
                values: [
                  { userEnteredValue: { stringValue: "Date" } },
                  { userEnteredValue: { stringValue: "Day" } },
                  { userEnteredValue: { stringValue: "Time Slot" } },
                  { userEnteredValue: { stringValue: "Subject" } },
                  { userEnteredValue: { stringValue: "Room" } },
                  { userEnteredValue: { stringValue: "Teacher" } },
                  { userEnteredValue: { stringValue: "Type" } },
                  { userEnteredValue: { stringValue: "Status" } },
                  { userEnteredValue: { stringValue: "Marked At" } }
                ]
              }]
            }]
          },
          {
            properties: { title: "Summary", sheetId: 1 },
            data: [{
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: [
                    { userEnteredValue: { stringValue: "Metric" } },
                    { userEnteredValue: { stringValue: "Value" } }
                  ]
                },
                {
                  values: [
                    { userEnteredValue: { stringValue: "Total Classes" } },
                    { userEnteredValue: { formulaValue: "=COUNTA('Attendance Log'!A2:A)" } }
                  ]
                },
                {
                  values: [
                    { userEnteredValue: { stringValue: "Present" } },
                    { userEnteredValue: { formulaValue: "=COUNTIF('Attendance Log'!H2:H, \"Present\")" } }
                  ]
                },
                {
                  values: [
                    { userEnteredValue: { stringValue: "Absent" } },
                    { userEnteredValue: { formulaValue: "=COUNTIF('Attendance Log'!H2:H, \"Absent\")" } }
                  ]
                },
                {
                  values: [
                    { userEnteredValue: { stringValue: "Cancelled" } },
                    { userEnteredValue: { formulaValue: "=COUNTIF('Attendance Log'!H2:H, \"Cancelled\")" } }
                  ]
                },
                {
                  values: [
                    { userEnteredValue: { stringValue: "Overall %" } },
                    { userEnteredValue: { formulaValue: "=IF(B2>0, ROUND((B3/(B2-B5))*100, 2), 0)" } } // (Present / (Total - Cancelled)) * 100
                  ]
                }
              ]
            }]
          }
        ]
      })
    });
    
    const sheetData = await createSheetRes.json();
    if (!sheetData.spreadsheetId) {
      return Response.redirect(url.origin + '/?error=sheet_creation_failed', 302);
    }

    const spreadsheetId = sheetData.spreadsheetId;
    const spreadsheetUrl = sheetData.spreadsheetUrl;
    const tokenExpiry = Math.floor(Date.now() / 1000) + (expires_in || 3600);

    // 4. Save to DB
    const db = env.DB;
    // We use INSERT OR REPLACE to handle reconnects
    await db.prepare(`
      INSERT INTO student_sheets (roll_no, google_email, access_token, refresh_token, token_expiry, spreadsheet_id, spreadsheet_url, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(roll_no) DO UPDATE SET
        google_email=excluded.google_email,
        access_token=excluded.access_token,
        refresh_token=COALESCE(excluded.refresh_token, student_sheets.refresh_token),
        token_expiry=excluded.token_expiry,
        spreadsheet_id=excluded.spreadsheet_id,
        spreadsheet_url=excluded.spreadsheet_url,
        updated_at=datetime('now')
    `).bind(
      rollNo, email, access_token, refresh_token || null, tokenExpiry, spreadsheetId, spreadsheetUrl
    ).run();

    return Response.redirect(url.origin + '/?view=attendance', 302);
  } catch (error) {
    return Response.redirect(url.origin + '/?error=server_error', 302);
  }
}
