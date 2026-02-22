export async function onRequest(context) {
  const { request, env } = context;
  const { method } = request;

  // 1. GET REQUEST: Fetch events
  if (method === 'GET') {
    const url = new URL(request.url);
    const isAdmin = url.searchParams.get('admin') === 'true';

    try {
      let query = `
        SELECT e.*, a.views, a.clicks 
        FROM society_events e 
        LEFT JOIN event_analytics a ON e.id = a.event_id 
        WHERE e.is_active = 1 ORDER BY e.id DESC
      `;
      
      if (isAdmin) {
        query = `
          SELECT e.*, a.views, a.clicks 
          FROM society_events e 
          LEFT JOIN event_analytics a ON e.id = a.event_id 
          ORDER BY e.id DESC
        `;
      }
      
      const { results } = await env.DB.prepare(query).all();
      return Response.json(results || []);
    } catch (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  }

  // 2. POST REQUEST: Analytics Tracking & Admin Actions
  if (method === 'POST') {
    try {
      const body = await request.json();

      // --- NEW: PUBLIC TRACKING (No password needed) ---
      if (body.action === 'track') {
        const field = body.type === 'click' ? 'clicks' : 'views';
        // Secure way to update the specific counter
        if (field === 'clicks' || field === 'views') {
            await env.DB.prepare(`UPDATE event_analytics SET ${field} = ${field} + 1 WHERE event_id = ?`)
              .bind(body.eventId)
              .run();
        }
        return Response.json({ success: true });
      }

      // --- ADMIN ACTIONS (Password Required) ---
      if (body.password !== env.ADMIN_PASSWORD) {
        return Response.json({ error: "Unauthorized. Incorrect password." }, { status: 403 });
      }

      if (body.action === 'toggle') {
        await env.DB.prepare("UPDATE society_events SET is_active = ? WHERE id = ?")
          .bind(body.isActive ? 1 : 0, body.eventId)
          .run();
        return Response.json({ success: true, message: "Status updated" });
      } 
      
      else if (body.action === 'create') {
        const insertRes = await env.DB.prepare(`
          INSERT INTO society_events 
          (society_name, event_name, event_date, event_time, location, event_type, description, registration_link) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id
        `).bind(
          body.society, body.eventName, body.date, body.time, body.location, body.type, body.description, body.link
        ).all();
        
        const newId = insertRes.results[0].id;
        await env.DB.prepare("INSERT INTO event_analytics (event_id) VALUES (?)").bind(newId).run();

        return Response.json({ success: true, message: "Event Listed Successfully!" });
      }
    } catch (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  }

  return new Response("Method not allowed", { status: 405 });
}