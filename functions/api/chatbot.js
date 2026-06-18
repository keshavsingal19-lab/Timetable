export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const message = (body.message || "").trim();
    const rollNo = body.rollNo;
    if (!message) return Response.json({ error: "Missing message" }, { status: 400 });

    const allTeachers = (await env.DB.prepare("SELECT id, name, department FROM teachers").all()).results || [];
    const isHindi = detectHindi(message);
    // Transliterate Devanagari to Latin for matching, then normalize
    const latinized = transliterate(message);
    const text = latinized.toLowerCase().replace(/[''`]/g, "'").replace(/\s+/g, ' ').trim();
    const day = parseDay(text);
    const timeObj = parseTime(text);
    const periodIndex = timeObj ? getPeriodIndex(timeObj) : getCurrentPeriodIndex();
    const roomMatch = parseRoom(text);
    const roomTypeFilter = parseRoomType(text);
    const teacherMatch = findTeacher(latinized, allTeachers);
    const intent = classifyIntent(text, roomMatch, teacherMatch, rollNo);

    const TL = ["8:30 AM","9:30 AM","10:30 AM","11:30 AM","12:30 PM","1:30 PM","2:30 PM","3:30 PM","4:30 PM"];
    const pLabel = periodIndex >= 0 && periodIndex < TL.length ? TL[periodIndex] : "now";
    let response = "", data = null, suggestions = ["Free rooms now", "My next class", "Help"];
    let speakText = ""; // Short version for TTS

    if (intent === "AVAILABLE_ROOMS") {
      if (periodIndex < 0 || periodIndex > 8) {
        response = isHindi ? "कॉलेज का समय 8:30 AM – 4:30 PM है।" : "College hours are 8:30 AM – 4:30 PM.";
        speakText = response;
      } else {
        const dbRooms = (await env.DB.prepare("SELECT name, type, emptySlots FROM campus_rooms").all()).results || [];
        const rooms = [];
        for (const r of dbRooms) {
          try {
            const slots = JSON.parse(r.emptySlots);
            if (slots[day] && slots[day].includes(periodIndex)) {
              if (!roomTypeFilter || r.type === roomTypeFilter) {
                rooms.push({ room: r.name, type: r.type });
              }
            }
          } catch(e) {}
        }
        const typeLabel = roomTypeFilter ? ` ${roomTypeFilter.toLowerCase()}` : '';
        if (rooms.length > 0) {
          response = isHindi
            ? `${day} को ${pLabel} पर ${rooms.length}${typeLabel} rooms खाली हैं:`
            : `${rooms.length}${typeLabel} rooms free on ${day} at ${pLabel}:`;
          data = rooms;
          speakText = isHindi
            ? `${rooms.length} rooms खाली हैं ${day} को ${pLabel} पर।`
            : `${rooms.length} rooms are free on ${day} at ${pLabel}. Check the list below.`;
        } else {
          response = isHindi ? `${day} को ${pLabel} पर कोई${typeLabel} room खाली नहीं है।` : `No free${typeLabel} rooms on ${day} at ${pLabel}.`;
          speakText = response;
        }
        const ni = periodIndex < 4 ? periodIndex + 1 : (periodIndex === 4 ? 5 : Math.min(periodIndex + 1, 8));
        suggestions = ni <= 8 ? [`Rooms at ${TL[ni]}`, "Free labs"] : ["Rooms tomorrow"];
      }
    }

    else if (intent === "TEACHER_INFO") {
      if (!teacherMatch) {
        response = isHindi ? "कौन से teacher? नाम बताइए।" : "Which teacher? Try typing their name.";
        speakText = response;
      } else {
        const ts = (await env.DB.prepare("SELECT day_of_week, period_index, room, subject, class_type FROM section_slots WHERE teacher_code = ?").bind(teacherMatch.id).all()).results || [];
        const daySlots = ts.filter(s => s.day_of_week === day).sort((a, b) => a.period_index - b.period_index);
        const cur = daySlots.find(s => s.period_index === periodIndex);
        const nxt = daySlots.find(s => s.period_index > periodIndex);
        const askWhere = /\b(where|kahan|kidhar|location)\b/.test(text);

        if (askWhere || cur) {
          if (cur) {
            response = isHindi
              ? `${teacherMatch.name} अभी ${cur.room} में हैं (${cur.subject})।`
              : `${teacherMatch.name} is in ${cur.room} right now (${cur.subject}).`;
            data = [{ subject: cur.subject, room: cur.room, type: cur.class_type, time: pLabel }];
          } else {
            response = isHindi
              ? `${teacherMatch.name} का अभी ${day} ${pLabel} पर कोई class नहीं है।`
              : `${teacherMatch.name} has no class on ${day} at ${pLabel}.`;
            if (nxt) {
              const nxtInfo = isHindi
                ? ` अगला: ${nxt.subject} (${nxt.room}) ${TL[nxt.period_index]} पर।`
                : ` Next: ${nxt.subject} in ${nxt.room} at ${TL[nxt.period_index]}.`;
              response += nxtInfo;
            }
          }
        } else {
          const busy = new Set(daySlots.map(s => s.period_index));
          const free = [];
          for (let i = 0; i <= 8; i++) if (!busy.has(i)) free.push(TL[i]);
          response = isHindi
            ? `${teacherMatch.name} ${day} को free हैं: ${free.join(', ')}।`
            : `${teacherMatch.name} is free on ${day} at: ${free.join(', ')}.`;
        }
        speakText = response;
        suggestions = [`${teacherMatch.name.split(' ').pop()} tomorrow`, "Free rooms now"];
      }
    }

    else if (intent === "MY_NEXT_CLASS" || intent === "MY_SCHEDULE") {
      if (!rollNo) {
        response = isHindi ? "पहले Student Portal में login करें।" : "Please log in first.";
        speakText = response;
      } else {
        try {
          const profile = await env.DB.prepare('SELECT * FROM student_profiles WHERE roll_no = ?').bind(rollNo).first();
          if (!profile) {
            response = isHindi ? "आपकी profile नहीं मिली।" : "Profile not found.";
            speakText = response;
          } else {
            const groups = extractGroups(profile);
            const vs = await getValidSubjects(env, profile, groups);
            const slots = await getFilteredSlots(env, profile, groups, vs);
            const ds = slots.filter(s => s.day_of_week === day).sort((a, b) => a.period_index - b.period_index);

            if (intent === "MY_NEXT_CLASS") {
              const ns = ds.find(s => s.period_index >= periodIndex);
              if (ns) {
                const t = TL[ns.period_index] || '';
                response = isHindi
                  ? `अगला class: ${ns.subject} (${ns.class_type}), Room ${ns.room}, ${t}।`
                  : `Next: ${ns.subject} (${ns.class_type}) in ${ns.room} at ${t}.`;
                data = [{ subject: ns.subject, room: ns.room, type: ns.class_type, time: t }];
              } else {
                response = isHindi ? `${day} को और कोई class नहीं! 🎉` : `No more classes on ${day}! 🎉`;
              }
              speakText = response;
              suggestions = [`Schedule ${day}`, "Free rooms"];
            } else {
              if (ds.length > 0) {
                response = isHindi ? `${day} का schedule (${ds.length} classes):` : `${day} schedule (${ds.length} classes):`;
                data = ds.map(s => ({ subject: s.subject, room: s.room, type: s.class_type, time: TL[s.period_index] || '', teacher: s.teacher_code }));
                speakText = isHindi
                  ? `आज ${ds.length} classes हैं ${day} को। List नीचे देखें।`
                  : `You have ${ds.length} classes on ${day}. See the list below.`;
              } else {
                response = isHindi ? `${day} को कोई class नहीं! 🎉` : `No classes on ${day}! 🎉`;
                speakText = response;
              }
              suggestions = ["My next class", "Free rooms"];
            }
          }
        } catch { response = isHindi ? "Schedule लाने में दिक्कत हुई।" : "Couldn't fetch schedule."; speakText = response; }
      }
    }

    else if (intent === "ROOM_INFO") {
      if (!roomMatch) {
        response = isHindi ? "कौन सा room? जैसे 'R29 खाली है?'" : "Which room? e.g. 'Is R29 free?'";
        speakText = response;
        suggestions = ["Is R29 free?", "Is PB4 free?"];
      } else {
        const rd = await env.DB.prepare("SELECT * FROM campus_rooms WHERE name = ?").bind(roomMatch).first();
        if (rd) {
          try {
            const es = JSON.parse(rd.emptySlots || '{}');
            const ob = JSON.parse(rd.occupiedBy || '{}');
            const isEmpty = es[day] && es[day].includes(periodIndex);
            const occ = ob[day]?.[String(periodIndex)] || [];
            if (isEmpty && occ.length === 0) {
              response = isHindi ? `✅ ${roomMatch} ${day} ${pLabel} पर खाली है।` : `✅ ${roomMatch} is free on ${day} at ${pLabel}.`;
            } else if (occ.length > 0) {
              const names = occ.map(c => { const t = allTeachers.find(t => t.id === c); return t ? t.name : c; }).join(', ');
              response = isHindi ? `🔴 ${roomMatch} occupied है — ${names}।` : `🔴 ${roomMatch} is occupied by ${names}.`;
            } else {
              response = isHindi ? `${roomMatch} का ${day} ${pLabel} पर data नहीं है।` : `No schedule data for ${roomMatch} at ${pLabel}.`;
            }
          } catch { response = `Error reading ${roomMatch} data.`; }
        } else {
          response = isHindi ? `"${roomMatch}" room नहीं मिला।` : `Room "${roomMatch}" not found.`;
        }
        speakText = response;
        suggestions = [`Rooms at ${pLabel}`, "My next class"];
      }
    }

    else if (intent === "HELP") {
      response = isHindi
        ? "मैं ये कर सकता हूँ:\n• खाली rooms — 'rooms free at 10:30'\n• Teacher — 'Jaideep kahan hai?'\n• अगला class — 'my next class'\n• Room check — 'R29 free hai?'"
        : "I can help with:\n• Free rooms — 'rooms free at 10:30'\n• Teacher — 'where is Jaideep?'\n• Next class — 'my next class'\n• Room check — 'is R29 free?'";
      speakText = isHindi ? "आप rooms, teachers, या schedule के बारे में पूछ सकते हैं।" : "Ask me about rooms, teachers, or your schedule.";
      suggestions = ["Free rooms now", "My next class"];
    }

    else {
      response = isHindi ? "समझ नहीं आया। Rooms, teachers, या schedule के बारे में पूछें!" : "Try asking about free rooms, teachers, or your schedule.";
      speakText = response;
      suggestions = ["Help", "Free rooms", "My next class"];
    }

    return Response.json({ intent, response, data, suggestions, speakText, isHindi });
  } catch (error) {
    return Response.json({ error: error.message, response: "Something went wrong." }, { status: 500 });
  }
}

// ---- Devanagari → Latin Transliteration ----
const DEVA_MAP = {
  'अ':'a','आ':'aa','इ':'i','ई':'ee','उ':'u','ऊ':'oo','ए':'e','ऐ':'ai','ओ':'o','औ':'au',
  'क':'k','ख':'kh','ग':'g','घ':'gh','च':'ch','छ':'chh','ज':'j','झ':'jh',
  'ट':'t','ठ':'th','ड':'d','ढ':'dh','ण':'n','त':'t','थ':'th','द':'d','ध':'dh','न':'n',
  'प':'p','फ':'ph','ब':'b','भ':'bh','म':'m','य':'y','र':'r','ल':'l','व':'v','श':'sh',
  'ष':'sh','स':'s','ह':'h','क्ष':'ksh','त्र':'tr','ज्ञ':'gya','श्र':'shr',
  'ा':'a','ि':'i','ी':'ee','ु':'u','ू':'oo','े':'e','ै':'ai','ो':'o','ौ':'au',
  'ं':'n','ः':'h','ँ':'n','्':'','़':'',
};

function transliterate(text) {
  if (!/[\u0900-\u097F]/.test(text)) return text; // No Devanagari, skip
  let result = '';
  for (let i = 0; i < text.length; i++) {
    // Try 2-char combo first (for conjuncts like क्ष)
    const two = text.substring(i, i + 2);
    if (DEVA_MAP[two] !== undefined) { result += DEVA_MAP[two]; i++; continue; }
    const one = text[i];
    if (DEVA_MAP[one] !== undefined) { result += DEVA_MAP[one]; continue; }
    result += one; // Pass through (spaces, punctuation, Latin chars)
  }
  // Also append original text so Latin parts aren't lost in mixed input
  return result;
}

// ---- Detect Hindi ----
function detectHindi(text) {
  if (/[\u0900-\u097F]/.test(text)) return true;
  const hindiWords = /\b(kahan|kidhar|khali|kab|kaun|konsa|koi|hai|hain|kya|batao|dikhao|chahiye|milega|milenge|abhi|aaj|kal|nahi|mein|ka|ki|ke|ko|se|par|bhi|aur|ya|sir|maam|ji)\b/i;
  const words = text.toLowerCase().split(/\s+/);
  let c = 0;
  for (const w of words) if (hindiWords.test(w)) c++;
  return c >= 2;
}

// ---- Room type filter ----
function parseRoomType(text) {
  if (/\b(lecture\s*(hall|room)?|bada\s*room|lecture)\b/i.test(text)) return 'Lecture Hall';
  if (/\b(tutorial\s*(room)?|tut\s*room|chota\s*room|tutorial)\b/i.test(text)) return 'Tutorial Room';
  if (/\b(lab|computer\s*lab|comp\s*lab)\b/i.test(text)) return 'Lab';
  if (/\b(seminar|seminar\s*room)\b/i.test(text)) return 'Seminar Room';
  return null;
}

// ---- Intent Classification ----
function classifyIntent(text, roomMatch, teacherMatch, rollNo) {
  if (/\b(help|commands|kya kar sakte|what can you|madad)\b/.test(text)) return "HELP";
  if (roomMatch && /\b(who|what|is|free|occupied|khali|kya|status)\b/.test(text)) return "ROOM_INFO";
  if (/\b(who is in|who's in|what's in|whats happening|who teaches in)\b/.test(text)) return "ROOM_INFO";

  // AVAILABLE_ROOMS before TEACHER_INFO
  if (/\b(room|rooms|kamra|halls?|labs?|tutorial)\b/.test(text) && /\b(free|available|empty|khali|vacant|open)\b/.test(text)) return "AVAILABLE_ROOMS";
  if (/\b(free room|available room|empty room|rooms?\s*(free|available|empty|khali|at))\b/.test(text)) return "AVAILABLE_ROOMS";
  if (/\b(koi room|which room|konsa room|room mil|room chahiye)\b/.test(text)) return "AVAILABLE_ROOMS";

  if (teacherMatch && /\b(free|available|where|kahan|schedule|kidhar|busy|milenge|hai|hain)\b/.test(text)) return "TEACHER_INFO";
  if (teacherMatch && !/\b(my|mera|mere|room|rooms|available|free|empty)\b/.test(text)) return "TEACHER_INFO";

  if (/\b(my next class|next lecture|next class|kahan jana|what'?s next|agla class|agla period)\b/.test(text)) return "MY_NEXT_CLASS";
  if (/\b(my schedule|my classes|my timetable|mera schedule|mere classes|today.*(class|schedule)|aaj.*(class|schedule))\b/.test(text)) return "MY_SCHEDULE";

  if (/\b(room|rooms)\b/.test(text)) return "AVAILABLE_ROOMS";
  if (/\b(next|agla)\b/.test(text) && rollNo) return "MY_NEXT_CLASS";
  if (teacherMatch) return "TEACHER_INFO";
  return "UNKNOWN";
}

// ---- FIND TEACHER — score ALL teachers, return BEST match ----
const STOP = new Set([
  'monday','tuesday','wednesday','thursday','friday','saturday','sunday',
  'mon','tue','tues','wed','thu','thur','thurs','fri','sat','sun',
  'today','tomorrow','yesterday','morning','afternoon','evening',
  'room','rooms','free','available','empty','vacant','open','class',
  'schedule','timetable','next','where','when','what','which','who',
  'show','find','tell','give','help','about','between','after',
  'before','from','until','lecture','tutorial','labs','hall',
  'teacher','teachers','student','period','slot','time',
  'mera','mere','meri','kya','kahan','kidhar','kab','kaun',
  'khali','busy','aaj','kal','abhi','now','currently',
  'classes','subjects','subject','sir','maam','madam','please',
  'is','the','at','on','in','for','and','or','a','an','of','to',
  'hai','hain','ka','ki','ke','ko','se','par','bhi','aur','ya',
  'batao','dikhao','chahiye','milega','milenge','koi','konsa',
]);

function findTeacher(rawMessage, allTeachers) {
  if (!allTeachers.length) return null;
  const text = rawMessage.toLowerCase()
    .replace(/\b(dr|mr|ms|mrs|prof|professor|sir|ma'am|maam|madam)\b\.?/gi, '')
    .replace(/\b\d[:.]?\d*\s*(am|pm)?\b/gi, '')
    .trim();

  const queryWords = text.split(/\s+/).filter(w => w.length >= 3 && !STOP.has(w));
  if (queryWords.length === 0) return null;

  let bestMatch = null;
  let bestScore = 0;

  for (const t of allTeachers) {
    const nameClean = t.name.toLowerCase().replace(/\b(dr|mr|ms|mrs|prof)\b\.?\s*/gi, '').trim();
    const nameWords = nameClean.split(/[\s.]+/).filter(w => w.length >= 3);
    let score = 0;
    let matchedWords = 0;

    for (const qw of queryWords) {
      for (const nw of nameWords) {
        if (STOP.has(nw)) continue;
        // Exact word match
        if (qw === nw) { score += nw.length * 4; matchedWords++; continue; }
        // Very close match (distance 1, both 5+ chars)
        if (qw.length >= 5 && nw.length >= 5 && levenshtein(qw, nw) <= 1) { score += nw.length * 3; matchedWords++; continue; }
        // Prefix match (4+ shared chars)
        let p = 0; while (p < qw.length && p < nw.length && qw[p] === nw[p]) p++;
        if (p >= 4) { score += p * 2; matchedWords++; }
      }
    }

    // Bonus for multiple word matches (handles "avinash kumar sharma" vs just "kumar")
    if (matchedWords >= 2) score *= 1.5;
    if (matchedWords >= 3) score *= 1.5;

    if (score > bestScore && score >= 10) {
      bestScore = score;
      bestMatch = t;
    }
  }

  // Also try exact teacher code match
  for (const t of allTeachers) {
    if (t.id.length >= 2 && t.id.length <= 5) {
      const re = new RegExp(`\\b${t.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (re.test(text) && !STOP.has(t.id.toLowerCase())) return t;
    }
  }

  return bestMatch;
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = a[i-1] === b[j-1] ? d[i-1][j-1] : 1 + Math.min(d[i-1][j], d[i][j-1], d[i-1][j-1]);
  return d[m][n];
}

// ---- Time Parsing ----
function parseTime(text) {
  if (/\b(right now|rn|currently|abhi|now|filhaal)\b/.test(text)) return "NOW";
  if (/\b(morning|subah)\b/.test(text)) return { hour: 10, min: 30 };
  if (/\b(afternoon|dopahar|after lunch)\b/.test(text)) return { hour: 14, min: 0 };
  if (/\b(evening|shaam)\b/.test(text)) return { hour: 16, min: 0 };

  const patterns = [
    /\b(1[0-2]|[1-9])\s*[:.]?\s*([0-5]\d)\s*(am|pm|a\.?m\.?|p\.?m\.?)\b/gi,
    /\b(1[0-2]|[1-9])\s*[:.]?\s*([0-5]\d)\b/gi,
    /\b(1[0-2]|[1-9])\s*(am|pm|a\.?m\.?|p\.?m\.?)\b/gi,
  ];
  for (const re of patterns) {
    re.lastIndex = 0;
    let m, best = null;
    while ((m = re.exec(text)) !== null) {
      if (m.index > 0 && /[a-z0-9]/i.test(text[m.index - 1])) continue;
      best = m;
    }
    if (best) {
      let h = parseInt(best[1]), min = parseInt(best[2] || "0");
      const ap = (best[3] || best[2] || "").toLowerCase().replace(/\./g, '');
      if (/^(am|pm)$/i.test(best[2])) {
        if (best[2].toLowerCase() === 'pm' && h < 12) h += 12;
        if (best[2].toLowerCase() === 'am' && h === 12) h = 0;
        return { hour: h, min: 0 };
      }
      if (ap.startsWith('p') && h < 12) h += 12;
      if (ap.startsWith('a') && h === 12) h = 0;
      if (!ap && !best[3] && h >= 1 && h <= 6) h += 12;
      return { hour: h, min: isNaN(min) ? 0 : min };
    }
  }
  return null;
}

function getPeriodIndex(t) { return t === "NOW" ? getCurrentPeriodIndex() : t ? getIdx(t.hour * 60 + t.min) : -1; }
function getCurrentPeriodIndex() {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  return getIdx(d.getHours() * 60 + d.getMinutes());
}
function getIdx(m) {
  if (m >= 510 && m < 570) return 0; if (m >= 570 && m < 630) return 1;
  if (m >= 630 && m < 690) return 2; if (m >= 690 && m < 750) return 3;
  if (m >= 750 && m < 810) return 4; if (m >= 810 && m < 870) return 5;
  if (m >= 870 && m < 930) return 6; if (m >= 930 && m < 990) return 7;
  if (m >= 990 && m < 1050) return 8; return -1;
}

// ---- Day Parsing ----
function parseDay(text) {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  if (/\b(tomorrow|tmrw|tmw|tommorow|tomo|kal)\b/.test(text) && !/\b(yesterday)\b/.test(text)) {
    const n = new Date(d); n.setDate(n.getDate() + 1); return days[n.getDay()];
  }
  if (/\b(yesterday)\b/.test(text)) {
    const n = new Date(d); n.setDate(n.getDate() - 1); return days[n.getDay()];
  }
  const map = {monday:'Monday',mon:'Monday',tuesday:'Tuesday',tue:'Tuesday',tues:'Tuesday',wednesday:'Wednesday',wed:'Wednesday',thursday:'Thursday',thu:'Thursday',thur:'Thursday',thurs:'Thursday',friday:'Friday',fri:'Friday',saturday:'Saturday',sat:'Saturday',sunday:'Sunday',sun:'Sunday',somvar:'Monday',mangalvar:'Tuesday',budhvar:'Wednesday',guruvar:'Thursday',shukravar:'Friday',shanivar:'Saturday'};
  for (const [k,v] of Object.entries(map)) if (new RegExp(`\\b${k}\\b`,'i').test(text)) return v;
  return days[d.getDay()];
}

// ---- Room Parsing ----
function parseRoom(text) {
  let m;
  if ((m = text.match(/\b(?:room\s*)?([r])\s*(\d{1,2})\b/i))) return "R" + m[2];
  if ((m = text.match(/\b(t)\s*(\d{1,2})\b/i))) return "T" + m[2];
  if ((m = text.match(/\b(pb)\s*(\d)\b/i))) return "PB" + m[2];
  if ((m = text.match(/\b(scr)\s*(\d)\b/i))) return "SCR" + m[2];
  if ((m = text.match(/\b(cl)\s*(\d)\b/i))) return "CL" + m[2];
  if (text.toUpperCase().includes("CLIB")) return "CLIB";
  return null;
}

// ---- Student Schedule Helpers ----
function extractGroups(p) {
  const raw = [p.tut_group, p.prac_group, p.sec_group, p.vac_group, p.aec_group, p.aec_code].filter(Boolean);
  const g = [];
  raw.forEach(v => { if (typeof v === 'string') g.push(...v.split(/[,/]+/).map(s => s.trim()).filter(Boolean)); else g.push(v); });
  return g;
}
async function getValidSubjects(env, p, g) {
  const vs = new Set();
  try { (await env.DB.prepare('SELECT subject_code FROM core_subject_config WHERE course = ? AND semester = ?').bind(p.course, p.semester).all()).results.forEach(r => vs.add(r.subject_code)); } catch {}
  [p.dse_ge_code, p.dse_code, p.ge_code, p.aec_code].filter(Boolean).forEach(s => vs.add(s));
  return vs;
}
async function getFilteredSlots(env, p, g, vs) {
  const ss = (await env.DB.prepare('SELECT * FROM section_slots WHERE course = ? AND semester = ? AND section = ?').bind(p.course, p.semester, p.section).all()).results || [];
  let js = [];
  if (g.length > 0) {
    const ph = g.map(() => '?').join(',');
    js = (await env.DB.prepare(`SELECT * FROM section_slots WHERE course = 'Joint' AND semester = ? AND group_id IN (${ph})`).bind(p.semester, ...g).all()).results || [];
  }
  const all = [...ss, ...js];
  for (const s of all) if (s.group_id && g.includes(s.group_id)) vs.add(s.subject);
  return all.filter(s => { if (s.course === 'Joint') return true; if (s.group_id) return g.includes(s.group_id); if (s.class_type === 'Lecture') return vs.has(s.subject); return true; });
}
