export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const message = (body.message || "").trim();
    const rollNo = body.rollNo;
    if (!message) return Response.json({ error: "Missing message" }, { status: 400 });

    const allTeachers = (await env.DB.prepare("SELECT id, name, department FROM teachers").all()).results || [];
    // Helper: always use full name with proper prefix
    const displayName = (t) => t ? t.name : 'Unknown';
    const speakName = (t) => {
      if (!t) return 'Unknown';
      return t.name.replace(/\bMs\.?\s/i,'Miss ').replace(/\bMr\.?\s/i,'Mister ').replace(/\bDr\.?\s/i,'Doctor ').replace(/\bProf\.?\s/i,'Professor ');
    };
    const cleanSpeak = (s) => s.replace(/[•→✅🔴🎉📍🌡️☀️⛅☁️🌤️🌫️🌦️🌧️⛈️🌨️❄️👋😊]/g,'').replace(/\s+/g,' ').trim();
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

    const TL = ["8:30 AM","9:30 AM","10:30 AM","11:30 AM","12:30 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"];
    const pLabel = periodIndex >= 0 && periodIndex < TL.length ? TL[periodIndex] : "current time";
    const isWeekend = ['Saturday','Sunday'].includes(day);
    let response = "", data = null, suggestions = ["Available rooms", "My next class", "Help"];
    let speakText = ""; // Short version for TTS

    if (intent === "AVAILABLE_ROOMS") {
      if (periodIndex < 0 || periodIndex > 8) {
        response = isHindi ? "कॉलेज का समय 8:30 AM – 4:30 PM है।" : "College hours are 8:30 AM – 4:30 PM.";
        speakText = response;
      } else {
        const dbRooms = (await env.DB.prepare("SELECT name, type, emptySlots, occupiedBy FROM campus_rooms").all()).results || [];
        // Fetch absent teachers for today to include freed rooms
        let absentIds = new Set();
        try {
          const aUrl = new URL('/api/attendance', request.url);
          const aRes = await fetch(aUrl.toString());
          const absList = await aRes.json();
          absList.forEach(a => absentIds.add(a.teacher_id));
        } catch {}

        const rooms = [];
        for (const r of dbRooms) {
          try {
            const slots = JSON.parse(r.emptySlots || '{}');
            const ob = JSON.parse(r.occupiedBy || '{}');
            const occupants = ob[day]?.[String(periodIndex)] || [];
            const isScheduledEmpty = slots[day] && slots[day].includes(periodIndex);
            // Room freed because ALL occupants are absent
            const allAbsent = occupants.length > 0 && occupants.every(c => absentIds.has(c));
            const isAvailable = isScheduledEmpty || allAbsent;
            // Exclude if any non-absent teacher still occupies
            const hasPresentOccupant = occupants.some(c => !absentIds.has(c));
            if (isAvailable && !hasPresentOccupant) {
              if (!roomTypeFilter || r.type === roomTypeFilter) {
                rooms.push({ room: r.name, type: r.type });
              }
            }
          } catch(e) {}
        }
        const typeLabel = roomTypeFilter ? ` ${roomTypeFilter.toLowerCase()}` : '';
        if (rooms.length > 0) {
          response = isHindi
            ? `${day} \u0915\u094b ${pLabel} \u092a\u0930 ${rooms.length}${typeLabel} rooms available \u0939\u0948\u0902:`
            : `${rooms.length}${typeLabel} rooms available on ${day} at ${pLabel}:`;
          data = rooms;
          speakText = isHindi
            ? `${rooms.length} rooms available \u0939\u0948\u0902 ${day} \u0915\u094b ${pLabel} \u092a\u0930.`
            : `${rooms.length} rooms available on ${day} at ${pLabel}. Check the list below.`;
        } else {
          response = isHindi ? `${day} \u0915\u094b ${pLabel} \u092a\u0930 \u0915\u094b\u0908${typeLabel} room available \u0928\u0939\u0940\u0902 \u0939\u0948.` : `No${typeLabel} rooms available on ${day} at ${pLabel}.`;
          speakText = response;
        }
        const ni = periodIndex < 4 ? periodIndex + 1 : (periodIndex === 4 ? 5 : Math.min(periodIndex + 1, 8));
        suggestions = ni <= 8 ? [`Rooms at ${TL[ni]}`, "Available labs"] : ["Rooms tomorrow"];
      }
    }

    else if (intent === "TEACHER_INFO") {
      if (!teacherMatch) {
        response = isHindi ? "कौन से teacher? नाम बताइए।" : "Which teacher? Try typing their name.";
        speakText = response;
      } else {
        const dn = displayName(teacherMatch);
        const sn = speakName(teacherMatch);
        const ts = (await env.DB.prepare("SELECT day_of_week, period_index, room, subject, class_type FROM section_slots WHERE teacher_code = ?").bind(teacherMatch.id).all()).results || [];
        const daySlots = ts.filter(s => s.day_of_week === day).sort((a, b) => a.period_index - b.period_index);
        const curPeriod = getCurrentPeriodIndex();
        const isCurrentTime = !timeObj && periodIndex === curPeriod;
        const cur = daySlots.find(s => s.period_index === periodIndex);
        const askNext = /\b(next|agla|agli|upcoming|baad)\b/.test(text);
        const nxt = daySlots.find(s => s.period_index > (isCurrentTime ? curPeriod : periodIndex));

        if (askNext) {
          if (nxt) {
            response = isHindi
              ? `${dn} ka agla class: ${nxt.subject} (${nxt.room}) ${TL[nxt.period_index]} par.`
              : `${dn}'s next class: ${nxt.subject} in ${nxt.room} at ${TL[nxt.period_index]}.`;
            speakText = isHindi
              ? `${sn} ka agla class ${nxt.subject} hai, ${nxt.room} mein, ${TL[nxt.period_index]} par.`
              : `${sn}'s next class is ${nxt.subject} in ${nxt.room} at ${TL[nxt.period_index]}.`;
            data = [{ subject: nxt.subject, room: nxt.room, type: nxt.class_type, time: TL[nxt.period_index] }];
          } else {
            response = isHindi ? `${dn} ka aaj aur koi class nahi hai.` : `${dn} has no more classes today.`;
            speakText = isHindi ? `${sn} ka aaj aur koi class nahi hai.` : `${sn} has no more classes today.`;
          }
        } else if (cur) {
          const timeNote = isCurrentTime ? (isHindi ? 'abhi' : 'right now') : (isHindi ? `${pLabel} par` : `at ${pLabel}`);
          response = isHindi
            ? `${dn} ${timeNote} ${cur.room} mein hain (${cur.subject}).`
            : `${dn} is in ${cur.room} ${timeNote} (${cur.subject}).`;
          speakText = isHindi
            ? `${sn} ${timeNote} ${cur.room} mein hain, ${cur.subject} padha rahe hain.`
            : `${sn} is in ${cur.room} ${timeNote}, teaching ${cur.subject}.`;
          data = [{ subject: cur.subject, room: cur.room, type: cur.class_type, time: pLabel }];
        } else {
          response = isHindi
            ? `${dn} ka ${day} ko ${pLabel} par koi class scheduled nahi hai.`
            : `${dn} has no class scheduled on ${day} at ${pLabel}.`;
          speakText = isHindi
            ? `${sn} ka ${day} ko ${pLabel} par koi class nahi hai.`
            : `${sn} has no class scheduled on ${day} at ${pLabel}.`;
        }
        suggestions = ["Available rooms", "My next class"];
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
              suggestions = [`Schedule ${day}`, "Available rooms"];
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
              suggestions = ["My next class", "Available rooms"];
            }
          }
        } catch { response = isHindi ? "Schedule लाने में दिक्कत हुई।" : "Couldn't fetch schedule."; speakText = response; }
      }
    }

    else if (intent === "ROOM_INFO") {
      if (!roomMatch) {
        response = isHindi ? "कौन सा room? जैसे 'R29 available है?'" : "Which room? e.g. 'Is R29 available?'";
        speakText = response;
        suggestions = ["Is R29 available?", "Is PB4 available?"];
      } else {
        const rd = await env.DB.prepare("SELECT * FROM campus_rooms WHERE name = ?").bind(roomMatch).first();
        if (rd) {
          try {
            const es = JSON.parse(rd.emptySlots || '{}');
            const ob = JSON.parse(rd.occupiedBy || '{}');
            const isEmpty = es[day] && es[day].includes(periodIndex);
            const occ = ob[day]?.[String(periodIndex)] || [];
            if (isEmpty && occ.length === 0) {
              response = isHindi ? `✅ ${roomMatch} ${day} ${pLabel} पर available है।` : `✅ ${roomMatch} is available on ${day} at ${pLabel}.`;
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

    else if (intent === "GREETING") {
      const greetings = isHindi ? ['नमस्ते! 👋 कैसे मदद करूँ?','हैलो! क्या जानना है?','बोलिए, क्या ढूंढ रहे हैं?'] : ['Hey! 👋 How can I help?','Hello! What are you looking for?','Hi there! Ask me anything.'];
      response = greetings[Math.floor(Math.random()*greetings.length)];
      speakText = response;
      suggestions = ["Available rooms", "My next class", "Help"];
    }

    else if (intent === "THANKS") {
      response = isHindi ? 'कोई बात नहीं! 😊 और कुछ पूछना हो तो बताइए।' : 'You\'re welcome! 😊 Anything else?';
      speakText = response;
      suggestions = ["Available rooms", "My next class"];
    }

    else if (intent === "COLLEGE_HOURS") {
      response = isHindi ? 'कॉलेज का समय: Monday–Friday, 8:30 AM – 6:00 PM.' : 'College hours: Monday–Friday, 8:30 AM – 6:00 PM.';
      if (isWeekend) response += isHindi ? ' आज छुट्टी है!' : ' Today is a holiday!';
      speakText = response;
      suggestions = ["Available rooms", "My next class"];
    }

    else if (intent === "COUNT_ROOMS") {
      if (periodIndex < 0 || periodIndex > 8) {
        response = isHindi ? 'कॉलेज का समय 8:30 AM – 4:30 PM है।' : 'College hours are 8:30 AM – 4:30 PM.';
      } else {
        const dbRooms = (await env.DB.prepare("SELECT name, type, emptySlots FROM campus_rooms").all()).results || [];
        let count = 0;
        for (const r of dbRooms) {
          try { const s = JSON.parse(r.emptySlots); if (s[day]?.includes(periodIndex)) { if (!roomTypeFilter || r.type === roomTypeFilter) count++; } } catch{}
        }
        response = isHindi ? `${day} को ${pLabel} पर ${count} rooms available हैं।` : `${count} rooms available on ${day} at ${pLabel}.`;
      }
      speakText = response;
      suggestions = ["Show available rooms", "My next class"];
    }

    else if (intent === "HELP") {
      response = isHindi
        ? "मैं ये कर सकता हूँ:\nAvailable rooms - 'rooms available at 10:30'\nTeacher - 'Dr. Amit kahan hai?'\nअगला class - 'my next class'\nRoom check - 'R29 available hai?'\nWeather - 'mausam kaisa hai?'"
        : "I can help with:\nAvailable rooms - 'rooms at 10:30'\nTeacher lookup - 'where is Dr. Amit?'\nNext class - 'my next class'\nRoom check - 'is R29 available?'\nWeather - 'how is the weather?'";
      speakText = isHindi ? "आप rooms, teachers, weather, या schedule के बारे में पूछ सकते हैं." : "Ask me about rooms, teachers, weather, or your schedule.";
      suggestions = ["Available rooms", "My next class"];
    }

    else if (intent === "WEATHER") {
      try {
        const wUrl = new URL('/api/weather', request.url);
        const wRes = await fetch(wUrl.toString());
        if (wRes.ok) {
          const w = await wRes.json();
          response = isHindi
            ? `SRCC Campus: ${w.temperature} degree C (feels like ${w.feelsLike} degree), ${w.condition}. Humidity ${w.humidity}%, Wind ${w.windSpeed} km/h. AQI: ${w.aqi} (${w.aqiLabel}).`
            : `SRCC Campus: ${w.temperature} degree C (feels like ${w.feelsLike} degree), ${w.condition}. Humidity ${w.humidity}%, Wind ${w.windSpeed} km/h. AQI: ${w.aqi} (${w.aqiLabel}).`;
          speakText = isHindi
            ? `SRCC में अभी ${w.temperature} degree है, ${w.condition}. AQI ${w.aqi}, ${w.aqiLabel}.`
            : `It is ${w.temperature} degrees at SRCC, ${w.condition}. AQI is ${w.aqi}, ${w.aqiLabel}.`;
        } else {
          response = isHindi ? 'Weather data अभी उपलब्ध नहीं है.' : 'Weather data unavailable right now.';
          speakText = response;
        }
      } catch { response = 'Weather data unavailable.'; speakText = response; }
      suggestions = ["Available rooms", "My next class"];
    }

    else if (intent === "DEVELOPER") {
      response = isHindi ? 'Keshav Singal (24BC702) की curiosity से बना है.' : 'Developed with curiosity to Keshav Singal (24BC702).';
      speakText = response;
      suggestions = ["Available rooms", "Help"];
    }

    else if (intent === "ABSENT_TEACHERS") {
      try {
        const aUrl = new URL('/api/attendance', request.url);
        const aRes = await fetch(aUrl.toString());
        const absList = await aRes.json();
        if (absList.length > 0) {
          const names = absList.map(a => { const t = allTeachers.find(t => t.id === a.teacher_id); return t ? displayName(t) : a.teacher_id; });
          response = isHindi
            ? `आज ${names.length} teachers on leave हैं: ${names.join(', ')}.`
            : `${names.length} teachers on leave today: ${names.join(', ')}.`;
          speakText = isHindi
            ? `आज ${names.length} teachers on leave हैं.`
            : `${names.length} teachers are on leave today.`;
        } else {
          response = isHindi ? 'आज कोई teacher on leave नहीं है.' : 'No teachers are on leave today.';
          speakText = response;
        }
      } catch { response = 'Could not fetch leave data.'; speakText = response; }
      suggestions = ["Available rooms", "My next class"];
    }

    else {
      response = isHindi ? "समझ नहीं आया. Rooms, teachers, या schedule के बारे में पूछें." : "Try asking about available rooms, teachers, or your schedule.";
      speakText = response;
      suggestions = ["Help", "Available rooms", "My next class"];
    }

    return Response.json({ intent, response, data, suggestions, speakText: cleanSpeak(speakText), isHindi });
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
  const hindiWords = /\b(kahan|kidhar|khali|kab|kaun|kaunse|konsa|koi|hai|hain|hote|hota|hoti|kya|batao|dikhao|chahiye|milega|milenge|abhi|aaj|kal|somwar|mangalvar|budhvar|guruvar|shukravar|shanivar|nahi|mein|ka|ki|ke|ko|se|par|bhi|aur|ya|sir|maam|ji)\b/i;
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

// ---- Intent Classification (expanded with 50+ patterns) ----
function classifyIntent(text, roomMatch, teacherMatch, rollNo) {
  // Greeting
  if (/^(hi|hey|hello|hii+|hola|namaste|namaskar|yo|sup|good morning|good afternoon|good evening)\b/.test(text)) return "GREETING";
  if (/^(thanks|thank you|thank u|thanku|shukriya|dhanyavad|thx|ty)\b/.test(text)) return "THANKS";

  // Developer / who made this
  if (/\b(who (made|built|created|developed)|kisne banaya|founder|creator|developer|made this|built this|banaaya)\b/.test(text)) return "DEVELOPER";

  // Weather
  if (/\b(weather|mausam|temperature|tapman|garmi|sardi|barish|rain|humidity|aqi|air quality|hawa|dhoop)\b/.test(text)) return "WEATHER";

  // Absent teachers
  if (/\b(absent|absent teacher|who.*(absent|not here|not coming|chutti|leave)|kaun.*absent|chutti.*kaun)\b/.test(text)) return "ABSENT_TEACHERS";

  // Help
  if (/\b(help|commands|kya kar sakte|what can you|madad|guide|how to use|options|features)\b/.test(text)) return "HELP";

  // College hours
  if (/\b(college hours|college timing|timing|kab.*khulta|kab.*band|opening time|closing time|when.*open|when.*close|samay|class.*kab.*start)\b/.test(text)) return "COLLEGE_HOURS";

  // Count rooms (how many, kitne)
  if (/\b(how many|kitne|kitni|count|total)\b/.test(text) && /\b(room|rooms|available|khali|empty)\b/.test(text)) return "COUNT_ROOMS";

  // Specific room check (ROOM_INFO) — must come before AVAILABLE_ROOMS
  if (roomMatch && /\b(who|what|is|available|occupied|khali|kya|status|check|kaun)\b/.test(text)) return "ROOM_INFO";
  if (/\b(who is in|who's in|what's in|whats happening|who teaches in)\b/.test(text)) return "ROOM_INFO";

  // AVAILABLE_ROOMS — many variations
  if (/\b(room|rooms|kamra|halls?|labs?|tutorial|lecture|lectures)\b/.test(text) && /\b(available|free|empty|khali|vacant|open|milega|milenge)\b/.test(text)) return "AVAILABLE_ROOMS";
  if (/\b(available room|free room|empty room|rooms?\s*(available|free|empty|khali|at))\b/.test(text)) return "AVAILABLE_ROOMS";
  if (/\b(koi room|which room|konsa room|room mil|room chahiye|room dikhao|room batao)\b/.test(text)) return "AVAILABLE_ROOMS";
  if (/\b(place to sit|jagah|where.*sit|where.*study|study room|padhai|padhne)\b/.test(text)) return "AVAILABLE_ROOMS";
  if (/\b(empty.*class|class.*empty|classroom available|available classroom)\b/.test(text)) return "AVAILABLE_ROOMS";
  if (/\b(koi jagah|jagah mil|jagah chahiye|kahan.*baithu|baith.*sakte)\b/.test(text)) return "AVAILABLE_ROOMS";
  if (/\b(show.*room|list.*room|find.*room)\b/.test(text)) return "AVAILABLE_ROOMS";

  // Teacher queries — with more variations
  if (teacherMatch && /\b(next.*class|agla.*class|agli.*class|upcoming|next.*lecture)\b/.test(text)) return "TEACHER_INFO";
  if (teacherMatch && /\b(available|free|where|kahan|schedule|kidhar|busy|milenge|hai|hain|located|cabin|office|class|teaches|padha|at)\b/.test(text)) return "TEACHER_INFO";
  if (teacherMatch && /\b(kab.*available|kab.*free|kab.*milenge|when.*available|when.*free)\b/.test(text)) return "TEACHER_INFO";
  if (teacherMatch && !/\b(my|mera|mere|room|rooms|available|free|empty)\b/.test(text)) return "TEACHER_INFO";

  // Student schedule — with more variations
  if (/\b(my next class|next lecture|next class|kahan jana|what'?s next|agla class|agla period|next period)\b/.test(text)) return "MY_NEXT_CLASS";
  if (/\b(do i have class|koi class hai|class hai kya|am i free|main free)\b/.test(text)) return "MY_NEXT_CLASS";
  if (/\b(my schedule|my classes|my timetable|mera schedule|mere classes|today.*(class|schedule)|aaj.*(class|schedule))\b/.test(text)) return "MY_SCHEDULE";
  if (/\b(full.*schedule|poora.*schedule|all.*class|saari.*class|din.*bhar|pura din)\b/.test(text)) return "MY_SCHEDULE";
  if (/\b(kitne class|how many class|total class)\b/.test(text) && rollNo) return "MY_SCHEDULE";

  // Fallback triggers
  if (/\b(room|rooms)\b/.test(text)) return "AVAILABLE_ROOMS";
  if (/\b(next|agla)\b/.test(text) && rollNo) return "MY_NEXT_CLASS";
  if (/\b(schedule|timetable)\b/.test(text) && rollNo) return "MY_SCHEDULE";
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
  'classes','subjects','subject','sir','maam','madam','please','sar','mam','mem',
  'is','the','at','on','in','for','and','or','a','an','of','to',
  'hai','hain','ka','ki','ke','ko','se','par','bhi','aur','ya','hote','hota','hoti',
  'batao','dikhao','chahiye','milega','milenge','koi','konsa','kaunse',
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
        // Very close match (distance 1 for 4+ chars, distance 2 for 6+ chars)
        const dist = levenshtein(qw, nw);
        if ((qw.length >= 4 && nw.length >= 4 && dist <= 1) || (qw.length >= 6 && nw.length >= 6 && dist <= 2)) {
          score += nw.length * 3; matchedWords++; continue;
        }
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
  if (m >= 750 && m < 810) return 4; if (m >= 840 && m < 900) return 5;
  if (m >= 900 && m < 960) return 6; if (m >= 960 && m < 1020) return 7;
  if (m >= 1020 && m < 1080) return 8; return -1;
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
