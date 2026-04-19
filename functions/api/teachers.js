export async function onRequestGet(context) {
    const { env } = context;
  
    try {
      let dbTeachers = [];
  
      if (env.DB) {
        try {
          const result = await env.DB.prepare("SELECT id, name, department, schedule FROM faculty_schedules ORDER BY name ASC").all();
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
