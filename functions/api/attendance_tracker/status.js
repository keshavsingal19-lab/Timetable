import jwt from '@tsndr/cloudflare-worker-jwt';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const isValid = await jwt.verify(token, env.JWT_SECRET || 'secret-key-fallback');
  if (!isValid) return new Response(JSON.stringify({ error: "Invalid session" }), { status: 401 });

  const { payload } = jwt.decode(token);
  const rollNo = payload.rollNo;

  if (!rollNo) return new Response(JSON.stringify({ error: "Missing roll no" }), { status: 400 });

  const row = await env.DB.prepare('SELECT spreadsheet_url, google_email, access_token FROM student_sheets WHERE roll_no = ?').bind(rollNo).first();

  if (row && row.access_token) {
    return new Response(JSON.stringify({
      connected: true,
      spreadsheetUrl: row.spreadsheet_url,
      email: row.google_email
    }), { status: 200 });
  } else {
    return new Response(JSON.stringify({ connected: false }), { status: 200 });
  }
}
