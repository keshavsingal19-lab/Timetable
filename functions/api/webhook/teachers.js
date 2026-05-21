export async function onRequestPost(context) {
  const { request, env } = context;

  // Verify Authorization
  const authHeader = request.headers.get("Authorization");
  const expectedSecret = env.WEBHOOK_SECRET || "dev_secret";
  if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const payload = await request.json();
    if (!payload.action || !payload.data) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
    }

    // Ensure table exists
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS teachers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        department TEXT
    )`).run();

    if (payload.action === "add_teacher") {
      const { id, name, department, access_code } = payload.data;
      // access_code may be NOT NULL in existing schemas — generate fallback if missing
      const code = access_code || `WH_${id}_${Date.now()}`;

      // Try inserting with access_code first (for schemas that have it)
      try {
        await env.DB.prepare(`
          INSERT INTO teachers (id, name, department, access_code)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET name=excluded.name, department=excluded.department
        `).bind(id, name, department || "Commerce", code).run();
      } catch (e) {
        // Fallback: schema without access_code column
        await env.DB.prepare(`
          INSERT INTO teachers (id, name, department)
          VALUES (?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET name=excluded.name, department=excluded.department
        `).bind(id, name, department || "Commerce").run();
      }
      console.log(`[Webhook] Added teacher ${id}`);
    } 
    else if (payload.action === "delete_teacher") {
      const { id } = payload.data;
      await env.DB.prepare(`DELETE FROM teachers WHERE id = ?`).bind(id).run();
      console.log(`[Webhook] Deleted teacher ${id}`);
    }
    else {
      return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true, message: "Webhook accepted." }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
