const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

// Fix the imports first
content = content.replace(/Database\s*RefreshCw,\s*Layers/, 'RefreshCw, Layers');

// Second check: if Database followed by newline RefreshCw
content = content.replace(/Database\s*\r?\n\s*RefreshCw,\s*Layers/, 'RefreshCw, Layers');

// Also Add the safety wrapper for ALL_STUDENT_SCHEDULES
const oldAggregation = `const ALL_STUDENT_SCHEDULES = {
  ...SEM2_STUDENT_SCHEDULES,
  ...SEM4_STUDENT_SCHEDULES,
  ...convertSem6Data(sem6StudentData)
};`;

const newAggregation = `// Combine all semesters with safety wrapper
const getSafeSem6Data = () => {
  try {
    return convertSem6Data(sem6StudentData);
  } catch (e) {
    console.error("Critical error converting Sem 6 data:", e);
    return {};
  }
};

const ALL_STUDENT_SCHEDULES = {
  ...(SEM2_STUDENT_SCHEDULES || {}),
  ...(SEM4_STUDENT_SCHEDULES || {}),
  ...getSafeSem6Data()
};`;

if (content.includes('...convertSem6Data(sem6StudentData)')) {
    content = content.replace(oldAggregation, newAggregation);
}

fs.writeFileSync('App.tsx', content);
console.log('App.tsx fixed programmatically');
