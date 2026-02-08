export async function onRequestPost(context) {
  const { request, env } = context;
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";

  try {
    const { password } = await request.json();

    // 1. Ensure Table Exists
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS login_attempts (
        ip_address TEXT PRIMARY KEY,
        attempts INTEGER,
        blocked_until INTEGER
      )
    `).run();

    // 2. Check existing status for this IP
    const record = await env.DB.prepare(
      "SELECT * FROM login_attempts WHERE ip_address = ?"
    ).bind(ip).first();

    // 3. IF BLOCKED: Reject immediately
    if (record && record.blocked_until > Date.now()) {
      return new Response(JSON.stringify({ 
        error: "BLOCKED", 
        message: "You were trying to breach into admin console, you are blocked for 1 hour" 
      }), { status: 403, headers: { "Content-Type": "application/json" } });
    }

    // 4. CHECK PASSWORD
    if (password === env.ADMIN_PASSWORD) {
      // SUCCESS: Clear any bad records for this IP
      await env.DB.prepare("DELETE FROM login_attempts WHERE ip_address = ?").bind(ip).run();
      
      return new Response(JSON.stringify({ success: true }), { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      });
    } else {
      // FAILURE: Update counts
      let newAttempts = (record?.attempts || 0) + 1;
      let blockedUntil = 0; // 0 means not blocked

      // If 3rd wrong attempt, block for 1 hour (3600000 ms)
      if (newAttempts >= 3) {
        blockedUntil = Date.now() + 3600000;
      }

      // Upsert the record (Insert or Replace)
      await env.DB.prepare(`
        INSERT INTO login_attempts (ip_address, attempts, blocked_until) 
        VALUES (?, ?, ?) 
        ON CONFLICT(ip_address) DO UPDATE SET 
          attempts = excluded.attempts, 
          blocked_until = excluded.blocked_until
      `).bind(ip, newAttempts, blockedUntil).run();

      if (blockedUntil > 0) {
        return new Response(JSON.stringify({ 
          error: "BLOCKED",
          message: "You were trying to breach into admin console, you are blocked for 1 hour" 
        }), { status: 403, headers: { "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({ 
        error: "Invalid password", 
        attemptsLeft: 3 - newAttempts 
      }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

  } catch (e) {
    return new Response(JSON.stringify({ error: "Server error: " + e.message }), { status: 500 });
  }
}