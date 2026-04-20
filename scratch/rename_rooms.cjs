const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

// Replace UI labels
content = content.replace(/>Room Finder</g, '>Vacant Rooms<');
content = content.replace(/<span>Room Finder<\/span>/g, '<span>Vacant Rooms</span>');

// Replace comments for consistency
content = content.replace(/\/\* --- ROOM FINDER TAB ---\ \*\//g, '/* --- VACANT ROOMS TAB --- */');

fs.writeFileSync('App.tsx', content);
console.log('Renamed Room Finder to Vacant Rooms');
