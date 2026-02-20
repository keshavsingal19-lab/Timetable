export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { rollNo, email, semester, section } = body;

    // 1. Constraint: Must end with @srcc.edu OR be the master admin email
    if (!email.endsWith('@srcc.edu') && email !== 'keshavsingal19@gmail.com') {
      return new Response(JSON.stringify({ error: "Only @srcc.edu emails are allowed." }), { status: 400 });
    }

    // 2. Generate a random 6-character access code
    const accessCode = Math.random().toString(36).slice(-6).toUpperCase();

    // 3. Save to Cloudflare D1 Database
    const db = env.DB; 
    const stmt = db.prepare(
      "INSERT INTO students (roll_no, email, semester, section, password) VALUES (?, ?, ?, ?, ?)"
    ).bind(rollNo, email, semester, section, accessCode);
    
    try {
      await stmt.run();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Roll number or Email already registered." }), { status: 400 });
    }

    // 4. Send Email via Google Apps Script
    // PASTE YOUR GOOGLE SCRIPT WEB APP URL HERE:
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzHZoqTdQBWMirZN8_5B9ykqi6EdVGrbP_UNPMdgypy5wESWhW-bbViWvM7GJ2Pp4iF/exec";
    
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ email: email, password: accessCode })
    });

    return new Response(JSON.stringify({ success: true, message: "Access code sent to your email! (Please check your spam as well and mark not spam.)" }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Server error during registration." }), { status: 500 });
  }
}