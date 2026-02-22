import jwt from '@tsndr/cloudflare-worker-jwt';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  if (!code) return new Response("No code provided", { status: 400 });

  const redirect_uri = `${url.origin}/api/auth/microsoft_callback`;

  // 1. Exchange code for token
  const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.MICROSOFT_CLIENT_ID,
      client_secret: env.MICROSOFT_CLIENT_SECRET,
      code,
      redirect_uri,
      grant_type: 'authorization_code'
    })
  });
  
  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) return new Response("Failed to retrieve token from Microsoft.", { status: 400 });

  // 2. Get User Info from Microsoft Graph
  const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  const userData = await userResponse.json();
  
  // Microsoft stores email in either 'mail' or 'userPrincipalName'
  const email = (userData.mail || userData.userPrincipalName || "").toLowerCase();
  if (!email) return new Response("Could not retrieve email.", { status: 400 });

  // 3. Domain Check
  const allowedDomains = ['srcc.edu', 'srcc.du.ac.in'];
  const isAllowed = allowedDomains.some(d => email.endsWith('@' + d)) || email === 'keshavsingal19@gmail.com';

  if (!isAllowed) {
    return new Response("Unauthorized Domain. Please use your College Email.", { status: 403 });
  }

  // 4. Check if User Exists in DB
  const db = env.DB;
  const stmt = db.prepare("SELECT * FROM students WHERE email = ?").bind(email);
  const existingUser = await stmt.first();
  const isNewUser = !existingUser;

  // 5. Generate Secure Token
  const sessionToken = await jwt.sign({ 
    email: email, 
    isNewUser: isNewUser,
    rollNo: existingUser ? existingUser.roll_no : null,
    exp: Math.floor(Date.now() / 1000) + (60 * 60)
  }, env.JWT_SECRET || 'secret-key-fallback');

  // 6. Redirect to Frontend
  return Response.redirect(`${url.origin}/?auth_token=${sessionToken}`, 302);
}