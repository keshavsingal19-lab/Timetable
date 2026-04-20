export async function onRequestGet(context) {
    const { env } = context;
  
    try {
      let dbTeachers = [];
  
      if (env.DB) {
        try {
          // Use LEFT JOINs to ensure all teachers appear even if they don't have a schedule or email yet
          const result = await env.DB.prepare(`
            SELECT t.id, t.name, t.department, fs.schedule, te.email
            FROM teachers t
            LEFT JOIN faculty_schedules fs ON t.id = fs.id
            LEFT JOIN teachers_email te ON t.id = te.id
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
