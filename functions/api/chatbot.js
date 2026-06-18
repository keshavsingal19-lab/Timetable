export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const message = body.message || "";
    const rollNo = body.rollNo;

    if (!message) {
      return Response.json({ error: "Missing message" }, { status: 400 });
    }

    const text = message.toLowerCase().trim();
    let intent = "UNKNOWN";

    // --- INTENT CLASSIFICATION (order matters: more specific first) ---
    if (
      text.includes("available room") || text.includes("free room") ||
      text.includes("empty room") || text.includes("available rooms") ||
      text.includes("free rooms") || text.includes("empty rooms") ||
      (text.includes("room") && (text.includes("free") || text.includes("available") || text.includes("empty") || text.includes("vacant") || text.includes("open"))) ||
      text.includes("vacant room") || text.includes("koi room khali") ||
      text.match(/rooms?\s*(at|between|from|around|near)/)
    ) {
      intent = "AVAILABLE_ROOMS";
    } else if (
      text.includes("my next class") || text.includes("next lecture") ||
      text.includes("next class") || text.includes("where do i go") ||
      text.includes("where should i go") || text.includes("what's next")
    ) {
      intent = "MY_NEXT_CLASS";
    } else if (
      text.includes("my schedule") || text.includes("my classes") ||
      text.includes("my timetable") || text.includes("today's schedule") ||
      text.includes("today schedule") || text.includes("classes today") ||
      text.includes("today's classes")
    ) {
      intent = "MY_SCHEDULE_TODAY";
    } else if (
      text.includes("who is in") || text.includes("what is happening in") ||
      text.includes("what's happening in") || text.includes("who's in") ||
      text.includes("who teaches in") || text.includes("room info") ||
      text.includes("is occupied") || text.includes("is free")
    ) {
      intent = "ROOM_INFO";
    } else if (
      text.includes("teacher") && (text.includes("available") || text.includes("free") || text.includes("schedule"))
    ) {
      intent = "TEACHER_INFO";
    } else if (text.includes("help") || text.includes("what can you do") || text.includes("commands")) {
      intent = "HELP";
    } else {
      // Fallback heuristics
      if (text.includes("next")) intent = "MY_NEXT_CLASS";
      else if (text.match(/\b(r\d|t\d|pb\d|cl\d|scr\d|clib)\b/i)) intent = "ROOM_INFO";
    }

    // --- ENTITY EXTRACTION ---
    const day = parseDay(text);
    const timeObj = parseTime(text);
    // If user specifies no time and intent is "available rooms", default to NOW
    // If user specifies no time and intent is "my next class", default to NOW
    const periodIndex = timeObj ? getPeriodIndex(timeObj) : getCurrentPeriodIndex();
    const roomMatch = parseRoom(text);
    const teacherQuery = parseTeacherName(text);

    let responseText = "I'm not sure how to help with that. Try asking about available rooms, your next class, or a room's status!";
    let data = null;
    let suggestions = ["Which rooms are free right now?", "What is my next class?", "Help"];
    
    const timeLabels = ["8:30 AM", "9:30 AM", "10:30 AM", "11:30 AM", "12:30 PM", "1:30 PM", "2:30 PM", "3:30 PM", "4:30 PM"];
    const periodLabel = periodIndex >= 0 && periodIndex < timeLabels.length ? timeLabels[periodIndex] : "now";

    // ===========================
    //  INTENT: AVAILABLE_ROOMS
    // ===========================
    if (intent === "AVAILABLE_ROOMS") {
      if (periodIndex < 0 || periodIndex > 8) {
        responseText = `College hours are between 8:30 AM and 4:30 PM. Can you specify a time in that range?`;
        suggestions = ["Rooms free at 10:30 AM", "Rooms free at 2:30 PM"];
      } else {
        const dbRooms = await env.DB.prepare("SELECT id, name, type, emptySlots FROM campus_rooms").all();
        const availableRooms = [];
        
        for (const r of (dbRooms.results || [])) {
          try {
            const emptySlots = JSON.parse(r.emptySlots);
            if (emptySlots[day] && emptySlots[day].includes(periodIndex)) {
              availableRooms.push({ room: r.name, type: r.type });
            }
          } catch(e) {}
        }
        
        if (availableRooms.length > 0) {
          responseText = `${availableRooms.length} rooms are available on ${day} at ${periodLabel}:`;
          data = availableRooms;
        } else {
          responseText = `No free rooms found on ${day} at ${periodLabel}. All rooms are occupied!`;
        }
        
        const nextSlotIdx = periodIndex + 1 + (periodIndex === 4 ? 1 : 0); // skip lunch gap
        const nextSlotLabel = nextSlotIdx < timeLabels.length ? timeLabels[nextSlotIdx] : null;
        suggestions = nextSlotLabel
          ? [`Rooms free at ${nextSlotLabel}`, "Show free labs only"]
          : ["Rooms free tomorrow morning"];
      }
    }

    // ===========================
    //  INTENT: MY_NEXT_CLASS / MY_SCHEDULE_TODAY
    // ===========================
    else if (intent === "MY_NEXT_CLASS" || intent === "MY_SCHEDULE_TODAY") {
      if (!rollNo) {
        responseText = "I need to know who you are! Please log in to the Student Portal first.";
        suggestions = ["Help"];
      } else {
        try {
          const profile = await env.DB.prepare('SELECT * FROM student_profiles WHERE roll_no = ?').bind(rollNo).first();
          if (!profile) {
            responseText = "Your profile isn't in the database yet. Ask your admin to upload the student roster.";
          } else {
            const rawGroups = [profile.tut_group, profile.prac_group, profile.sec_group, profile.vac_group, profile.aec_group, profile.aec_code].filter(Boolean);
            const groups = [];
            rawGroups.forEach(g => {
              if (typeof g === 'string') groups.push(...g.split(/[,/]+/).map(s => s.trim()).filter(Boolean));
              else groups.push(g);
            });
            
            let coreSubjects = new Set();
            try {
              const coreRows = await env.DB.prepare('SELECT subject_code FROM core_subject_config WHERE course = ? AND semester = ?').bind(profile.course, profile.semester).all();
              coreSubjects = new Set((coreRows.results || []).map(r => r.subject_code));
            } catch(e) {}

            const sectionSlots = await env.DB.prepare('SELECT * FROM section_slots WHERE course = ? AND semester = ? AND section = ?').bind(profile.course, profile.semester, profile.section).all();

            let jointSlots = { results: [] };
            if (groups.length > 0) {
              const placeholders = groups.map(() => '?').join(',');
              jointSlots = await env.DB.prepare(`SELECT * FROM section_slots WHERE course = 'Joint' AND semester = ? AND group_id IN (${placeholders})`).bind(profile.semester, ...groups).all();
            }

            const allSlots = [...(sectionSlots.results || []), ...(jointSlots.results || [])];
            const electives = [profile.dse_ge_code, profile.dse_code, profile.ge_code, profile.aec_code].filter(Boolean);
            const validSubjects = new Set([...coreSubjects, ...electives]);

            for (const slot of allSlots) {
              if (slot.group_id && groups.includes(slot.group_id)) validSubjects.add(slot.subject);
            }

            const filteredSlots = allSlots.filter(slot => {
              if (slot.course === 'Joint') return true;
              if (slot.group_id) return groups.includes(slot.group_id);
              if (slot.class_type === 'Lecture') return validSubjects.has(slot.subject);
              return true;
            });

            const todaySlots = filteredSlots.filter(s => s.day_of_week === day);
            todaySlots.sort((a, b) => a.period_index - b.period_index);

            if (intent === "MY_NEXT_CLASS") {
              const nextSlot = todaySlots.find(s => s.period_index >= periodIndex);
              if (nextSlot) {
                const slotTime = timeLabels[nextSlot.period_index] || '';
                responseText = `Your next class is **${nextSlot.subject}** (${nextSlot.class_type}) in room **${nextSlot.room}** at ${slotTime}.`;
                data = [{ subject: nextSlot.subject, room: nextSlot.room, type: nextSlot.class_type, time: slotTime }];
              } else {
                responseText = `No more classes for ${day}! 🎉 You're free!`;
              }
              suggestions = [`My schedule for ${day}`, "Rooms free right now"];
            } else {
              // MY_SCHEDULE_TODAY
              if (todaySlots.length > 0) {
                responseText = `Your schedule for ${day} (${todaySlots.length} classes):`;
                data = todaySlots.map(s => ({
                  subject: s.subject,
                  room: s.room,
                  type: s.class_type,
                  time: timeLabels[s.period_index] || ''
                }));
              } else {
                responseText = `You have no classes scheduled for ${day}! 🎉`;
              }
              suggestions = ["What is my next class?", "Rooms free right now"];
            }
          }
        } catch (err) {
          responseText = "Sorry, I couldn't fetch your schedule right now. The database might be busy.";
        }
      }
    }

    // ===========================
    //  INTENT: ROOM_INFO
    // ===========================
    else if (intent === "ROOM_INFO") {
      if (!roomMatch) {
        responseText = "Which room? Try something like 'Who is in R29?' or 'Is PB4 free?'";
        suggestions = ["Who is in R29?", "Is PB4 free?", "Is T15 free?"];
      } else {
        const roomData = await env.DB.prepare("SELECT * FROM campus_rooms WHERE name = ?").bind(roomMatch).first();
        if (roomData) {
          try {
            const emptySlots = JSON.parse(roomData.emptySlots || '{}');
            const occupiedBy = JSON.parse(roomData.occupiedBy || '{}');
            const isEmpty = emptySlots[day] && emptySlots[day].includes(periodIndex);
            
            if (isEmpty) {
              responseText = `✅ **${roomMatch}** (${roomData.type}) is **free** on ${day} at ${periodLabel}.`;
            } else if (occupiedBy[day] && occupiedBy[day][String(periodIndex)] && occupiedBy[day][String(periodIndex)].length > 0) {
              const teachers = occupiedBy[day][String(periodIndex)].join(', ');
              responseText = `🔴 **${roomMatch}** (${roomData.type}) is **occupied** on ${day} at ${periodLabel} by: **${teachers}**`;
            } else {
              responseText = `**${roomMatch}** doesn't appear to have any scheduled activity on ${day} at ${periodLabel}, but it's not marked as officially free either.`;
            }
          } catch(e) {
            responseText = `Found room ${roomMatch} but couldn't parse its schedule data.`;
          }
        } else {
          responseText = `I couldn't find a room named **${roomMatch}**. Valid room IDs look like R1-R37, T1-T54, PB2-PB4, CL1, CL2, CLIB, SCR1-SCR4.`;
        }
        suggestions = [`Rooms free at ${periodLabel}`, "What is my next class?"];
      }
    }

    // ===========================
    //  INTENT: TEACHER_INFO
    // ===========================
    else if (intent === "TEACHER_INFO") {
      if (!teacherQuery) {
        responseText = "Which teacher are you asking about? Try 'Is Dr. Sapna Bansal free at 10:30?'";
      } else {
        // Fuzzy match teacher name against DB
        const allTeachers = await env.DB.prepare("SELECT id, name FROM teachers").all();
        const match = fuzzyMatchTeacher(teacherQuery, allTeachers.results || []);
        
        if (match) {
          // Find all rooms where this teacher is scheduled on this day at this period
          const dbRooms = await env.DB.prepare("SELECT name, type, occupiedBy FROM campus_rooms").all();
          let foundRoom = null;
          
          for (const r of (dbRooms.results || [])) {
            try {
              const occupiedBy = JSON.parse(r.occupiedBy || '{}');
              if (occupiedBy[day] && occupiedBy[day][String(periodIndex)]) {
                if (occupiedBy[day][String(periodIndex)].includes(match.id)) {
                  foundRoom = r.name;
                  break;
                }
              }
            } catch(e) {}
          }
          
          if (foundRoom) {
            responseText = `${match.name} is teaching in **${foundRoom}** on ${day} at ${periodLabel}.`;
          } else {
            responseText = `${match.name} doesn't appear to have a class on ${day} at ${periodLabel}. They might be free!`;
          }
        } else {
          responseText = `I couldn't find a teacher matching "${teacherQuery}". Check the spelling?`;
        }
      }
      suggestions = ["Rooms free right now", "What is my next class?"];
    }

    // ===========================
    //  INTENT: HELP
    // ===========================
    else if (intent === "HELP") {
      responseText = "Here's what I can do:\n• **Free rooms** — 'Which rooms are free at 10:30 AM?'\n• **Next class** — 'What is my next class?'\n• **My schedule** — 'What are my classes today?'\n• **Room check** — 'Who is in R29 right now?'\n• **Teacher check** — 'Is Dr. Sapna Bansal free?'\n\nI handle typos, 8.30 vs 8:30, 'tomorrow', etc.";
      suggestions = ["Rooms free now", "My next class", "Who is in PB4?"];
    }

    return Response.json({ intent, response: responseText, data, suggestions });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// =============================================
//  HELPER: Parse time from natural language
// =============================================
function parseTime(text) {
  // Check for "now" / "right now" / "rn" / "currently"
  if (/\b(right now|rn|currently|abhi|now)\b/.test(text)) {
    return "NOW";
  }

  // Check for "morning", "afternoon", "after lunch"
  if (/\b(morning)\b/.test(text)) return { hour: 10, min: 30 }; // mid-morning
  if (/\b(afternoon|after lunch|post lunch)\b/.test(text)) return { hour: 14, min: 30 }; // mid-afternoon

  // Try to match time patterns like "8:30", "8.30", "830", "8 30", "8:30 AM", "8.30am"
  const timeRegex = /\b(1[0-2]|[1-9])[\s:.]?([0-5]\d)?\s*(am|pm|a\.m\.?|p\.m\.?)?\b/gi;
  let bestMatch = null;
  let match;
  
  while ((match = timeRegex.exec(text)) !== null) {
    // Skip if this is part of a roll number like "24BC342"
    const before = text.substring(Math.max(0, match.index - 3), match.index);
    if (/\d/.test(before)) continue;
    
    bestMatch = match;
  }
  
  if (!bestMatch) return null;
  
  let hour = parseInt(bestMatch[1]);
  const min = parseInt(bestMatch[2] || "0");
  const ampm = (bestMatch[3] || "").toLowerCase().replace(/\./g, '');
  
  // Handle AM/PM
  if (ampm.startsWith('p') && hour < 12) hour += 12;
  if (ampm.startsWith('a') && hour === 12) hour = 0;
  
  // If no AM/PM specified, use context: college hours are 8 AM - 6 PM
  // Hours 1-7 without AM/PM are probably PM (1 PM - 7 PM would never happen but 1-4:30 does)
  if (!ampm) {
    if (hour >= 1 && hour <= 6) hour += 12;
    // 7 is ambiguous but 7 AM class doesn't exist, so leave as is (7 = 7 AM which would return -1 period anyway)
  }
  
  return { hour, min };
}

// =============================================
//  HELPER: Get period index from time object
// =============================================
function getPeriodIndex(timeObj) {
  if (timeObj === "NOW") return getCurrentPeriodIndex();
  if (!timeObj) return -1;
  const timeMins = timeObj.hour * 60 + timeObj.min;
  return getIndexFromMins(timeMins);
}

function getCurrentPeriodIndex() {
  const now = new Date();
  const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const istDate = new Date(istString);
  const timeMins = istDate.getHours() * 60 + istDate.getMinutes();
  return getIndexFromMins(timeMins);
}

function getIndexFromMins(timeMins) {
  if (timeMins >= 8*60+30 && timeMins < 9*60+30) return 0;
  if (timeMins >= 9*60+30 && timeMins < 10*60+30) return 1;
  if (timeMins >= 10*60+30 && timeMins < 11*60+30) return 2;
  if (timeMins >= 11*60+30 && timeMins < 12*60+30) return 3;
  if (timeMins >= 12*60+30 && timeMins < 13*60+30) return 4;
  // 1:30 PM - 2:00 PM is lunch; 2:00 PM maps to period 5
  if (timeMins >= 13*60+30 && timeMins < 14*60+30) return 5;
  if (timeMins >= 14*60+30 && timeMins < 15*60+30) return 6;
  if (timeMins >= 15*60+30 && timeMins < 16*60+30) return 7;
  if (timeMins >= 16*60+30 && timeMins < 17*60+30) return 8;
  return -1; // Outside college hours
}

// =============================================
//  HELPER: Parse day from natural language
// =============================================
function parseDay(text) {
  const now = new Date();
  const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const istDate = new Date(istString);
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Check for relative day references
  if (/\b(tomorrow|tmrw|tmw|tommorow|tomorro|kal)\b/.test(text)) {
    const nextDay = new Date(istDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return days[nextDay.getDay()];
  }
  if (/\b(yesterday)\b/.test(text)) {
    const prevDay = new Date(istDate);
    prevDay.setDate(prevDay.getDate() - 1);
    return days[prevDay.getDay()];
  }
  
  // Check for explicit day names (full or abbreviated)
  const dayMatch = text.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun)\b/i);
  if (dayMatch) {
    const m = dayMatch[1].toLowerCase();
    if (m.startsWith('sun')) return 'Sunday';
    if (m.startsWith('mon') || m === 'mon') return 'Monday';
    if (m.startsWith('tu')) return 'Tuesday';
    if (m.startsWith('w')) return 'Wednesday';
    if (m.startsWith('th')) return 'Thursday';
    if (m.startsWith('f')) return 'Friday';
    if (m.startsWith('sa')) return 'Saturday';
  }
  
  // Default to today
  return days[istDate.getDay()];
}

// =============================================
//  HELPER: Parse room ID from text
// =============================================
function parseRoom(text) {
  // Direct match patterns: "R29", "r 29", "room 29", "Room29", "PB4", "pb 4"
  const patterns = [
    /\b(R)\s*(\d{1,2})\b/i,
    /\b(T)\s*(\d{1,2})\b/i,
    /\b(PB)\s*(\d)\b/i,
    /\b(SCR)\s*(\d)\b/i,
    /\b(CL)\s*(\d)\b/i,
    /\broom\s*(\d{1,2})\b/i, // "room 29" → R29
  ];
  
  for (const p of patterns) {
    const match = p.exec(text);
    if (match) {
      if (p === patterns[5]) {
        // "room 29" -> R29
        return "R" + match[1];
      }
      return (match[1] + match[2]).toUpperCase();
    }
  }
  
  // Check for special names
  const upper = text.toUpperCase();
  if (upper.includes("CLIB")) return "CLIB";
  if (upper.includes("CL1")) return "CL1";
  if (upper.includes("CL2")) return "CL2";
  
  // Natural language room names
  if (/\b(computer lab|comp lab|computer)\b/i.test(text)) return "CL1"; // or return list?
  if (/\b(seminar|seminar room)\b/i.test(text)) return "SCR1";
  
  return null;
}

// =============================================
//  HELPER: Parse teacher name from text
// =============================================
function parseTeacherName(text) {
  // Remove common filler words to isolate the name
  const cleaned = text
    .replace(/\b(is|the|dr|mr|ms|mrs|prof|professor|teacher|sir|ma'am|maam|madam|available|free|schedule|at|on|in|for|today|tomorrow|tmrw|now|right now|what|when|where|who)\b/gi, '')
    .replace(/\b\d[:.]?\d*\s*(am|pm)?\b/gi, '') // remove times
    .replace(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat)\b/gi, '') // remove days
    .trim()
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleaned.length >= 2 ? cleaned : null;
}

// =============================================
//  HELPER: Fuzzy match teacher name
// =============================================
function fuzzyMatchTeacher(query, teachers) {
  if (!query || !teachers.length) return null;
  
  const q = query.toLowerCase().trim();
  
  // 1. Exact substring match on name
  for (const t of teachers) {
    if (t.name.toLowerCase().includes(q)) return t;
  }
  
  // 2. Match on ID (teacher code like "SPB", "PRA")
  for (const t of teachers) {
    if (t.id.toLowerCase() === q) return t;
  }
  
  // 3. Simple word-overlap scoring
  const queryWords = q.split(/\s+/);
  let bestScore = 0;
  let bestMatch = null;
  
  for (const t of teachers) {
    const nameWords = t.name.toLowerCase().split(/[\s.]+/);
    let score = 0;
    for (const qw of queryWords) {
      for (const nw of nameWords) {
        if (nw.startsWith(qw) || qw.startsWith(nw)) {
          score += Math.min(qw.length, nw.length);
        }
      }
    }
    if (score > bestScore && score >= 3) { // minimum 3 chars match
      bestScore = score;
      bestMatch = t;
    }
  }
  
  return bestMatch;
}
