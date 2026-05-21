export async function onRequestGet(context) {
  const { env } = context;
  const url = new URL(context.request.url);
  const rawCourse = url.searchParams.get('course');
  const rawSemester = url.searchParams.get('semester');
  const section = url.searchParams.get('section');
  const teacherId = url.searchParams.get('teacher_id')?.toUpperCase();
  const groupId = url.searchParams.get('group_id');

  if (!rawCourse || !rawSemester || !section || !teacherId) {
    return Response.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  // Normalize Course
  const course = rawCourse === 'B.Com (Hons.)' ? 'B.Com. (Hons.)' : rawCourse;

  // Normalize Semester
  let semester = rawSemester;
  if (rawSemester === 'Sem 2') semester = 'II';
  else if (rawSemester === 'Sem 4') semester = 'IV';
  else if (rawSemester === 'Sem 6') semester = 'VI';

  try {
    const db = env.DB;

    // 1. Get all occupied slots for this section
    // If groupId is provided, only check slots for the whole section (NULL) or that specific group.
    // If no groupId, check ALL slots for the section (since any group being busy means the whole section isn't fully free).
    let sectionQuery = `
      SELECT day_of_week, period_index 
      FROM section_slots 
      WHERE course = ? AND semester = ? AND section = ?
    `;
    let sectionParams = [course, semester, section];
    
    if (groupId) {
      sectionQuery += ` AND (group_id IS NULL OR group_id = ?)`;
      sectionParams.push(groupId);
    }

    const sectionSlots = await db.prepare(sectionQuery).bind(...sectionParams).all();
    
    // 2. Get all occupied slots for the teacher
    const teacherQuery = `
      SELECT day_of_week, period_index
      FROM section_slots
      WHERE teacher_code = ?
    `;
    const teacherSlots = await db.prepare(teacherQuery).bind(teacherId).all();

    // 3. Get makeup classes already scheduled for this section or teacher (to prevent overlapping makeups)
    // Create table if not exists first, otherwise query might fail
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

    const makeupQuery = `
      SELECT day_of_week, period_index 
      FROM makeup_classes
      WHERE (course = ? AND semester = ? AND section = ?) OR teacher_id = ?
    `;
    const makeupSlots = await db.prepare(makeupQuery).bind(course, semester, section, teacherId).all();

    // Combine all blocked slots into a set for fast lookup
    // format: "Monday_3"
    const blockedSlots = new Set();
    
    if (sectionSlots.results) {
      sectionSlots.results.forEach(s => blockedSlots.add(`${s.day_of_week}_${s.period_index}`));
    }
    if (teacherSlots.results) {
      teacherSlots.results.forEach(s => blockedSlots.add(`${s.day_of_week}_${s.period_index}`));
    }
    if (makeupSlots.results) {
      makeupSlots.results.forEach(s => blockedSlots.add(`${s.day_of_week}_${s.period_index}`));
    }

    // 4. Find vacant rooms for all available slots
    // We check a standard 6 days x 8 periods grid
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const periods = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // 9 periods

    let dbRooms = [];
    try {
      const roomRes = await db.prepare("SELECT id, name, type, emptySlots FROM campus_rooms").all();
      dbRooms = roomRes.results || [];
    } catch(e) {
      // Room table might be empty or missing
    }

    const availableSlots = [];

    for (const day of days) {
      for (const period of periods) {
        const slotKey = `${day}_${period}`;
        
        // If the slot is completely free for both students and teacher
        if (!blockedSlots.has(slotKey)) {
          // Find rooms that are empty on this day at this period
          const emptyRooms = [];
          for (const room of dbRooms) {
            try {
              const emptySlotsObj = JSON.parse(room.emptySlots || '{}');
              const dayEmptySlots = emptySlotsObj[day] || [];
              if (dayEmptySlots.includes(period)) {
                emptyRooms.push(room.name);
              }
            } catch(e) {}
          }

          // Only suggest the slot if there's at least one room available
          if (emptyRooms.length > 0) {
            availableSlots.push({
              day,
              periodIndex: period,
              availableRooms: emptyRooms
            });
          }
        }
      }
    }

    // Map days to sort indices
    const dayIndices = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };

    // Sort chronologically (by day then period)
    availableSlots.sort((a, b) => {
      if (dayIndices[a.day] !== dayIndices[b.day]) {
        return dayIndices[a.day] - dayIndices[b.day];
      }
      return a.periodIndex - b.periodIndex;
    });

    return Response.json({
      success: true,
      course,
      semester,
      section,
      teacherId,
      recommendations: availableSlots
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
