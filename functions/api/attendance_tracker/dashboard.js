import jwt from '@tsndr/cloudflare-worker-jwt';
import { getValidToken } from './_helpers.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const isValid = await jwt.verify(token, env.JWT_SECRET || 'secret-key-fallback');
  if (!isValid) return new Response(JSON.stringify({ error: "Invalid session" }), { status: 401 });

  const { payload } = jwt.decode(token);
  const rollNo = payload.rollNo;

  if (!rollNo) return new Response(JSON.stringify({ error: "Missing roll no" }), { status: 400 });

  try {
    const { accessToken, spreadsheetId } = await getValidToken(env, rollNo);

    // Read semester dates from query params (frontend stores in localStorage)
    const url = new URL(request.url);
    const semesterStart = url.searchParams.get('semesterStart') || null;
    const semesterEnd = url.searchParams.get('semesterEnd') || null;

    // Get all rows from Attendance Log
    const getRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Attendance%20Log!A:I`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!getRes.ok) {
      const errText = await getRes.text();
      throw new Error('Failed to fetch from Google Sheets: ' + errText);
    }
    
    const sheetData = await getRes.json();
    const values = sheetData.values || [];

    // Compute metrics
    const dataRows = values.slice(1); // skip header
    let present = 0;
    let absent = 0;
    let cancelled = 0;
    
    // Group by "Subject (Type)" — e.g., "IB (Lecture)", "IB (Tutorial)"
    const subjectStats = {};
    const monthlyStats = {};
    const allEntries = [];

    // 1. Fetch actual timetable frequency and pre-populate subjectStats
    // This ensures even subjects with 0 marked classes appear in the dashboard.
    let timetableFreq = {};
    try {
      // First get the student's profile to know their course, semester, section
      const profile = await env.DB.prepare(
        'SELECT * FROM student_profiles WHERE roll_no = ?'
      ).bind(rollNo).first();
      
      if (profile) {
        const rawGroups = [profile.tut_group, profile.prac_group, profile.sec_group, profile.vac_group, profile.aec_group, profile.aec_code].filter(Boolean);
        const groups = [];
        rawGroups.forEach(g => {
          if (typeof g === 'string') {
            groups.push(...g.split(/[,/]+/).map(s => s.trim()).filter(Boolean));
          } else {
            groups.push(g);
          }
        });
        
        // Fetch core subjects
        const coreRows = await env.DB.prepare(
          'SELECT subject_code FROM core_subject_config WHERE course = ? AND semester = ?'
        ).bind(profile.course, profile.semester).all();
        const coreSubjects = new Set(coreRows?.results?.map(r => r.subject_code) || []);

        // Fetch section slots
        const sectionSlots = await env.DB.prepare(
          'SELECT * FROM section_slots WHERE course = ? AND semester = ? AND section = ?'
        ).bind(profile.course, profile.semester, profile.section).all();

        // Fetch Joint slots
        let jointSlots = { results: [] };
        if (groups.length > 0) {
          const placeholders = groups.map(() => '?').join(',');
          jointSlots = await env.DB.prepare(
            `SELECT * FROM section_slots WHERE course = 'Joint' AND semester = ? AND group_id IN (${placeholders})`
          ).bind(profile.semester, ...groups).all();
        }

        const allSlots = [...(sectionSlots.results || []), ...(jointSlots.results || [])];
        const electives = [profile.dse_ge_code, profile.dse_code, profile.ge_code, profile.aec_code].filter(Boolean);
        const validSubjects = new Set([...coreSubjects, ...electives]);

        for (const slot of allSlots) {
          if (slot.group_id && groups.includes(slot.group_id)) {
            validSubjects.add(slot.subject);
          }
        }

        const filteredSlots = allSlots.filter(slot => {
          if (slot.course === 'Joint') return true;
          if (slot.group_id) return groups.includes(slot.group_id);
          if (slot.class_type === 'Lecture') return validSubjects.has(slot.subject);
          return true;
        });

        const freqResults = {};
        for (const slot of filteredSlots) {
          const key = `${slot.subject}|${slot.class_type}`;
          freqResults[key] = (freqResults[key] || 0) + 1;
        }

        // Build frequency map and pre-populate subjectStats
        Object.keys(freqResults).forEach(key => {
          const [subject, class_type] = key.split('|');
          const count = freqResults[key];
          let displaySubject = subject;
          // Map group-based subjects to their actual display names
          if (profile.sec_subject && subject === profile.sec_group) displaySubject = profile.sec_subject;
          if (profile.vac_subject && subject === profile.vac_group) displaySubject = profile.vac_subject;
          if (profile.aec_subject && (subject === profile.aec_group || subject === profile.aec_code)) displaySubject = profile.aec_subject;
          
          const freqKey = `${displaySubject} (${class_type})`;
          timetableFreq[freqKey] = (timetableFreq[freqKey] || 0) + count;
          if (!subjectStats[freqKey]) {
            subjectStats[freqKey] = { 
              name: freqKey, 
              subject: displaySubject, 
              classType: class_type, 
              total: 0, present: 0, absent: 0, cancelled: 0 
            };
          }
        });
      }
    } catch (e) {
      console.warn("Failed to fetch timetable freq", e);
    }

    for (const row of dataRows) {
      const date = row[0] || '';
      const day = row[1] || '';
      const timeSlot = row[2] || '';
      const subj = row[3] || '';
      const room = row[4] || '';
      const teacher = row[5] || '';
      const classType = row[6] || 'Lecture';
      const stat = row[7] || '';
      const markedAt = row[8] || '';
      
      if (stat === 'Present') present++;
      if (stat === 'Absent') absent++;
      if (stat === 'Cancelled') cancelled++;

      // Subject+Type differentiation
      if (subj) {
        const key = `${subj} (${classType})`;
        if (!subjectStats[key]) subjectStats[key] = { name: key, subject: subj, classType, total: 0, present: 0, absent: 0, cancelled: 0 };
        subjectStats[key].total++;
        if (stat === 'Present') subjectStats[key].present++;
        if (stat === 'Absent') subjectStats[key].absent++;
        if (stat === 'Cancelled') subjectStats[key].cancelled++;
      }

      // Monthly breakdown
      if (date) {
        const monthKey = date.substring(0, 7); // "2026-05"
        if (!monthlyStats[monthKey]) monthlyStats[monthKey] = { month: monthKey, present: 0, absent: 0, cancelled: 0, total: 0 };
        monthlyStats[monthKey].total++;
        if (stat === 'Present') monthlyStats[monthKey].present++;
        if (stat === 'Absent') monthlyStats[monthKey].absent++;
        if (stat === 'Cancelled') monthlyStats[monthKey].cancelled++;
      }

      // All entries for calendar view
      allEntries.push({ date, day, timeSlot, subject: subj, room, teacher, classType, status: stat, markedAt });
    }

    // Recent entries (last 15, reversed)
    const recentEntries = [];
    for (let i = dataRows.length - 1; i >= Math.max(0, dataRows.length - 15); i--) {
      recentEntries.push({
        date: dataRows[i][0] || '',
        day: dataRows[i][1] || '',
        timeSlot: dataRows[i][2] || '',
        subject: dataRows[i][3] || '',
        room: dataRows[i][4] || '',
        classType: dataRows[i][6] || 'Lecture',
        status: dataRows[i][7] || ''
      });
    }

    // Convert subject stats to array with percentages
    const subjects = Object.values(subjectStats).map(s => {
      const validClasses = s.total - s.cancelled;
      const percentage = validClasses > 0 ? parseFloat(((s.present / validClasses) * 100).toFixed(1)) : 0;
      return { ...s, percentage };
    });

    // Sort subjects by name
    subjects.sort((a, b) => a.name.localeCompare(b.name));

    const validTotal = present + absent; // excluding cancelled
    const overallPercentage = validTotal > 0 ? parseFloat(((present / validTotal) * 100).toFixed(1)) : 0;

    // ── Projections ──
    const TARGET_PERCENT = 66.67;
    const NON_WORKING_WEEKS = 3;
    
    let totalWeeksInSession = 16; // default fallback
    let workingWeeks = 13; // default: 16 - 3
    let weeksElapsed = 1;
    let weeksRemaining = 13;

    if (semesterStart && semesterEnd) {
      const startDate = new Date(semesterStart);
      const endDate = new Date(semesterEnd);
      const diffMs = endDate - startDate;
      totalWeeksInSession = Math.max(1, Math.round(diffMs / (7 * 24 * 60 * 60 * 1000)));
      workingWeeks = Math.max(1, totalWeeksInSession - NON_WORKING_WEEKS);

      const now = new Date();
      const elapsedMs = Math.min(now, endDate) - startDate;
      weeksElapsed = Math.max(1, Math.round(elapsedMs / (7 * 24 * 60 * 60 * 1000)));
      weeksRemaining = Math.max(0, workingWeeks - weeksElapsed);
    } else {
      // Fallback: estimate from log data
      const allDates = dataRows.map(r => r[0]).filter(Boolean);
      if (allDates.length > 1) {
        const sorted = [...new Set(allDates)].sort();
        const first = new Date(sorted[0]);
        const last = new Date(sorted[sorted.length - 1]);
        const diffMs = last - first;
        weeksElapsed = Math.max(1, Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000)));
      }
      workingWeeks = totalWeeksInSession - NON_WORKING_WEEKS;
      weeksRemaining = Math.max(0, workingWeeks - weeksElapsed);
    }

    const subjectProjections = subjects.map(s => {
      // Use exact classes per week from timetable if available, otherwise fallback to estimation
      const exactFreq = timetableFreq[s.name];
      const classesPerWeek = exactFreq !== undefined ? exactFreq : Math.max(1, Math.round(s.total / weeksElapsed));
      
      // New logic: Denominator dynamically adjusts down for Cancelled and Unmarked classes, 
      // and adjusts up for Extra classes.
      // Denominator = (Valid Logged Classes) + (Expected Future Classes)
      const sessionTotal = (s.present + s.absent) + (classesPerWeek * weeksRemaining);
      const remaining = classesPerWeek * weeksRemaining;
      
      // To achieve 66.67%: mustAttend = ceil((2/3) * sessionTotal - present)
      const mustAttend = Math.max(0, Math.ceil((2/3) * sessionTotal - s.present));
      const canSkip = Math.max(0, remaining - mustAttend);
      const verdict = canSkip >= 0 && mustAttend <= remaining ? 'safe' : 'at_risk';

      return {
        subject: s.name,
        rawSubject: s.subject,
        classType: s.classType,
        currentPercentage: s.percentage,
        classesPerWeek,
        isExactFreq: exactFreq !== undefined,
        sessionTotal,
        attended: s.present,
        remaining,
        mustAttend,
        canSkip,
        verdict
      };
    });

    // Monthly breakdown sorted
    const monthlyBreakdown = Object.values(monthlyStats)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(m => ({
        ...m,
        percentage: (m.total - m.cancelled) > 0 ? parseFloat(((m.present / (m.total - m.cancelled)) * 100).toFixed(1)) : 0
      }));

    // Overall projection
    const totalSessionEstimate = subjectProjections.reduce((sum, s) => sum + s.sessionTotal, 0);
    const totalRemaining = subjectProjections.reduce((sum, s) => sum + s.remaining, 0);
    const totalMustAttend = subjectProjections.reduce((sum, s) => sum + s.mustAttend, 0);
    const totalCanSkip = Math.max(0, totalRemaining - totalMustAttend);

    // -- Option A Implementation: Rebuild Google Sheet Tabs on Dashboard Load --
    // We build the rows for the Subject Summary and Projections tabs using the data we already collected.
    const summaryRows = [
      ['Subject', 'Type', 'Total', 'Present', 'Absent', 'Cancelled', 'Attendance %', 'Status']
    ];
    subjects.forEach((s, idx) => {
      const rowNum = idx + 2;
      summaryRows.push([
        s.subject,
        s.classType,
        `=COUNTIFS('Attendance Log'!D:D, "${s.subject}", 'Attendance Log'!G:G, "${s.classType}")`,
        `=COUNTIFS('Attendance Log'!D:D, "${s.subject}", 'Attendance Log'!G:G, "${s.classType}", 'Attendance Log'!H:H, "Present")`,
        `=COUNTIFS('Attendance Log'!D:D, "${s.subject}", 'Attendance Log'!G:G, "${s.classType}", 'Attendance Log'!H:H, "Absent")`,
        `=COUNTIFS('Attendance Log'!D:D, "${s.subject}", 'Attendance Log'!G:G, "${s.classType}", 'Attendance Log'!H:H, "Cancelled")`,
        `=IF((C${rowNum}-F${rowNum})>0, ROUND(D${rowNum}/(C${rowNum}-F${rowNum})*100, 1)&"%", "N/A")`,
        `=IF(VALUE(SUBSTITUTE(G${rowNum}, "%", ""))>=66.67, "✅ On Track", "⚠️ Below Target")`
      ]);
    });

    const projRows = [
      ['Subject', 'Type', 'Current %', 'Freq/Wk', 'Total (Est.)', 'Attended', 'Remaining', 'Must Attend (66.67%)', 'Can Skip', 'Verdict']
    ];
    subjectProjections.forEach((proj, idx) => {
      const summaryRow = idx + 2;
      const projRow = idx + 2;
      const exactFreq = timetableFreq[proj.subject]; // subject here is the key "Subject (Type)"
      
      const freqFormula = exactFreq !== undefined ? 
        `${exactFreq}` : 
        `=MAX(1, ROUND('Subject Summary'!C${summaryRow}/${weeksElapsed}, 0))`;

      projRows.push([
        proj.rawSubject,
        proj.classType,
        `='Subject Summary'!G${summaryRow}`,
        freqFormula,
        `='Subject Summary'!D${summaryRow} + 'Subject Summary'!E${summaryRow} + (D${projRow}*${weeksRemaining})`,
        `='Subject Summary'!D${summaryRow}`,
        `=D${projRow}*${weeksRemaining}`,
        `=MAX(0, CEILING((2/3)*E${projRow} - F${projRow}, 1))`,
        `=MAX(0, G${projRow}-H${projRow})`,
        `=IF(H${projRow}<=G${projRow}, "✅ Safe", "⚠️ At Risk")`
      ]);
    });

    // Run the updates in the background using Cloudflare Workers' waitUntil
    // This allows the dashboard to return instantly while updating the sheet tabs for manual viewers.
    const updateTabsPromise = (async () => {
      try {
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Subject%20Summary!A:H:clear`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Subject%20Summary!A1?valueInputOption=USER_ENTERED`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ values: summaryRows })
        });
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Projections!A:J:clear`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Projections!A1?valueInputOption=USER_ENTERED`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ values: projRows })
        });
      } catch (e) {
        console.warn("Failed to update sheet tabs in background:", e);
      }
    })();
    context.waitUntil(updateTabsPromise);


    return new Response(JSON.stringify({
      totalClasses: dataRows.length,
      present,
      absent,
      cancelled,
      overallPercentage,
      subjects,
      recentEntries,
      allEntries,
      subjectProjections,
      monthlyBreakdown,
      projections: {
        targetPercent: TARGET_PERCENT,
        totalWeeksInSession,
        workingWeeks,
        nonWorkingWeeks: NON_WORKING_WEEKS,
        sessionTotalEstimate: totalSessionEstimate,
        weeksElapsed,
        weeksRemaining,
        remainingClasses: totalRemaining,
        classesNeededFor67: totalMustAttend,
        canSkip: totalCanSkip,
        status: totalMustAttend <= totalRemaining ? 'safe' : 'at_risk',
        hasSemesterDates: !!(semesterStart && semesterEnd)
      }
    }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
