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
    if (payload.action !== "save_sections" || !payload.slots) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
    }

    // Ensure section_slots table exists
    // Use COALESCE in the unique index to handle NULL group_id properly
    // (SQLite treats NULLs as distinct, so a plain UNIQUE would allow duplicates)
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS section_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course TEXT NOT NULL,
      semester TEXT NOT NULL,
      section TEXT NOT NULL,
      day_of_week TEXT NOT NULL,
      period_index INTEGER NOT NULL,
      class_type TEXT NOT NULL,
      subject TEXT NOT NULL,
      room TEXT NOT NULL,
      teacher_code TEXT,
      group_id TEXT
    )`).run();

    // Create unique index with COALESCE to handle NULLs
    try {
      await env.DB.prepare(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_section_slots_unique 
        ON section_slots(course, semester, section, day_of_week, period_index, COALESCE(group_id, '__NONE__'))
      `).run();
    } catch(e) {
      // Index may already exist
    }

    const course = payload.course;
    const semester = payload.semester;
    const section = payload.section;

    // Delete existing slots for this specific section
    if (course && semester && section) {
      await env.DB.prepare(`
        DELETE FROM section_slots 
        WHERE course = ? AND semester = ? AND section = ?
      `).bind(course, semester, section).run();
    } else {
      // If full sync, clear table
      if (payload.clearAll) {
         await env.DB.prepare(`DELETE FROM section_slots`).run();
      }
    }

    // Insert new slots
    const insertStmt = env.DB.prepare(`
      INSERT OR REPLACE INTO section_slots (
        course, semester, section, day_of_week, period_index,
        class_type, subject, room, teacher_code, group_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const batch = [];
    for (const slot of payload.slots) {
      batch.push(
        insertStmt.bind(
          slot.course,
          slot.semester,
          slot.section,
          slot.day_of_week,
          slot.period_index,
          slot.class_type,
          slot.subject,
          slot.room,
          slot.teacher_code || null,
          slot.group_id || null
        )
      );
    }

    // Process in chunks of 50 to avoid D1 batch limits
    for (let i = 0; i < batch.length; i += 50) {
      await env.DB.batch(batch.slice(i, i + 50));
    }

    return new Response(JSON.stringify({ success: true, message: `Saved ${batch.length} section slots` }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
