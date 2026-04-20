const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

// 1. Clear the mobile sidebar backdrop
content = content.replace(/className="fixed inset-0 bg-srcc-portalNavy\/80 backdrop-blur-sm/g, 'className="fixed inset-0 bg-transparent');

// 2. Change active tab color from Navy to White
content = content.replace(/text-srcc-portalNavy/g, 'text-white');

fs.writeFileSync('App.tsx', content);
console.log('Cleared mobile backdrop and set active text to white');
