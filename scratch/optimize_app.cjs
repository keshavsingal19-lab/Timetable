const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

// 1. Remove the top-level ALL_STUDENT_SCHEDULES block
const oldBlockRegex = /\/\/ Combine all semesters\s*const ALL_STUDENT_SCHEDULES = \{[\s\S]*?\};/;
content = content.replace(oldBlockRegex, '// Aggregated in App via useMemo');

// 2. Insert the useMemo block inside function App()
const appStart = 'function App() {';
const newCode = `function App() {
  // Move heavy data processing into useMemo to prevent top-level hangs
  const ALL_STUDENT_SCHEDULES = useMemo(() => {
    try {
      return {
        ...(SEM2_STUDENT_SCHEDULES || {}),
        ...(SEM4_STUDENT_SCHEDULES || {}),
        ...convertSem6Data(sem6StudentData)
      };
    } catch (e) {
      console.error("Error processing student schedules:", e);
      return {};
    }
  }, []);`;

if (content.includes(appStart) && !content.includes('const ALL_STUDENT_SCHEDULES = useMemo')) {
    content = content.replace(appStart, newCode);
}

fs.writeFileSync('App.tsx', content);
console.log('App.tsx optimized programmatically');
