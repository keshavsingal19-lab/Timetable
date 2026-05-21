/**
 * Webhook Receiver: Student App (Timetable)
 * Endpoint: POST /api/webhook/absence
 *
 * Receives absence notifications from the Admin Broadcaster.
 * Handles actions: add, remove, update, clear_today
 * Writes to `global_absences` table (same schema concept as Admin).
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

  if (!env.DB) {
    console.error("[Webhook] Student App: DB binding not available");
    return new Response(JSON.stringify({ success: true, note: "DB not configured" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body = await request.json();
    const action = body.action;

    // Ensure the global_absences table exists (mirrors Admin schema)
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS global_absences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacher_name TEXT,
        teacher_id TEXT,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // Migration: Add columns to pre-existing tables that may lack them
    try { await env.DB.prepare("ALTER TABLE global_absences ADD COLUMN teacher_name TEXT").run(); } catch(e) { /* already exists */ }
    try { await env.DB.prepare("ALTER TABLE global_absences ADD COLUMN teacher_id TEXT").run(); } catch(e) { /* already exists */ }

    // --- Resolve teacher ID ---
    // Uses the teacherId sent from Admin, with a fallback name lookup
    let resolvedId = body.teacherId && body.teacherId !== "N/A" ? body.teacherId : null;

    if (!resolvedId && body.teacherName) {
      try {
        const dbLookup = await env.DB.prepare(
          "SELECT id FROM teachers WHERE name = ? COLLATE NOCASE LIMIT 1"
        ).bind(body.teacherName).first();
        if (dbLookup) resolvedId = dbLookup.id;
      } catch (e) {
        console.warn("[Webhook] Student App: Teacher name lookup failed:", e);
      }
    }

    // --- Handle each action ---
    switch (action) {
      case "add": {
        if (!body.startDate || !body.endDate) {
          return new Response(JSON.stringify({ error: "Missing startDate or endDate" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        await env.DB.prepare(
          "INSERT INTO global_absences (teacher_name, teacher_id, start_date, end_date) VALUES (?, ?, ?, ?)"
        ).bind(body.teacherName || null, resolvedId, body.startDate, body.endDate).run();

        console.log(`[Webhook] Student App: Recorded absence for ${resolvedId || body.teacherName} (${body.startDate} to ${body.endDate})`);
        break;
      }

      case "remove": {
        if (!body.startDate || !body.endDate) {
          return new Response(JSON.stringify({ error: "Missing date range for removal" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        // Match by teacher + date range (we try both teacher_id and teacher_name)
        if (resolvedId) {
          await env.DB.prepare(
            "DELETE FROM global_absences WHERE teacher_id = ? AND start_date = ? AND end_date = ?"
          ).bind(resolvedId, body.startDate, body.endDate).run();
        } else if (body.teacherName) {
          await env.DB.prepare(
            "DELETE FROM global_absences WHERE teacher_name = ? AND start_date = ? AND end_date = ?"
          ).bind(body.teacherName, body.startDate, body.endDate).run();
        }

        console.log(`[Webhook] Student App: Removed absence for ${resolvedId || body.teacherName} (${body.startDate} to ${body.endDate})`);
        break;
      }

      case "update": {
        if (!body.startDate || !body.endDate || !body.oldStartDate || !body.oldEndDate) {
          return new Response(JSON.stringify({ error: "Missing date fields for update" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        // Match old record by teacher + old dates, update to new dates and name
        if (resolvedId) {
          await env.DB.prepare(
            "UPDATE global_absences SET teacher_name = ?, start_date = ?, end_date = ? WHERE teacher_id = ? AND start_date = ? AND end_date = ?"
          ).bind(body.newTeacherName || body.teacherName, body.startDate, body.endDate, resolvedId, body.oldStartDate, body.oldEndDate).run();
        } else if (body.teacherName) {
          await env.DB.prepare(
            "UPDATE global_absences SET teacher_name = ?, start_date = ?, end_date = ? WHERE teacher_name = ? AND start_date = ? AND end_date = ?"
          ).bind(body.newTeacherName || body.teacherName, body.startDate, body.endDate, body.teacherName, body.oldStartDate, body.oldEndDate).run();
        }

        console.log(`[Webhook] Student App: Updated absence for ${resolvedId || body.teacherName}`);
        break;
      }

      case "clear_today": {
        const date = body.date;
        if (!date) {
          return new Response(JSON.stringify({ error: "Missing date for clear" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        await env.DB.prepare(
          "DELETE FROM global_absences WHERE ? BETWEEN start_date AND end_date"
        ).bind(date).run();

        console.log(`[Webhook] Student App: Cleared all absences for ${date}`);
        break;
      }

      default: {
        console.warn(`[Webhook] Student App: Unknown action "${action}"`);
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      action: action,
      resolved: !!resolvedId
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
