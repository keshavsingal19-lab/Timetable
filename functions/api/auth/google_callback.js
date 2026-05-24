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

  // 3. Check if User Exists in DB
  const db = env.DB;
  
  const isMaster = email === 'studentassistsrcc@gmail.com';
  
  // Find the student profile that matches this email from the CSV
  const stmtProfile = db.prepare("SELECT * FROM student_profiles WHERE email = ?").bind(email);
  const profile = await stmtProfile.first();

  if (!profile && !isMaster) {
    return new Response("Unauthorized Email. Please use the email registered in the Admin portal.", { status: 403 });
  }

  const rollNo = profile ? profile.roll_no : null;

  // Check if they have already set up an access code
  let isNewUser = true;
  if (rollNo) {
    const existingUser = await db.prepare("SELECT * FROM students WHERE roll_no = ?").bind(rollNo).first();
    isNewUser = !existingUser;
  }

  // 5. Generate a Secure Token for Frontend
  // We sign this so the frontend knows it's legit
  const sessionToken = await jwt.sign({ 
    email: email, 
    isNewUser: isNewUser,
    rollNo: rollNo,
    isMaster: isMaster,
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
  }, env.JWT_SECRET || 'secret-key-fallback');

  // 6. If this was opened in a popup, send a message back to the opener and close.
  //    Otherwise, fallback to a standard redirect (e.g. if user navigated directly).
  const origin = url.origin;
  const html = `<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#000066;color:white;">
<p>Authenticating…</p>
<script>
  var token = ${JSON.stringify(sessionToken)};
  if (window.opener) {
    window.opener.postMessage({ type: 'google_auth_success', token: token }, ${JSON.stringify(origin)});
    window.close();
  } else {
    window.location.href = '/?auth_token=' + encodeURIComponent(token);
  }
</script>
</body></html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}