export async function onRequest(context) {
  try {
    // RATE LIMIT BYPASSED FOR TESTING
    return new Response(JSON.stringify({ blocked: false }), { 
      headers: { "Content-Type": "application/json" } 
    });

  } catch (e) {
    return new Response(JSON.stringify({ blocked: false }), { 
      headers: { "Content-Type": "application/json" } 
    });
  }
}