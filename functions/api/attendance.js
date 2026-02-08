export async function onRequest(context) {
  const { request, env } = context;
  
  // Use IST (Indian Standard Time) for date consistency
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); 

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }

  // GET Request: Anyone can see who is absent
  if (request.method === "GET") {
    try {
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS daily_absences (
          date TEXT, 
          teacher_id TEXT, 
          PRIMARY KEY (date, teacher_id)
        )
      `).run();

      const { results } = await env.DB.prepare(
        "SELECT teacher_id FROM daily_absences WHERE date = ?"
      ).bind(today).all();
      
      const ids = results.map(r => r.teacher_id);
      return new Response(JSON.stringify(ids), { headers: { "Content-Type": "application/json" } });
    } catch (e) {
      return new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json" } });
    }
  }

  // POST Request: Only Admin (with password) can change this
  if (request.method === "POST") {
    try {
      const { teacherId, isAbsent, password } = await request.json();

      // 1. SECURITY CHECK
      if (password !== env.ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { 
          status: 401, 
          headers: { "Content-Type": "application/json" } 
        });
      }
      
      // 2. UPDATE DATABASE
      if (isAbsent) {
        await env.DB.prepare(
          "INSERT OR IGNORE INTO daily_absences (date, teacher_id) VALUES (?, ?)"
        ).bind(today, teacherId).run();
      } else {
        await env.DB.prepare(
          "DELETE FROM daily_absences WHERE date = ? AND teacher_id = ?"
        ).bind(today, teacherId).run();
      }
      return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  }

  return new Response("Method not allowed", { status: 405 });
}