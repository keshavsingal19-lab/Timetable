# SRCC Room Finder: Technical Documentation

This document provides a comprehensive overview of the SRCC Room Finder logic, detailing the data extraction from the main website and the complex absence cross-referencing logic. It is designed to act as a blueprint for integrations in third-party applications.

## Overview

The SRCC Room Finder allows students and administrators to identify true room availability on the campus in real-time. It achieves this by:
1.  **Fetching and parsing raw HTML** timetables for every valid room from the official college website (`srcccollegetimetable.in`).
2.  **Structuring and storing** this data.
3.  **Cross-referencing** the schedule with dynamic **Teacher Absence** lists to release occupied rooms when the scheduled teacher is on leave.

---

## 1. Constants & Data Dictionaries

To replicate this system, you must use the exact IDs and constants used by the SRC.

### 1.1 Complete Room Registry (`ALL_ROOM_IDS`)
You must query the college server strictly using these exact 70 internal IDs:
```json
[
  "CL1","CL2","CLIB",
  "PB2","PB3","PB4",
  "R1","R2","R3","R4","R5","R6","R7","R8","R10",
  "R13","R14","R15","R16","R17","R18","R19","R20","R21","R22","R23","R24","R25",
  "R26","R27","R28","R29","R30","R31","R32","R33","R34","R35","R37",
  "SCR1","SCR2","SCR3","SCR4",
  "T1","T2","T3","T4","T5","T6","T7","T8","T9",
  "T11","T12","T13","T14","T15","T16","T17","T18",
  "T23","T24","T25","T26","T27","T29",
  "T31","T32","T33","T34","T35","T36","T37","T38","T39","T40",
  "T41","T42","T43","T44","T45","T46","T48","T49","T50","T51","T53","T54"
]
```

### 1.2 Skipped Anomalies (`IGNORED_ROOMS`)
Do not process or display the following as standard rooms:
```json
["PRINCIPAL OFFICE", "PLAYGROUND", "SEMINAR HALL"]
```

### 1.3 Time Slots Array
The college operates on 9 primary slots (ignoring lunch). All internal logic maps real-world times to continuous indices (0-8).
```javascript
const TIME_SLOTS = [
  "8:30 AM", "9:30 AM", "10:30 AM", "11:30 AM",
  "12:30 PM", "1:30 PM", "2:30 PM", "3:30 PM", "4:30 PM"
];

// Mapping HTML Column Index to the continuous Array Index
// Notice that column 5 is skipped because it is the Lunch break.
const COL_TO_SLOT = {
  0: 0, 1: 1, 2: 2, 3: 3, 4: 4,
  // HTML Col 5 is Lunch Break
  6: 5, 7: 6, 8: 7, 9: 8
};
```

---

## 2. The Fetching & Extraction Engine

You must fetch the data directly from the official SRCC Timetable portal.

### The Endpoint
*   `TIMETABLE_BASE_URL`: `https://srcccollegetimetable.in/admin/timetable_printpreview.php?mode=print&roomno=`
*   **Method:** `GET` (e.g., `...roomno=R1`)
*   **Headers:** Recommended to use standard User-Agent headers to avoid rejection.

### The HTML Parsing Algorithm
The college website returns a visual HTML table. You must parse it into structured JSON: `emptySlots` (arrays) and `occupiedBy` (teacher mapping).

1.  **Row Isolation by Day:** For every day (`Monday` through `Saturday`), run a regex to extract the `<tr>` block containing the day name:
    ```javascript
    const dayRegex = new RegExp(`<td[^>]*>\\s*${day}\\s*</td>([\\s\\S]*?)(?:</tr>)`, 'i');
    ```
2.  **Cell Iteration:** Extract all `<td>` elements within that row. Skip column 5 (lunch).
3.  **Detecting Empty Classes:** The website uses a CSS style `style="Array...` on valid grid cells. If a cell contains this style but has **no text content** (after stripping HTML and `&nbsp;`), it is a legitimately empty slot. Add its mapped `slotIdx` to your `emptySlots` array database.
4.  **Extracting Teacher Codes:** If the cell has text (e.g. `B.Com(H) - SEC-A - SG`), you must extract the teacher code ("SG").
    *   Strip styling, line numbers (`\d+\.`), and merge multiple class segments using separators.
    *   **Regex Rule:** The teacher code is almost always a 1 to 4 letter alphabetic string at the very end of the segment.
    ```javascript
    // Iterate through segment parts (split by space/hyphen) backwards
    if (/^[A-Za-z]{1,4}$/.test(part)) {
        return part.toUpperCase(); // e.g. "SG", "AK"
    }
    ```
    *   Save these extracted IDs to an `occupiedBy` map so the system knows exactly *who* is scheduled to use the room at that time slot.

---

## 3. Dynamic "Freed Room" Cross-Referencing Algorithm

This is the core business logic of the Smart Room Finder. If a room is not natively empty, it might still be available if the scheduled teacher is on leave.

> [!WARNING]
> You must handle "Multi-Occupancy" anomalies. A room might have two different teachers scheduled simultaneously due to timetable errors, merged sessions, or large halls having two distinct groups. **A room can only be marked as "Freed" if ALL teachers scheduled there are definitively absent.**

### The Algorithm Breakdown

To generate a map of rooms that should be dynamically released for a specific day (`targetDay`):

1.  **Identify Potential Rooms:**
    *   Iterate through the global list of `todayAbsences`.
    *   For each absent teacher, find their parsed `schedule` object.
    *   Look at the classes they are supposed to teach on `targetDay`.
    *   If they are scheduled in a room (e.g., `R29`), add `R29` to a "Potentially Freed" list, alongside the name of the absent teacher.

2.  **Strict Occupancy Verification:**
    *   Iterate through every room in your "Potentially Freed" list.
    *   For each room, look at the schedules of **ALL OTHER LIVE TEACHERS** in the entire college registry.
    *   **Crucial Check:** Is there *any* teacher scheduled to use that *same* room at that *same* slot who is **NOT** on the `todayAbsences` list?
    *   If "Yes", it means a live teacher is using the room. **Do not free it.**
    *   If "No", it means the room is definitively abandoned.

3.  **Execution & tagging:**
    *   If the room passes the verification, release it.
    *   Attach a visual tag to the data object (e.g., `tags: ["Released: {Teacher Name}"]`) so users understand *why* a normally occupied room is showing as available.

### Reference Code (TypeScript / React)

This is the exact algorithm used in the SmartProf ecosystem:

```tsx
const getFreedSlotsForDay = (targetDay: DayOfWeek) => {
  const map = new Map<number, any[]>();
  TIME_SLOTS.forEach((_, i) => map.set(i, []));
          
  TIME_SLOTS.forEach((_, slotIdx) => {
     const potentialFreedRooms = new Map<string, string[]>(); // roomId -> absentNames

     // 1. Identify all absent teachers and the rooms they are supposed to be in
     todayAbsences.forEach(absent => {
         const tMatch = allTeachers.find(t => t.name.toLowerCase() === absent.teacher_name.toLowerCase());
         if (!tMatch) return;
         const schedule = tMatch.schedule?.[targetDay];
         if (!schedule) return;
         
         const classAtSlot = schedule.find((c: any) => c.periods.includes(slotIdx));
         if (classAtSlot && classAtSlot.room) {
             if (!potentialFreedRooms.has(classAtSlot.room)) {
                 potentialFreedRooms.set(classAtSlot.room, []);
             }
             potentialFreedRooms.get(classAtSlot.room)?.push(tMatch.name);
         }
     });

     // 2. Verify no OTHER present teacher is scheduled in that room
     potentialFreedRooms.forEach((absentNames, roomId) => {
         let isActuallyOccupied = false;
         
         allTeachers.forEach(t => {
             if (isActuallyOccupied) return;
             if (todayAbsences.some(a => a.teacher_name.toLowerCase() === t.name.toLowerCase())) return; // They are absent
             
             const schedule = t.schedule?.[targetDay];
             if (!schedule) return;
             
             const classAtSlot = schedule.find((c: any) => c.periods.includes(slotIdx) && c.room === roomId);
             if (classAtSlot) {
                 isActuallyOccupied = true;
             }
         });

         // 3. Release the room if verified empty
         if (!isActuallyOccupied) {
             const roomObj = allRooms.find(r => r.id === roomId);
             if (roomObj) {
                // Attach dynamic tags or push to the final array
                map.get(slotIdx)?.push({...roomObj, tags: [`Released: ${absentNames.join(', ')}`]});
             }
         }
     });
  });

  return map;
};
```
