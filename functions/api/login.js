export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const ip = request.headers.get("CF-Connecting-IP") || "127.0.0.1";
    
    // Create the rate_limits table if it doesn't exist
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS admin_rate_limits (
        ip TEXT PRIMARY KEY,
        attempts INTEGER DEFAULT 0,
        blocked_until INTEGER DEFAULT 0
      )
    `).run();

    // Check if IP is blocked
    const now = Math.floor(Date.now() / 1000);
    const limitRecord = await env.DB.prepare(
      `SELECT attempts, blocked_until FROM admin_rate_limits WHERE ip = ?`
    ).bind(ip).first();

    if (limitRecord && limitRecord.blocked_until > now) {
      const remainingMinutes = Math.ceil((limitRecord.blocked_until - now) / 60);
      return new Response(JSON.stringify({ 
        error: `Too many failed attempts. Try again in ${remainingMinutes} minute(s).` 
      }), { status: 429, headers: { "Content-Type": "application/json" } });
    }

    // Parse request JSON
    let password = "";
    try {
      const body = await request.json();
      password = body.password;
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
    }

    if (password === env.ADMIN_PASSWORD) {
      // Reset attempts on successful login
      await env.DB.prepare(
        `INSERT INTO admin_rate_limits (ip, attempts, blocked_until) VALUES (?, 0, 0)
         ON CONFLICT(ip) DO UPDATE SET attempts = 0, blocked_until = 0`
      ).bind(ip).run();

      return new Response(JSON.stringify({ success: true }), { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      });
    } else {
      // Increment attempts
      let newAttempts = limitRecord ? limitRecord.attempts + 1 : 1;
      let blockedUntil = limitRecord ? limitRecord.blocked_until : 0;
      
      // If wrong for 2 times, block for 1 hour
      if (newAttempts >= 2) {
        blockedUntil = now + 3600; // block for 1 hour
      }

      await env.DB.prepare(
        `INSERT INTO admin_rate_limits (ip, attempts, blocked_until) VALUES (?, ?, ?)
         ON CONFLICT(ip) DO UPDATE SET attempts = ?, blocked_until = ?`
      ).bind(ip, newAttempts, blockedUntil, newAttempts, blockedUntil).run();

      if (newAttempts >= 2) {
        return new Response(JSON.stringify({ 
          error: "Too many failed attempts. Try again in 60 minute(s)." 
        }), { status: 403, headers: { "Content-Type": "application/json" } });
      }

      const attemptsLeft = 2 - newAttempts;
      return new Response(JSON.stringify({ 
        error: `Invalid password. ${attemptsLeft} attempt(s) left.`, 
        attemptsLeft 
      }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

  } catch (e) {
    return new Response(JSON.stringify({ error: "Server error: " + e.message }), { status: 500 });
  }
}