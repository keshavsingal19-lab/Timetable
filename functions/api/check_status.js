export async function onRequest(context) {
  const { request, env } = context;
  
  // 1. Get User IP
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "DB not configured" }), { status: 500 });
  }

  try {
    // 2. Check if this IP is blocked
    const result = await env.DB.prepare(
      "SELECT * FROM login_attempts WHERE ip_address = ?"
    ).bind(ip).first();

    if (result && result.blocked_until > Date.now()) {
      // User is still blocked
      const remainingMs = result.blocked_until - Date.now();
      const remainingMinutes = Math.ceil(remainingMs / 60000);
      
      return new Response(JSON.stringify({ 
        blocked: true, 
        message: `You were trying to breach into admin console, you are blocked for ${remainingMinutes} minutes.` 
      }), { 
        headers: { "Content-Type": "application/json" } 
      });
    }

    // User is NOT blocked
    return new Response(JSON.stringify({ blocked: false }), { 
      headers: { "Content-Type": "application/json" } 
    });

  } catch (e) {
    // If table doesn't exist yet, they aren't blocked
    return new Response(JSON.stringify({ blocked: false }), { 
      headers: { "Content-Type": "application/json" } 
    });
  }
}