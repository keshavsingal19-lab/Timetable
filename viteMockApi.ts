import { Plugin } from 'vite';

const ALL_ROOM_IDS = [
  "CL1","CL2","CLIB","PB2","PB3","PB4",
  "R1","R2","R3","R4","R5","R6","R7","R8","R10",
  "R13","R14","R15","R16","R17","R18","R19","R20","R21","R22","R23","R24","R25",
  "R26","R27","R28","R29","R30","R31","R32","R33","R34","R35","R37",
  "SCR1","SCR2","SCR3","SCR4",
  "T1","T2","T3","T4","T5","T6","T7","T8","T9",
  "T11","T12","T13","T14","T15","T16","T17","T18",
  "T23","T24","T25","T26","T27","T29",
  "T31","T32","T33","T34","T35","T36","T37","T38","T39","T40",
  "T41","T42","T43","T44","T45","T46","T48","T49","T50","T51","T53","T54"
];

const IGNORED_ROOMS = ["PRINCIPAL OFFICE", "PLAYGROUND", "SEMINAR HALL"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIMETABLE_BASE_URL = "https://srcccollegetimetable.in/admin/timetable_printpreview.php?mode=print&roomno=";
const COL_TO_SLOT: Record<number, number> = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 6: 5, 7: 6, 8: 7, 9: 8 };

function classifyRoomType(id: string) {
  if (id.startsWith("CL")) return "Computer Lab";
  if (id.startsWith("PB")) return "Lecture Hall";
  if (id.startsWith("SCR")) return "Seminar Room";
  if (id.startsWith("T")) return "Tutorial Room";
  return "Lecture Hall";
}

function extractTeacherCode(cellText: string) {
  if (!cellText || !cellText.trim()) return null;
  const segments = cellText.split(/[\/|,]+/);
  const codes: string[] = [];

  for (const segment of segments) {
    const cleaned = segment.replace(/^\d+\.\s*/, '').trim();
    if (!cleaned) continue;
    const parts = cleaned.split(/[\s\-]+/);
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i].trim();
      if (/^[A-Za-z]{1,4}$/.test(part)) {
        codes.push(part.toUpperCase());
        break;
      }
    }
  }
  return codes.length > 0 ? codes.join(',') : null;
}

function parseRoomHtml(html: string) {
  const emptySlots: Record<string, number[]> = {};
  const occupiedBy: Record<string, Record<string, string[]>> = {};

  for (const day of DAYS) {
    emptySlots[day] = [];
    occupiedBy[day] = {};

    const dayRegex = new RegExp('<td[^>]*>\\s*' + day + '\\s*</td>([\\s\\S]*?)(?:</tr>)', 'i');
    const dayMatch = html.match(dayRegex);
    if (!dayMatch) continue;

    const rowHtml = dayMatch[1];
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let cellMatch;
    let colIndex = 0;

    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      const fullCellTag = cellMatch[0];
      const cellContent = cellMatch[1];
      const slotIdx = COL_TO_SLOT[colIndex];

      if (slotIdx !== undefined) {
        const textContent = cellContent.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
        if (!textContent || textContent.length === 0) {
          emptySlots[day].push(slotIdx);
        } else {
          const meaningfulText = textContent.replace(/[\s\-\.]+/g, '').trim();
          if (!meaningfulText) {
            emptySlots[day].push(slotIdx);
          } else {
            const teacherCode = extractTeacherCode(textContent);
            if (teacherCode) {
              // Store as array of segments (IDs) to match production schema
              occupiedBy[day][slotIdx.toString()] = teacherCode.split(',').map(s => s.trim());
            }
          }
        }
      }
      colIndex++;
    }
  }
  return { emptySlots, occupiedBy };
}

let localDbRooms: any[] = [];

export function mockBackendPlugin(): Plugin {
  return {
    name: 'mock-backend',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        
        if (req.url === '/api/rooms' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(localDbRooms));
          return;
        }

        if (req.url === '/api/teachers' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify([
            { id: 'ADMIN', name: 'System Administrator', department: 'Office Control' },
            { id: 'AJ', name: 'Dr. Aruna Jha', department: 'Commerce' },
            { id: 'RKS', name: 'Mr. R.K. Singh', department: 'Economics' },
            { id: 'PNM', name: 'Ms. Poonam', department: 'English' },
            { id: 'SGP', name: 'Dr. Saurabh Gupta', department: 'Commerce' },
            { id: 'MKM', name: 'Dr. M.K. Mahajan', department: 'Commerce' },
            { id: 'AKS', name: 'Dr. Amit Kumar Singh', department: 'Commerce' },
            { id: 'JS', name: 'Ms. J. Sahay', department: 'Economics' },
            { id: 'RK', name: 'Dr. Ravi Kant', department: 'Commerce' },
            { id: 'SK', name: 'Mr. Santosh Kumar', department: 'Commerce' }
          ]));
          return;
        }

        if (req.url === '/api/sync_rooms' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', async () => {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            
            try {
              const payload = JSON.parse(body);
              const roomIdsToProcess = payload.roomIds || [];
              const isFirstBatch = payload.isFirstBatch || false;
              const totalRooms = payload.totalRooms || roomIdsToProcess.length;
              let processed = payload.processedCount || 0;
              let errors = 0;
              const results: any[] = [];

              if (isFirstBatch) {
                localDbRooms = []; 
                res.write("data: " + JSON.stringify({ type: 'start', total: totalRooms, message: "Starting sync for " + totalRooms + " rooms in batches..." }) + "\n\n");
              }

              for (const roomId of roomIdsToProcess) {
                if (IGNORED_ROOMS.some(ignored => roomId.toUpperCase() === ignored.replace(/\s+/g, ''))) {
                  processed++;
                  res.write("data: " + JSON.stringify({ type: 'skip', room: roomId, processed, message: "Skipped " + roomId + " (ignored)" }) + "\n\n");
                  continue;
                }

                try {
                  const url = TIMETABLE_BASE_URL + encodeURIComponent(roomId);
                  const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
                  
                  if (!response.ok) throw new Error("HTTP " + response.status);
                  const html = await response.text();
                  
                  const { emptySlots, occupiedBy } = parseRoomHtml(html);
                  const roomType = classifyRoomType(roomId);
                  
                  const roomData = { id: roomId, name: roomId, type: roomType, emptySlots, occupiedBy, source: 'database' };
                  results.push(roomData);
                  
                  const freeCount = Object.values(emptySlots).flat().length;
                  processed++;
                  res.write("data: " + JSON.stringify({ type: 'progress', room: roomId, processed, total: totalRooms, emptySlotCount: freeCount, message: "? " + roomId + " synced (" + freeCount + " free slots)" }) + "\n\n");
                  
                  await new Promise(resolve => setTimeout(resolve, 300)); 
                } catch (err: any) {
                  errors++;
                  processed++;
                  res.write("data: " + JSON.stringify({ type: 'error', room: roomId, processed, message: "? " + roomId + ": " + err.message }) + "\n\n");
                }
              }

              localDbRooms = [...localDbRooms, ...results];

              const isComplete = isFirstBatch && totalRooms === results.length;
              res.write("data: " + JSON.stringify({ 
                type: 'complete', 
                total: totalRooms, 
                processed, 
                errors, 
                roomsSynced: results.length, 
                batchComplete: true, 
                message: isComplete ? 'Sync complete!' : "Batch complete (" + results.length + " rooms)." 
              }) + "\n\n");
              res.end();
            } catch (e: any) {
              res.write("data: " + JSON.stringify({ type: 'fatal', message: "Fatal error: " + e.message }) + "\n\n");
              res.end();
            }
          });
          return;
        }
        
        next();
      });
    }
  };
}
