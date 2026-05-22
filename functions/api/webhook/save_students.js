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
    if (payload.action !== "save_students" || !Array.isArray(payload.students)) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
    }

    // Use a SEPARATE table from the auth `students` table to avoid schema conflicts.
    // The auth table has: (roll_no, email, password, semester, section)
    // This table stores the richer profile data for schedule mapping.
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS student_profiles (
      roll_no TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      course TEXT NOT NULL,
      semester TEXT NOT NULL,
      section TEXT NOT NULL,
      tut_group TEXT,
      prac_group TEXT,
      dse_subject TEXT,
      sec_subject TEXT,
      vac_subject TEXT,
      sec_group TEXT,
      vac_group TEXT,
      email TEXT,
      aec_subject TEXT,
      aec_group TEXT,
      cluster_semester TEXT,
      aec_course_cluster TEXT,
      dse_ge_code TEXT,
      dse_code TEXT,
      ge_code TEXT,
      aec_code TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`).run();

    // Add columns if they don't exist (graceful migration)
    const columnsToAdd = ['dse_ge_code', 'dse_code', 'ge_code', 'aec_code'];
    for (const col of columnsToAdd) {
      try {
        await env.DB.prepare(`ALTER TABLE student_profiles ADD COLUMN ${col} TEXT`).run();
      } catch (e) {
        // Ignore "column already exists" errors
      }
    }

    // Insert or update student profile data (preserves the auth `students` table)
    const insertStmt = env.DB.prepare(`
      INSERT INTO student_profiles (
        roll_no, name, course, semester, section, tut_group, prac_group,
        dse_subject, sec_subject, vac_subject, sec_group, vac_group,
        email, aec_subject, aec_group, cluster_semester, aec_course_cluster
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(roll_no) DO UPDATE SET
        name=excluded.name, course=excluded.course, semester=excluded.semester,
        section=excluded.section, tut_group=excluded.tut_group, prac_group=excluded.prac_group,
        dse_subject=excluded.dse_subject, sec_subject=excluded.sec_subject, vac_subject=excluded.vac_subject,
        sec_group=excluded.sec_group, vac_group=excluded.vac_group,
        email=excluded.email, aec_subject=excluded.aec_subject, aec_group=excluded.aec_group,
        cluster_semester=excluded.cluster_semester, aec_course_cluster=excluded.aec_course_cluster
    `);

    const batch = [];
    for (const student of payload.students) {
      batch.push(
        insertStmt.bind(
          student.roll_no,
          student.name,
          student.course,
          student.semester,
          student.section,
          student.tut_group || null,
          student.prac_group || null,
          student.dse_subject || null,
          student.sec_subject || null,
          student.vac_subject || null,
          student.sec_group || null,
          student.vac_group || null,
          student.email || null,
          student.aec_subject || null,
          student.aec_group || null,
          student.cluster_semester || null,
          student.aec_course_cluster || null
        )
      );
    }

    // Process in chunks of 50 to avoid D1 batch limits
    for (let i = 0; i < batch.length; i += 50) {
      await env.DB.batch(batch.slice(i, i + 50));
    }

    return new Response(JSON.stringify({ success: true, message: `Saved ${batch.length} student profiles` }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
