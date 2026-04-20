const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

// Target the desktop implementation specifically
content = content.replace(/bg-srcc-yellow text-srcc-portalNavy' : 'text-gray-300 hover:bg-white\/10 hover:text-white'/g, "bg-srcc-yellow text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'");

// Just in case of any remaining mobile ones
content = content.replace(/bg-srcc-yellow text-srcc-portalNavy' : 'text-gray-300'/g, "bg-srcc-yellow text-white' : 'text-gray-300'");

fs.writeFileSync('App.tsx', content);
console.log('Final color cleanup complete');
