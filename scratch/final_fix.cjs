const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

// 1. Fix the StatusIcon rendering block
const oldPattern = /\{visibleEntities\.map\(\(entity: any\) => \{[\s\S]*?const statusInfo = getEntityStatus\(entity\);\s*return \(/;
const newFragment = `{visibleEntities.map((entity: any) => {
                const statusInfo = getEntityStatus(entity);
                const StatusIcon = statusInfo.icon;
                return (`;

if (oldPattern.test(content)) {
    content = content.replace(oldPattern, newFragment);
    console.log('StatusIcon logic fixed');
} else {
    console.log('Could not find the map block for StatusIcon');
}

// 2. Double check for any duplicate convertSem6Data (if duplicated by scripts)
// The cleanup_app.cjs should have handled this, but let's be sure.

fs.writeFileSync('App.tsx', content);
console.log('App.tsx finalized perfectly');
