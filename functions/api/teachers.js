export async function onRequestGet(context) {
    const { env } = context;
  
    try {
      let dbTeachers = [];
  
      if (env.DB) {
        try {
          // Fetch teachers with their schedule and their newly added email field
          const result = await env.DB.prepare(`
            SELECT t.id, t.name, t.department, fs.schedule, t.email
            FROM teachers t
            LEFT JOIN faculty_schedules fs ON t.id = fs.id
            ORDER BY t.name ASC
          `).all();
          dbTeachers = result.results || [];
        } catch (e) {
          console.error("DB Query error:", e);
        }
      }
      return new Response(JSON.stringify(dbTeachers), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
