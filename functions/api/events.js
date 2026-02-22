export async function onRequest(context) {
  const { request, env } = context;
  const { method } = request;
  
  // Use a stable date string (YYYY-MM-DD) for grouping stats by day
  const today = new Date().toISOString().split('T')[0];

  // 1. GET REQUEST: Fetch events with Daily + Total stats
  if (method === 'GET') {
    const url = new URL(request.url);
    const isAdmin = url.searchParams.get('admin') === 'true';

    try {
      // Logic: Join society_events with subqueries that sum up total stats 
      // and filter for today's specific stats.
      let query = `
        SELECT 
          e.*, 
          COALESCE((SELECT SUM(views) FROM daily_event_analytics WHERE event_id = e.id), 0) as total_views,
          COALESCE((SELECT SUM(clicks) FROM daily_event_analytics WHERE event_id = e.id), 0) as total_clicks,
          COALESCE((SELECT views FROM daily_event_analytics WHERE event_id = e.id AND log_date = '${today}'), 0) as today_views,
          COALESCE((SELECT clicks FROM daily_event_analytics WHERE event_id = e.id AND log_date = '${today}'), 0) as today_clicks
        FROM society_events e 
        WHERE ${isAdmin ? '1=1' : 'e.is_active = 1'} 
        ORDER BY e.is_pinned DESC, e.id DESC
      `;
      
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

      // --- PUBLIC TRACKING (Daily Upsert Logic) ---
      if (body.action === 'track') {
        const field = body.type === 'click' ? 'clicks' : 'views';
        
        // UPSERT: If a row for (event_id + today's date) exists, increment it.
        // Otherwise, create a new row for today starting at 1.
        await env.DB.prepare(`
          INSERT INTO daily_event_analytics (event_id, log_date, ${field}) 
          VALUES (?, ?, 1)
          ON CONFLICT(event_id, log_date) 
          DO UPDATE SET ${field} = ${field} + 1
        `).bind(body.eventId, today).run();

        return Response.json({ success: true });
      }

      // --- ADMIN ACTIONS (Password Required) ---
      if (body.password !== env.ADMIN_PASSWORD) {
        return Response.json({ error: "Unauthorized" }, { status: 403 });
      }

      // Action: Pin Event
      if (body.action === 'pin') {
        await env.DB.prepare("UPDATE society_events SET is_pinned = 0").run(); 
        await env.DB.prepare("UPDATE society_events SET is_pinned = 1 WHERE id = ?").bind(body.eventId).run(); 
        return Response.json({ success: true });
      }

      // Action: Toggle Active Status
      else if (body.action === 'toggle') {
        await env.DB.prepare("UPDATE society_events SET is_active = ? WHERE id = ?")
          .bind(body.isActive ? 1 : 0, body.eventId)
          .run();
        return Response.json({ success: true });
      } 
      
      // Action: Delete Event
      else if (body.action === 'delete') {
        await env.DB.prepare("DELETE FROM society_events WHERE id = ?").bind(body.eventId).run();
        return Response.json({ success: true });
      }

      // Action: Edit Event
      else if (body.action === 'edit') {
        await env.DB.prepare(`
          UPDATE society_events 
          SET society_name = ?, event_name = ?, event_date = ?, event_time = ?, location = ?, event_type = ?, description = ?, registration_link = ?
          WHERE id = ?
        `).bind(
          body.society, body.eventName, body.date, body.time, body.location, body.type, body.description, body.link, body.eventId
        ).run();
        return Response.json({ success: true });
      }
      
      // Action: Create New Event
      else if (body.action === 'create') {
        await env.DB.prepare(`
          INSERT INTO society_events 
          (society_name, event_name, event_date, event_time, location, event_type, description, registration_link) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          body.society, body.eventName, body.date, body.time, body.location, body.type, body.description, body.link
        ).run();

        return Response.json({ success: true });
      }
    } catch (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  }

  return new Response("Method not allowed", { status: 405 });
}