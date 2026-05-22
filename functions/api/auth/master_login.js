import jwt from '@tsndr/cloudflare-worker-jwt';

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { token, rollNo } = await request.json();

    if (!token || !rollNo) {
      return new Response(JSON.stringify({ error: "Missing token or roll number" }), { status: 400 });
    }

    // Verify token
    const isValid = await jwt.verify(token, env.JWT_SECRET || 'secret-key-fallback');
    if (!isValid) return new Response(JSON.stringify({ error: "Invalid or expired session." }), { status: 401 });

    const { payload } = jwt.decode(token);
    if (!payload.isMaster) {
      return new Response(JSON.stringify({ error: "Unauthorized access. Not a master account." }), { status: 403 });
    }

    const db = env.DB;
    let user;

    // Try auth students table first
    user = await db.prepare("SELECT * FROM students WHERE roll_no = ?").bind(rollNo).first();
    
    // If not registered yet, fetch from the uploaded student roster (student_profiles)
    if (!user) {
      const profile = await db.prepare("SELECT * FROM student_profiles WHERE roll_no = ?").bind(rollNo).first();
      if (profile) {
        user = {
          roll_no: profile.roll_no,
          email: profile.email || `${profile.roll_no.toLowerCase()}@example.com`,
          semester: profile.semester,
          section: profile.section
        };
      }
    }

    if (!user) {
      return new Response(JSON.stringify({ error: "Roll No not found in database." }), { status: 404 });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      user: { rollNo: user.roll_no, email: user.email, semester: user.semester, section: user.section } 
    }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Server error during master login." }), { status: 500 });
  }
}
