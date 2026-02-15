// Auto-generated teacher data from Google Sheets
// Generated on: 2026-02-15T00:03:11.664Z

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
const scheduleID_MSSMITASHARMA = {
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
  'Saturday': [
  ],
};

const scheduleID_PROFDEEPASHREE = {
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
  'Saturday': [
  ],
};

const scheduleID_DRREENACHADHA = {
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
  'Saturday': [
  ],
};

const scheduleID_DRSNEHLATAGUPTA = {
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
  'Saturday': [
  ],
};

const scheduleID_MSRENUAGARWAL = {
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
  'Saturday': [
  ],
};

const scheduleID_DRAMITSACHDEVA = {
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
  'Saturday': [
  ],
};

const scheduleID_PROFRACHNAJAWA = {
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
  'Saturday': [
  ],
};

const scheduleID_PROFARUNAJHA = {
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
  'Saturday': [
  ],
};

const scheduleID_MSSANTOSHSABHARWAL = {
  'Monday': [
  ],
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

const scheduleID_PROFMALLIKAKUMAR = {
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
  'Saturday': [
  ],
};

const scheduleID_DRSANTOSHKUMAR = {
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
  'Thursday': [
  ],
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

const scheduleID_PROFABHAYJAIN = {
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
  'Saturday': [
  ],
};

const scheduleID_PROFSANTOSHKUMARI = {
  'Monday': [
  ],
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

const scheduleID_PROFPADMESHWARDOLEY = {
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
  'Saturday': [
  ],
};

const scheduleID_PROFHARENDRANATHTIWARI = {
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
  'Saturday': [
  ],
};

const scheduleID_PROFTARUNMANJHI = {
  'Monday': [
  ],
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

const scheduleID_PROFSURYAPRAKASH = {
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
  'Saturday': [
  ],
};

const scheduleID_PROFNAVEENMITTAL = {
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
  'Wednesday': [
  ],
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

const scheduleID_PROFKINNERIJAIN = {
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
  'Saturday': [
  ],
};

const scheduleID_PROFVANDANAJAIN = {
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
  'Saturday': [
  ],
};

const scheduleID_MSKARUNA = {
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
  'Saturday': [
  ],
};

const scheduleID_DRMONIKABANSAL = {
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
  'Saturday': [
  ],
};

const scheduleID_DRAMANPREETKAUR = {
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
  'Saturday': [
  ],
};

const scheduleID_DRALOKKUMAR = {
  'Monday': [
  ],
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

const scheduleID_DRANISHA = {
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
  'Saturday': [
  ],
};

const scheduleID_DRRAJKUMARSAH = {
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
  'Saturday': [
  ],
};

const scheduleID_DRSHALINIAGGARWAL = {
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
  'Saturday': [
  ],
};

const scheduleID_MRBALKISHAN = {
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
  'Saturday': [
  ],
};

const scheduleID_MRSUDHANSHUYADAV = {
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
  'Saturday': [
  ],
};

const scheduleID_MRHARISHKUMAR = {
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
  'Saturday': [
  ],
};

const scheduleID_MSMANPREETSHARMA = {
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
  'Saturday': [
  ],
};

const scheduleID_MSPOONAM = {
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
  'Thursday': [
  ],
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

const scheduleID_DRPRIYANKAAGGARWAL = {
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
  'Saturday': [
  ],
};

const scheduleID_MRMOHDHASSAN = {
  'Monday': [
  ],
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

const scheduleID_MSVARTIKAKHANDELWAL = {
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
  'Saturday': [
  ],
};

const scheduleID_DRJAIDEEP = {
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
  'Saturday': [
  ],
};

const scheduleID_DRASHARANI = {
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
  'Saturday': [
  ],
};

const scheduleID_DRJIGMETWANGDUS = {
  'Monday': [
  ],
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

const scheduleID_DRYUSRANASEEM = {
  'Monday': [
  ],
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

const scheduleID_MSANJUVERMA = {
  'Monday': [
  ],
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

const scheduleID_DRSHASHANKVIKRAMPRATAPSINGH = {
  'Monday': [
  ],
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

const scheduleID_DRDIPIKABANSAL = {
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
  'Saturday': [
  ],
};

const scheduleID_DRPRERANA = {
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
  'Saturday': [
  ],
};

const scheduleID_DRSAURABHGUPTA = {
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
  'Saturday': [
  ],
};

const scheduleID_DRSAUMYAAGGARWAL = {
  'Monday': [
  ],
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

const scheduleID_DRAMARJEETSINGH = {
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
  'Wednesday': [
  ],
  'Thursday': [
    createClass('Thursday', '8:30 AM', '9:30 AM', 'Class', 'All', 'PB3', 'Main'),
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T49', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R28', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R33', 'Main'),
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T27', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R1', 'Main'),
  ],
  'Saturday': [
    createClass('Saturday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R3', 'Main'),
    createClass('Saturday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T14', 'Main'),
  ],
};

const scheduleID_MRSATNAMSINGH = {
  'Monday': [
  ],
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

const scheduleID_DRSAROJJOSHI = {
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
  'Saturday': [
  ],
};

const scheduleID_DRANUJJATAV = {
  'Monday': [
  ],
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

const scheduleID_DRDIXITYADAV = {
  'Monday': [
  ],
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

const scheduleID_MSANKITATOMAR = {
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
  'Saturday': [
  ],
};

const scheduleID_MSVAISHALICHHOKAR = {
  'Monday': [
    createClass('Monday', '2:00 PM', '3:00 PM', 'Class', 'All', 'R23', 'Main'),
    createClass('Monday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R23', 'Main'),
    createClass('Monday', '4:00 PM', '5:00 PM', 'Class', 'All', 'R23', 'Main'),
    createClass('Monday', '5:00 PM', '6:00 PM', 'Class', 'All', 'R23', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T4', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R29', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R6', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R29', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '2:00 PM', '3:00 PM', 'Class', 'All', 'R19', 'Main'),
    createClass('Thursday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R19', 'Main'),
    createClass('Thursday', '4:00 PM', '5:00 PM', 'Class', 'All', 'R19', 'Main'),
    createClass('Thursday', '5:00 PM', '6:00 PM', 'Class', 'All', 'R19', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '2:00 PM', '3:00 PM', 'Class', 'All', 'R13', 'Main'),
    createClass('Friday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R13', 'Main'),
    createClass('Friday', '4:00 PM', '5:00 PM', 'Class', 'All', 'R13', 'Main'),
    createClass('Friday', '5:00 PM', '6:00 PM', 'Class', 'All', 'R13', 'Main'),
  ],
  'Saturday': [
  ],
};

const scheduleID_DRAMITKUMAR = {
  'Monday': [
  ],
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

const scheduleID_DRSUMANSI = {
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
  'Saturday': [
  ],
};

const scheduleID_MRGAURAVRANA = {
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
  'Saturday': [
  ],
};

const scheduleID_DRPALAKKANOJIA = {
  'Monday': [
  ],
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

const scheduleID_DRANURADHAAGGARWAL = {
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
  'Saturday': [
  ],
};

const scheduleID_DRRUCHIKACHOUDHARY = {
  'Monday': [
    createClass('Monday', '2:00 PM', '3:00 PM', 'Class', 'All', 'R16', 'Main'),
    createClass('Monday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R16', 'Main'),
    createClass('Monday', '4:00 PM', '5:00 PM', 'Class', 'All', 'R16', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '2:00 PM', '3:00 PM', 'Class', 'All', 'R19', 'Main'),
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
    createClass('Thursday', '2:00 PM', '3:00 PM', 'Class', 'All', 'R20', 'Main'),
    createClass('Thursday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R20', 'Main'),
    createClass('Thursday', '4:00 PM', '5:00 PM', 'Class', 'All', 'R20', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R32', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 PM', 'Class', 'All', 'SCR4', 'Main'),
  ],
  'Saturday': [
  ],
};

const scheduleID_DRRUTIKASAINI = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R18', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T43', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'PB3', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T43', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R33', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T43', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R33', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R33', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 AM', 'Class', 'All', 'T40', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R21', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T43', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R18', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R28', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T43', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T43', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 AM', 'Class', 'All', 'R33', 'Main'),
  ],
  'Saturday': [
  ],
};

const scheduleID_DRKAMALDEEPKAURSARNA = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T44', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R35', 'Main'),
    createClass('Monday', '11:30 AM', '12:30 PM', 'Class', 'All', 'PB3', 'Main'),
    createClass('Monday', '12:30 PM', '1:30 AM', 'Class', 'All', 'PB3', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R28', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 AM', 'Class', 'All', 'T44', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T44', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R35', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T44', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T44', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R35', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T44', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 AM', 'Class', 'All', 'R13', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R33', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'SCR4', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 AM', 'Class', 'All', 'T44', 'Main'),
  ],
  'Saturday': [
  ],
};

const scheduleID_DRPRIYACHAURASIA = {
  'Monday': [
  ],
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

const scheduleID_MRANUJVIJAYBHATIA = {
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
  'Saturday': [
  ],
};

const scheduleID_DRCHARUSHRI = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R8', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '8:30 AM', '9:30 AM', 'Class', 'All', 'R27', 'Main'),
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T46', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R7', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T44', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 AM', 'Class', 'All', 'R23', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T44', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'PB4', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 AM', 'Class', 'All', 'R23', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R2', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T45', 'Main'),
    createClass('Thursday', '12:30 PM', '1:30 AM', 'Class', 'All', 'R23', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T25', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T44', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R24', 'Main'),
    createClass('Friday', '12:30 PM', '1:30 AM', 'Class', 'All', 'T25', 'Main'),
  ],
  'Saturday': [
  ],
};

const scheduleID_DRNIKUNJAGGARWAL = {
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
  'Saturday': [
  ],
};

const scheduleID_MRABHISHEKKUMARYADAV = {
  'Monday': [
    createClass('Monday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R27', 'Main'),
    createClass('Monday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R27', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '2:00 PM', '3:00 PM', 'Class', 'All', 'R17', 'Main'),
    createClass('Tuesday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R17', 'Main'),
  ],
  'Wednesday': [
  ],
  'Thursday': [
    createClass('Thursday', '2:00 PM', '3:00 PM', 'Class', 'All', 'R24', 'Main'),
    createClass('Thursday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R24', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '2:00 PM', '3:00 PM', 'Class', 'All', 'R17', 'Main'),
    createClass('Friday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R17', 'Main'),
  ],
  'Saturday': [
  ],
};

const scheduleID_MRANILKUMAR = {
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
  'Wednesday': [
  ],
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

const scheduleID_DRSHRUTIMALLIK = {
  'Monday': [
    createClass('Monday', '11:00 AM', '12:30 PM', 'Class', 'All', 'R37', 'Main'),
    createClass('Monday', '12:30 PM', '1:30 PM', 'Class', 'All', 'R37', 'Main'),
    createClass('Monday', '2:00 PM', '3:00 PM', 'Class', 'All', 'SCR4', 'Main'),
    createClass('Monday', '3:00 PM', '4:00 PM', 'Class', 'All', 'SCR4', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '2:00 PM', '3:00 PM', 'Class', 'All', 'R7', 'Main'),
    createClass('Tuesday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R33', 'Main'),
    createClass('Tuesday', '4:00 PM', '5:00 PM', 'Class', 'All', 'R33', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '2:00 PM', '3:00 PM', 'Class', 'All', 'R13', 'Main'),
    createClass('Wednesday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R13', 'Main'),
    createClass('Wednesday', '4:00 PM', '5:00 PM', 'Class', 'All', 'R13', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '2:00 PM', '3:00 PM', 'Class', 'All', 'R21', 'Main'),
    createClass('Thursday', '3:00 PM', '4:00 PM', 'Class', 'All', 'R21', 'Main'),
    createClass('Thursday', '4:00 PM', '5:00 PM', 'Class', 'All', 'R21', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '2:00 PM', '3:00 PM', 'Class', 'All', 'R24', 'Main'),
    createClass('Friday', '3:00 PM', '4:00 PM', 'Class', 'All', 'T1', 'Main'),
    createClass('Friday', '4:00 PM', '5:00 PM', 'Class', 'All', 'T1', 'Main'),
  ],
  'Saturday': [
  ],
};

const scheduleID_DRSHIKHAGUPTA = {
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
  'Saturday': [
  ],
};

const scheduleID_MSANUBHAGODARA = {
  'Monday': [
  ],
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

const scheduleID_MSLATIKABAJETHA = {
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
  'Saturday': [
  ],
};

const scheduleID_DRSHIKHARAJPUT = {
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
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R23', 'Main'),
    createClass('Friday', '11:30 AM', '12:30 PM', 'Class', 'All', 'R2', 'Main'),
  ],
  'Saturday': [
  ],
};

const scheduleID_MRVIKKISHARMA = {
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
  'Saturday': [
  ],
};

const scheduleID_DRNISHADEVI = {
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
  'Saturday': [
  ],
};

const scheduleID_MRKRISHANKANT = {
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
  'Saturday': [
  ],
};

const scheduleID_DRSAPNABANSAL = {
  'Monday': [
  ],
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

const scheduleID_DRSHIVANGIKAUSHIK = {
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
  'Saturday': [
  ],
};

const scheduleID_DRRAJIVJHA = {
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
  'Saturday': [
  ],
};

const scheduleID_PROFRITURANJAN = {
  'Monday': [
  ],
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

const scheduleID_MSPRIYANKABHATIA = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R25', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R24', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R24', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R29', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 AM', 'Class', 'All', 'R29', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R24', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R29', 'Main'),
  ],
  'Thursday': [
    createClass('Thursday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R24', 'Main'),
    createClass('Thursday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R29', 'Main'),
    createClass('Thursday', '11:30 AM', '12:30 AM', 'Class', 'All', 'R29', 'Main'),
  ],
  'Friday': [
    createClass('Friday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R24', 'Main'),
    createClass('Friday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R29', 'Main'),
  ],
  'Saturday': [
  ],
};

const scheduleID_DRESTHERNGAIHTE = {
  'Monday': [
  ],
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

const scheduleID_DRAVINASHKUMARJHA = {
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
  'Saturday': [
  ],
};

const scheduleID_DRRENUBANSAL = {
  'Monday': [
  ],
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

const scheduleID_DRRAKESHRANJAN = {
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
  'Saturday': [
  ],
};

const scheduleID_MSNIDHIGUPTA = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'PB4', 'Main'),
    createClass('Monday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T16', 'Main'),
    createClass('Monday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T16', 'Main'),
  ],
  'Tuesday': [
  ],
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

const scheduleID_DRRAVIKANT = {
  'Monday': [
  ],
  'Tuesday': [
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'SCR4', 'Main'),
  ],
  'Wednesday': [
    createClass('Wednesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R20', 'Main'),
    createClass('Wednesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'T53', 'Main'),
    createClass('Wednesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T50', 'Main'),
    createClass('Wednesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'PB3', 'Main'),
    createClass('Wednesday', '2:00 PM', '3:00 PM', 'Class', 'All', 'T51', 'Main'),
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

const scheduleID_MRROHIT = {
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
  'Saturday': [
  ],
};

const scheduleID_DRKAPILDEVYADAV = {
  'Monday': [
  ],
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

const scheduleID_MSYUTHIKAAGARWAL = {
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
  'Saturday': [
  ],
};

const scheduleID_MSCHHAVIGAUTAM = {
  'Monday': [
  ],
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

const scheduleID_MRJAGADISHKONTHOUJAM = {
  'Monday': [
  ],
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

const scheduleID_MRASHWANIKUMAR = {
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
  'Thursday': [
  ],
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

const scheduleID_DRAMITGIRDHARWAL = {
  'Monday': [
  ],
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

const scheduleID_MSANURADHAGULATIDASGUPTA = {
  'Monday': [
  ],
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

const scheduleID_MRABHISHEKKHADGAWAT = {
  'Monday': [
  ],
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

const scheduleID_MSHIMANSHIAGGARWAL = {
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
  'Saturday': [
  ],
};

const scheduleID_MSSHREYASHREEDHAR = {
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
  'Saturday': [
  ],
};

const scheduleID_DRKAUSHALKISHORE = {
  'Monday': [
    createClass('Monday', '9:30 AM', '10:30 AM', 'Class', 'All', 'R7', 'Main'),
  ],
  'Tuesday': [
    createClass('Tuesday', '9:30 AM', '10:30 AM', 'Class', 'All', 'T14', 'Main'),
    createClass('Tuesday', '10:30 AM', '11:30 AM', 'Class', 'All', 'R23', 'Main'),
    createClass('Tuesday', '11:30 AM', '12:30 PM', 'Class', 'All', 'T37', 'Main'),
    createClass('Tuesday', '12:30 PM', '1:30 PM', 'Class', 'All', 'SCR2', 'Main'),
  ],
  'Wednesday': [
  ],
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

const scheduleID_DRMONIKAGAUR = {
  'Monday': [
  ],
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

export const TEACHER_SCHEDULES: Record<string, any> = {
  'ID_MSSMITASHARMA': { id: 'ID_MSSMITASHARMA', name: 'Ms. Smita Sharma', schedule: scheduleID_MSSMITASHARMA },
  'ID_PROFDEEPASHREE': { id: 'ID_PROFDEEPASHREE', name: 'Prof. Deepashree', schedule: scheduleID_PROFDEEPASHREE },
  'ID_DRREENACHADHA': { id: 'ID_DRREENACHADHA', name: 'Dr. Reena Chadha', schedule: scheduleID_DRREENACHADHA },
  'ID_DRSNEHLATAGUPTA': { id: 'ID_DRSNEHLATAGUPTA', name: 'Dr. Sneh Lata Gupta', schedule: scheduleID_DRSNEHLATAGUPTA },
  'ID_MSRENUAGARWAL': { id: 'ID_MSRENUAGARWAL', name: 'Ms. Renu Agarwal', schedule: scheduleID_MSRENUAGARWAL },
  'ID_DRAMITSACHDEVA': { id: 'ID_DRAMITSACHDEVA', name: 'Dr. Amit Sachdeva', schedule: scheduleID_DRAMITSACHDEVA },
  'ID_PROFRACHNAJAWA': { id: 'ID_PROFRACHNAJAWA', name: 'Prof. Rachna Jawa', schedule: scheduleID_PROFRACHNAJAWA },
  'ID_PROFARUNAJHA': { id: 'ID_PROFARUNAJHA', name: 'Prof. Aruna Jha', schedule: scheduleID_PROFARUNAJHA },
  'ID_MSSANTOSHSABHARWAL': { id: 'ID_MSSANTOSHSABHARWAL', name: 'Ms. Santosh Sabharwal', schedule: scheduleID_MSSANTOSHSABHARWAL },
  'ID_PROFMALLIKAKUMAR': { id: 'ID_PROFMALLIKAKUMAR', name: 'Prof. Mallika Kumar', schedule: scheduleID_PROFMALLIKAKUMAR },
  'ID_DRSANTOSHKUMAR': { id: 'ID_DRSANTOSHKUMAR', name: 'Dr. Santosh Kumar', schedule: scheduleID_DRSANTOSHKUMAR },
  'ID_PROFABHAYJAIN': { id: 'ID_PROFABHAYJAIN', name: 'Prof. Abhay Jain', schedule: scheduleID_PROFABHAYJAIN },
  'ID_PROFSANTOSHKUMARI': { id: 'ID_PROFSANTOSHKUMARI', name: 'Prof. Santosh Kumari', schedule: scheduleID_PROFSANTOSHKUMARI },
  'ID_PROFPADMESHWARDOLEY': { id: 'ID_PROFPADMESHWARDOLEY', name: 'Prof. Padmeshwar Doley', schedule: scheduleID_PROFPADMESHWARDOLEY },
  'ID_PROFHARENDRANATHTIWARI': { id: 'ID_PROFHARENDRANATHTIWARI', name: 'Prof. Harendra Nath Tiwari', schedule: scheduleID_PROFHARENDRANATHTIWARI },
  'ID_PROFTARUNMANJHI': { id: 'ID_PROFTARUNMANJHI', name: 'Prof. Tarun Manjhi', schedule: scheduleID_PROFTARUNMANJHI },
  'ID_PROFSURYAPRAKASH': { id: 'ID_PROFSURYAPRAKASH', name: 'Prof. Surya Prakash', schedule: scheduleID_PROFSURYAPRAKASH },
  'ID_PROFNAVEENMITTAL': { id: 'ID_PROFNAVEENMITTAL', name: 'Prof. Naveen Mittal', schedule: scheduleID_PROFNAVEENMITTAL },
  'ID_PROFKINNERIJAIN': { id: 'ID_PROFKINNERIJAIN', name: 'Prof. Kinneri Jain', schedule: scheduleID_PROFKINNERIJAIN },
  'ID_PROFVANDANAJAIN': { id: 'ID_PROFVANDANAJAIN', name: 'Prof. Vandana Jain', schedule: scheduleID_PROFVANDANAJAIN },
  'ID_MSKARUNA': { id: 'ID_MSKARUNA', name: 'Ms. Karuna', schedule: scheduleID_MSKARUNA },
  'ID_DRMONIKABANSAL': { id: 'ID_DRMONIKABANSAL', name: 'Dr. Monika Bansal', schedule: scheduleID_DRMONIKABANSAL },
  'ID_DRAMANPREETKAUR': { id: 'ID_DRAMANPREETKAUR', name: 'Dr. Amanpreet Kaur', schedule: scheduleID_DRAMANPREETKAUR },
  'ID_DRALOKKUMAR': { id: 'ID_DRALOKKUMAR', name: 'Dr. Alok Kumar', schedule: scheduleID_DRALOKKUMAR },
  'ID_DRANISHA': { id: 'ID_DRANISHA', name: 'Dr. Anisha', schedule: scheduleID_DRANISHA },
  'ID_DRRAJKUMARSAH': { id: 'ID_DRRAJKUMARSAH', name: 'Dr. Raj Kumar Sah', schedule: scheduleID_DRRAJKUMARSAH },
  'ID_DRSHALINIAGGARWAL': { id: 'ID_DRSHALINIAGGARWAL', name: 'Dr. Shalini Aggarwal', schedule: scheduleID_DRSHALINIAGGARWAL },
  'ID_MRBALKISHAN': { id: 'ID_MRBALKISHAN', name: 'Mr. Bal Kishan', schedule: scheduleID_MRBALKISHAN },
  'ID_MRSUDHANSHUYADAV': { id: 'ID_MRSUDHANSHUYADAV', name: 'Mr. Sudhanshu Yadav', schedule: scheduleID_MRSUDHANSHUYADAV },
  'ID_MRHARISHKUMAR': { id: 'ID_MRHARISHKUMAR', name: 'Mr. Harish Kumar', schedule: scheduleID_MRHARISHKUMAR },
  'ID_MSMANPREETSHARMA': { id: 'ID_MSMANPREETSHARMA', name: 'Ms. Manpreet Sharma', schedule: scheduleID_MSMANPREETSHARMA },
  'ID_MSPOONAM': { id: 'ID_MSPOONAM', name: 'Ms. Poonam', schedule: scheduleID_MSPOONAM },
  'ID_DRPRIYANKAAGGARWAL': { id: 'ID_DRPRIYANKAAGGARWAL', name: 'Dr. Priyanka Aggarwal', schedule: scheduleID_DRPRIYANKAAGGARWAL },
  'ID_MRMOHDHASSAN': { id: 'ID_MRMOHDHASSAN', name: 'Mr. Mohd. Hassan', schedule: scheduleID_MRMOHDHASSAN },
  'ID_MSVARTIKAKHANDELWAL': { id: 'ID_MSVARTIKAKHANDELWAL', name: 'Ms. Vartika Khandelwal', schedule: scheduleID_MSVARTIKAKHANDELWAL },
  'ID_DRJAIDEEP': { id: 'ID_DRJAIDEEP', name: 'Dr. Jaideep', schedule: scheduleID_DRJAIDEEP },
  'ID_DRASHARANI': { id: 'ID_DRASHARANI', name: 'Dr. Asha Rani', schedule: scheduleID_DRASHARANI },
  'ID_DRJIGMETWANGDUS': { id: 'ID_DRJIGMETWANGDUS', name: 'Dr. Jigmet Wangdus', schedule: scheduleID_DRJIGMETWANGDUS },
  'ID_DRYUSRANASEEM': { id: 'ID_DRYUSRANASEEM', name: 'Dr. Yusra Naseem', schedule: scheduleID_DRYUSRANASEEM },
  'ID_MSANJUVERMA': { id: 'ID_MSANJUVERMA', name: 'Ms. Anju Verma', schedule: scheduleID_MSANJUVERMA },
  'ID_DRSHASHANKVIKRAMPRATAPSINGH': { id: 'ID_DRSHASHANKVIKRAMPRATAPSINGH', name: 'Dr. Shashank Vikram Pratap Singh', schedule: scheduleID_DRSHASHANKVIKRAMPRATAPSINGH },
  'ID_DRDIPIKABANSAL': { id: 'ID_DRDIPIKABANSAL', name: 'Dr. Dipika Bansal', schedule: scheduleID_DRDIPIKABANSAL },
  'ID_DRPRERANA': { id: 'ID_DRPRERANA', name: 'Dr. Prerana', schedule: scheduleID_DRPRERANA },
  'ID_DRSAURABHGUPTA': { id: 'ID_DRSAURABHGUPTA', name: 'Dr. Saurabh Gupta', schedule: scheduleID_DRSAURABHGUPTA },
  'ID_DRSAUMYAAGGARWAL': { id: 'ID_DRSAUMYAAGGARWAL', name: 'Dr. Saumya Aggarwal', schedule: scheduleID_DRSAUMYAAGGARWAL },
  'ID_DRAMARJEETSINGH': { id: 'ID_DRAMARJEETSINGH', name: 'Dr. Amarjeet Singh', schedule: scheduleID_DRAMARJEETSINGH },
  'ID_MRSATNAMSINGH': { id: 'ID_MRSATNAMSINGH', name: 'Mr. Satnam Singh', schedule: scheduleID_MRSATNAMSINGH },
  'ID_DRSAROJJOSHI': { id: 'ID_DRSAROJJOSHI', name: 'Dr. Saroj Joshi', schedule: scheduleID_DRSAROJJOSHI },
  'ID_DRANUJJATAV': { id: 'ID_DRANUJJATAV', name: 'Dr. Anuj Jatav', schedule: scheduleID_DRANUJJATAV },
  'ID_DRDIXITYADAV': { id: 'ID_DRDIXITYADAV', name: 'Dr. Dixit Yadav', schedule: scheduleID_DRDIXITYADAV },
  'ID_MSANKITATOMAR': { id: 'ID_MSANKITATOMAR', name: 'Ms. Ankita Tomar', schedule: scheduleID_MSANKITATOMAR },
  'ID_MSVAISHALICHHOKAR': { id: 'ID_MSVAISHALICHHOKAR', name: 'Ms. Vaishali Chhokar', schedule: scheduleID_MSVAISHALICHHOKAR },
  'ID_DRAMITKUMAR': { id: 'ID_DRAMITKUMAR', name: 'Dr. Amit Kumar', schedule: scheduleID_DRAMITKUMAR },
  'ID_DRSUMANSI': { id: 'ID_DRSUMANSI', name: 'Dr. Suman Si', schedule: scheduleID_DRSUMANSI },
  'ID_MRGAURAVRANA': { id: 'ID_MRGAURAVRANA', name: 'Mr. Gaurav Rana', schedule: scheduleID_MRGAURAVRANA },
  'ID_DRPALAKKANOJIA': { id: 'ID_DRPALAKKANOJIA', name: 'Dr. Palak Kanojia', schedule: scheduleID_DRPALAKKANOJIA },
  'ID_DRANURADHAAGGARWAL': { id: 'ID_DRANURADHAAGGARWAL', name: 'Dr. Anuradha Aggarwal', schedule: scheduleID_DRANURADHAAGGARWAL },
  'ID_DRRUCHIKACHOUDHARY': { id: 'ID_DRRUCHIKACHOUDHARY', name: 'Dr. Ruchika Choudhary', schedule: scheduleID_DRRUCHIKACHOUDHARY },
  'ID_DRRUTIKASAINI': { id: 'ID_DRRUTIKASAINI', name: 'Dr. Rutika Saini', schedule: scheduleID_DRRUTIKASAINI },
  'ID_DRKAMALDEEPKAURSARNA': { id: 'ID_DRKAMALDEEPKAURSARNA', name: 'Dr. Kamaldeep Kaur Sarna', schedule: scheduleID_DRKAMALDEEPKAURSARNA },
  'ID_DRPRIYACHAURASIA': { id: 'ID_DRPRIYACHAURASIA', name: 'Dr. Priya Chaurasia', schedule: scheduleID_DRPRIYACHAURASIA },
  'ID_MRANUJVIJAYBHATIA': { id: 'ID_MRANUJVIJAYBHATIA', name: 'Mr. Anuj Vijay Bhatia', schedule: scheduleID_MRANUJVIJAYBHATIA },
  'ID_DRCHARUSHRI': { id: 'ID_DRCHARUSHRI', name: 'Dr. Charu Shri', schedule: scheduleID_DRCHARUSHRI },
  'ID_DRNIKUNJAGGARWAL': { id: 'ID_DRNIKUNJAGGARWAL', name: 'Dr. Nikunj Aggarwal', schedule: scheduleID_DRNIKUNJAGGARWAL },
  'ID_MRABHISHEKKUMARYADAV': { id: 'ID_MRABHISHEKKUMARYADAV', name: 'Mr. Abhishek Kumar Yadav', schedule: scheduleID_MRABHISHEKKUMARYADAV },
  'ID_MRANILKUMAR': { id: 'ID_MRANILKUMAR', name: 'Mr. Anil Kumar', schedule: scheduleID_MRANILKUMAR },
  'ID_DRSHRUTIMALLIK': { id: 'ID_DRSHRUTIMALLIK', name: 'Dr. Shruti Mallik', schedule: scheduleID_DRSHRUTIMALLIK },
  'ID_DRSHIKHAGUPTA': { id: 'ID_DRSHIKHAGUPTA', name: 'Dr. Shikha Gupta', schedule: scheduleID_DRSHIKHAGUPTA },
  'ID_MSANUBHAGODARA': { id: 'ID_MSANUBHAGODARA', name: 'Ms. Anubha Godara', schedule: scheduleID_MSANUBHAGODARA },
  'ID_MSLATIKABAJETHA': { id: 'ID_MSLATIKABAJETHA', name: 'Ms. Latika Bajetha', schedule: scheduleID_MSLATIKABAJETHA },
  'ID_DRSHIKHARAJPUT': { id: 'ID_DRSHIKHARAJPUT', name: 'Dr. Shikha Rajput', schedule: scheduleID_DRSHIKHARAJPUT },
  'ID_MRVIKKISHARMA': { id: 'ID_MRVIKKISHARMA', name: 'Mr. Vikki Sharma', schedule: scheduleID_MRVIKKISHARMA },
  'ID_DRNISHADEVI': { id: 'ID_DRNISHADEVI', name: 'Dr. Nisha Devi', schedule: scheduleID_DRNISHADEVI },
  'ID_MRKRISHANKANT': { id: 'ID_MRKRISHANKANT', name: 'Mr. Krishan Kant', schedule: scheduleID_MRKRISHANKANT },
  'ID_DRSAPNABANSAL': { id: 'ID_DRSAPNABANSAL', name: 'Dr. Sapna Bansal', schedule: scheduleID_DRSAPNABANSAL },
  'ID_DRSHIVANGIKAUSHIK': { id: 'ID_DRSHIVANGIKAUSHIK', name: 'Dr. Shivangi Kaushik', schedule: scheduleID_DRSHIVANGIKAUSHIK },
  'ID_DRRAJIVJHA': { id: 'ID_DRRAJIVJHA', name: 'Dr. Rajiv Jha', schedule: scheduleID_DRRAJIVJHA },
  'ID_PROFRITURANJAN': { id: 'ID_PROFRITURANJAN', name: 'Prof. Ritu Ranjan', schedule: scheduleID_PROFRITURANJAN },
  'ID_MSPRIYANKABHATIA': { id: 'ID_MSPRIYANKABHATIA', name: 'Ms. Priyanka Bhatia', schedule: scheduleID_MSPRIYANKABHATIA },
  'ID_DRESTHERNGAIHTE': { id: 'ID_DRESTHERNGAIHTE', name: 'Dr. Esther Ngaihte', schedule: scheduleID_DRESTHERNGAIHTE },
  'ID_DRAVINASHKUMARJHA': { id: 'ID_DRAVINASHKUMARJHA', name: 'Dr. Avinash Kumar Jha', schedule: scheduleID_DRAVINASHKUMARJHA },
  'ID_DRRENUBANSAL': { id: 'ID_DRRENUBANSAL', name: 'Dr. Renu Bansal', schedule: scheduleID_DRRENUBANSAL },
  'ID_DRRAKESHRANJAN': { id: 'ID_DRRAKESHRANJAN', name: 'Dr. Rakesh Ranjan', schedule: scheduleID_DRRAKESHRANJAN },
  'ID_MSNIDHIGUPTA': { id: 'ID_MSNIDHIGUPTA', name: 'Ms. Nidhi Gupta', schedule: scheduleID_MSNIDHIGUPTA },
  'ID_DRRAVIKANT': { id: 'ID_DRRAVIKANT', name: 'Dr. Ravi Kant', schedule: scheduleID_DRRAVIKANT },
  'ID_MRROHIT': { id: 'ID_MRROHIT', name: 'Mr. Rohit', schedule: scheduleID_MRROHIT },
  'ID_DRKAPILDEVYADAV': { id: 'ID_DRKAPILDEVYADAV', name: 'Dr. Kapil Dev Yadav', schedule: scheduleID_DRKAPILDEVYADAV },
  'ID_MSYUTHIKAAGARWAL': { id: 'ID_MSYUTHIKAAGARWAL', name: 'Ms. Yuthika Agarwal', schedule: scheduleID_MSYUTHIKAAGARWAL },
  'ID_MSCHHAVIGAUTAM': { id: 'ID_MSCHHAVIGAUTAM', name: 'Ms. Chhavi Gautam', schedule: scheduleID_MSCHHAVIGAUTAM },
  'ID_MRJAGADISHKONTHOUJAM': { id: 'ID_MRJAGADISHKONTHOUJAM', name: 'Mr. Jagadish Konthoujam', schedule: scheduleID_MRJAGADISHKONTHOUJAM },
  'ID_MRASHWANIKUMAR': { id: 'ID_MRASHWANIKUMAR', name: 'Mr. Ashwani Kumar', schedule: scheduleID_MRASHWANIKUMAR },
  'ID_DRAMITGIRDHARWAL': { id: 'ID_DRAMITGIRDHARWAL', name: 'Dr. Amit Girdharwal', schedule: scheduleID_DRAMITGIRDHARWAL },
  'ID_MSANURADHAGULATIDASGUPTA': { id: 'ID_MSANURADHAGULATIDASGUPTA', name: 'Ms. Anuradha Gulati Dasgupta', schedule: scheduleID_MSANURADHAGULATIDASGUPTA },
  'ID_MRABHISHEKKHADGAWAT': { id: 'ID_MRABHISHEKKHADGAWAT', name: 'Mr. Abhishek Khadgawat', schedule: scheduleID_MRABHISHEKKHADGAWAT },
  'ID_MSHIMANSHIAGGARWAL': { id: 'ID_MSHIMANSHIAGGARWAL', name: 'Ms. Himanshi Aggarwal', schedule: scheduleID_MSHIMANSHIAGGARWAL },
  'ID_MSSHREYASHREEDHAR': { id: 'ID_MSSHREYASHREEDHAR', name: 'Ms. Shreya Shreedhar', schedule: scheduleID_MSSHREYASHREEDHAR },
  'ID_DRKAUSHALKISHORE': { id: 'ID_DRKAUSHALKISHORE', name: 'Dr. Kaushal Kishore', schedule: scheduleID_DRKAUSHALKISHORE },
  'ID_DRMONIKAGAUR': { id: 'ID_DRMONIKAGAUR', name: 'Dr. Monika Gaur', schedule: scheduleID_DRMONIKAGAUR },
  'ADMIN': { id: 'kroni', name: 'System Administrator', department: 'Office Control', schedule: EMPTY_SCHEDULE }
};
