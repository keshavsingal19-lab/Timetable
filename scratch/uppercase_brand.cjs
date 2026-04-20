const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

// Replace Headings to Uppercase and keep sans-serif
content = content.replace(/SRCC Assist<\/h1>/g, "SRCC ASSIST</h1>");
content = content.replace(/SRCC Assist<\/h2>/g, "SRCC ASSIST</h2>");

fs.writeFileSync('App.tsx', content);
console.log('Updated to SRCC ASSIST and Sans-Serif');
