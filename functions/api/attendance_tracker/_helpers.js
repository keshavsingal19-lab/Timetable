export async function getValidToken(env, rollNo) {
  const row = await env.DB.prepare('SELECT * FROM student_sheets WHERE roll_no = ?').bind(rollNo).first();
  if (!row) throw new Error('Not connected');

  const now = Math.floor(Date.now() / 1000);
  if (row.token_expiry > now + 60) {
    // Token still valid (with 60s buffer)
    return { accessToken: row.access_token, spreadsheetId: row.spreadsheet_id, email: row.google_email };
  }

  // Refresh the token
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: row.refresh_token,
      grant_type: 'refresh_token'
    })
  });
  const data = await res.json();

  if (!data.access_token) throw new Error('Token refresh failed: ' + JSON.stringify(data));

  const newExpiry = now + (data.expires_in || 3600);
  await env.DB.prepare('UPDATE student_sheets SET access_token = ?, token_expiry = ?, updated_at = datetime("now") WHERE roll_no = ?')
    .bind(data.access_token, newExpiry, rollNo).run();

  return { accessToken: data.access_token, spreadsheetId: row.spreadsheet_id, email: row.google_email };
}
