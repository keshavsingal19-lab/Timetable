export async function onRequest(context) {
  const { request, env } = context;
  
  // Use IST (Indian Standard Time) for date consistency
  // This ensures the list resets at midnight Indian time, not UTC.
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); 

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }

  // --- GET Request: Public (Anyone can see who is absent) ---
  if (request.method === "GET") {
    try {
      // Fetch records where today is between start_date and end_date
      const { results } = await env.DB.prepare(
        "SELECT teacher_id, start_date, end_date FROM global_absences WHERE ? BETWEEN start_date AND end_date"
      ).bind(today).all();
      
      return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
    } catch (e) {
      return new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json" } });
    }
  }

  // --- POST Request: Protected (Only Admin) ---
  if (request.method === "POST") {
    try {
      const { teacherId, isAbsent, password } = await request.json();

      // 1. SECURITY CHECK: Validate Password
      if (password !== env.ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { 
          status: 401, 
          headers: { "Content-Type": "application/json" } 
        });
      }

      // 2. SECURITY CHECK: Validate Input (Prevent Garbage Data)
      if (!teacherId || typeof teacherId !== 'string' || teacherId.length > 50) {
        return new Response(JSON.stringify({ error: "Invalid Teacher ID" }), { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      // 3. UPDATE DATABASE
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