export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { rollNo, password } = await request.json();

    const db = env.DB;
    const stmt = db.prepare("SELECT * FROM students WHERE roll_no = ? AND password = ?").bind(rollNo, password);
    const user = await stmt.first();

    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid Roll No or Access Code." }), { status: 401 });
    }

    // Return user details (without password) so the frontend can personalize the schedule
    return new Response(JSON.stringify({ 
      success: true, 
      user: { rollNo: user.roll_no, email: user.email, semester: user.semester, section: user.section } 
    }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Server error during login." }), { status: 500 });
  }
}