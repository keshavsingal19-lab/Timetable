const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

// Replace the active tab text color with a soft white (Gray 100)
content = content.replace(/bg-srcc-yellow text-white/g, "bg-srcc-yellow text-gray-100");

fs.writeFileSync('App.tsx', content);
console.log('Softened active tab text to match dashboard white tones');
