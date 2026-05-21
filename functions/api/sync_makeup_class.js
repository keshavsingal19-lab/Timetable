export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const payload = await request.json();
    const { secret, course, semester, section, subject, room, date, day_of_week, period_index, teacher_id } = payload;

    // Verify webhook secret
    if (secret !== env.WEBHOOK_SECRET) {
      return Response.json({ error: 'Unauthorized: Invalid webhook secret' }, { status: 401 });
    }

    if (!course || !semester || !section || !subject || !room || !date || !day_of_week || period_index === undefined || !teacher_id) {
      return Response.json({ error: 'Missing required payload fields' }, { status: 400 });
    }

    const db = env.DB;
    const now = Math.floor(Date.now() / 1000);

    // Create table if not exists
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS makeup_classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course TEXT,
        semester TEXT,
        section TEXT,
        subject TEXT,
        room TEXT,
        date TEXT,
        day_of_week TEXT,
        period_index INTEGER,
        teacher_id TEXT,
        created_at INTEGER
      )
    `).run();

    // Insert the makeup class
    await db.prepare(`
      INSERT INTO makeup_classes (course, semester, section, subject, room, date, day_of_week, period_index, teacher_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      course, semester, section, subject, room, date, day_of_week, period_index, teacher_id.toUpperCase(), now
    ).run();

    return Response.json({ success: true, message: 'Makeup class scheduled successfully' }, { status: 200 });

  } catch (error) {
    return Response.json({ error: 'Database error: ' + error.message }, { status: 500 });
  }
}
