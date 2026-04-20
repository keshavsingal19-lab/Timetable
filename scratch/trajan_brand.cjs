const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

// Replace Helvetica Neue with Trajan Pro in line styles
content = content.replace(/'Helvetica Neue', 'Helvetica', 'Arial', sans-serif/g, "'Trajan Pro', 'Trajan', 'Cinzel', serif");

fs.writeFileSync('App.tsx', content);
console.log('Migrated brand titles to Trajan Pro stack');
