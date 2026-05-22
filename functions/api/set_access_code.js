import jwt from '@tsndr/cloudflare-worker-jwt';

export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.json();
  
  const { token, accessCode, dseGeCode, dseCode, geCode, aecCode } = body;

  // 1. Verify the Token (Security Check)
  const isValid = await jwt.verify(token, env.JWT_SECRET || 'secret-key-fallback');
  if (!isValid) return new Response(JSON.stringify({ error: "Invalid or expired session." }), { status: 401 });

  const { payload } = jwt.decode(token);
  const email = payload.email;

  // 2. Extract roll number from email
  const verifiedRollNo = email.split('@')[0].toUpperCase();

  const db = env.DB;

  try {
    if (payload.isNewUser) {
      // Look up profile to get semester/section
      const profile = await db.prepare("SELECT semester, section FROM student_profiles WHERE roll_no = ?").bind(verifiedRollNo).first();
      if (!profile) {
        return new Response(JSON.stringify({ error: "Profile not found. Cannot set access code." }), { status: 400 });
      }

      // Update student_profiles with the selected electives
      await db.prepare(`
        UPDATE student_profiles 
        SET dse_ge_code = ?, dse_code = ?, ge_code = ?, aec_code = ?
        WHERE roll_no = ?
      `).bind(
        dseGeCode || null, 
        dseCode || null, 
        geCode || null, 
        aecCode || null, 
        verifiedRollNo
      ).run();

      // Insert into auth students table
      await db.prepare(
        "INSERT INTO students (roll_no, email, semester, section, password) VALUES (?, ?, ?, ?, ?)"
      ).bind(verifiedRollNo, email, profile.semester, profile.section, accessCode).run();

      return new Response(JSON.stringify({ 
        success: true, 
        user: { rollNo: verifiedRollNo, email, semester: profile.semester, section: profile.section, password: accessCode } 
      }), { status: 200 });

    } else {
      // UPDATE EXISTING USER (Change Access Code)
      await db.prepare(
        "UPDATE students SET password = ? WHERE email = ?"
      ).bind(accessCode, email).run();

      // Retrieve full user for frontend
      const user = await db.prepare("SELECT * FROM students WHERE email = ?").bind(email).first();
      return new Response(JSON.stringify({ 
        success: true, 
        user: { rollNo: user.roll_no, email, semester: user.semester, section: user.section, password: accessCode } 
      }), { status: 200 });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: "Database error: " + e.message }), { status: 500 });
  }
}