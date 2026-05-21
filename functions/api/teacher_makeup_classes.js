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

      // Filter expired classes
      const now = new Date();
      const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      const istDate = new Date(istString);
      const todayDateStr = istDate.getFullYear() + "-" + String(istDate.getMonth() + 1).padStart(2, '0') + "-" + String(istDate.getDate()).padStart(2, '0');
      
      const timeMins = istDate.getHours() * 60 + istDate.getMinutes();
      let currentPeriodIndex = -1;
      if (timeMins >= 8*60+30 && timeMins < 9*60+30) currentPeriodIndex = 0;
      else if (timeMins >= 9*60+30 && timeMins < 10*60+30) currentPeriodIndex = 1;
      else if (timeMins >= 10*60+30 && timeMins < 11*60+30) currentPeriodIndex = 2;
      else if (timeMins >= 11*60+30 && timeMins < 12*60+30) currentPeriodIndex = 3;
      else if (timeMins >= 12*60+30 && timeMins < 13*60+30) currentPeriodIndex = 4;
      else if (timeMins >= 14*60 && timeMins < 15*60) currentPeriodIndex = 5;
      else if (timeMins >= 15*60 && timeMins < 16*60) currentPeriodIndex = 6;
      else if (timeMins >= 16*60 && timeMins < 17*60) currentPeriodIndex = 7;
      else if (timeMins >= 17*60 && timeMins < 18*60) currentPeriodIndex = 8;
      else if (timeMins >= 18*60) currentPeriodIndex = 9;

      const results = (classes.results || []).filter(cls => {
        if (cls.date < todayDateStr) return false;
        if (cls.date === todayDateStr && cls.period_index < currentPeriodIndex) return false;
        return true;
      });

      return Response.json({ success: true, classes: results });
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
