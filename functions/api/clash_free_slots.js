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

    // 3. Get makeup classes already scheduled for this section or teacher
    // We only care about future makeup classes
    const today = new Date();
    // Convert to IST safely or just use generic ISO
    const todayStr = today.toISOString().split('T')[0];

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
      SELECT date, period_index 
      FROM makeup_classes
      WHERE ((course = ? AND semester = ? AND section = ?) OR teacher_id = ?)
      AND date >= ?
    `;
    const makeupSlots = await db.prepare(makeupQuery).bind(course, semester, section, teacherId, todayStr).all();

    // Fast lookup for regular timetable blocks
    const regularBlockedSlots = new Set();
    if (sectionSlots.results) sectionSlots.results.forEach(s => regularBlockedSlots.add(`${s.day_of_week}_${s.period_index}`));
    if (teacherSlots.results) teacherSlots.results.forEach(s => regularBlockedSlots.add(`${s.day_of_week}_${s.period_index}`));

    // Fast lookup for makeup blocks for this section/teacher
    const makeupBlockedSlots = new Set();
    if (makeupSlots.results) makeupSlots.results.forEach(s => makeupBlockedSlots.add(`${s.date}_${s.period_index}`));

    // 4. Get ALL future makeup classes to exclude their rooms!
    const allMakeupRooms = await db.prepare(`SELECT room, date, period_index FROM makeup_classes WHERE date >= ?`).bind(todayStr).all();
    const bookedRoomsMap = {}; // { 'YYYY-MM-DD_periodIndex': Set(['R12', 'PB4']) }
    if (allMakeupRooms.results) {
      allMakeupRooms.results.forEach(m => {
        const key = `${m.date}_${m.period_index}`;
        if (!bookedRoomsMap[key]) bookedRoomsMap[key] = new Set();
        bookedRoomsMap[key].add(m.room);
      });
    }

    // Helper to calculate target dates for the next week
    const getNextDateForDay = (dayName) => {
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const targetDayIndex = daysOfWeek.indexOf(dayName);
      const currentDayIndex = today.getDay();
      let daysToAdd = targetDayIndex - currentDayIndex;
      if (daysToAdd <= 0) daysToAdd += 7; 
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysToAdd);
      return targetDate.toISOString().split('T')[0];
    };

    // 5. Find vacant rooms for all available slots
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const periods = [0, 1, 2, 3, 4]; // Only slots before 1:30 PM

    let dbRooms = [];
    try {
      const roomRes = await db.prepare("SELECT id, name, type, emptySlots FROM campus_rooms").all();
      dbRooms = roomRes.results || [];
    } catch(e) {}

    const availableSlots = [];

    for (const day of days) {
      const targetDateStr = getNextDateForDay(day);
      
      for (const period of periods) {
        const regularKey = `${day}_${period}`;
        const makeupKey = `${targetDateStr}_${period}`;
        
        // If the slot is completely free for both students and teacher
        if (!regularBlockedSlots.has(regularKey) && !makeupBlockedSlots.has(makeupKey)) {
          const emptyRooms = [];
          
          for (const room of dbRooms) {
            // Room is already booked by ANOTHER extra class on this specific date and time?
            if (bookedRoomsMap[makeupKey] && bookedRoomsMap[makeupKey].has(room.name)) {
              continue;
            }

            try {
              const emptySlotsObj = JSON.parse(room.emptySlots || '{}');
              const dayEmptySlots = emptySlotsObj[day] || [];
              if (dayEmptySlots.includes(period)) {
                emptyRooms.push(room.name);
              }
            } catch(e) {}
          }

          if (emptyRooms.length > 0) {
            availableSlots.push({
              day,
              dateStr: targetDateStr,
              periodIndex: period,
              availableRooms: emptyRooms
            });
          }
        }
      }
    }

    // Sort chronologically (by actual date string, then period)
    availableSlots.sort((a, b) => {
      if (a.dateStr !== b.dateStr) {
        return a.dateStr.localeCompare(b.dateStr);
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
