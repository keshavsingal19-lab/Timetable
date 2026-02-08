// Auto-generated teacher data from Google Sheets
// Generated on: 2026-02-08T14:29:27.504Z

// Helper: Map time strings to array indices
export const timeSlotMap: Record<string, number> = {
  "8:30 AM": 0, "9:30 AM": 1, "10:30 AM": 2, "11:30 AM": 3,
  "12:30 PM": 4, "1:30 PM": 5, "2:30 PM": 6, "3:30 PM": 7, "4:30 PM": 8, "5:30 PM": 9
};

// Helper: Parse time string to minutes
function parseTimeStringToMinutes(timeString: string) {
  const [time, period] = timeString.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

// Helper: Create class object
export function createClass(day: string, startTime: string, endTime: string, type: string, batch: string, room: string, subject: string) {
  const startMinutes = parseTimeStringToMinutes(startTime);
  const endMinutes = parseTimeStringToMinutes(endTime);
  const duration = (endMinutes - startMinutes) / 60;
  
  const startSlotIndex = timeSlotMap[startTime];
  const periods: number[] = [];
  if (startSlotIndex !== undefined) {
      for (let i = 0; i < Math.ceil(duration); i++) {
          periods.push(startSlotIndex + i);
      }
  }

  return {
    day, startTime, endTime, type, batch, room, subject,
    duration,
    periods
  };
}

const EMPTY_SCHEDULE = {
  Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: []
};

// --- TEACHER SCHEDULES ---
const scheduleSIS = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R1', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T18', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R1', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T18', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R2', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T9', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R5', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T18', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T18', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R1', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T18', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'T9', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R1', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T18', 'Main'),
  ],
  'Saturday': [],
};

const scheduleDPE = {
  'Monday': [
    createClass('Monday', '2:00 PM', '3:00 PM', 'Class', 'All', 'R3', 'Main'),
    createClass('Monday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R3', 'Main'),
    createClass('Monday', '4:00 PM', '5:00 PM', 'Class', 'All', 'R3', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '2:00 PM', '3:00 PM', 'Class', 'All', 'R3', 'Main'),
    createClass('Tuesday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R3', 'Main'),
    createClass('Tuesday', '4:00 PM', '5:00 PM', 'Class', 'All', 'R3', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '2:00 PM', '3:00 PM', 'Class', 'All', 'R3', 'Main'),
    createClass('Wednesday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R3', 'Main'),
    createClass('Wednesday', '4:00 PM', '5:00 PM', 'Class', 'All', 'R3', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T15', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T15', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '2:00 PM', '3:00 PM', 'Class', 'All', 'R3', 'Main'),
    createClass('Friday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R3', 'Main'),
    createClass('Friday', '4:00 PM', '5:00 PM', 'Class', 'All', 'R3', 'Main'),
  ],
  'Saturday': [],
};

const scheduleRNC = {
  'Monday': [
    createClass('Monday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R1', 'Main'),
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T17', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T17', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R1', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T17', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R1', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T17', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R1', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R1', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T17', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T17', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R1', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T17', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T17', 'Main'),
  ],
  'Saturday': [],
};

const scheduleSLG = {
  'Monday': [
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R17', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R21', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T8', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R5', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R21', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T8', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T8', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R27', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T8', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T8', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R8', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T8', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T8', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T8', 'Main'),
  ],
  'Saturday': [],
};

const scheduleRUA = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R2', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T9', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R2', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T9', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T9', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R2', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T9', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T9', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R2', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R1', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T9', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R2', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T9', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T9', 'Main'),
  ],
  'Saturday': [],
};

const scheduleAMS = {
  'Monday': [
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R33', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R21', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T1', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T14', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T35', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R28', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T1', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R21', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R35', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T4', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R21', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T1', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T1', 'Main'),
  ],
  'Saturday': [],
};

const scheduleRAJ = {
  'Monday': [
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R5', 'Main'),
    createClass('Monday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T7', 'Main'),
    createClass('Monday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T7', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R5', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T7', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T7', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R5', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T7', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T7', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R8', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T7', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R5', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T7', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R5', 'Main'),
  ],
  'Saturday': [],
};

const scheduleAAJ = {
  'Monday': [
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R8', 'Main'),
    createClass('Monday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T29', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R8', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T29', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T29', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R24', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R8', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R24', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T29', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T29', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R24', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T29', 'Main'),
  ],
  'Saturday': [],
};

const scheduleSSS = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '2:00 PM', '3:00 PM', 'Class', 'All', 'R34', 'Main'),
    createClass('Tuesday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R34', 'Main'),
    createClass('Tuesday', '4:00 PM', '5:00 PM', 'Class', 'All', 'R34', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '2:00 PM', '3:00 PM', 'Class', 'All', 'R16', 'Main'),
    createClass('Wednesday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R16', 'Main'),
    createClass('Wednesday', '4:00 PM', '5:00 PM', 'Class', 'All', 'R16', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '2:00 PM', '3:00 PM', 'Class', 'All', 'R23', 'Main'),
    createClass('Thursday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R23', 'Main'),
    createClass('Thursday', '4:00 PM', '5:00 PM', 'Class', 'All', 'R23', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T31', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T31', 'Main'),
    createClass('Friday', '2:00 PM', '3:00 PM', 'Class', 'All', 'PB3', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R6', 'Main'),
    createClass('Saturday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R6', 'Main'),
  ],
};

const scheduleMAK = {
  'Monday': [
    createClass('Monday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R13', 'Main'),
    createClass('Monday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R13', 'Main'),
    createClass('Monday', '2:00 PM', '3:00 PM', 'Class', 'All', 'R24', 'Main'),
    createClass('Monday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R24', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '2:00 PM', '3:00 PM', 'Class', 'All', 'R14', 'Main'),
    createClass('Tuesday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R14', 'Main'),
    createClass('Tuesday', '4:00 PM', '5:00 PM', 'Class', 'All', 'R14', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T13', 'Main'),
    createClass('Wednesday', '2:00 PM', '3:00 PM', 'Class', 'All', 'R7', 'Main'),
    createClass('Wednesday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R14', 'Main'),
    createClass('Wednesday', '4:00 PM', '5:00 PM', 'Class', 'All', 'R14', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T13', 'Main'),
    createClass('Thursday', '2:00 PM', '3:00 PM', 'Class', 'All', 'R22', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '2:00 PM', '3:00 PM', 'Class', 'All', 'R22', 'Main'),
  ],
  'Saturday': [],
};

const scheduleSNK = {
  'Monday': [
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'PB3', 'Main'),
    createClass('Monday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T36', 'Main'),
    createClass('Monday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T36', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'SCR4', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'SCR4', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T36', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'SCR1', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T36', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T36', 'Main'),
  ],
  'Thursday': [],
  'Friday': [
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'SCR1', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T36', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T36', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R4', 'Main'),
    createClass('Saturday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T36', 'Main'),
  ],
};

const scheduleAYJ = {
  'Monday': [
    createClass('Monday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R10', 'Main'),
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R3', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T11', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R10', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T11', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T11', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R10', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T11', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T11', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R3', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T11', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R3', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T11', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T11', 'Main'),
  ],
  'Saturday': [],
};

const scheduleSHK = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '2:00 PM', '3:00 PM', 'Class', 'All', 'R25', 'Main'),
    createClass('Tuesday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R25', 'Main'),
    createClass('Tuesday', '4:00 PM', '5:00 PM', 'Class', 'All', 'R25', 'Main'),
    createClass('Tuesday', '5:00 PM', '6:00 PM', 'Class', 'All', 'R25', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R19', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T25', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '2:00 PM', '3:00 PM', 'Class', 'All', 'PB3', 'Main'),
    createClass('Thursday', '3:00 PM', '4:00 PM', 'Class', 'All', 'PB3', 'Main'),
    createClass('Thursday', '4:00 PM', '5:00 PM', 'Class', 'All', 'PB3', 'Main'),
    createClass('Thursday', '5:00 PM', '6:00 PM', 'Class', 'All', 'PB3', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R4', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R4', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R18', 'Main'),
    createClass('Saturday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R18', 'Main'),
  ],
};

const schedulePRD = {
  'Monday': [
    createClass('Monday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R8', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R22', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R5', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T24', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T24', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R8', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T24', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T24', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R32', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T24', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T24', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R34', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T24', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T24', 'Main'),
  ],
  'Saturday': [],
};

const scheduleHNT = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R5', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R10', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T5', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T5', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R10', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T5', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T5', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T5', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'T5', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R5', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R5', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T5', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R5', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T5', 'Main'),
  ],
  'Saturday': [],
};

const scheduleTNM = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R14', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R4', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T12', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T38', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T37', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R16', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T12', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T38', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T37', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R16', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T12', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R4', 'Main'),
    createClass('Saturday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R4', 'Main'),
    createClass('Saturday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T12', 'Main'),
  ],
};

const scheduleSAP = {
  'Monday': [
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R10', 'Main'),
    createClass('Monday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T12', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R10', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R10', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T12', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R10', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T12', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T12', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R8', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T12', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T12', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R10', 'Main'),
  ],
  'Saturday': [],
};

const scheduleNNM = {
  'Monday': [
    createClass('Monday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R34', 'Main'),
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T35', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R21', 'Main'),
    createClass('Monday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T35', 'Main'),
    createClass('Monday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T35', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R13', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T35', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T35', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T35', 'Main'),
  ],
  'Wednesday': [],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R21', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T35', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R5', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T35', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R10', 'Main'),
  ],
};

const scheduleKIJ = {
  'Monday': [
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R22', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R22', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R13', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T26', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T25', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R22', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T24', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T26', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R13', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T3', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T26', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T26', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R15', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T27', 'Main'),
  ],
  'Saturday': [],
};

const scheduleVAJ = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R21', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T26', 'Main'),
    createClass('Monday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T39', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T31', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T31', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R15', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T26', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'PB3', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T26', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R3', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T32', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R15', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T27', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R27', 'Main'),
  ],
  'Saturday': [],
};

const scheduleKRA = {
  'Monday': [
    createClass('Monday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R26', 'Main'),
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R29', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R29', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R29', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R29', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R16', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R27', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R19', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R19', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R22', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'PB3', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R4', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R19', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R22', 'Main'),
  ],
  'Saturday': [],
};

const scheduleMAB = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R17', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T25', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R18', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T25', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R18', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T25', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T25', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R17', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T26', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T27', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T25', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R10', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T27', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R33', 'Main'),
  ],
  'Saturday': [],
};

const scheduleANK = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R22', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R13', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T42', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T33', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T33', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T5', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T4', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R22', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T5', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R15', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T33', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T5', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R26', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R34', 'Main'),
  ],
  'Saturday': [],
};

const scheduleAOK = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R17', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T39', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R34', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T40', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R17', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T39', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T40', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T40', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R17', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T41', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R17', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T40', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R1', 'Main'),
    createClass('Saturday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T40', 'Main'),
  ],
};

const scheduleASA = {
  'Monday': [
    createClass('Monday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R13', 'Main'),
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T8', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T8', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R8', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T8', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T4', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R3', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R13', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T14', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R2', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T8', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T27', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R2', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T8', 'Main'),
  ],
  'Saturday': [],
};

const scheduleRKS = {
  'Monday': [
    createClass('Monday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R2', 'Main'),
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T5', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R2', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T36', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T36', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R21', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R1', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T27', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R18', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T42', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T46', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R21', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T1', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T1', 'Main'),
  ],
  'Saturday': [],
};

const scheduleSIA = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R28', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R27', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R17', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T26', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'CLIB', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T32', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R17', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T26', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R17', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T33', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R28', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R27', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T30', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R17', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T32', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T33', 'Main'),
  ],
  'Saturday': [],
};

const scheduleBLK = {
  'Monday': [
    createClass('Monday', '11:30 AM', '12:30 PM', 'Class', 'All', 'CL2', 'Main'),
    createClass('Monday', '12:30 PM', '1:30 PM', 'Class', 'All', 'CL2', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'CL1', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'SCR2', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'SCR2', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'CL2', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'CL2', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R31', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R31', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R31', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R30', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R31', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R31', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'CLIB', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'CL1', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'CL1', 'Main'),
  ],
  'Saturday': [],
};

const scheduleSUY = {
  'Monday': [
    createClass('Monday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R15', 'Main'),
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T7', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R18', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R33', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T7', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R18', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R32', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T7', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T38', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R34', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R18', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T7', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T41', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R8', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T7', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R22', 'Main'),
  ],
  'Saturday': [],
};

const scheduleHHK = {
  'Monday': [
    createClass('Monday', '8:30 AM', '9:30 AM', 'Class', 'All', 'PB2', 'Main'),
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'CL1', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'CL1', 'Main'),
    createClass('Monday', '11:30 AM', '12:30 PM', 'Class', 'All', 'PB2', 'Main'),
    createClass('Monday', '12:30 PM', '1:30 PM', 'Class', 'All', 'PB2', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'SCR3', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'SCR3', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R19', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R19', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'CLIB', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'CLIB', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'CLIB', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'CLIB', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'PB2', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'CL2', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'CL2', 'Main'),
  ],
  'Saturday': [],
};

const scheduleMTS = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R15', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R15', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R32', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R20', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R20', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R28', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R20', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R20', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R15', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T33', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R20', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R20', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R15', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T46', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R20', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R20', 'Main'),
  ],
  'Saturday': [],
};

const schedulePNM = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R32', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R32', 'Main'),
    createClass('Monday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T26', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T32', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R15', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R27', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T50', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R15', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T49', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R2', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T37', 'Main'),
  ],
  'Thursday': [],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T50', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'LIBRARY FF', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R21', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T24', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R21', 'Main'),
  ],
};

const schedulePAA = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T38', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R1', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T38', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R2', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T38', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R1', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T38', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R2', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R18', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T38', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R34', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R32', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T38', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T38', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R10', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R3', 'Main'),
  ],
  'Saturday': [],
};

const scheduleMDH = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T24', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T27', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R23', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R13', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T23', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T1', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R35', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R18', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T50', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T5', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R7', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R18', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T35', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R13', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R28', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R2', 'Main'),
  ],
};

const scheduleVAK = {
  'Monday': [
    createClass('Monday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R3', 'Main'),
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R13', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R3', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T31', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T33', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R5', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T31', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T31', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'PB3', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R13', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T31', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R4', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R13', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T31', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R4', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T32', 'Main'),
  ],
  'Saturday': [],
};

const scheduleJDP = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T39', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T40', 'Main'),
    createClass('Monday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R15', 'Main'),
    createClass('Monday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R33', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R33', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R35', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T39', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T39', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R35', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R32', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T39', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R27', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T39', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R27', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T39', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R35', 'Main'),
  ],
  'Saturday': [],
};

const scheduleAAR = {
  'Monday': [
    createClass('Monday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R22', 'Main'),
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T33', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R3', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R14', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R14', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R27', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R3', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R14', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R14', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R17', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R6', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R14', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R3', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T33', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R14', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R14', 'Main'),
  ],
  'Saturday': [],
};

const scheduleJTW = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T50', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R3', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R21', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T50', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R34', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T45', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R17', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R13', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T50', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T50', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R32', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'T50', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R32', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T50', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R3', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R1', 'Main'),
  ],
};

const scheduleYAM = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'CLIB', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R6', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R6', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R34', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R4', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R16', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R35', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T25', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R10', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'PB3', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R15', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T14', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R16', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R16', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R22', 'Main'),
    createClass('Saturday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R6', 'Main'),
  ],
};

const scheduleAUV = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'CLIB', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'CLIB', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R19', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'CL1', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'CL2', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R15', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'CL1', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'CL2', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'CL2', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R28', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'SCR4', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'SCR4', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'CL2', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '9:30 AM', '10:30 AM', 'Class', 'All', 'CL2', 'Main'),
    createClass('Saturday', '10:30 AM', '11:30 AM', 'Class', 'All', 'CL2', 'Main'),
    createClass('Saturday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R10', 'Main'),
  ],
};

const scheduleSVP = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R33', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T14', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R18', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R27', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T14', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R3', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R28', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T14', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T14', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R13', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T14', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T14', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R8', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R13', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R35', 'Main'),
    createClass('Saturday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T14', 'Main'),
  ],
};

const scheduleDAB = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R27', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T41', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T1', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R18', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T41', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R8', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T41', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T41', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R15', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R8', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T43', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R3', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T1', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R8', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R33', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R17', 'Main'),
  ],
  'Saturday': [],
};

const schedulePRA = {
  'Monday': [
    createClass('Monday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R17', 'Main'),
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T31', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R6', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R28', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R28', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R22', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R6', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R6', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R10', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R20', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R20', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R31', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R27', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T33', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R20', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R31', 'Main'),
  ],
  'Saturday': [],
};

const scheduleSHG = {
  'Monday': [
    createClass('Monday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T27', 'Main'),
    createClass('Monday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R15', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R22', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T32', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R15', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T27', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'LIBRARY FF', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T32', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R21', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R35', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T32', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R15', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T31', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R13', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R3', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T26', 'Main'),
  ],
  'Saturday': [],
};

const scheduleSAA = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R4', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R4', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'CL1', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R32', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'CL1', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'CL1', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'CL1', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R19', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R19', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R34', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'CL1', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'CLIB', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'CLIB', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R32', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '9:30 AM', '10:30 AM', 'Class', 'All', 'CL1', 'Main'),
    createClass('Saturday', '10:30 AM', '11:30 AM', 'Class', 'All', 'CL1', 'Main'),
  ],
};

const scheduleATS = {
  'Monday': [
    createClass('Monday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R21', 'Main'),
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T49', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T49', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R21', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T49', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R1', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R26', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T49', 'Main'),
  ],
  'Wednesday': [],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'PB3', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T49', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R28', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R33', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T27', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R32', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R3', 'Main'),
    createClass('Saturday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T14', 'Main'),
  ],
};

const scheduleSTS = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R30', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T50', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R35', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'PB3', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T50', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T54', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R22', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T53', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R5', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T50', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R27', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T41', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'PB3', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T50', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R5', 'Main'),
    createClass('Saturday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R3', 'Main'),
  ],
};

const scheduleSJJ = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R35', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R8', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T38', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R18', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T35', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R13', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T36', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T36', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R13', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T36', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T36', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R33', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R1', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T36', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R26', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'CL1', 'Main'),
  ],
  'Saturday': [],
};

const scheduleAJJ = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R34', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T40', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T40', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R17', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R33', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T40', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'LIBRARY FF', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T49', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R31', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T40', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R22', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R32', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'LIBRARY FF', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T40', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R22', 'Main'),
    createClass('Saturday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T38', 'Main'),
  ],
};

const scheduleDTY = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R35', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T27', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R28', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R8', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T27', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T27', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R8', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R6', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R14', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T27', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T29', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R6', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R6', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R21', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T27', 'Main'),
    createClass('Saturday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R22', 'Main'),
  ],
};

const scheduleAAT = {
  'Monday': [
    createClass('Monday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R28', 'Main'),
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T32', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'CL2', 'Main'),
    createClass('Monday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T33', 'Main'),
    createClass('Monday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T33', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R15', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'CL1', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T49', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R18', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T33', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T33', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R32', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R27', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R28', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R28', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T33', 'Main'),
  ],
  'Saturday': [],
};

const scheduleVIC = {
  'Monday': [
    createClass('Monday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R23', 'Main'),
    createClass('Monday', '4:00 PM', '5:00 PM', 'Class', 'All', 'R23', 'Main'),
    createClass('Monday', '5:00 PM', '6:00 PM', 'Class', 'All', 'R23', 'Main'),
  ],
  'Tuesday': [],
  'Wednesday': [],
  'Thursday': [
    createClass('Thursday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R19', 'Main'),
    createClass('Thursday', '4:00 PM', '5:00 PM', 'Class', 'All', 'R19', 'Main'),
    createClass('Thursday', '5:00 PM', '6:00 PM', 'Class', 'All', 'R19', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R13', 'Main'),
    createClass('Friday', '4:00 PM', '5:00 PM', 'Class', 'All', 'R13', 'Main'),
    createClass('Friday', '5:00 PM', '6:00 PM', 'Class', 'All', 'R13', 'Main'),
  ],
  'Saturday': [],
};

const scheduleATK = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'CL2', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R3', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'CLIB', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R16', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R4', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R4', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R33', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'SCR1', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'SCR1', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T49', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T49', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R6', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R6', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R18', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R2', 'Main'),
    createClass('Saturday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R2', 'Main'),
  ],
};

const scheduleSNS = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R10', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R34', 'Main'),
    createClass('Monday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T37', 'Main'),
    createClass('Monday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T37', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T37', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T54', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R22', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R34', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'SCR4', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R27', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R6', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T39', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'PB2', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T37', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T38', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'PB2', 'Main'),
  ],
  'Saturday': [],
};

const scheduleGVR = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R33', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T13', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R34', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T13', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T13', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R17', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R22', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R17', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T13', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T14', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T13', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R2', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R17', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T13', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R18', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R17', 'Main'),
  ],
  'Saturday': [],
};

const schedulePKK = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'PB3', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R28', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T37', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T48', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R3', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R28', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T37', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R21', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R28', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'PB3', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T37', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'PB3', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T37', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T37', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R22', 'Main'),
    createClass('Saturday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T37', 'Main'),
  ],
};

const scheduleAAA = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R19', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R19', 'Main'),
    createClass('Monday', '11:30 AM', '12:30 PM', 'Class', 'All', 'CLIB', 'Main'),
    createClass('Monday', '12:30 PM', '1:30 PM', 'Class', 'All', 'CLIB', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R19', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R19', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R32', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R31', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R14', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'SCR4', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R30', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'CL1', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'CL1', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'CL1', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'PB2', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'PB2', 'Main'),
  ],
  'Saturday': [],
};

const scheduleRAC = {
  'Monday': [
    createClass('Monday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R16', 'Main'),
    createClass('Monday', '4:00 PM', '5:00 PM', 'Class', 'All', 'R16', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R19', 'Main'),
    createClass('Tuesday', '4:00 PM', '5:00 PM', 'Class', 'All', 'R19', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'SCR3', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'SCR3', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R21', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'CL2', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R31', 'Main'),
    createClass('Thursday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R20', 'Main'),
    createClass('Thursday', '4:00 PM', '5:00 PM', 'Class', 'All', 'R20', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R32', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'SCR4', 'Main'),
  ],
  'Saturday': [],
};

const scheduleRAS = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R18', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T43', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'PB3', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T43', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T43', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R33', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R21', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T43', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R28', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T43', 'Main'),
  ],
  'Saturday': [],
};

const scheduleKKS = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T44', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R35', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R28', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T44', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R35', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T44', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R35', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R33', 'Main'),
  ],
  'Saturday': [],
};

const schedulePAC = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T42', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R27', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'LIBRARY FF', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T41', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T49', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R28', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T42', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R33', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R33', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T44', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R22', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T41', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R2', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T40', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R1', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R3', 'Main'),
  ],
};

const scheduleAVB = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R34', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T29', 'Main'),
    createClass('Monday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R33', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R15', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T29', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R34', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R34', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T29', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R34', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T29', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'PB3', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R33', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T24', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R34', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T29', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T30', 'Main'),
  ],
  'Saturday': [],
};

const scheduleCUS = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R8', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R27', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T46', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R7', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T44', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R2', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T25', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T44', 'Main'),
  ],
  'Saturday': [],
};

const scheduleNJA = {
  'Monday': [
    createClass('Monday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R5', 'Main'),
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T4', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R28', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R5', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T5', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T1', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R2', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T1', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R27', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R8', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T1', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'CL1', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R10', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T2', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R10', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T4', 'Main'),
  ],
  'Saturday': [],
};

const scheduleAKY = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R17', 'Main'),
  ],
  'Wednesday': [],
  'Thursday': [
    createClass('Thursday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R24', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R17', 'Main'),
  ],
  'Saturday': [],
};

const scheduleALK = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R14', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R14', 'Main'),
    createClass('Monday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R1', 'Main'),
    createClass('Monday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R1', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R30', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'CL2', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'CL2', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R4', 'Main'),
  ],
  'Wednesday': [],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'CLIB', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R14', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R14', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R14', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R14', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R30', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R31', 'Main'),
    createClass('Saturday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R31', 'Main'),
  ],
};

const scheduleSIM = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '4:00 PM', '5:00 PM', 'Class', 'All', 'R33', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '4:00 PM', '5:00 PM', 'Class', 'All', 'R13', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '4:00 PM', '5:00 PM', 'Class', 'All', 'R21', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '4:00 PM', '5:00 PM', 'Class', 'All', 'T1', 'Main'),
  ],
  'Saturday': [],
};

const scheduleSAG = {
  'Monday': [
    createClass('Monday', '8:30 AM', '9:30 AM', 'Class', 'All', 'CL2', 'Main'),
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'CL2', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'SCR1', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'SCR1', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'CL1', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R6', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'CL1', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'SCR1', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'SCR1', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'SCR1', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R34', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'LIBRARY FF', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'SCR1', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'SCR1', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R34', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'SCR2', 'Main'),
  ],
  'Saturday': [],
};

const scheduleAAG = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R16', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R16', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'T37', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T45', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'CL2', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'CL2', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T50', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T37', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T41', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R1', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T39', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R31', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R31', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R22', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T46', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R22', 'Main'),
  ],
};

const scheduleLKB = {
  'Monday': [
    createClass('Monday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R30', 'Main'),
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R30', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R2', 'Main'),
    createClass('Monday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R5', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R31', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R31', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R30', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R30', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R30', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R30', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'CL2', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R30', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'CLIB', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'CL1', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R30', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R30', 'Main'),
  ],
  'Saturday': [],
};

const scheduleSAR = {
  'Monday': [
    createClass('Monday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R32', 'Main'),
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'PB3', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T44', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'PB3', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T43', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T44', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R28', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T42', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T42', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R22', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R4', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T49', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R22', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T43', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R1', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R2', 'Main'),
  ],
  'Saturday': [],
};

const scheduleVIS = {
  'Monday': [
    createClass('Monday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T12', 'Main'),
    createClass('Monday', '2:00 PM', '3:00 PM', 'Class', 'All', 'R6', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'PB2', 'Main'),
    createClass('Tuesday', '2:00 PM', '3:00 PM', 'Class', 'All', 'R1', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R14', 'Main'),
    createClass('Wednesday', '2:00 PM', '3:00 PM', 'Class', 'All', 'SCR3', 'Main'),
    createClass('Wednesday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R35', 'Main'),
    createClass('Wednesday', '4:00 PM', '5:00 PM', 'Class', 'All', 'R35', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T12', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R19', 'Main'),
    createClass('Thursday', '2:00 PM', '3:00 PM', 'Class', 'All', 'SCR2', 'Main'),
    createClass('Thursday', '3:00 PM', '4:00 PM', 'Class', 'All', 'SCR2', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T25', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T12', 'Main'),
    createClass('Friday', '2:00 PM', '3:00 PM', 'Class', 'All', 'SCR4', 'Main'),
    createClass('Friday', '3:00 PM', '4:00 PM', 'Class', 'All', 'SCR4', 'Main'),
  ],
  'Saturday': [],
};

const scheduleNAD = {
  'Monday': [
    createClass('Monday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R27', 'Main'),
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T42', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R18', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R20', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T14', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T43', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R33', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'PB2', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T43', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R1', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'PB2', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T42', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R3', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R18', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T42', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T42', 'Main'),
  ],
  'Saturday': [],
};

const scheduleKNK = {
  'Monday': [
    createClass('Monday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R33', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'CLIB', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T44', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R17', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T45', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T39', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R33', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T39', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'LIBRARY FF', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T44', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R32', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T40', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R17', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R35', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T49', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R17', 'Main'),
  ],
  'Saturday': [],
};

const scheduleSPB = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R37', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T45', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T45', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R16', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R37', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T45', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T45', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R27', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R6', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T45', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T45', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R19', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R19', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T5', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R18', 'Main'),
    createClass('Saturday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R18', 'Main'),
  ],
};

const scheduleSVK = {
  'Monday': [
    createClass('Monday', '8:30 AM', '9:30 AM', 'Class', 'All', 'CLIB', 'Main'),
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'CLIB', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R13', 'Main'),
    createClass('Monday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R30', 'Main'),
    createClass('Monday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R30', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R14', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R13', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'CLIB', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R13', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T41', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T42', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R16', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R16', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T42', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R19', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R19', 'Main'),
  ],
  'Saturday': [],
};

const scheduleRJ = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R23', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R23', 'Main'),
    createClass('Monday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T6', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R23', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T6', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T6', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R23', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T6', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R23', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T6', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R23', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T6', 'Main'),
  ],
  'Saturday': [],
};

const scheduleRUR = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T2', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R25', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R7', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T2', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T2', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T2', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R23', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T2', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T2', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T2', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R23', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T2', 'Main'),
    createClass('Saturday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R23', 'Main'),
    createClass('Saturday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R23', 'Main'),
  ],
};

const schedulePB = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R25', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R24', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R24', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R29', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R24', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R29', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R24', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R29', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R24', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R29', 'Main'),
  ],
  'Saturday': [],
};

const scheduleENN = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R25', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R24', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T17', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R25', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T23', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T23', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R25', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T23', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T23', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R25', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T23', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R25', 'Main'),
    createClass('Saturday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T23', 'Main'),
    createClass('Saturday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T23', 'Main'),
  ],
};

const scheduleAKJ = {
  'Monday': [
    createClass('Monday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R7', 'Main'),
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R24', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T3', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R7', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T3', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T3', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R24', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T3', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T3', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R7', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T3', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T3', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R24', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T3', 'Main'),
  ],
  'Saturday': [],
};

const scheduleRB = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T41', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R8', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T3', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T33', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R7', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R32', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T4', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T18', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R15', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T24', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R22', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R10', 'Main'),
  ],
};

const scheduleRAK = {
  'Monday': [
    createClass('Monday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R26', 'Main'),
    createClass('Monday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T51', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R24', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R27', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T51', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R25', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R26', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T51', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R25', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R26', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T51', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R25', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R21', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T51', 'Main'),
  ],
  'Saturday': [],
};

const scheduleNG = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'PB4', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T16', 'Main'),
    createClass('Monday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T16', 'Main'),
  ],
  'Tuesday': [],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R7', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T16', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T16', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R7', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T16', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T16', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T16', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R18', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T3', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T16', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T16', 'Main'),
    createClass('Saturday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R26', 'Main'),
    createClass('Saturday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R26', 'Main'),
  ],
};

const scheduleRK = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'SCR4', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R20', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T53', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T50', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'PB3', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'SCR4', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T51', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R6', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T51', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T48', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T51', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'PB3', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R21', 'Main'),
    createClass('Saturday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R21', 'Main'),
    createClass('Saturday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R2', 'Main'),
  ],
};

const scheduleRHT = {
  'Monday': [
    createClass('Monday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R23', 'Main'),
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R26', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T54', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R23', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R7', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T53', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T16', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R26', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R37', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R23', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R37', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T54', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R23', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T54', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T54', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T54', 'Main'),
  ],
  'Saturday': [],
};

const scheduleKD = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R26', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T16', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R7', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T2', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T2', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T3', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R26', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T2', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T15', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T2', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R26', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T16', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T16', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R26', 'Main'),
    createClass('Saturday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R5', 'Main'),
    createClass('Saturday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T16', 'Main'),
  ],
};

const scheduleYAA = {
  'Monday': [
    createClass('Monday', '8:30 AM', '9:30 AM', 'Class', 'All', 'PB4', 'Main'),
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T54', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'PB2', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R25', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T54', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'PB2', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R1', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'PB4', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T54', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'PB2', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R5', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T54', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'PB2', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R28', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T45', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T45', 'Main'),
  ],
  'Saturday': [],
};

const scheduleCG = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T16', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R24', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T16', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T16', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R26', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R25', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T16', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T16', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R7', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R24', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T17', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T4', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R23', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R26', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R25', 'Main'),
    createClass('Saturday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R24', 'Main'),
  ],
};

const scheduleJK = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'PB4', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T23', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T30', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T2', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T6', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R23', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T53', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T6', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R26', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T53', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T23', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R23', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T6', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '9:30 AM', '10:30 AM', 'Class', 'All', 'PB4', 'Main'),
    createClass('Saturday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R25', 'Main'),
    createClass('Saturday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T6', 'Main'),
  ],
};

const scheduleAK = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R37', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T30', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R37', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T30', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T26', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T30', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R8', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T30', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T30', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T30', 'Main'),
  ],
  'Thursday': [],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R37', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T31', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T30', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R26', 'Main'),
    createClass('Saturday', '10:30 AM', '11:30 AM', 'Class', 'All', 'PB4', 'Main'),
    createClass('Saturday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T30', 'Main'),
  ],
};

const scheduleAG = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'PB4', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T2', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R23', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T51', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R37', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T51', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R24', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T51', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R37', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'PB4', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'PB4', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T25', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T53', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R23', 'Main'),
    createClass('Saturday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R37', 'Main'),
    createClass('Saturday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T51', 'Main'),
  ],
};

const scheduleAGD = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R26', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R26', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T3', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T1', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'PB4', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T17', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T17', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T24', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'PB4', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T30', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T17', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T3', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R26', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T30', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T17', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R23', 'Main'),
  ],
};

const scheduleABK = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R32', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T30', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R20', 'Main'),
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T53', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'PB4', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'PB4', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T53', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'PB4', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T54', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R37', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T53', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T53', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'PB2', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R24', 'Main'),
    createClass('Saturday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T53', 'Main'),
    createClass('Saturday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R29', 'Main'),
  ],
};

const scheduleHA = {
  'Monday': [
    createClass('Monday', '8:30 AM', '9:30 AM', 'Class', 'All', 'T16', 'Main'),
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R6', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T14', 'Main'),
    createClass('Monday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T23', 'Main'),
    createClass('Monday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T14', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R3', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R16', 'Main'),
    createClass('Tuesday', '2:00 PM', '3:00 PM', 'Class', 'All', 'R2', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R32', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R16', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T48', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T36', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'PB3', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R4', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R34', 'Main'),
    createClass('Friday', '2:00 PM', '3:00 PM', 'Class', 'All', 'T16', 'Main'),
  ],
  'Saturday': [],
};

const scheduleSHS = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T2', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T1', 'Main'),
    createClass('Monday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R6', 'Main'),
    createClass('Monday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R6', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'T4', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T4', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T2', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R3', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T1', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R3', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T1', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T14', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R3', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T14', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R4', 'Main'),
    createClass('Friday', '2:00 PM', '3:00 PM', 'Class', 'All', 'T4', 'Main'),
  ],
  'Saturday': [],
};

const scheduleKK = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R7', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T14', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R23', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T37', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'SCR2', 'Main'),
  ],
  'Wednesday': [],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T23', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R23', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'SCR2', 'Main'),
    createClass('Thursday', '2:00 PM', '3:00 PM', 'Class', 'All', 'T23', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R7', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T3', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'SCR2', 'Main'),
    createClass('Friday', '2:00 PM', '3:00 PM', 'Class', 'All', 'T23', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R7', 'Main'),
    createClass('Saturday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R24', 'Main'),
    createClass('Saturday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T16', 'Main'),
  ],
};

const scheduleMG = {
  'Monday': [],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T23', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'PB4', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T54', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R21', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T35', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R21', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T29', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R26', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T54', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T49', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'PB4', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R24', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R24', 'Main'),
    createClass('Saturday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R23', 'Main'),
    createClass('Saturday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R24', 'Main'),
    createClass('Saturday', '12:30 PM', '1:30 PM', 'Class', 'All', 'T54', 'Main'),
  ],
};

// --- MAIN EXPORT ---
export const TEACHER_SCHEDULES: Record<string, any> = {
  'SIS': { id: 'SIS', name: 'Ms. Smita Sharma', department: 'Commerce', schedule: scheduleSIS },
  'DPE': { id: 'DPE', name: 'Prof. Deepashree', department: 'Commerce', schedule: scheduleDPE },
  'RNC': { id: 'RNC', name: 'Dr. Reena Chadha', department: 'Commerce', schedule: scheduleRNC },
  'SLG': { id: 'SLG', name: 'Dr. Sneh Lata Gupta', department: 'Commerce', schedule: scheduleSLG },
  'RUA': { id: 'RUA', name: 'Ms. Renu Agarwal', department: 'Commerce', schedule: scheduleRUA },
  'AMS': { id: 'AMS', name: 'Dr. Amit Sachdeva', department: 'Commerce', schedule: scheduleAMS },
  'RAJ': { id: 'RAJ', name: 'Prof. Rachna Jawa', department: 'Commerce', schedule: scheduleRAJ },
  'AAJ': { id: 'AAJ', name: 'Prof. Aruna Jha', department: 'Commerce', schedule: scheduleAAJ },
  'SSS': { id: 'SSS', name: 'Ms. Santosh Sabharwal', department: 'Commerce', schedule: scheduleSSS },
  'MAK': { id: 'MAK', name: 'Prof. Mallika Kumar', department: 'Commerce', schedule: scheduleMAK },
  'SNK': { id: 'SNK', name: 'Dr. Santosh Kumar', department: 'Commerce', schedule: scheduleSNK },
  'AYJ': { id: 'AYJ', name: 'Prof. Abhay Jain', department: 'Commerce', schedule: scheduleAYJ },
  'SHK': { id: 'SHK', name: 'Prof. Santosh Kumari', department: 'Commerce', schedule: scheduleSHK },
  'PRD': { id: 'PRD', name: 'Prof. Padmeshwar Doley', department: 'Commerce', schedule: schedulePRD },
  'HNT': { id: 'HNT', name: 'Prof. Harendra Nath Tiwari', department: 'Commerce', schedule: scheduleHNT },
  'TNM': { id: 'TNM', name: 'Prof. Tarun Manjhi', department: 'Commerce', schedule: scheduleTNM },
  'SAP': { id: 'SAP', name: 'Prof. Surya Prakash', department: 'Commerce', schedule: scheduleSAP },
  'NNM': { id: 'NNM', name: 'Prof. Naveen Mittal', department: 'Commerce', schedule: scheduleNNM },
  'KIJ': { id: 'KIJ', name: 'Prof. Kinneri Jain', department: 'Commerce', schedule: scheduleKIJ },
  'VAJ': { id: 'VAJ', name: 'Prof. Vandana Jain', department: 'Commerce', schedule: scheduleVAJ },
  'KRA': { id: 'KRA', name: 'Ms. Karuna', department: 'Commerce', schedule: scheduleKRA },
  'MAB': { id: 'MAB', name: 'Dr. Monika Bansal', department: 'Commerce', schedule: scheduleMAB },
  'ANK': { id: 'ANK', name: 'Dr. Amanpreet Kaur', department: 'Commerce', schedule: scheduleANK },
  'AOK': { id: 'AOK', name: 'Dr. Alok Kumar', department: 'Commerce', schedule: scheduleAOK },
  'ASA': { id: 'ASA', name: 'Dr. Anisha', department: 'Commerce', schedule: scheduleASA },
  'RKS': { id: 'RKS', name: 'Dr. Raj Kumar Sah', department: 'Commerce', schedule: scheduleRKS },
  'SIA': { id: 'SIA', name: 'Dr. Shalini Aggarwal', department: 'Commerce', schedule: scheduleSIA },
  'BLK': { id: 'BLK', name: 'Mr. Bal Kishan', department: 'Commerce', schedule: scheduleBLK },
  'SUY': { id: 'SUY', name: 'Mr. Sudhanshu Yadav', department: 'Commerce', schedule: scheduleSUY },
  'HHK': { id: 'HHK', name: 'Mr. Harish Kumar', department: 'Commerce', schedule: scheduleHHK },
  'MTS': { id: 'MTS', name: 'Ms. Manpreet Sharma', department: 'Commerce', schedule: scheduleMTS },
  'PNM': { id: 'PNM', name: 'Ms. Poonam', department: 'Commerce', schedule: schedulePNM },
  'PAA': { id: 'PAA', name: 'Dr. Priyanka Aggarwal', department: 'Commerce', schedule: schedulePAA },
  'MDH': { id: 'MDH', name: 'Mr. Mohd. Hassan', department: 'Commerce', schedule: scheduleMDH },
  'VAK': { id: 'VAK', name: 'Ms. Vartika Khandelwal', department: 'Commerce', schedule: scheduleVAK },
  'JDP': { id: 'JDP', name: 'Dr. Jaideep', department: 'Commerce', schedule: scheduleJDP },
  'AAR': { id: 'AAR', name: 'Dr. Asha Rani', department: 'Commerce', schedule: scheduleAAR },
  'JTW': { id: 'JTW', name: 'Dr. Jigmet Wangdus', department: 'Commerce', schedule: scheduleJTW },
  'YAM': { id: 'YAM', name: 'Dr. Yusra Naseem', department: 'Commerce', schedule: scheduleYAM },
  'AUV': { id: 'AUV', name: 'Ms. Anju Verma', department: 'Commerce', schedule: scheduleAUV },
  'SVP': { id: 'SVP', name: 'Dr. Shashank Vikram Pratap Singh', department: 'Commerce', schedule: scheduleSVP },
  'DAB': { id: 'DAB', name: 'Dr. Dipika Bansal', department: 'Commerce', schedule: scheduleDAB },
  'PRA': { id: 'PRA', name: 'Dr. Prerana', department: 'Commerce', schedule: schedulePRA },
  'SHG': { id: 'SHG', name: 'Dr. Saurabh Gupta', department: 'Commerce', schedule: scheduleSHG },
  'SAA': { id: 'SAA', name: 'Dr. Saumya Aggarwal', department: 'Commerce', schedule: scheduleSAA },
  'ATS': { id: 'ATS', name: 'Dr. Amarjeet Singh', department: 'Commerce', schedule: scheduleATS },
  'STS': { id: 'STS', name: 'Mr. Satnam Singh', department: 'Commerce', schedule: scheduleSTS },
  'SJJ': { id: 'SJJ', name: 'Dr. Saroj Joshi', department: 'Commerce', schedule: scheduleSJJ },
  'AJJ': { id: 'AJJ', name: 'Dr. Anuj Jatav', department: 'Commerce', schedule: scheduleAJJ },
  'DTY': { id: 'DTY', name: 'Dr. Dixit Yadav', department: 'Commerce', schedule: scheduleDTY },
  'AAT': { id: 'AAT', name: 'Ms. Ankita Tomar', department: 'Commerce', schedule: scheduleAAT },
  'VIC': { id: 'VIC', name: 'Ms. Vaishali Chhokar', department: 'Commerce', schedule: scheduleVIC },
  'ATK': { id: 'ATK', name: 'Dr. Amit Kumar', department: 'Commerce', schedule: scheduleATK },
  'SNS': { id: 'SNS', name: 'Dr. Suman Si', department: 'Commerce', schedule: scheduleSNS },
  'GVR': { id: 'GVR', name: 'Mr. Gaurav Rana', department: 'Commerce', schedule: scheduleGVR },
  'PKK': { id: 'PKK', name: 'Dr. Palak Kanojia', department: 'Commerce', schedule: schedulePKK },
  'AAA': { id: 'AAA', name: 'Dr. Anuradha Aggarwal', department: 'Commerce', schedule: scheduleAAA },
  'RAC': { id: 'RAC', name: 'Dr. Ruchika Choudhary', department: 'Commerce', schedule: scheduleRAC },
  'RAS': { id: 'RAS', name: 'Dr. Rutika Saini', department: 'Commerce', schedule: scheduleRAS },
  'KKS': { id: 'KKS', name: 'Dr. Kamaldeep Kaur Sarna', department: 'Commerce', schedule: scheduleKKS },
  'PAC': { id: 'PAC', name: 'Dr. Priya Chaurasia', department: 'Commerce', schedule: schedulePAC },
  'AVB': { id: 'AVB', name: 'Mr. Anuj Vijay Bhatia', department: 'Commerce', schedule: scheduleAVB },
  'CUS': { id: 'CUS', name: 'Dr. Charu Shri', department: 'Commerce', schedule: scheduleCUS },
  'NJA': { id: 'NJA', name: 'Dr. Nikunj Aggarwal', department: 'Commerce', schedule: scheduleNJA },
  'AKY': { id: 'AKY', name: 'Mr. Abhishek Kumar Yadav', department: 'Commerce', schedule: scheduleAKY },
  'ALK': { id: 'ALK', name: 'Mr. Anil Kumar', department: 'Commerce', schedule: scheduleALK },
  'SIM': { id: 'SIM', name: 'Dr. Shruti Mallik', department: 'Commerce', schedule: scheduleSIM },
  'SAG': { id: 'SAG', name: 'Dr. Shikha Gupta', department: 'Commerce', schedule: scheduleSAG },
  'AAG': { id: 'AAG', name: 'Ms. Anubha Godara', department: 'Commerce', schedule: scheduleAAG },
  'LKB': { id: 'LKB', name: 'Ms. Latika Bajetha', department: 'Commerce', schedule: scheduleLKB },
  'SAR': { id: 'SAR', name: 'Dr. Shikha Rajput', department: 'Commerce', schedule: scheduleSAR },
  'VIS': { id: 'VIS', name: 'Mr. Vikki Sharma', department: 'Commerce', schedule: scheduleVIS },
  'NAD': { id: 'NAD', name: 'Dr. Nisha Devi', department: 'Commerce', schedule: scheduleNAD },
  'KNK': { id: 'KNK', name: 'Mr. Krishan Kant', department: 'Commerce', schedule: scheduleKNK },
  'SPB': { id: 'SPB', name: 'Dr. Sapna Bansal', department: 'Commerce', schedule: scheduleSPB },
  'SVK': { id: 'SVK', name: 'Dr. Shivangi Kaushik', department: 'Commerce', schedule: scheduleSVK },
  'RJ': { id: 'RJ', name: 'Dr. Rajiv Jha', department: 'Commerce', schedule: scheduleRJ },
  'RUR': { id: 'RUR', name: 'Prof. Ritu Ranjan', department: 'Commerce', schedule: scheduleRUR },
  'PB': { id: 'PB', name: 'Ms. Priyanka Bhatia', department: 'Commerce', schedule: schedulePB },
  'ENN': { id: 'ENN', name: 'Dr. Esther Ngaihte', department: 'Commerce', schedule: scheduleENN },
  'AKJ': { id: 'AKJ', name: 'Dr. Avinash Kumar Jha', department: 'Commerce', schedule: scheduleAKJ },
  'RB': { id: 'RB', name: 'Dr. Renu Bansal', department: 'Commerce', schedule: scheduleRB },
  'RAK': { id: 'RAK', name: 'Dr. Rakesh Ranjan', department: 'Commerce', schedule: scheduleRAK },
  'NG': { id: 'NG', name: 'Ms. Nidhi Gupta', department: 'Commerce', schedule: scheduleNG },
  'RK': { id: 'RK', name: 'Dr. Ravi Kant', department: 'Commerce', schedule: scheduleRK },
  'RHT': { id: 'RHT', name: 'Mr. Rohit', department: 'Commerce', schedule: scheduleRHT },
  'KD': { id: 'KD', name: 'Dr. Kapil Dev Yadav', department: 'Commerce', schedule: scheduleKD },
  'YAA': { id: 'YAA', name: 'Ms. Yuthika Agarwal', department: 'Commerce', schedule: scheduleYAA },
  'CG': { id: 'CG', name: 'Ms. Chhavi Gautam', department: 'Commerce', schedule: scheduleCG },
  'JK': { id: 'JK', name: 'Mr. Jagadish Konthoujam', department: 'Commerce', schedule: scheduleJK },
  'AK': { id: 'AK', name: 'Mr. Ashwani Kumar', department: 'Commerce', schedule: scheduleAK },
  'AG': { id: 'AG', name: 'Dr. Amit Girdharwal', department: 'Commerce', schedule: scheduleAG },
  'AGD': { id: 'AGD', name: 'Ms. Anuradha Gulati Dasgupta', department: 'Commerce', schedule: scheduleAGD },
  'ABK': { id: 'ABK', name: 'Mr. Abhishek Khadgawat', department: 'Commerce', schedule: scheduleABK },
  'HA': { id: 'HA', name: 'Ms. Himanshi Aggarwal', department: 'Commerce', schedule: scheduleHA },
  'SHS': { id: 'SHS', name: 'Ms. Shreya Shreedhar', department: 'Commerce', schedule: scheduleSHS },
  'KK': { id: 'KK', name: 'Dr. Kaushal Kishore', department: 'Commerce', schedule: scheduleKK },
  'MG': { id: 'MG', name: 'Dr. Monika Gaur', department: 'Commerce', schedule: scheduleMG },
  'ADMIN': { id: 'kroni', name: 'System Administrator', department: 'Office Control', schedule: EMPTY_SCHEDULE }
};
