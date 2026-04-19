export async function onRequestGet(context) {
  const { env } = context;

  try {
    let dbRooms = [];

    if (env.DB) {
      try {
        const result = await env.DB.prepare("SELECT * FROM campus_rooms").all();
        dbRooms = result.results || [];
      } catch (e) {}
    }

    const formattedDbRooms = dbRooms.map(r => {
      let parsedEmpty = {};
      let parsedOccupied = {};
      try { parsedEmpty = JSON.parse(r.emptySlots); } catch(e) {}
      try { parsedOccupied = JSON.parse(r.occupiedBy); } catch(e) {}
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
