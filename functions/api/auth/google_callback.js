import jwt from '@tsndr/cloudflare-worker-jwt';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  if (!code) return new Response("No code provided", { status: 400 });

  // 1. Exchange code for token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${url.origin}/api/auth/google_callback`,
      grant_type: 'authorization_code'
    })
  });
  
  const tokenData = await tokenResponse.json();
  
  // 2. Get User Info
  const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  const userData = await userResponse.json();
  const email = userData.email.toLowerCase();

  // 3. Domain Check
  const allowedDomains = ['srcc.edu', 'srcc.du.ac.in'];
  const isAllowed = allowedDomains.some(d => email.endsWith('@' + d)) || email === 'keshavsingal19@gmail.com'; // Master email

  if (!isAllowed) {
    return new Response("Unauthorized Domain. Please use your College Email (@srcc.edu or @srcc.du.ac.in).", { status: 403 });
  }

  // 4. Check if User Exists in DB
  const db = env.DB;
  const stmt = db.prepare("SELECT * FROM students WHERE email = ?").bind(email);
  const existingUser = await stmt.first();
  const isNewUser = !existingUser;

  // 5. Generate a Secure Token for Frontend
  // We sign this so the frontend knows it's legit
  const sessionToken = await jwt.sign({ 
    email: email, 
    isNewUser: isNewUser,
    rollNo: existingUser ? existingUser.roll_no : null,
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
  }, env.JWT_SECRET || 'secret-key-fallback');

  // 6. Redirect to Frontend with Token
  return Response.redirect(`${url.origin}/?auth_token=${sessionToken}`, 302);
}