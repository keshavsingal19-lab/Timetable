export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const message = (body.message || "").trim();
    const rollNo = body.rollNo;

    if (!message) {
      return Response.json({ error: "Missing message" }, { status: 400 });
    }

    // Preload teacher list for fuzzy matching (cached per request)
    const allTeachersResult = await env.DB.prepare("SELECT id, name, department FROM teachers").all();
    const allTeachers = allTeachersResult.results || [];

    const text = normalize(message);
    const day = parseDay(text);
    const timeObj = parseTime(text, message);
    const periodIndex = timeObj ? getPeriodIndex(timeObj) : getCurrentPeriodIndex();
    const roomMatch = parseRoom(text);
    const teacherMatch = findTeacher(message, allTeachers);

    const intent = classifyIntent(text, roomMatch, teacherMatch, rollNo);

    const TIME_LABELS = ["8:30 AM", "9:30 AM", "10:30 AM", "11:30 AM", "12:30 PM", "1:30 PM", "2:30 PM", "3:30 PM", "4:30 PM"];
    const pLabel = periodIndex >= 0 && periodIndex < TIME_LABELS.length ? TIME_LABELS[periodIndex] : "now";

    let response = "";
    let data = null;
    let suggestions = ["Which rooms are free?", "My next class", "Help"];

    // ===========================
    //  AVAILABLE_ROOMS
    // ===========================
    if (intent === "AVAILABLE_ROOMS") {
      if (periodIndex < 0 || periodIndex > 8) {
        response = "College hours are 8:30 AM – 4:30 PM. Try asking for a time in that range!";
        suggestions = ["Rooms free at 10:30 AM", "Rooms free at 2 PM"];
      } else {
        const dbRooms = await env.DB.prepare("SELECT name, type, emptySlots FROM campus_rooms").all();
        const rooms = [];
        for (const r of (dbRooms.results || [])) {
          try {
            const slots = JSON.parse(r.emptySlots);
            if (slots[day] && slots[day].includes(periodIndex)) {
              rooms.push({ room: r.name, type: r.type });
            }
          } catch(e) {}
        }
        if (rooms.length > 0) {
          response = `${rooms.length} rooms free on ${day} at ${pLabel}:`;
          data = rooms;
        } else {
          response = `No free rooms on ${day} at ${pLabel}. Everything is occupied!`;
        }
        const nextIdx = periodIndex < 4 ? periodIndex + 1 : (periodIndex === 4 ? 5 : periodIndex + 1);
        suggestions = nextIdx <= 8
          ? [`Rooms free at ${TIME_LABELS[nextIdx]}`, "Free tutorial rooms"]
          : ["Rooms free tomorrow morning"];
      }
    }

    // ===========================
    //  TEACHER_INFO — "is X free?", "where is X?", "X ka schedule"
    // ===========================
    else if (intent === "TEACHER_INFO") {
      if (!teacherMatch) {
        response = "Which teacher? Try typing their name, e.g. 'Where is Dr. Jaideep?' or 'Is Poonam free?'";
        suggestions = ["Help"];
      } else {
        // Check section_slots for this teacher's schedule
        const teacherSlots = await env.DB.prepare(
          "SELECT day_of_week, period_index, room, subject, class_type FROM section_slots WHERE teacher_code = ?"
        ).bind(teacherMatch.id).all();

        const todaySlots = (teacherSlots.results || []).filter(s => s.day_of_week === day);
        todaySlots.sort((a, b) => a.period_index - b.period_index);

        // Check if specifically asking "is free" / "available"
        const askingFree = /\b(free|available|khali|kab milenge|mil sakte|appointment)\b/.test(text);
        // Check if asking "where is" / "kahan hai"
        const askingWhere = /\b(where|kahan|kidhar|location|room)\b/.test(text);

        const currentSlot = todaySlots.find(s => s.period_index === periodIndex);
        const nextSlot = todaySlots.find(s => s.period_index > periodIndex);

        if (askingWhere || (!askingFree && currentSlot)) {
          if (currentSlot) {
            response = `${teacherMatch.name} is in ${currentSlot.room} right now (${currentSlot.subject}, ${pLabel}).`;
            data = [{ subject: currentSlot.subject, room: currentSlot.room, type: currentSlot.class_type, time: pLabel }];
          } else {
            response = `${teacherMatch.name} doesn't have a class right now on ${day} at ${pLabel}.`;
            if (nextSlot) {
              response += ` Next class: ${nextSlot.subject} in ${nextSlot.room} at ${TIME_LABELS[nextSlot.period_index]}.`;
            }
          }
        } else {
          // Asking when free
          const busyPeriods = new Set(todaySlots.map(s => s.period_index));
          const freePeriods = [];
          for (let i = 0; i <= 8; i++) {
            if (!busyPeriods.has(i)) freePeriods.push(i);
          }

          if (freePeriods.length === 9) {
            response = `${teacherMatch.name} has no classes scheduled on ${day}. They're free all day!`;
          } else if (freePeriods.length === 0) {
            response = `${teacherMatch.name} is busy all day on ${day}.`;
          } else {
            response = `${teacherMatch.name} is free on ${day} at: ${freePeriods.map(i => TIME_LABELS[i]).join(', ')}.`;
          }
          if (todaySlots.length > 0) {
            response += `\nSchedule: ${todaySlots.map(s => `${TIME_LABELS[s.period_index]} → ${s.subject} (${s.room})`).join(', ')}.`;
          }
        }

        suggestions = [`${teacherMatch.name.split(' ').pop()}'s schedule tomorrow`, "Rooms free now"];
      }
    }

    // ===========================
    //  MY_NEXT_CLASS / MY_SCHEDULE
    // ===========================
    else if (intent === "MY_NEXT_CLASS" || intent === "MY_SCHEDULE") {
      if (!rollNo) {
        response = "Please log in to the Student Portal first so I can find your schedule!";
        suggestions = ["Help"];
      } else {
        try {
          const profile = await env.DB.prepare('SELECT * FROM student_profiles WHERE roll_no = ?').bind(rollNo).first();
          if (!profile) {
            response = "Your profile isn't set up yet. Ask your admin to upload the student roster.";
          } else {
            const groups = extractGroups(profile);
            const validSubjects = await getValidSubjects(env, profile, groups);
            const filteredSlots = await getFilteredSlots(env, profile, groups, validSubjects);

            const daySlots = filteredSlots.filter(s => s.day_of_week === day);
            daySlots.sort((a, b) => a.period_index - b.period_index);

            if (intent === "MY_NEXT_CLASS") {
              const nextSlot = daySlots.find(s => s.period_index >= periodIndex);
              if (nextSlot) {
                const t = TIME_LABELS[nextSlot.period_index] || '';
                response = `Your next class: ${nextSlot.subject} (${nextSlot.class_type}) in ${nextSlot.room} at ${t}.`;
                data = [{ subject: nextSlot.subject, room: nextSlot.room, type: nextSlot.class_type, time: t }];
              } else {
                response = `No more classes for ${day}! You're done 🎉`;
              }
              suggestions = [`My schedule for ${day}`, "Rooms free now"];
            } else {
              if (daySlots.length > 0) {
                response = `Your ${day} schedule (${daySlots.length} classes):`;
                data = daySlots.map(s => ({
                  subject: s.subject, room: s.room, type: s.class_type,
                  time: TIME_LABELS[s.period_index] || '', teacher: s.teacher_code
                }));
              } else {
                response = `No classes on ${day}! 🎉`;
              }
              suggestions = ["My next class", "Rooms free now"];
            }
          }
        } catch (err) {
          response = "Sorry, couldn't fetch your schedule right now.";
        }
      }
    }

    // ===========================
    //  ROOM_INFO — "who is in R29?", "is PB4 free?"
    // ===========================
    else if (intent === "ROOM_INFO") {
      if (!roomMatch) {
        response = "Which room? Try 'Is R29 free?' or 'Who is in PB4?'";
        suggestions = ["Is R29 free?", "Is PB4 free?", "Is T15 free?"];
      } else {
        const roomData = await env.DB.prepare("SELECT * FROM campus_rooms WHERE name = ?").bind(roomMatch).first();
        if (roomData) {
          try {
            const emptySlots = JSON.parse(roomData.emptySlots || '{}');
            const occupiedBy = JSON.parse(roomData.occupiedBy || '{}');
            const isEmpty = emptySlots[day] && emptySlots[day].includes(periodIndex);
            const occupants = occupiedBy[day]?.[String(periodIndex)] || [];

            if (isEmpty && occupants.length === 0) {
              response = `✅ ${roomMatch} (${roomData.type}) is free on ${day} at ${pLabel}.`;
            } else if (occupants.length > 0) {
              const names = occupants.map(code => {
                const t = allTeachers.find(t => t.id === code);
                return t ? t.name : code;
              }).join(', ');
              response = `🔴 ${roomMatch} (${roomData.type}) is occupied on ${day} at ${pLabel} by: ${names}.`;
            } else {
              response = `${roomMatch} doesn't have explicit schedule data for ${day} at ${pLabel}.`;
            }
          } catch(e) {
            response = `Found ${roomMatch} but couldn't read its schedule.`;
          }
        } else {
          response = `Room "${roomMatch}" not found. Valid IDs: R1-R37, T1-T54, PB2-PB4, CL1/CL2/CLIB, SCR1-SCR4.`;
        }
        suggestions = [`Rooms free at ${pLabel}`, "My next class"];
      }
    }

    // ===========================
    //  HELP
    // ===========================
    else if (intent === "HELP") {
      response = "Here's what I can do:\n• Free rooms — 'Which rooms are free at 10:30?'\n• Teacher info — 'Where is Dr. Jaideep?' or 'Is Poonam free?'\n• Next class — 'What is my next class?'\n• My schedule — 'My classes today'\n• Room check — 'Is R29 free?' or 'Who is in PB4?'\n\nI handle typos, '8.30' vs '8:30', 'tomorrow', etc!";
      suggestions = ["Rooms free now", "My next class", "Where is Dr. Prerana?"];
    }

    // ===========================
    //  UNKNOWN — try to be helpful
    // ===========================
    else {
      response = "I'm not sure what you mean. Try asking about free rooms, teacher schedules, or your next class!";
      suggestions = ["Help", "Rooms free now", "My next class"];
    }

    return Response.json({ intent, response, data, suggestions });

  } catch (error) {
    console.error("Chatbot error:", error);
    return Response.json({ error: error.message, response: "Something went wrong. Try again!" }, { status: 500 });
  }
}

// ========================================================
//  INTENT CLASSIFICATION — Order matters
// ========================================================
function classifyIntent(text, roomMatch, teacherMatch, rollNo) {
  // HELP
  if (/\b(help|commands|kya kar sakte|what can you)\b/.test(text)) return "HELP";

  // ROOM_INFO (specific room ID mentioned + question about it)
  if (roomMatch && /\b(who|what|is|free|occupied|khali|kya|status)\b/.test(text)) return "ROOM_INFO";
  if (/\b(who is in|who's in|what's in|what is in|whats happening|who teaches in)\b/.test(text)) return "ROOM_INFO";

  // AVAILABLE_ROOMS — check BEFORE teacher to avoid false positives
  if (/\b(room|rooms|kamra|halls?|labs?|tutorial)\b/.test(text) && /\b(free|available|empty|khali|vacant|open)\b/.test(text)) return "AVAILABLE_ROOMS";
  if (/\b(free room|available room|empty room|rooms? free|rooms? available|rooms? empty|rooms? khali)\b/.test(text)) return "AVAILABLE_ROOMS";
  if (/\b(koi room|which room|konsa room|room mil|room chahiye|rooms? at)\b/.test(text)) return "AVAILABLE_ROOMS";

  // TEACHER_INFO (teacher name detected) — only if no room keywords present
  if (teacherMatch && /\b(free|available|where|kahan|schedule|kidhar|busy|milenge)\b/.test(text)) return "TEACHER_INFO";
  if (teacherMatch && !/\b(my|mera|mere|room|rooms|available|free|empty)\b/.test(text)) return "TEACHER_INFO";

  // MY_NEXT_CLASS
  if (/\b(my next class|next lecture|next class|kahan jana|where.*(go|next)|what'?s next|agla class|agla period)\b/.test(text)) return "MY_NEXT_CLASS";

  // MY_SCHEDULE
  if (/\b(my schedule|my classes|my timetable|mera schedule|mere classes|today.*(class|schedule)|aaj.*(class|schedule))\b/.test(text)) return "MY_SCHEDULE";

  // Broader fallbacks
  if (/\b(room|rooms)\b/.test(text)) return "AVAILABLE_ROOMS";
  if (/\b(next|agla)\b/.test(text) && rollNo) return "MY_NEXT_CLASS";
  if (teacherMatch) return "TEACHER_INFO";

  return "UNKNOWN";
}

// ========================================================
//  NORMALIZE — lowercase, fix common typos, clean up
// ========================================================
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[''`]/g, "'")
    .replace(/[""]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

// ========================================================
//  PARSE TIME — robust time extraction
// ========================================================
function parseTime(text, rawMessage) {
  // Explicit keywords
  if (/\b(right now|rn|currently|abhi|now|rn|filhaal)\b/.test(text)) return "NOW";
  if (/\b(morning|subah)\b/.test(text)) return { hour: 10, min: 30 };
  if (/\b(afternoon|dopahar|after lunch|post lunch)\b/.test(text)) return { hour: 14, min: 0 };
  if (/\b(evening|shaam)\b/.test(text)) return { hour: 16, min: 0 };

  // Pattern matching for explicit times
  // Match: "8:30", "8.30", "8 30", "830", "8:30 AM", "8.30am", etc.
  const patterns = [
    /\b(1[0-2]|[1-9])\s*[:.]?\s*([0-5]\d)\s*(am|pm|a\.?m\.?|p\.?m\.?)\b/gi,  // "8:30 AM"
    /\b(1[0-2]|[1-9])\s*[:.]?\s*([0-5]\d)\b/gi,                                // "8:30", "8.30"
    /\b(1[0-2]|[1-9])\s*(am|pm|a\.?m\.?|p\.?m\.?)\b/gi,                         // "8 AM", "2pm"
  ];

  for (const regex of patterns) {
    regex.lastIndex = 0;
    let match;
    let bestMatch = null;

    while ((match = regex.exec(text)) !== null) {
      // Skip matches that are part of roll numbers (e.g., "24BC342")
      const idx = match.index;
      if (idx > 0 && /[a-z0-9]/i.test(text[idx - 1])) continue;
      bestMatch = match;
    }

    if (bestMatch) {
      let hour = parseInt(bestMatch[1]);
      const min = parseInt(bestMatch[2] || "0");
      const ampm = (bestMatch[3] || bestMatch[2] || "").toLowerCase().replace(/\./g, '');

      // Is the "minutes" capture actually an AM/PM indicator?
      if (/^(am|pm)$/i.test(bestMatch[2])) {
        const ampStr = bestMatch[2].toLowerCase();
        if (ampStr === 'pm' && hour < 12) hour += 12;
        if (ampStr === 'am' && hour === 12) hour = 0;
        return { hour, min: 0 };
      }

      if (ampm && ampm.startsWith('p') && hour < 12) hour += 12;
      if (ampm && ampm.startsWith('a') && hour === 12) hour = 0;

      // No AM/PM: use college context (hours 1-7 mean PM)
      if (!ampm && !bestMatch[3]) {
        if (hour >= 1 && hour <= 6) hour += 12;
      }

      return { hour, min: isNaN(min) ? 0 : min };
    }
  }

  return null;
}

// ========================================================
//  PARSE DAY
// ========================================================
function parseDay(text) {
  const now = new Date();
  const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const istDate = new Date(istString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (/\b(tomorrow|tmrw|tmw|tommorow|tomorro|kal|tomo)\b/.test(text)) {
    const d = new Date(istDate);
    d.setDate(d.getDate() + 1);
    return days[d.getDay()];
  }
  if (/\b(yesterday|kal|parso)\b/.test(text) && /\b(yesterday)\b/.test(text)) {
    const d = new Date(istDate);
    d.setDate(d.getDate() - 1);
    return days[d.getDay()];
  }

  const dayMap = {
    'monday': 'Monday', 'mon': 'Monday',
    'tuesday': 'Tuesday', 'tue': 'Tuesday', 'tues': 'Tuesday',
    'wednesday': 'Wednesday', 'wed': 'Wednesday',
    'thursday': 'Thursday', 'thu': 'Thursday', 'thur': 'Thursday', 'thurs': 'Thursday',
    'friday': 'Friday', 'fri': 'Friday',
    'saturday': 'Saturday', 'sat': 'Saturday',
    'sunday': 'Sunday', 'sun': 'Sunday',
    // Hindi day names
    'somvar': 'Monday', 'mangalvar': 'Tuesday', 'budhvar': 'Wednesday',
    'guruvar': 'Thursday', 'shukravar': 'Friday', 'shanivar': 'Saturday',
  };

  for (const [key, val] of Object.entries(dayMap)) {
    if (new RegExp(`\\b${key}\\b`, 'i').test(text)) return val;
  }

  return days[istDate.getDay()];
}

// ========================================================
//  PARSE ROOM
// ========================================================
function parseRoom(text) {
  // "room 29" → R29, "R 29" → R29, "r29" → R29
  const m1 = text.match(/\b(?:room\s*)?([r])\s*(\d{1,2})\b/i);
  if (m1) return "R" + m1[2];

  const m2 = text.match(/\b(t)\s*(\d{1,2})\b/i);
  if (m2) return "T" + m2[2];

  const m3 = text.match(/\b(pb)\s*(\d)\b/i);
  if (m3) return "PB" + m3[2];

  const m4 = text.match(/\b(scr)\s*(\d)\b/i);
  if (m4) return "SCR" + m4[2];

  const m5 = text.match(/\b(cl)\s*(\d)\b/i);
  if (m5) return "CL" + m5[2];

  const upper = text.toUpperCase();
  if (upper.includes("CLIB")) return "CLIB";

  if (/\b(computer lab|comp lab)\b/i.test(text)) return "CL1";
  if (/\b(seminar|seminar room)\b/i.test(text)) return "SCR1";

  return null;
}

// ========================================================
//  FIND TEACHER — fuzzy matching against DB
// ========================================================
const STOPWORDS = new Set([
  // Days & time
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'mon', 'tue', 'tues', 'wed', 'thu', 'thur', 'thurs', 'fri', 'sat', 'sun',
  'today', 'tomorrow', 'yesterday', 'morning', 'afternoon', 'evening',
  'somvar', 'mangalvar', 'budhvar', 'guruvar', 'shukravar', 'shanivar',
  // Common query words
  'room', 'rooms', 'free', 'available', 'empty', 'vacant', 'open', 'class',
  'schedule', 'timetable', 'next', 'where', 'when', 'what', 'which', 'who',
  'show', 'find', 'tell', 'give', 'help', 'about', 'between', 'after',
  'before', 'from', 'until', 'lecture', 'tutorial', 'labs', 'hall',
  'teacher', 'teachers', 'student', 'period', 'slot', 'time',
  'mera', 'mere', 'meri', 'kya', 'kahan', 'kidhar', 'kab', 'kaun',
  'khali', 'busy', 'aaj', 'kal', 'abhi', 'now', 'currently',
  'classes', 'subjects', 'subject',
]);

function findTeacher(rawMessage, allTeachers) {
  if (!allTeachers.length) return null;
  const text = rawMessage.toLowerCase()
    .replace(/\b(dr|mr|ms|mrs|prof|professor|sir|ma'am|maam|madam)\b\.?/gi, '')
    .replace(/\b\d[:.]?\d*\s*(am|pm)?\b/gi, '') // strip times
    .trim();

  // 1. Exact substring match — teacher's surname or full name in query
  for (const t of allTeachers) {
    const name = t.name.toLowerCase().replace(/\b(dr|mr|ms|mrs|prof)\b\.?\s*/gi, '');
    const nameWords = name.split(/[\s.]+/).filter(w => w.length >= 4); // require 4+ char words
    for (const word of nameWords) {
      if (STOPWORDS.has(word)) continue;
      // Must be a standalone word in the query, not substring of another word
      if (new RegExp(`\\b${escapeRegex(word)}\\b`).test(text)) return t;
    }
  }

  // 2. Match by teacher code (e.g., "SPB", "JDP") — only if explicitly typed
  for (const t of allTeachers) {
    if (t.id.length >= 2 && t.id.length <= 4) {
      if (new RegExp(`\\b${escapeRegex(t.id.toLowerCase())}\\b`).test(text)) return t;
    }
  }

  // 3. Levenshtein-based fuzzy match — strict: only non-stopword query words ≥ 5 chars
  const queryWords = text.split(/\s+/).filter(w => w.length >= 5 && !STOPWORDS.has(w));
  if (queryWords.length === 0) return null;

  let bestMatch = null;
  let bestScore = 0;

  for (const t of allTeachers) {
    const nameClean = t.name.toLowerCase().replace(/\b(dr|mr|ms|mrs|prof)\b\.?\s*/gi, '');
    const nameWords = nameClean.split(/[\s.]+/).filter(w => w.length >= 4 && !STOPWORDS.has(w));

    let score = 0;
    for (const qw of queryWords) {
      for (const nw of nameWords) {
        // Exact match
        if (qw === nw) { score += nw.length * 3; continue; }
        // Prefix match — require at least 4 shared chars
        const prefixLen = commonPrefixLength(qw, nw);
        if (prefixLen >= 4) { score += prefixLen * 2; continue; }
        // Levenshtein — only for words ≥ 5 chars, max distance 1
        if (qw.length >= 5 && nw.length >= 5 && levenshtein(qw, nw) <= 1) {
          score += nw.length;
        }
      }
    }
    if (score > bestScore && score >= 8) {
      bestScore = score;
      bestMatch = t;
    }
  }

  return bestMatch;
}

function commonPrefixLength(a, b) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[m][n];
}

// ========================================================
//  GET PERIOD INDEX
// ========================================================
function getPeriodIndex(timeObj) {
  if (timeObj === "NOW") return getCurrentPeriodIndex();
  if (!timeObj) return -1;
  return getIndexFromMins(timeObj.hour * 60 + timeObj.min);
}

function getCurrentPeriodIndex() {
  const now = new Date();
  const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const istDate = new Date(istString);
  return getIndexFromMins(istDate.getHours() * 60 + istDate.getMinutes());
}

function getIndexFromMins(m) {
  if (m >= 510 && m < 570) return 0;  // 8:30 - 9:30
  if (m >= 570 && m < 630) return 1;  // 9:30 - 10:30
  if (m >= 630 && m < 690) return 2;  // 10:30 - 11:30
  if (m >= 690 && m < 750) return 3;  // 11:30 - 12:30
  if (m >= 750 && m < 810) return 4;  // 12:30 - 1:30
  if (m >= 810 && m < 870) return 5;  // 1:30 - 2:30
  if (m >= 870 && m < 930) return 6;  // 2:30 - 3:30
  if (m >= 930 && m < 990) return 7;  // 3:30 - 4:30
  if (m >= 990 && m < 1050) return 8; // 4:30 - 5:30
  return -1;
}

// ========================================================
//  STUDENT SCHEDULE HELPERS (reuse from student_schedule.js)
// ========================================================
function extractGroups(profile) {
  const raw = [profile.tut_group, profile.prac_group, profile.sec_group, profile.vac_group, profile.aec_group, profile.aec_code].filter(Boolean);
  const groups = [];
  raw.forEach(g => {
    if (typeof g === 'string') groups.push(...g.split(/[,/]+/).map(s => s.trim()).filter(Boolean));
    else groups.push(g);
  });
  return groups;
}

async function getValidSubjects(env, profile, groups) {
  const validSubjects = new Set();
  try {
    const coreRows = await env.DB.prepare('SELECT subject_code FROM core_subject_config WHERE course = ? AND semester = ?').bind(profile.course, profile.semester).all();
    (coreRows.results || []).forEach(r => validSubjects.add(r.subject_code));
  } catch(e) {}
  [profile.dse_ge_code, profile.dse_code, profile.ge_code, profile.aec_code].filter(Boolean).forEach(s => validSubjects.add(s));
  return validSubjects;
}

async function getFilteredSlots(env, profile, groups, validSubjects) {
  const sectionSlots = await env.DB.prepare('SELECT * FROM section_slots WHERE course = ? AND semester = ? AND section = ?').bind(profile.course, profile.semester, profile.section).all();
  let jointSlots = { results: [] };
  if (groups.length > 0) {
    const ph = groups.map(() => '?').join(',');
    jointSlots = await env.DB.prepare(`SELECT * FROM section_slots WHERE course = 'Joint' AND semester = ? AND group_id IN (${ph})`).bind(profile.semester, ...groups).all();
  }
  const allSlots = [...(sectionSlots.results || []), ...(jointSlots.results || [])];

  for (const slot of allSlots) {
    if (slot.group_id && groups.includes(slot.group_id)) validSubjects.add(slot.subject);
  }

  return allSlots.filter(slot => {
    if (slot.course === 'Joint') return true;
    if (slot.group_id) return groups.includes(slot.group_id);
    if (slot.class_type === 'Lecture') return validSubjects.has(slot.subject);
    return true;
  });
}
