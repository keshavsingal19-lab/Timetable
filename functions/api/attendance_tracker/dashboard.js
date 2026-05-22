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
    const NON_WORKING_WEEKS = 2;
    
    let totalWeeksInSession = 16; // default fallback
    let workingWeeks = 14; // default: 16 - 2
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

    // Fetch actual timetable frequency to get exact classes per week
    let timetableFreq = {};
    try {
      const freqRes = await env.DB.prepare(`
        SELECT s.subject_name, s.type as class_type, count(*) as count
        FROM student_sections ss
        JOIN sections s ON ss.section_id = s.id
        JOIN timetable t ON t.section_id = s.id
        WHERE ss.roll_no = ?
        GROUP BY s.subject_name, s.type
      `).bind(rollNo).all();
      
      if (freqRes && freqRes.results) {
        freqRes.results.forEach(row => {
          const key = `${row.subject_name} (${row.class_type})`;
          timetableFreq[key] = row.count;
        });
      }
    } catch (e) {
      console.warn("Failed to fetch timetable freq", e);
    }

    const subjectProjections = subjects.map(s => {
      // Use exact classes per week from timetable if available, otherwise fallback to estimation
      const exactFreq = timetableFreq[s.name];
      const classesPerWeek = exactFreq !== undefined ? exactFreq : Math.max(1, Math.round(s.total / weeksElapsed));
      
      const sessionTotal = classesPerWeek * workingWeeks;
      const remaining = Math.max(0, sessionTotal - s.total);
      
      // To achieve 66.67%: mustAttend = ceil(0.6667 * effectiveTotal - present)
      const effectiveTotal = sessionTotal - s.cancelled;
      const mustAttend = Math.max(0, Math.ceil(TARGET_PERCENT / 100 * effectiveTotal - s.present));
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
