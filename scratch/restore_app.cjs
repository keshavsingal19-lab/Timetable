const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

// 1. Fix the React mounting crash (statusInfo.icon -> StatusIcon)
const oldMapBlock = `              {visibleEntities.map((entity: any) => {
                const statusInfo = getEntityStatus(entity);
                return (
                  <div key={entity.id} className="bg-white border rounded-xl p-5 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-srcc-portalNavy/10 p-2.5 rounded-xl text-srcc-portalNavy">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div className={\`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 \${statusInfo.color === 'red' ? 'bg-red-50 text-red-700' : statusInfo.color === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}\`}>
                        <statusInfo.icon className="w-3 h-3" /> {statusInfo.status}
                      </div>
                    </div>`;

const newMapBlock = `              {visibleEntities.map((entity: any) => {
                const statusInfo = getEntityStatus(entity);
                const StatusIcon = statusInfo.icon;
                return (
                  <div key={entity.id} className="bg-white border rounded-xl p-5 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-srcc-portalNavy/10 p-2.5 rounded-xl text-srcc-portalNavy">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div className={\`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 \${statusInfo.color === 'red' ? 'bg-red-50 text-red-700' : statusInfo.color === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}\`}>
                        <StatusIcon className="w-3 h-3" /> {statusInfo.status}
                      </div>
                    </div>`;

if (content.includes('statusInfo.icon')) {
    content = content.replace(oldMapBlock, newMapBlock);
    // Fallout protection if formatting was slightly different
    content = content.replace('<statusInfo.icon', '<StatusIcon');
}

// 2. Revert ALL_STUDENT_SCHEDULES to top-level for code purity
if (content.includes('const ALL_STUDENT_SCHEDULES = useMemo')) {
    const topLevelBlock = `// Combined all semesters with safety wrapper
const ALL_STUDENT_SCHEDULES = {
  ...(SEM2_STUDENT_SCHEDULES || {}),
  ...(SEM4_STUDENT_SCHEDULES || {}),
  ...convertSem6Data(sem6StudentData)
};

const getDayName = (day: DayOfWeek): string => day;`;

    // Remove the useMemo block
    content = content.replace(/const ALL_STUDENT_SCHEDULES = useMemo\([\s\S]*?\};/g, '');
    // Remove duplication of getDayName
    content = content.replace('const getDayName = (day: DayOfWeek): string => day;', '');
    // Insert back at top level
    content = content.replace('// Helper function to dynamically fix Sem 6 formatting', topLevelBlock + '\n\n// Helper function to dynamically fix Sem 6 formatting');
}

fs.writeFileSync('App.tsx', content);
console.log('App.tsx surgically fixed and restored');
