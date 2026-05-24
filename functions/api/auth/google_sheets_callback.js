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

    // 3. Check if student already has a connected spreadsheet
    const db = env.DB;
    const existingRow = await db.prepare('SELECT spreadsheet_id, spreadsheet_url FROM student_sheets WHERE roll_no = ?').bind(rollNo).first();

    let spreadsheetId, spreadsheetUrl;

    if (existingRow && existingRow.spreadsheet_id) {
      // Try to verify the existing spreadsheet is still accessible
      const verifyRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${existingRow.spreadsheet_id}?fields=spreadsheetId`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      if (verifyRes.ok) {
        // Existing spreadsheet is still accessible — reuse it
        spreadsheetId = existingRow.spreadsheet_id;
        spreadsheetUrl = existingRow.spreadsheet_url;
      }
    }

    if (!spreadsheetId) {
      // Not in DB or inaccessible. Let's search Google Drive to see if the file exists.
      const queryName = `SRCC Attendance Tracker — ${rollNo}`;
      const queryStr = `name='${queryName}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`;
      const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(queryStr)}&fields=files(id,webViewLink)`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      const searchData = await searchRes.json();
      
      if (searchData.files && searchData.files.length > 0) {
        spreadsheetId = searchData.files[0].id;
        spreadsheetUrl = searchData.files[0].webViewLink;
      } else {
        // No existing connection and not in Drive — create a new spreadsheet
        const result = await createProfessionalSpreadsheet(access_token, rollNo);
        spreadsheetId = result.spreadsheetId;
        spreadsheetUrl = result.spreadsheetUrl;
      }
    }

    const tokenExpiry = Math.floor(Date.now() / 1000) + (expires_in || 3600);

    // 4. Save to DB
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
    console.error('Google Sheets callback error:', error);
    return Response.redirect(url.origin + '/?error=server_error', 302);
  }
}

// ─────────────────────────────────────────────────────────────
// Creates a professional multi-tab spreadsheet with formatting
// ─────────────────────────────────────────────────────────────
async function createProfessionalSpreadsheet(accessToken, rollNo) {
  const NAVY = { red: 0.09, green: 0.11, blue: 0.22 };
  const GOLD = { red: 0.95, green: 0.77, blue: 0.06 };
  const WHITE = { red: 1, green: 1, blue: 1 };
  const LIGHT_GRAY = { red: 0.96, green: 0.96, blue: 0.97 };
  const GREEN_BG = { red: 0.85, green: 0.95, blue: 0.85 };
  const RED_BG = { red: 0.98, green: 0.85, blue: 0.85 };
  const GRAY_BG = { red: 0.93, green: 0.93, blue: 0.93 };

  const headerFormat = {
    backgroundColor: NAVY,
    textFormat: { bold: true, fontSize: 11, foregroundColor: WHITE, fontFamily: 'Inter' },
    horizontalAlignment: 'CENTER',
    verticalAlignment: 'MIDDLE',
    padding: { top: 8, bottom: 8, left: 6, right: 6 }
  };

  // ── 1. Create the spreadsheet with all tabs ──
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: `SRCC Attendance Tracker — ${rollNo}`,
        locale: 'en_US',
        defaultFormat: {
          textFormat: { fontFamily: 'Inter', fontSize: 10 }
        }
      },
      sheets: [
        {
          properties: { title: 'Attendance Log', sheetId: 0, gridProperties: { frozenRowCount: 1 } },
          data: [{
            startRow: 0,
            startColumn: 0,
            rowData: [{
              values: [
                { userEnteredValue: { stringValue: 'Date' }, userEnteredFormat: headerFormat },
                { userEnteredValue: { stringValue: 'Day' }, userEnteredFormat: headerFormat },
                { userEnteredValue: { stringValue: 'Time Slot' }, userEnteredFormat: headerFormat },
                { userEnteredValue: { stringValue: 'Subject' }, userEnteredFormat: headerFormat },
                { userEnteredValue: { stringValue: 'Room' }, userEnteredFormat: headerFormat },
                { userEnteredValue: { stringValue: 'Teacher' }, userEnteredFormat: headerFormat },
                { userEnteredValue: { stringValue: 'Type' }, userEnteredFormat: headerFormat },
                { userEnteredValue: { stringValue: 'Status' }, userEnteredFormat: headerFormat },
                { userEnteredValue: { stringValue: 'Marked At' }, userEnteredFormat: headerFormat }
              ]
            }]
          }]
        },
        {
          properties: { title: 'Subject Summary', sheetId: 1, gridProperties: { frozenRowCount: 1 } },
          data: [{
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: [
                  { userEnteredValue: { stringValue: 'Subject' }, userEnteredFormat: headerFormat },
                  { userEnteredValue: { stringValue: 'Type' }, userEnteredFormat: headerFormat },
                  { userEnteredValue: { stringValue: 'Total' }, userEnteredFormat: headerFormat },
                  { userEnteredValue: { stringValue: 'Present' }, userEnteredFormat: headerFormat },
                  { userEnteredValue: { stringValue: 'Absent' }, userEnteredFormat: headerFormat },
                  { userEnteredValue: { stringValue: 'Cancelled' }, userEnteredFormat: headerFormat },
                  { userEnteredValue: { stringValue: 'Attendance %' }, userEnteredFormat: headerFormat },
                  { userEnteredValue: { stringValue: 'Status' }, userEnteredFormat: headerFormat }
                ]
              }
            ]
          }]
        },
        {
          properties: { title: 'Projections', sheetId: 2, gridProperties: { frozenRowCount: 1 } },
          data: [{
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: [
                  { userEnteredValue: { stringValue: 'Subject' }, userEnteredFormat: headerFormat },
                  { userEnteredValue: { stringValue: 'Type' }, userEnteredFormat: headerFormat },
                  { userEnteredValue: { stringValue: 'Current %' }, userEnteredFormat: headerFormat },
                  { userEnteredValue: { stringValue: 'Freq/Wk' }, userEnteredFormat: headerFormat },
                  { userEnteredValue: { stringValue: 'Total (Est.)' }, userEnteredFormat: headerFormat },
                  { userEnteredValue: { stringValue: 'Attended' }, userEnteredFormat: headerFormat },
                  { userEnteredValue: { stringValue: 'Remaining' }, userEnteredFormat: headerFormat },
                  { userEnteredValue: { stringValue: 'Must Attend (for 66.67%)' }, userEnteredFormat: headerFormat },
                  { userEnteredValue: { stringValue: 'Can Skip' }, userEnteredFormat: headerFormat },
                  { userEnteredValue: { stringValue: 'Verdict' }, userEnteredFormat: headerFormat }
                ]
              }
            ]
          }]
        },
        {
          properties: { title: 'Dashboard', sheetId: 3, gridProperties: { frozenRowCount: 0 } },
          data: [{
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: [
                  { userEnteredValue: { stringValue: `SRCC Attendance Dashboard — ${rollNo}` }, userEnteredFormat: { ...headerFormat, textFormat: { ...headerFormat.textFormat, fontSize: 16 } } },
                  { userEnteredValue: { stringValue: '' }, userEnteredFormat: { backgroundColor: NAVY } },
                  { userEnteredValue: { stringValue: '' }, userEnteredFormat: { backgroundColor: NAVY } },
                  { userEnteredValue: { stringValue: '' }, userEnteredFormat: { backgroundColor: NAVY } }
                ]
              },
              { values: [{ userEnteredValue: { stringValue: '' } }] },
              {
                values: [
                  { userEnteredValue: { stringValue: 'Metric' }, userEnteredFormat: { ...headerFormat, backgroundColor: { red: 0.2, green: 0.2, blue: 0.35 } } },
                  { userEnteredValue: { stringValue: 'Value' }, userEnteredFormat: { ...headerFormat, backgroundColor: { red: 0.2, green: 0.2, blue: 0.35 } } }
                ]
              },
              {
                values: [
                  { userEnteredValue: { stringValue: 'Total Classes Logged' }, userEnteredFormat: { textFormat: { bold: true, fontFamily: 'Inter' } } },
                  { userEnteredValue: { formulaValue: "=COUNTA('Attendance Log'!A2:A)" } }
                ]
              },
              {
                values: [
                  { userEnteredValue: { stringValue: '✅ Present' }, userEnteredFormat: { textFormat: { bold: true, fontFamily: 'Inter' }, backgroundColor: GREEN_BG } },
                  { userEnteredValue: { formulaValue: "=COUNTIF('Attendance Log'!H2:H, \"Present\")" }, userEnteredFormat: { backgroundColor: GREEN_BG } }
                ]
              },
              {
                values: [
                  { userEnteredValue: { stringValue: '❌ Absent' }, userEnteredFormat: { textFormat: { bold: true, fontFamily: 'Inter' }, backgroundColor: RED_BG } },
                  { userEnteredValue: { formulaValue: "=COUNTIF('Attendance Log'!H2:H, \"Absent\")" }, userEnteredFormat: { backgroundColor: RED_BG } }
                ]
              },
              {
                values: [
                  { userEnteredValue: { stringValue: '🚫 Cancelled' }, userEnteredFormat: { textFormat: { bold: true, fontFamily: 'Inter' }, backgroundColor: GRAY_BG } },
                  { userEnteredValue: { formulaValue: "=COUNTIF('Attendance Log'!H2:H, \"Cancelled\")" }, userEnteredFormat: { backgroundColor: GRAY_BG } }
                ]
              },
              { values: [{ userEnteredValue: { stringValue: '' } }] },
              {
                values: [
                  { userEnteredValue: { stringValue: '📊 Overall Attendance %' }, userEnteredFormat: { textFormat: { bold: true, fontSize: 13, fontFamily: 'Inter' } } },
                  { userEnteredValue: { formulaValue: "=IF(B4>0, ROUND((B5/(B4-B7))*100, 2)&\"%\", \"N/A\")" }, userEnteredFormat: { textFormat: { bold: true, fontSize: 13, fontFamily: 'Inter' } } }
                ]
              },
              { values: [{ userEnteredValue: { stringValue: '' } }] },
              {
                values: [
                  { userEnteredValue: { stringValue: '⚠️ Disclaimer' }, userEnteredFormat: { textFormat: { bold: true, fontFamily: 'Inter', foregroundColor: { red: 0.8, green: 0.2, blue: 0.2 } } } }
                ]
              },
              {
                values: [
                  { userEnteredValue: { stringValue: 'This tracker is based entirely on manual markings and is for personal record only. It does not represent official college attendance records.' }, userEnteredFormat: { textFormat: { italic: true, fontFamily: 'Inter', fontSize: 9, foregroundColor: { red: 0.5, green: 0.5, blue: 0.5 } } } }
                ]
              }
            ]
          }]
        }
      ]
    })
  });

  const sheetData = await createRes.json();
  if (!sheetData.spreadsheetId) {
    throw new Error('Sheet creation failed: ' + JSON.stringify(sheetData));
  }

  const spreadsheetId = sheetData.spreadsheetId;

  // ── 2. Apply formatting: column widths, data validation, conditional formatting ──
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        // ── Column widths for Attendance Log ──
        ...[ 110, 100, 180, 200, 70, 150, 90, 100, 200 ].map((w, i) => ({
          updateDimensionProperties: {
            range: { sheetId: 0, dimension: 'COLUMNS', startIndex: i, endIndex: i + 1 },
            properties: { pixelSize: w },
            fields: 'pixelSize'
          }
        })),

        // ── Row height for header ──
        {
          updateDimensionProperties: {
            range: { sheetId: 0, dimension: 'ROWS', startIndex: 0, endIndex: 1 },
            properties: { pixelSize: 40 },
            fields: 'pixelSize'
          }
        },

        // ── Data Validation: Status column (H) dropdown ──
        {
          setDataValidation: {
            range: { sheetId: 0, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 7, endColumnIndex: 8 },
            rule: {
              condition: {
                type: 'ONE_OF_LIST',
                values: [
                  { userEnteredValue: 'Present' },
                  { userEnteredValue: 'Absent' },
                  { userEnteredValue: 'Cancelled' }
                ]
              },
              showCustomUi: true,
              strict: true
            }
          }
        },

        // ── Conditional Formatting: Status = Present → Green ──
        {
          addConditionalFormatRule: {
            rule: {
              ranges: [{ sheetId: 0, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: 9 }],
              booleanRule: {
                condition: { type: 'CUSTOM_FORMULA', values: [{ userEnteredValue: '=$H2="Present"' }] },
                format: { backgroundColor: GREEN_BG }
              }
            },
            index: 0
          }
        },

        // ── Conditional Formatting: Status = Absent → Red ──
        {
          addConditionalFormatRule: {
            rule: {
              ranges: [{ sheetId: 0, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: 9 }],
              booleanRule: {
                condition: { type: 'CUSTOM_FORMULA', values: [{ userEnteredValue: '=$H2="Absent"' }] },
                format: { backgroundColor: RED_BG }
              }
            },
            index: 1
          }
        },

        // ── Conditional Formatting: Status = Cancelled → Gray ──
        {
          addConditionalFormatRule: {
            rule: {
              ranges: [{ sheetId: 0, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: 9 }],
              booleanRule: {
                condition: { type: 'CUSTOM_FORMULA', values: [{ userEnteredValue: '=$H2="Cancelled"' }] },
                format: { backgroundColor: GRAY_BG }
              }
            },
            index: 2
          }
        },

        // ── Column widths for Subject Summary ──
        ...[ 200, 80, 80, 80, 80, 80, 110, 120 ].map((w, i) => ({
          updateDimensionProperties: {
            range: { sheetId: 1, dimension: 'COLUMNS', startIndex: i, endIndex: i + 1 },
            properties: { pixelSize: w },
            fields: 'pixelSize'
          }
        })),

        // ── Column widths for Projections ──
        ...[ 200, 80, 100, 80, 140, 90, 100, 180, 90, 120 ].map((w, i) => ({
          updateDimensionProperties: {
            range: { sheetId: 2, dimension: 'COLUMNS', startIndex: i, endIndex: i + 1 },
            properties: { pixelSize: w },
            fields: 'pixelSize'
          }
        })),

        // ── Column widths for Dashboard ──
        { updateDimensionProperties: { range: { sheetId: 3, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 }, properties: { pixelSize: 280 }, fields: 'pixelSize' } },
        { updateDimensionProperties: { range: { sheetId: 3, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 }, properties: { pixelSize: 180 }, fields: 'pixelSize' } },

        // ── Merge Dashboard title row ──
        {
          mergeCells: {
            range: { sheetId: 3, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 4 },
            mergeType: 'MERGE_ALL'
          }
        },

        // ── Dashboard title row height ──
        {
          updateDimensionProperties: {
            range: { sheetId: 3, dimension: 'ROWS', startIndex: 0, endIndex: 1 },
            properties: { pixelSize: 50 },
            fields: 'pixelSize'
          }
        },

        // ── Tab colors ──
        { updateSheetProperties: { properties: { sheetId: 0, tabColor: { red: 0.2, green: 0.47, blue: 0.96 } }, fields: 'tabColor' } },
        { updateSheetProperties: { properties: { sheetId: 1, tabColor: { red: 0.18, green: 0.8, blue: 0.44 } }, fields: 'tabColor' } },
        { updateSheetProperties: { properties: { sheetId: 2, tabColor: { red: 1, green: 0.6, blue: 0.0 } }, fields: 'tabColor' } },
        { updateSheetProperties: { properties: { sheetId: 3, tabColor: { red: 0.55, green: 0.23, blue: 0.83 } }, fields: 'tabColor' } }
      ]
    })
  });

  return {
    spreadsheetId: sheetData.spreadsheetId,
    spreadsheetUrl: sheetData.spreadsheetUrl
  };
}
