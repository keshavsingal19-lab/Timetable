export async function onRequestPost(context) {
  const { request, env } = context;
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";

  try {
    const { password } = await request.json();

    // 1. Ensure Table Exists (New Name: access_logs_v3)
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS access_logs_v3 (
        ip_address TEXT PRIMARY KEY,
        attempts INTEGER,
        blocked_until INTEGER
      )
    `).run();

    const record = await env.DB.prepare(
      "SELECT * FROM access_logs_v3 WHERE ip_address = ?"
    ).bind(ip).first();

    if (record && record.blocked_until > Date.now()) {
      return new Response(JSON.stringify({ 
        error: "BLOCKED", 
        message: "You were trying to breach into admin console, you are blocked for 1 hour" 
      }), { status: 403, headers: { "Content-Type": "application/json" } });
    }

    if (password === env.ADMIN_PASSWORD) {
      await env.DB.prepare("DELETE FROM access_logs_v3 WHERE ip_address = ?").bind(ip).run();
      return new Response(JSON.stringify({ success: true }), { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      });
    } else {
      let newAttempts = (record?.attempts || 0) + 1;
      let blockedUntil = 0; 

      if (newAttempts >= 3) {
        blockedUntil = Date.now() + 3600000;
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