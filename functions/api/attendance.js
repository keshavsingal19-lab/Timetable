export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // Get today's date in YYYY-MM-DD format (UTC). 
  // This automatically "resets" the list because tomorrow will be a new date.
  const today = new Date().toISOString().split('T')[0];

  // 1. Safety Check: Ensure Database is connected
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }

  // 2. GET Request: Fetch all absent teacher IDs for today
  if (request.method === "GET") {
    try {
      // Create table if it doesn't exist (First run logic)
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

  // 3. POST Request: Admin marks a teacher as Absent or Present
  if (request.method === "POST") {
    try {
      const { teacherId, isAbsent } = await request.json();
      
      if (isAbsent) {
        // Add to absent list
        await env.DB.prepare(
          "INSERT OR IGNORE INTO daily_absences (date, teacher_id) VALUES (?, ?)"
        ).bind(today, teacherId).run();
      } else {
        // Remove from absent list
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