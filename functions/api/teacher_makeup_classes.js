export async function onRequest(context) {
  const { request, env } = context;
  const db = env.DB;

  try {
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const teacherId = url.searchParams.get('teacher_id');
      if (!teacherId) return Response.json({ error: 'Missing teacher_id' }, { status: 400 });

      // Create table if not exists just in case
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

      const classes = await db.prepare(
        'SELECT * FROM makeup_classes WHERE teacher_id = ? ORDER BY date DESC, period_index ASC'
      ).bind(teacherId.toUpperCase()).all();

      return Response.json({ success: true, classes: classes.results || [] });
    }
    
    if (request.method === 'DELETE') {
      const payload = await request.json();
      const { secret, id, teacher_id } = payload;
      
      if (secret !== env.WEBHOOK_SECRET) {
        return Response.json({ error: 'Unauthorized: Invalid webhook secret' }, { status: 401 });
      }

      const result = await db.prepare(
        'DELETE FROM makeup_classes WHERE id = ? AND teacher_id = ?'
      ).bind(id, teacher_id.toUpperCase()).run();

      if (result.meta.changes > 0) {
        return Response.json({ success: true, message: 'Class deleted successfully' });
      } else {
        return Response.json({ error: 'Class not found or unauthorized' }, { status: 404 });
      }
    }

    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    return Response.json({ error: 'Database error: ' + error.message }, { status: 500 });
  }
}
