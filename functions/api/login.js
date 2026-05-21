export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { password } = await request.json();

    if (password === env.ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ success: true }), { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      });
    } else {
      // RATE LIMIT BYPASSED FOR TESTING
      return new Response(JSON.stringify({ 
        error: "Invalid password", 
        attemptsLeft: 999 
      }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

  } catch (e) {
    return new Response(JSON.stringify({ error: "Server error: " + e.message }), { status: 500 });
  }
}