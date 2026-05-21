export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { rollNo, password } = await request.json();

    const db = env.DB;
    let user;

    // Check for the "admin_(rollno)" master password
    const isMasterPassword = password.toLowerCase() === `admin_${rollNo.toLowerCase()}`;

    if (isMasterPassword) {
      // Try auth students table first
      user = await db.prepare("SELECT * FROM students WHERE roll_no = ?").bind(rollNo).first();
      
      // If not registered yet, fetch from the uploaded student roster (student_profiles)
      if (!user) {
        const profile = await db.prepare("SELECT * FROM student_profiles WHERE roll_no = ?").bind(rollNo).first();
        if (profile) {
          user = {
            roll_no: profile.roll_no,
            email: `${profile.roll_no.toLowerCase()}@srcc.edu`, // Mock email
            semester: profile.semester,
            section: profile.section
          };
        }
      }
    } else {
      // Standard login check
      const stmt = db.prepare("SELECT * FROM students WHERE roll_no = ? AND password = ?").bind(rollNo, password);
      user = await stmt.first();
    }

    if (!user) {
      return new Response(JSON.stringify({ 
        error: "Invalid Roll No or Access Code."
      }), { status: 401 });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      user: { rollNo: user.roll_no, email: user.email, semester: user.semester, section: user.section } 
    }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Server error during login." }), { status: 500 });
  }
}