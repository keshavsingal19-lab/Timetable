const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

// The marker for the teacher card header
const searchBlock = `<div className="bg-srcc-portalNavy/10 p-2.5 rounded-xl text-srcc-portalNavy">
                        <GraduationCap className="w-6 h-6" />
                      </div>`;

const replacementBlock = `<div className="relative bg-srcc-portalNavy/10 p-2.5 rounded-xl text-srcc-portalNavy">
                        <GraduationCap className="w-6 h-6" />
                        {entity.source === 'database' && (
                          <div className="absolute -top-1 -right-1 bg-green-500 w-2.5 h-2.5 rounded-full border-2 border-white" title="Live Database Data"></div>
                        )}
                      </div>`;

if (content.includes('GraduationCap')) {
    content = content.replace(searchBlock, replacementBlock);
}

fs.writeFileSync('App.tsx', content);
console.log('UI Data badge added');
