const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

// Sidebar Headings: Revert to serif (Cinzel) and remove inline style
const sidebarRegex = /<h1 className="font-bold text-xl leading-tight tracking-wide text-white" style=\{\{ fontFamily: "'Trajan Pro', 'Trajan', 'Cinzel', serif" \}\}>SRCC ASSIST<\/h1>/g;
content = content.replace(sidebarRegex, '<h1 className="font-serif font-bold text-xl leading-tight tracking-wide text-white">SRCC ASSIST</h1>');

// Landing Page Heading: Maintain Trajan Pro and Bolden (font-black)
const landingRegex = /<h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-3 tracking-wide" style=\{\{ fontFamily: "'Trajan Pro', 'Trajan', 'Cinzel', serif" \}\}>SRCC ASSIST<\/h2>/g;
content = content.replace(landingRegex, '<h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white mb-1 sm:mb-3 tracking-wide" style={{ fontFamily: "\'Trajan Pro\', \'Trajan\', \'Cinzel\', serif" }}>SRCC ASSIST</h2>');

fs.writeFileSync('App.tsx', content);
console.log('Restored original fonts except for landing page brand title');
