import jwt from '@tsndr/cloudflare-worker-jwt';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // We need the rollNo so the callback knows who to link the sheet to.
  // The client passes the token, we decode it.
  const token = url.searchParams.get('token');
  if (!token) {
    return Response.redirect(url.origin + '/?error=missing_token', 302);
  }

  const isValid = await jwt.verify(token, env.JWT_SECRET || 'secret-key-fallback');
  if (!isValid) {
    return Response.redirect(url.origin + '/?error=invalid_token', 302);
  }

  const { payload } = jwt.decode(token);
  const rollNo = payload.rollNo;
  if (!rollNo) {
    return Response.redirect(url.origin + '/?error=missing_roll_no', 302);
  }

  const redirectUri = `${url.origin}/api/auth/google_sheets_callback`;
  const clientId = env.GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    return new Response("Missing GOOGLE_CLIENT_ID in environment", { status: 500 });
  }

  // Set the state parameter to the rollNo so we can recover it in the callback
  const state = rollNo;
  const scopes = encodeURIComponent('https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email');

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}&access_type=offline&prompt=consent&state=${encodeURIComponent(state)}`;

  return Response.redirect(authUrl, 302);
}
