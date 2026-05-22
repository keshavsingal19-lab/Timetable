import jwt from '@tsndr/cloudflare-worker-jwt';

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { rollNo, password } = await request.json();

    const db = env.DB;
    let user;

    // Standard login check
    const stmt = db.prepare("SELECT * FROM students WHERE roll_no = ? AND password = ?").bind(rollNo, password);
    user = await stmt.first();

    if (!user) {
      return new Response(JSON.stringify({ 
        error: "Invalid Roll No or Access Code."
      }), { status: 401 });
    }

    const sessionToken = await jwt.sign({ 
      email: user.email, 
      isNewUser: false,
      rollNo: user.roll_no,
      isMaster: false,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    }, env.JWT_SECRET || 'secret-key-fallback');

    return new Response(JSON.stringify({ 
      success: true, 
      token: sessionToken,
      user: { rollNo: user.roll_no, email: user.email, semester: user.semester, section: user.section } 
    }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Server error during login." }), { status: 500 });
  }
}