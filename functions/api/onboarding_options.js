export async function onRequestGet(context) {
  const { env } = context;
  const url = new URL(context.request.url);
  const rollNo = url.searchParams.get('rollNo')?.toUpperCase();

  if (!rollNo) return new Response(JSON.stringify({ error: 'Missing rollNo' }), { status: 400 });

  try {
    // 1. Get student profile from the CSV-uploaded profiles
    const profile = await env.DB.prepare(
      'SELECT * FROM student_profiles WHERE roll_no = ?'
    ).bind(rollNo).first();

    if (!profile) {
      return new Response(JSON.stringify({ 
        error: 'Profile not found. Please ensure your details have been uploaded by the admin.' 
      }), { status: 404 });
    }

    const { course, semester, section } = profile;

    // 2. Fetch Core Subjects for this course/semester
    const coreSubjectRows = await env.DB.prepare(
      'SELECT subject_code FROM core_subject_config WHERE course = ? AND semester = ?'
    ).bind(course, semester).all();
    const coreSubjects = new Set(coreSubjectRows.results.map(r => r.subject_code));

    // 3. Fetch all unique subject codes for this section (Lecture class type, section-wide)
    const sectionSlots = await env.DB.prepare(`
      SELECT DISTINCT subject 
      FROM section_slots 
      WHERE course = ? AND semester = ? AND section = ? 
      AND group_id IS NULL AND class_type = 'Lecture'
    `).bind(course, semester, section).all();

    // The non-core subjects found in the section timetable are DSE/GE options
    let dseGeOptions = [];
    let aecOptions = [];
    
    for (const slot of sectionSlots.results) {
      if (!coreSubjects.has(slot.subject)) {
        // If it's a Hindi subject, it goes to AEC options (Sem 1-4)
        if (['HINDI', 'HINDI-A', 'HINDI-B', 'HINDI-C'].includes(slot.subject)) {
          aecOptions.push(slot.subject);
        } else {
          dseGeOptions.push(slot.subject);
        }
      }
    }

    // 4. Determine Semester phase
    const semNumMap = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6 };
    const semNum = semNumMap[semester] || parseInt(semester);
    const isSem1to4 = semNum <= 4;
    const isSem5or6 = semNum === 5 || semNum === 6;

    // 5. Fetch AEC Options from Joint Timetable (if applicable)
    if (isSem1to4) {
      const jointSlots = await env.DB.prepare(`
        SELECT DISTINCT group_id 
        FROM section_slots 
        WHERE course = 'Joint' AND semester = ? 
        AND group_id LIKE 'AEC-%'
      `).bind(semester).all();

      jointSlots.results.forEach(slot => {
        if (slot.group_id) aecOptions.push(slot.group_id);
      });

      // Also add CSV hint if exists and not already there
      if (profile.aec_group && !aecOptions.includes(profile.aec_group)) {
        aecOptions.push(profile.aec_group);
      }
      
      // Always add Cluster option (meaning no AEC at SRCC)
      aecOptions.push('Cluster');
    }

    return new Response(JSON.stringify({
      success: true,
      profile: {
        name: profile.name,
        rollNo: profile.roll_no,
        course: profile.course,
        semester: profile.semester,
        section: profile.section,
        tutGroup: profile.tut_group,
        pracGroup: profile.prac_group
      },
      isSem1to4,
      isSem5or6,
      dseGeOptions,
      aecOptions,
      // We require selection if there is more than one option. For Sem 5/6, we always need 2 selections.
      dseGeRequired: isSem5or6 ? true : dseGeOptions.length > 1,
      aecRequired: isSem1to4 && aecOptions.length > 0
    }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
