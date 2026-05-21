export async function onRequestGet(context) {
  const { env } = context;

  try {
    let dbRooms = [];
    let extraClasses = [];

    if (env.DB) {
      try {
        const result = await env.DB.prepare("SELECT * FROM campus_rooms").all();
        dbRooms = result.results || [];

        // Also fetch all future extra classes
        const makeups = await env.DB.prepare("SELECT room, date, day_of_week, period_index, subject, teacher_id FROM makeup_classes WHERE date >= date('now', 'localtime')").all();
        extraClasses = makeups.results || [];
      } catch (e) {}
    }

    const formattedDbRooms = dbRooms.map(r => {
      let parsedEmpty = {};
      let parsedOccupied = {};
      try { parsedEmpty = JSON.parse(r.emptySlots); } catch(e) {}
      try { parsedOccupied = JSON.parse(r.occupiedBy); } catch(e) {}

      const now = new Date();
      const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      const istDate = new Date(istString);
      const todayDateStr = istDate.getFullYear() + "-" + String(istDate.getMonth() + 1).padStart(2, '0') + "-" + String(istDate.getDate()).padStart(2, '0');
      
      const timeMins = istDate.getHours() * 60 + istDate.getMinutes();
      let currentPeriodIndex = -1;
      if (timeMins >= 8*60+30 && timeMins < 9*60+30) currentPeriodIndex = 0;
      else if (timeMins >= 9*60+30 && timeMins < 10*60+30) currentPeriodIndex = 1;
      else if (timeMins >= 10*60+30 && timeMins < 11*60+30) currentPeriodIndex = 2;
      else if (timeMins >= 11*60+30 && timeMins < 12*60+30) currentPeriodIndex = 3;
      else if (timeMins >= 12*60+30 && timeMins < 13*60+30) currentPeriodIndex = 4;
      else if (timeMins >= 14*60 && timeMins < 15*60) currentPeriodIndex = 5;
      else if (timeMins >= 15*60 && timeMins < 16*60) currentPeriodIndex = 6;
      else if (timeMins >= 16*60 && timeMins < 17*60) currentPeriodIndex = 7;
      else if (timeMins >= 17*60 && timeMins < 18*60) currentPeriodIndex = 8;
      else if (timeMins >= 18*60) currentPeriodIndex = 9;

      // Inject Extra Classes directly into the schedule
      extraClasses.forEach(ext => {
        // Skip expired
        if (ext.date < todayDateStr) return;
        if (ext.date === todayDateStr && ext.period_index < currentPeriodIndex) return;

        if (ext.room === r.name) {
          const d = ext.day_of_week;
          const p = ext.period_index;
          
          // Remove from emptySlots
          if (parsedEmpty[d]) {
            parsedEmpty[d] = parsedEmpty[d].filter(slot => slot !== p);
          }
          
          // Add to occupiedBy
          if (!parsedOccupied[d]) parsedOccupied[d] = {};
          if (!parsedOccupied[d][p]) parsedOccupied[d][p] = [];
          
          parsedOccupied[d][p].push(ext.teacher_id + ' (Extra)');
        }
      });
      return {
        id: r.id,
        name: r.name,
        type: r.type,
        emptySlots: parsedEmpty,
        occupiedBy: parsedOccupied,
        updatedAt: r.updated_at,
        source: 'database'
      };
    });

    return new Response(JSON.stringify(formattedDbRooms), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
