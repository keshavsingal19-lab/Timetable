/**
 * Webhook Receiver: Student App (Timetable)
 * Endpoint: POST /api/webhook/absence
 *
 * Receives absence notifications from the Admin Broadcaster.
 * Verifies the Authorization Bearer token, resolves the teacher name
 * to a local teacher_id, and inserts into daily_absences.
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  // 1. SECURITY: Verify Bearer token
  const authHeader = request.headers.get("Authorization");
  const expectedToken = `Bearer ${env.WEBHOOK_SECRET}`;

  if (!authHeader || authHeader !== expectedToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body = await request.json();
    const { teacherName, date } = body;

    if (!teacherName || !date) {
      return new Response(JSON.stringify({ error: "Missing teacherName or date" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 2. Ensure the daily_absences and teachers table exist
    if (env.DB) {
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS daily_absences (
          date TEXT,
          teacher_id TEXT,
          PRIMARY KEY (date, teacher_id)
        )
      `).run();
      
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS teachers (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          department TEXT,
          access_code TEXT UNIQUE
        )
      `).run();
    }

    // 3. Resolve teacherName to a local teacher_id
    let teacherId = null;

    // Strategy A: Try to find in a local teachers table (Exact Name Match)
    if (env.DB) {
      try {
        const dbLookup = await env.DB.prepare(
          "SELECT id FROM teachers WHERE name = ? COLLATE NOCASE LIMIT 1"
        ).bind(teacherName).first();

        if (dbLookup) {
          teacherId = dbLookup.id;
        }
      } catch (e) {
        console.error("Local teacher lookup failed:", e);
      }
    }

    // Strategy B: Heuristic — convert "Dr. Sanjay Jain" → "JAIN_SANJAY"
    if (!teacherId) {
      const cleanName = teacherName
        .replace(/^(Dr\.?|Prof\.?|Mr\.?|Mrs\.?|Ms\.?|Shri\.?)\s*/i, "")
        .trim();

      const parts = cleanName.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        const lastName = parts[parts.length - 1].toUpperCase();
        const firstName = parts[0].toUpperCase();
        teacherId = `${lastName}_${firstName}`;
      } else if (parts.length === 1) {
        teacherId = parts[0].toUpperCase();
      }
    }

    // 4. Insert into daily_absences if we resolved an ID
    if (teacherId && env.DB) {
      await env.DB.prepare(
        "INSERT OR IGNORE INTO daily_absences (date, teacher_id) VALUES (?, ?)"
      ).bind(date, teacherId).run();

      console.log(`[Webhook] Student App: Recorded absence for ${teacherId} on ${date}`);
    } else {
      console.log(`[Webhook] Student App: Could not resolve teacher "${teacherName}" — acknowledged without insert.`);
    }

    // 5. Always return 200 to acknowledge receipt
    return new Response(JSON.stringify({
      success: true,
      resolved: !!teacherId,
      teacherId: teacherId || null
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[Webhook] Student App Error:", error.message || error);
    return new Response(JSON.stringify({ error: "Internal processing error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
