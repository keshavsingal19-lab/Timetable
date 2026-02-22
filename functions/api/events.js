export async function onRequest(context) {
  const { request, env } = context;
  const { method } = request;

  // 1. GET REQUEST: Fetch events
  if (method === 'GET') {
    const url = new URL(request.url);
    const isAdmin = url.searchParams.get('admin') === 'true';

    try {
      // ORDER BY e.is_pinned DESC ensures the pinned event is always first
      let query = `
        SELECT e.*, a.views, a.clicks 
        FROM society_events e 
        LEFT JOIN event_analytics a ON e.id = a.event_id 
        WHERE e.is_active = 1 ORDER BY e.is_pinned DESC, e.id DESC
      `;
      
      if (isAdmin) {
        query = `
          SELECT e.*, a.views, a.clicks 
          FROM society_events e 
          LEFT JOIN event_analytics a ON e.id = a.event_id 
          ORDER BY e.is_pinned DESC, e.id DESC
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

      // --- PUBLIC TRACKING (No password needed) ---
      if (body.action === 'track') {
        const field = body.type === 'click' ? 'clicks' : 'views';
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

      // Action: Pin Event (Make Featured)
      if (body.action === 'pin') {
        // First, unpin all events
        await env.DB.prepare("UPDATE society_events SET is_pinned = 0").run(); 
        // Then, pin only the selected one
        await env.DB.prepare("UPDATE society_events SET is_pinned = 1 WHERE id = ?").bind(body.eventId).run(); 
        return Response.json({ success: true, message: "Event Pinned Successfully!" });
      }

      // Action: Toggle Active Status
      else if (body.action === 'toggle') {
        await env.DB.prepare("UPDATE society_events SET is_active = ? WHERE id = ?")
          .bind(body.isActive ? 1 : 0, body.eventId)
          .run();
        return Response.json({ success: true, message: "Status updated" });
      } 
      
      // Action: Delete Event
      else if (body.action === 'delete') {
        // Deleting from society_events will automatically delete from event_analytics due to ON DELETE CASCADE
        await env.DB.prepare("DELETE FROM society_events WHERE id = ?").bind(body.eventId).run();
        return Response.json({ success: true, message: "Event permanently deleted" });
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
        return Response.json({ success: true, message: "Event Updated Successfully!" });
      }
      
      // Action: Create New Event
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