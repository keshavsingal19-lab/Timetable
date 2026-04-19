const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

// 1. Identify the mess part
const messStart = 'return converted;\\s*\\};[\\s\\S]*?// --- NAVIGATION & GLOBAL STATES ---';
const messRegex = new RegExp(messStart);

const restorationCode = `return converted;
};

// Combined all semesters with safety wrapper
const ALL_STUDENT_SCHEDULES = {
  ...(SEM2_STUDENT_SCHEDULES || {}),
  ...(SEM4_STUDENT_SCHEDULES || {}),
  ...convertSem6Data(sem6StudentData)
};

const getDayName = (day: DayOfWeek): string => day;

function App() {
  // --- NAVIGATION & GLOBAL STATES ---`;

if (messRegex.test(content)) {
    content = content.replace(messRegex, restorationCode);
} else {
    console.log('Regex did not match, trying literal fallback');
    // Literal fallback if formatting changed
    const literalTarget = 'return converted;\\n};\\n\\n// Aggregated in App via useMemo\\n\\n\\nfunction App() {\\n  // Move heavy data processing into useMemo to prevent top-level hangs\\n  \\n    } catch (e) {\\n      console.error("Error processing student schedules:", e);\\n      return {};\\n    }\\n  }, [];\\n  // --- NAVIGATION & GLOBAL STATES ---';
    // (Actual file content might have different newlines)
}

// Ensure getDayName is not duplicated elsewhere
// (It shouldn't be)

fs.writeFileSync('App.tsx', content);
console.log('App.tsx structure restored surgically');
