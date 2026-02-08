export async function onRequest(context) {
  const { request, env } = context;
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "DB not configured" }), { status: 500 });
  }

  try {
    // Check against the NEW table: access_logs_v3
    const result = await env.DB.prepare(
      "SELECT * FROM access_logs_v3 WHERE ip_address = ?"
    ).bind(ip).first();

    if (result && result.blocked_until > Date.now()) {
      const remainingMs = result.blocked_until - Date.now();
      const remainingMinutes = Math.ceil(remainingMs / 60000);
      
      return new Response(JSON.stringify({ 
        blocked: true, 
        message: `You were trying to breach into admin console, you are blocked for ${remainingMinutes} minutes.` 
      }), { 
        headers: { "Content-Type": "application/json" } 
      });
    }

    return new Response(JSON.stringify({ blocked: false }), { 
      headers: { "Content-Type": "application/json" } 
    });

  } catch (e) {
    return new Response(JSON.stringify({ blocked: false }), { 
      headers: { "Content-Type": "application/json" } 
    });
  }
}