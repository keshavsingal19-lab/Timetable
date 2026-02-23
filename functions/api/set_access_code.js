import jwt from '@tsndr/cloudflare-worker-jwt';

export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.json();
  
  // Notice we don't extract 'rollNo' from the body anymore. We ignore the frontend's input.
  const { token, accessCode, semester, section } = body;

  // 1. Verify the Token (Security Check)
  const isValid = await jwt.verify(token, env.JWT_SECRET || 'secret-key-fallback');
  if (!isValid) return new Response(JSON.stringify({ error: "Invalid or expired session." }), { status: 401 });

  const { payload } = jwt.decode(token);
  const email = payload.email;

  // --- SECURE EXTRACTION (Step 3) ---
  // Force the roll number to be the email prefix (e.g., 24bc702@srcc.edu -> 24BC702)
  const verifiedRollNo = email.split('@')[0].toUpperCase();

  const db = env.DB;

  if (payload.isNewUser) {
    // INSERT NEW USER
    if (!semester || !section) {
      return new Response(JSON.stringify({ error: "Missing details." }), { status: 400 });
    }
    try {
      // Use verifiedRollNo here instead of what the frontend sent
      await db.prepare(
        "INSERT INTO students (roll_no, email, semester, section, password) VALUES (?, ?, ?, ?, ?)"
      ).bind(verifiedRollNo, email, semester, section, accessCode).run();
    } catch (e) {
      return new Response(JSON.stringify({ error: "User already exists or DB error." }), { status: 500 });
    }
  } else {
    // UPDATE EXISTING USER (Change Access Code)
    await db.prepare(
      "UPDATE students SET password = ? WHERE email = ?"
    ).bind(accessCode, email).run();
  }

  // Return the full user object so frontend can auto-login perfectly
  return new Response(JSON.stringify({ 
    success: true, 
    user: { rollNo: verifiedRollNo, email, semester, section, password: accessCode } 
  }), { status: 200 });
}