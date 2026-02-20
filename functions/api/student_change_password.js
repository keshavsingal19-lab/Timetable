export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { rollNo, oldPassword, newPassword } = await request.json();
    const db = env.DB;

    // Verify the current password
    const stmt = db.prepare("SELECT * FROM students WHERE roll_no = ? AND password = ?").bind(rollNo, oldPassword);
    const user = await stmt.first();

    if (!user) {
      return new Response(JSON.stringify({ error: "Incorrect current passcode." }), { status: 401 });
    }

    // Update to the new password
    const updateStmt = db.prepare("UPDATE students SET password = ? WHERE roll_no = ?").bind(newPassword, rollNo);
    await updateStmt.run();

    return new Response(JSON.stringify({ success: true, message: "Passcode updated successfully!" }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Server error while changing password." }), { status: 500 });
  }
}