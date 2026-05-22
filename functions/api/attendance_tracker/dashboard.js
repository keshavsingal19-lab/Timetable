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
      const classType = row[6] || '';
      const stat = row[7] || '';
      const markedAt = row[8] || '';
      
      if (stat === 'Present') present++;
      if (stat === 'Absent') absent++;
      if (stat === 'Cancelled') cancelled++;

      // Subject-wise stats
      if (subj) {
        if (!subjectStats[subj]) subjectStats[subj] = { name: subj, total: 0, present: 0, absent: 0, cancelled: 0 };
        subjectStats[subj].total++;
        if (stat === 'Present') subjectStats[subj].present++;
        if (stat === 'Absent') subjectStats[subj].absent++;
        if (stat === 'Cancelled') subjectStats[subj].cancelled++;
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

    // ── Projections: estimate session total and compute "must attend" for 66.67% ──
    // Estimate: ~4 months (16 weeks), calculate classes per subject per week from existing data
    const TARGET_PERCENT = 66.67;
    const WEEKS_IN_SESSION = 16;
    
    // Figure out how many weeks of data we have
    const allDates = dataRows.map(r => r[0]).filter(Boolean);
    let weeksElapsed = 1;
    if (allDates.length > 1) {
      const sorted = [...new Set(allDates)].sort();
      const first = new Date(sorted[0]);
      const last = new Date(sorted[sorted.length - 1]);
      const diffMs = last - first;
      weeksElapsed = Math.max(1, Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000)));
    }

    const subjectProjections = subjects.map(s => {
      const classesPerWeek = Math.max(1, Math.round(s.total / weeksElapsed));
      const sessionTotal = classesPerWeek * WEEKS_IN_SESSION;
      const remaining = Math.max(0, sessionTotal - s.total);
      
      // To achieve 66.67%: (present + mustAttend) / (sessionTotal - cancelled_so_far - future_cancels) >= 0.6667
      // Simplified: mustAttend = ceil(0.6667 * (sessionTotal - s.cancelled) - s.present)
      const effectiveTotal = sessionTotal - s.cancelled;
      const mustAttend = Math.max(0, Math.ceil(TARGET_PERCENT / 100 * effectiveTotal - s.present));
      const canSkip = Math.max(0, remaining - mustAttend);
      const verdict = canSkip >= 0 && mustAttend <= remaining ? 'safe' : 'at_risk';

      return {
        subject: s.name,
        currentPercentage: s.percentage,
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
        sessionTotalEstimate: totalSessionEstimate,
        weeksElapsed,
        weeksRemaining: Math.max(0, WEEKS_IN_SESSION - weeksElapsed),
        remainingClasses: totalRemaining,
        classesNeededFor67: totalMustAttend,
        canSkip: totalCanSkip,
        status: totalMustAttend <= totalRemaining ? 'safe' : 'at_risk'
      }
    }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
