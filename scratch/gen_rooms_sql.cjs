const fs = require('fs');
// This is a simplified mock of the data.ts structure to extract EXISTING_ROOMS
const content = fs.readFileSync('data.ts', 'utf8');

// Heuristic to extract the array content
const roomsMatch = content.match(/const EXISTING_ROOMS: RoomData\[\] = (\[[\s\S]*?\]);/);
if (!roomsMatch) {
    console.error("Could not find EXISTING_ROOMS in data.ts");
    process.exit(1);
}

// We can't easily eval() because of DayOfWeek enum etc.
// But we can use regex to find IDs and compute their full objects.
// Actually, I'll just use a simpler method: regex for the whole block.

const roomBlocks = content.match(/\{[\s\S]*?id: "(\w+)"[\s\S]*?name: "(\w+)"[\s\S]*?type: "([\w\s]+)"[\s\S]*?emptySlots: \{([\s\S]*?)\}[\s\S]*?\}/g);

if (!roomBlocks) {
    console.error("No room blocks found");
    process.exit(1);
}

let sql = "INSERT OR IGNORE INTO campus_rooms (id, name, type, emptySlots, occupiedBy) VALUES\n";
const values = [];

roomBlocks.forEach(block => {
    const id = block.match(/id:\s*"(\w+)"/)[1];
    const name = block.match(/name:\s*"(\w+)"/)[1];
    const type = block.match(/type:\s*"([\w\s]+)"/)[1];
    
    // Extract emptySlots manually
    const slotsMatch = block.match(/emptySlots:\s*\{([\s\S]*?)\}/);
    if (!slotsMatch) return;
    
    const slotsText = slotsMatch[1];
    const slotMap = {};
    const dayMatches = slotsText.match(/\[DayOfWeek\.(\w+)\]:\s*\[([\d,\s]*)\]/g);
    if (dayMatches) {
        dayMatches.forEach(dm => {
            const m = dm.match(/\[DayOfWeek\.(\w+)\]:\s*\[([\d,\s]*)\]/);
            const day = m[1];
            const slots = m[2].split(',').map(s => s.trim()).filter(s => s.length > 0).map(Number);
            slotMap[day] = slots;
        });
    }
    
    values.push(`('${id}', '${name}', '${type}', '${JSON.stringify(slotMap)}', '{}')`);
});

sql += values.join(",\n") + ";";
fs.writeFileSync('seed_rooms.sql', sql);
console.log(`Generated seed_rooms.sql with ${values.length} rooms`);
