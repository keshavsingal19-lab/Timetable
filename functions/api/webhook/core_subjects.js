const DEFAULT_CORE_SUBJECTS = [
  { course: 'B.Com. (Hons.)', semester: 'I', code1: 'MPA', code2: 'BLAW', code3: 'FA' },
  { course: 'B.Com. (Hons.)', semester: 'II', code1: 'CA', code2: 'CLAW', code3: 'HRM' },
  { course: 'B.Com. (Hons.)', semester: 'III', code1: 'BMATH', code2: 'FM', code3: 'POM' },
  { course: 'B.Com. (Hons.)', semester: 'IV', code1: 'COST', code2: 'BSTAT', code3: 'IB' },
  { course: 'B.Com. (Hons.)', semester: 'V', code1: 'ITLP', code2: 'BECON', code3: 'MA' },
  { course: 'B.Com. (Hons.)', semester: 'VI', code1: 'BA', code2: 'CG', code3: 'GSTCL' },
  { course: 'B.A. (Hons.) Economics', semester: 'I', code1: 'INTROMICRO', code2: 'INTROMME', code3: 'ISE' },
  { course: 'B.A. (Hons.) Economics', semester: 'II', code1: 'INTROMACRO', code2: 'INTERMME', code3: 'ISE' },
  { course: 'B.A. (Hons.) Economics', semester: 'III', code1: 'MICRO', code2: 'MACRO', code3: 'ADV MME' },
  { course: 'B.A. (Hons.) Economics', semester: 'IV', code1: 'MICRO', code2: 'MACRO', code3: 'TRIX' },
  { course: 'B.A. (Hons.) Economics', semester: 'V', code1: 'GT', code2: 'GBS', code3: 'IDE' },
  { course: 'B.A. (Hons.) Economics', semester: 'VI', code1: 'IT', code2: 'DTE', code3: 'IGD' }
];

export async function onRequestGet(context) {
  const { env } = context;

  try {
    // Ensure the table exists
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS core_subject_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course TEXT NOT NULL,
        semester TEXT NOT NULL,
        subject_code TEXT NOT NULL,
        UNIQUE(course, semester, subject_code)
      )
    `).run();

    // Seed if empty
    const countResult = await env.DB.prepare('SELECT COUNT(*) as count FROM core_subject_config').first();
    if (countResult && countResult.count === 0) {
      const stmt = env.DB.prepare('INSERT INTO core_subject_config (course, semester, subject_code) VALUES (?, ?, ?)');
      const batch = [];
      for (const item of DEFAULT_CORE_SUBJECTS) {
        batch.push(stmt.bind(item.course, item.semester, item.code1));
        batch.push(stmt.bind(item.course, item.semester, item.code2));
        batch.push(stmt.bind(item.course, item.semester, item.code3));
      }
      for (let i = 0; i < batch.length; i += 50) {
        await env.DB.batch(batch.slice(i, i + 50));
      }
    }

    // Fetch and group
    const results = await env.DB.prepare('SELECT * FROM core_subject_config ORDER BY course, semester').all();
    const grouped = {};
    for (const row of results.results) {
      const key = `${row.course}_${row.semester}`;
      if (!grouped[key]) {
        grouped[key] = { course: row.course, semester: row.semester, codes: [] };
      }
      grouped[key].codes.push(row.subject_code);
    }

    return new Response(JSON.stringify({ success: true, data: Object.values(grouped) }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // Verify Authorization
  const authHeader = request.headers.get("Authorization");
  const expectedSecret = env.WEBHOOK_SECRET || "dev_secret";
  if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const { configs } = await request.json();
    if (!Array.isArray(configs)) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
    }

    // Ensure the table exists
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS core_subject_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course TEXT NOT NULL,
        semester TEXT NOT NULL,
        subject_code TEXT NOT NULL,
        UNIQUE(course, semester, subject_code)
      )
    `).run();

    // Clear and re-insert
    await env.DB.prepare('DELETE FROM core_subject_config').run();
    const stmt = env.DB.prepare('INSERT INTO core_subject_config (course, semester, subject_code) VALUES (?, ?, ?)');
    const batch = [];
    for (const item of configs) {
      for (const code of item.codes) {
        if (code) batch.push(stmt.bind(item.course, item.semester, code));
      }
    }
    for (let i = 0; i < batch.length; i += 50) {
      await env.DB.batch(batch.slice(i, i + 50));
    }

    return new Response(JSON.stringify({ success: true, message: 'Core subjects updated' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
