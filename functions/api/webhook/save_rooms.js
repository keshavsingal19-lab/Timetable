export async function onRequestPost(context) {
  const { request, env } = context;

  // Verify Authorization
  const authHeader = request.headers.get("Authorization");
  const expectedSecret = env.WEBHOOK_SECRET || "dev_secret";
  if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const payload = await request.json();
    if (payload.action !== "save_rooms" || !payload.rooms) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
    }

    // Ensure table exists
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS campus_rooms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      emptySlots TEXT NOT NULL,
      occupiedBy TEXT NOT NULL DEFAULT '{}',
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`).run();

    // Add occupiedBy if missing from older schemas
    try { await env.DB.prepare("ALTER TABLE campus_rooms ADD COLUMN occupiedBy TEXT NOT NULL DEFAULT '{}'").run(); } catch(e) {}

    // Insert
    const insertStmt = env.DB.prepare(`
      INSERT INTO campus_rooms (id, name, type, emptySlots, occupiedBy, last_updated)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        name=excluded.name, type=excluded.type, emptySlots=excluded.emptySlots, occupiedBy=excluded.occupiedBy, last_updated=CURRENT_TIMESTAMP
    `);

    const batch = payload.rooms.map(room =>
      insertStmt.bind(
        room.id, 
        room.name || room.id, 
        room.type, 
        JSON.stringify(room.emptySlots || {}), 
        JSON.stringify(room.occupiedBy || {})
      )
    );

    if (batch.length > 0) {
      await env.DB.batch(batch);
    }

    // Process teacherDirectory if present — upsert scraped teacher names into DB
    if (payload.teacherDirectory && Object.keys(payload.teacherDirectory).length > 0) {
      // Ensure teachers table exists
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS teachers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        department TEXT
      )`).run();

      for (const [code, name] of Object.entries(payload.teacherDirectory)) {
        try {
          // Try with access_code column (may exist in some schema variants)
          await env.DB.prepare(`
            INSERT INTO teachers (id, name, department, access_code) 
            VALUES (?, ?, 'SRCC', ?)
            ON CONFLICT(id) DO UPDATE SET name=excluded.name
          `).bind(code, name, `WH_${code}_${Date.now()}`).run();
        } catch (e) {
          // Fallback for schema without access_code column
          await env.DB.prepare(`
            INSERT INTO teachers (id, name, department) 
            VALUES (?, ?, 'SRCC')
            ON CONFLICT(id) DO UPDATE SET name=excluded.name
          `).bind(code, name).run();
        }
      }
    }

    return new Response(JSON.stringify({ success: true, message: "Webhook accepted." }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
