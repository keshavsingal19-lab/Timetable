export async function onRequestPost(context) {
  const { request, env } = context;
  
  // 1. Parse Request
  try {
    const { password } = await request.json();
    const clientIP = request.headers.get("CF-Connecting-IP") || "unknown";
    
    // 2. Rate Limit Check (using D1)
    const now = Date.now();
    const blockUntil = await getBlockStatus(env.DB, clientIP);
    
    if (blockUntil && blockUntil > now) {
      const minutesLeft = Math.ceil((blockUntil - now) / 60000);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Too many failed attempts. Try again in ${minutesLeft} minutes.` 
      }), { status: 429 });
    }

    // 3. Verify Password
    // Access password from environment variable or fallback securely
    const CORRECT_PASSWORD = env.ADMIN_PASSWORD || "kroni2005"; 

    if (password === CORRECT_PASSWORD) {
      // Reset failures on success
      await resetFailures(env.DB, clientIP);
      return new Response(JSON.stringify({ success: true, token: "admin-session-valid" }), { status: 200 });
    } else {
      // 4. Handle Failure & Locking
      await recordFailure(env.DB, clientIP, now);
      return new Response(JSON.stringify({ success: false, error: "Invalid Access Code" }), { status: 401 });
    }

  } catch (e) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

// --- HELPER FUNCTIONS FOR D1 RATE LIMITING ---

async function getBlockStatus(db, ip) {
  // Create table if missing (best effort init)
  try {
    await db.prepare(`CREATE TABLE IF NOT EXISTS login_attempts (ip TEXT PRIMARY KEY, failures INT, block_until INT)`).run();
  } catch (e) { /* ignore if already exists */ }
  
  const result = await db.prepare("SELECT block_until FROM login_attempts WHERE ip = ?").bind(ip).first();
  return result ? result.block_until : null;
}

async function recordFailure(db, ip, now) {
  // Check current failures
  const row = await db.prepare("SELECT failures FROM login_attempts WHERE ip = ?").bind(ip).first();
  let failures = row ? row.failures + 1 : 1;
  let blockUntil = 0;

  // Block after 3 failed attempts
  if (failures >= 3) {
    blockUntil = now + (60 * 60 * 1000); // Block for 1 hour
  }

  // Upsert the failure record
  await db.prepare(`
    INSERT INTO login_attempts (ip, failures, block_until) VALUES (?, ?, ?)
    ON CONFLICT(ip) DO UPDATE SET failures = ?, block_until = ?
  `).bind(ip, failures, blockUntil, failures, blockUntil).run();
}

async function resetFailures(db, ip) {
  await db.prepare("DELETE FROM login_attempts WHERE ip = ?").bind(ip).run();
}