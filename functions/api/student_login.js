export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    
    // 1. Initialise Rate Limit Table
    try {
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS access_logs_v3 (
            ip_address TEXT PRIMARY KEY,
            attempts INTEGER,
            blocked_until INTEGER
          )
        `).run();
    } catch(e) {} // Silent ignore if exists natively

    const record = await env.DB.prepare("SELECT * FROM access_logs_v3 WHERE ip_address = ?").bind(ip).first();

    if (record && record.blocked_until > Date.now()) {
      return new Response(JSON.stringify({ 
        error: "BLOCKED", 
        message: "You have exceeded maximum secure login limits. Your IP is completely blocked for 1 hour to prevent brute force attacks." 
      }), { status: 403, headers: { "Content-Type": "application/json" } });
    }

    const { rollNo, password } = await request.json();

    const db = env.DB;
    const stmt = db.prepare("SELECT * FROM students WHERE roll_no = ? AND password = ?").bind(rollNo, password);
    const user = await stmt.first();

    if (!user) {
      let newAttempts = (record?.attempts || 0) + 1;
      let blockedUntil = 0; 

      if (newAttempts >= 3) {
        blockedUntil = Date.now() + 3600000; // 1 hour block
      }

      await env.DB.prepare(`
        INSERT INTO access_logs_v3 (ip_address, attempts, blocked_until) 
        VALUES (?, ?, ?) 
        ON CONFLICT(ip_address) DO UPDATE SET 
          attempts = excluded.attempts, 
          blocked_until = excluded.blocked_until
      `).bind(ip, newAttempts, blockedUntil).run();

      if (blockedUntil > 0) {
        return new Response(JSON.stringify({ 
          error: "BLOCKED",
          message: "You have exceeded maximum secure login limits. Your IP is completely blocked for 1 hour to prevent brute force attacks." 
        }), { status: 403, headers: { "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({ 
        error: "Invalid Roll No or Access Code.", 
        message: `Invalid credentials. Attempts left: ${3 - newAttempts}.`
      }), { status: 401 });
    }

    // Auth Success -> Natively Clear IP Limits
    await env.DB.prepare("DELETE FROM access_logs_v3 WHERE ip_address = ?").bind(ip).run();

    return new Response(JSON.stringify({ 
      success: true, 
      user: { rollNo: user.roll_no, email: user.email, semester: user.semester, section: user.section } 
    }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Server error during login." }), { status: 500 });
  }
}