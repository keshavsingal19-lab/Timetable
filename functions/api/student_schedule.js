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
