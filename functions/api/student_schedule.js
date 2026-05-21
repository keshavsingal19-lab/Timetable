export async function onRequestGet(context) {
  const { env } = context;
  const url = new URL(context.request.url);
  const rollNo = url.searchParams.get('rollNo')?.toUpperCase();

  if (!rollNo) return Response.json({ error: 'Missing rollNo' }, { status: 400 });

  try {
    // 1. Look up student profile (from student_profiles, NOT the auth students table)
    const profile = await env.DB.prepare(
      'SELECT * FROM student_profiles WHERE roll_no = ?'
    ).bind(rollNo).first();

    if (!profile) {
      return Response.json({ error: 'Student profile not found in database' }, { status: 404 });
    }

    // 2. Build group list for filtering
    const groups = [
      profile.tut_group,
      profile.prac_group,
      profile.sec_group,
      profile.vac_group
    ].filter(Boolean);

    // 3. Query section_slots matching this student's course/sem/section
    //    Include: slots with no group (section-wide) OR matching any of student's groups
    let slots;
    if (groups.length > 0) {
      const placeholders = groups.map(() => '?').join(',');
      const query = `
        SELECT * FROM section_slots 
        WHERE course = ? AND semester = ? AND section = ?
        AND (group_id IS NULL OR group_id IN (${placeholders}))
        ORDER BY 
          CASE day_of_week 
            WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 
            WHEN 'Wednesday' THEN 3 WHEN 'Thursday' THEN 4 
            WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6 
          END,
          period_index
      `;
      const bindParams = [profile.course, profile.semester, profile.section, ...groups];
      slots = await env.DB.prepare(query).bind(...bindParams).all();
    } else {
      const query = `
        SELECT * FROM section_slots 
        WHERE course = ? AND semester = ? AND section = ?
        AND group_id IS NULL
        ORDER BY 
          CASE day_of_week 
            WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 
            WHEN 'Wednesday' THEN 3 WHEN 'Thursday' THEN 4 
            WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6 
          END,
          period_index
      `;
      slots = await env.DB.prepare(query).bind(profile.course, profile.semester, profile.section).all();
    }

    // 4. Transform to the ClassSession format expected by App.tsx
    const schedule = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [] };
    
    if (slots && slots.results) {
      for (const slot of slots.results) {
        if (schedule[slot.day_of_week]) {
          schedule[slot.day_of_week].push({
            periodIndex: slot.period_index,
            subject: slot.subject,
            room: slot.room,
            type: slot.class_type,
            teacher: slot.teacher_code
          });
        }
      }
    }

    // 4.5 Fetch Make-up classes
    try {
      // Create table if not exists just in case
      await env.DB.prepare(`
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

      const makeupSlots = await env.DB.prepare(`
        SELECT * FROM makeup_classes
        WHERE course = ? AND semester = ? AND section = ?
      `).bind(profile.course, profile.semester, profile.section).all();

      if (makeupSlots && makeupSlots.results) {
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

        for (const slot of makeupSlots.results) {
          if (slot.date < todayDateStr) continue;
          if (slot.date === todayDateStr && slot.period_index < currentPeriodIndex) continue;

          if (schedule[slot.day_of_week]) {
            // Check if there is already a makeup class or normal class here.
            // For now, we'll just push it and maybe the frontend can show both or highlight the makeup class.
            schedule[slot.day_of_week].push({
              periodIndex: slot.period_index,
              subject: slot.subject,
              room: slot.room,
              type: 'Extra',
              teacher: slot.teacher_id,
              date: slot.date // Helpful for frontend to show the specific date
            });
          }
        }
      }
    } catch (e) {
      // Ignore if makeup table doesn't exist
    }

    // 5. Check if we actually got any slots
    const totalSlots = Object.values(schedule).reduce((sum, day) => sum + day.length, 0);
    if (totalSlots === 0) {
      return Response.json({ error: 'No schedule data found for this student' }, { status: 404 });
    }

    return Response.json({
      source: 'database',
      student: { 
        name: profile.name, 
        rollNo, 
        course: profile.course,
        semester: profile.semester, 
        section: profile.section,
        groups
      }, 
      schedule 
    });
  } catch (err) {
    // Table may not exist yet — return 404 so frontend falls back to static data
    return Response.json({ error: err.message }, { status: 500 });
  }
}
