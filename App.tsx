import React, { useState, useMemo, useEffect } from 'react';
import { 
  Clock, MapPin, Search, Filter, Lock, CheckCircle, 
  XCircle, LogOut, AlertTriangle, AlertCircle, UserMinus, 
  CalendarDays, Download, Share, Users, GraduationCap, 
  ArrowRight, MessageCircle, Star, Timer, Megaphone, Mail, Home,
  BookOpen
} from 'lucide-react';
import { DayOfWeek, TIME_SLOTS, RoomData } from './types';
import { ROOMS } from './data';
import { TEACHER_SCHEDULES } from './teacherData';
// Import the newly split semester files
import { SEM2_STUDENT_SCHEDULES } from './Sem2';
import { STUDENT_SCHEDULES as SEM4_STUDENT_SCHEDULES } from './Sem4';
import { sem6StudentData } from './Sem6';

// Helper function to dynamically fix Sem 6 formatting so it matches Sem 2 and Sem 4
const convertSem6Data = (data: any) => {
  const converted: Record<string, any> = {};
  
  const timeMap: Record<string, number> = {
    "8:30 AM to 9:30 AM": 0, "9:30 AM to 10:30 AM": 1,
    "10:30 AM to 11:30 AM": 2, "11:30 AM to 12:30 PM": 3,
    "12:30 PM to 1:30 PM": 4, "2:00 PM to 3:00 PM": 5,
    "3:00 PM to 4:00 PM": 6, "4:00 PM to 5:00 PM": 7,
    "5:00 PM to 6:00 PM": 8
  };

  const typeMap: Record<string, string> = {
    "L": "Lecture", "T": "Tutorial", "LAB": "Practical" // Maps 'LAB' to Practical to keep your color coding
  };

  for (const [rollNo, classes] of Object.entries(data)) {
    converted[rollNo] = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [] };
    
    (classes as any[]).forEach((cls) => {
      const periodIndex = timeMap[cls.time];
      if (periodIndex !== undefined && converted[rollNo][cls.day]) {
        converted[rollNo][cls.day].push({
          periodIndex,
          subject: cls.subject,
          room: cls.room,
          type: typeMap[cls.type] || cls.type,
          teacher: cls.teacher
        });
      }
    });
  }
  return converted;
};

// Combine all 3 semesters into one master database
const ALL_STUDENT_SCHEDULES = {
  ...SEM2_STUDENT_SCHEDULES,
  ...SEM4_STUDENT_SCHEDULES,
  ...convertSem6Data(sem6StudentData)
};

// --- SOCIETY EVENTS DATA ---
const SOCIETY_EVENTS = [
  {
    id: 1,
    society: "The XYZ Society",
    event: "Sample Event Name",
    date: "01 Jan 2026",
    time: "10:00 AM Onwards",
    location: "Sample Venue",
    type: "Sample",
    description: "This is a hypothetical event description. Your society's event details, poster, and registration links will appear here."
  }
];

const getDayName = (day: DayOfWeek): string => day;

function App() {
  // --- STATE VARIABLES ---
  
  // 1. Navigation & Global
  const [activeTab, setActiveTab] = useState<'menu' | 'rooms' | 'teachers' | 'societies' | 'timetable' | 'leave'>('menu'); 
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(DayOfWeek.Monday);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState<number>(0);
  
  // 2. Room Finder
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('All');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // 3. Teacher Finder
  const [finderSearchQuery, setFinderSearchQuery] = useState('');

  // 4. Admin & Security
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [absentTeachers, setAbsentTeachers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState(''); 
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  // 5. Modals & Blocking
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isSiteBlocked, setIsSiteBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');

  // 6. Timetable State
  const [timetableRollNo, setTimetableRollNo] = useState('');
  const [activeTimetable, setActiveTimetable] = useState<any>(null);
  const [timetableDay, setTimetableDay] = useState<DayOfWeek>(DayOfWeek.Monday);

  // --- HELPER: Get Current Date Details ---
  const todayDateObj = new Date();
  const currentDayName = todayDateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = todayDateObj.toLocaleDateString('en-GB', { 
    day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' 
  });

  // --- 1. INITIAL CHECKS (Run on Load) ---
  useEffect(() => {
    if (Object.values(DayOfWeek).includes(currentDayName as DayOfWeek)) {
      setSelectedDay(currentDayName as DayOfWeek);
      setTimetableDay(currentDayName as DayOfWeek);
      
      const currentHour = todayDateObj.getHours();
      const currentMinutes = todayDateObj.getMinutes();
      let estimatedSlot = currentHour - 8; 
      if (currentMinutes < 30) estimatedSlot -= 1;
      if (estimatedSlot >= 0 && estimatedSlot < TIME_SLOTS.length) {
         setSelectedTimeIndex(estimatedSlot);
      }
    }
    
    fetch('/api/check_status')
      .then(res => res.json())
      .then(data => {
        if (data.blocked) {
          setIsSiteBlocked(true);
          setBlockMessage(data.message);
        }
      })
      .catch(err => console.error("Block check failed", err));

    fetch('/api/attendance')
      .then(res => res.json())
      .then(ids => {
        setAbsentTeachers(Array.isArray(ids) ? ids : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Attendance fetch error:", err);
        setLoading(false);
      });
  }, []); 

  // --- 2. ADMIN ACTIONS ---
  
  const handleAdminLogin = async () => {
    setLoginError(''); 
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPass })
      });
      const data = await response.json();
      if (response.ok) {
        setIsLoggedIn(true);
        setLoginError('');
      } else {
        if (response.status === 403) {
           setIsSiteBlocked(true);
           setBlockMessage(data.message);
           setIsAdminOpen(false); 
        } else {
           setLoginError(data.error || `Incorrect password. ${data.attemptsLeft} attempts left.`);
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
      setLoginError("Connection error. Please try again.");
    }
  };

  const toggleAbsence = async (tid: string) => {
    const isAbsent = !absentTeachers.includes(tid);
    setAbsentTeachers(prev => isAbsent ? [...prev, tid] : prev.filter(id => id !== tid));

    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId: tid, isAbsent, password: adminPass })
      });
      if (!response.ok) throw new Error("Unauthorized or Failed");
    } catch (e) {
      console.error("Save failed", e);
      alert("Failed to save. Session may have expired.");
      setAbsentTeachers(prev => isAbsent ? prev.filter(id => id !== tid) : [...prev, tid]);
    }
  };

  // --- 3. TIMETABLE LOGIC (REAL DATA IMPORT) ---
  const handleSearchTimetable = (e: React.FormEvent) => {
    e.preventDefault();
    const roll = timetableRollNo.trim().toUpperCase();
    if (!roll) return;

    // Fetch the data straight from the new combined database
    const studentData = ALL_STUDENT_SCHEDULES[roll];

    if (studentData) {
      setActiveTimetable(studentData);
      setTimetableDay(Object.values(DayOfWeek).includes(currentDayName as DayOfWeek) ? (currentDayName as DayOfWeek) : DayOfWeek.Monday);
    } else {
      alert("Roll Number not found! Please check for typos and try again.");
    }
  };

  // --- 4. LOGIC: ROOM FINDER (SMART SORT & DURATION) ---

  const calculateFreeDuration = (room: any, startSlotIndex: number) => {
    let freeSlots = 0;
    for (let i = startSlotIndex; i < TIME_SLOTS.length; i++) {
       const isStaticallyFree = room.emptySlots[selectedDay]?.includes(i);
       if (isStaticallyFree) {
         freeSlots++;
       } else {
         break;
       }
    }
    return freeSlots;
  };

  const freedRooms = useMemo(() => {
    if (selectedDay !== currentDayName) return []; 
    const freed: RoomData[] = [];
    const dayName = getDayName(selectedDay);

    absentTeachers.forEach(tid => {
      const teacher = TEACHER_SCHEDULES[tid];
      if (!teacher) return;
      const schedule = teacher.schedule[dayName];
      if (!schedule) return;

      const classAtSlot = schedule.find((c: any) => c.periods.includes(selectedTimeIndex));

      if (classAtSlot && classAtSlot.room) {
        freed.push({
          id: classAtSlot.room,
          name: classAtSlot.room,
          type: 'Lecture Hall', 
          emptySlots: { [selectedDay]: [selectedTimeIndex] } as any,
          tags: [`Freed: ${teacher.name}`]
        } as any);
      }
    });
    return freed;
  }, [absentTeachers, selectedDay, selectedTimeIndex, currentDayName]);

  const availableRooms = useMemo(() => {
    const staticRooms = ROOMS.filter(room => room.emptySlots[selectedDay]?.includes(selectedTimeIndex));
    const allRooms = [...staticRooms];
    
    freedRooms.forEach(freed => {
      if (!allRooms.find(r => r.id === freed.id)) allRooms.push(freed);
    });

    const filtered = allRooms.filter(room => {
      const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'All' || room.type === filterType;
      return matchesSearch && matchesType;
    });

    return filtered.sort((a, b) => {
       const durA = calculateFreeDuration(a, selectedTimeIndex);
       const durB = calculateFreeDuration(b, selectedTimeIndex);
       return durB - durA;
    });

  }, [selectedDay, selectedTimeIndex, searchQuery, filterType, freedRooms]);

  const roomStats = useMemo(() => {
    return { available: availableRooms.length, total: ROOMS.length };
  }, [availableRooms]);

  // --- 5. LOGIC: TIMELINE & FINDER ---
  
  const getRoomTimeline = (roomId: string) => {
    const timeline = new Array(TIME_SLOTS.length).fill(null);
    const dayName = getDayName(selectedDay);

    Object.values(TEACHER_SCHEDULES).forEach((teacher: any) => {
       if (teacher.id === 'ADMIN') return;
       const daySchedule = teacher.schedule[dayName];
       if (daySchedule) {
         daySchedule.forEach((cls: any) => {
           if (cls.room === roomId) {
             cls.periods.forEach((period: number) => {
                if (period < timeline.length) {
                  timeline[period] = {
                    status: 'Occupied',
                    teacher: teacher.name,
                    teacherId: teacher.id,
                    subject: cls.subject,
                    isAbsent: absentTeachers.includes(teacher.id) && selectedDay === currentDayName
                  };
                }
             });
           }
         });
       }
    });
    return timeline; 
  };

  const selectedRoomTimeline = useMemo(() => {
    if (!selectedRoomId) return [];
    return getRoomTimeline(selectedRoomId);
  }, [selectedRoomId, selectedDay, absentTeachers]);

  // --- 6. LOGIC: TEACHER FINDER ---

  const getEntityStatus = (teacher: any) => {
    if (absentTeachers.includes(teacher.id) && selectedDay === currentDayName) {
      return { status: 'On Leave', color: 'red', icon: UserMinus, detail: 'Marked Absent' };
    }
    const daySchedule = teacher.schedule[selectedDay];
    if (!daySchedule) return { status: 'Free', color: 'green', icon: CheckCircle, detail: 'No classes today' };
    
    const currentClass = daySchedule.find((c: any) => c.periods.includes(selectedTimeIndex));
    if (currentClass) {
      return { 
        status: `In ${currentClass.room}`, 
        color: 'blue', 
        icon: MapPin, 
        detail: currentClass.subject || 'Class' 
      };
    }
    return { status: 'Free', color: 'green', icon: CheckCircle, detail: 'Staff Room / Free' };
  };

  const visibleEntities = useMemo(() => {
    const query = finderSearchQuery.toLowerCase();
    
    const teachers = Object.values(TEACHER_SCHEDULES)
      .filter(t => t.id !== 'ADMIN')
      .filter(t => t.name.toLowerCase().includes(query))
      .map(t => ({ ...t, type: 'teacher' }));

    return teachers.sort((a, b) => a.name.localeCompare(b.name));
  }, [finderSearchQuery]);

  // --- COMPONENT: Teachers On Leave Dashboard (Reused) ---
  const TeachersOnLeaveDashboard = () => (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl shadow-sm border border-red-100 p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg shadow-sm text-red-600">
              <UserMinus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Teachers on Leave</h2>
              <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                <CalendarDays className="w-4 h-4" />
                {formattedDate}
              </div>
            </div>
          </div>
          {absentTeachers.length > 0 && (
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
              {absentTeachers.length} Absent Today
            </span>
          )}
      </div>
      
      <div className="bg-white/60 rounded-lg p-4 border border-red-100/50">
        {absentTeachers.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {absentTeachers.map(tid => (
              <span key={tid} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-red-200 shadow-sm text-sm font-medium text-gray-700">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                {TEACHER_SCHEDULES[tid]?.name || tid}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm italic flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            No teachers marked absent today.
          </p>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-2 text-right">
        *List resets automatically at end of day
      </p>
    </div>
  );


  // --- 7. RENDER ---

  if (isSiteBlocked) {
    return (
      <div className="min-h-screen bg-red-900 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full animate-pulse">
          <div className="flex justify-center mb-4"><AlertTriangle className="w-16 h-16 text-red-600" /></div>
          <h1 className="text-2xl font-bold text-red-700 mb-2">ACCESS DENIED</h1>
          <p className="text-gray-800 font-semibold text-lg">{blockMessage || "You are blocked."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20 font-sans selection:bg-red-100">
      
      {/* HEADER */}
      <header className="bg-red-800 text-white sticky top-0 z-50 shadow-lg backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-xl border border-white/10">
                <MapPin className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold leading-none tracking-tight">SRCC Finder</h1>
                <p className="text-red-200 text-xs mt-1 font-medium tracking-wide">ACADEMIC SESSION 2025-26</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
               {activeTab !== 'menu' && (
                 <button 
                   onClick={() => setActiveTab('menu')}
                   className="bg-white text-red-900 px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-all active:scale-95 flex items-center gap-2 font-bold shadow-md"
                 >
                   <Home className="w-5 h-5" /> Menu
                 </button>
               )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* --- MAIN MENU TAB (MOBILE OPTIMIZED) --- */}
        {activeTab === 'menu' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 text-center md:text-left">What do you want to do?</h2>
            
            {/* Grid structure updated to grid-cols-2 for mobile to save space */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              
              <button onClick={() => setActiveTab('rooms')} className="bg-white border border-gray-200 p-4 md:p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center group active:scale-95">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-2 md:mb-4 transition-colors bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white">
                  <MapPin className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h3 className="text-sm md:text-xl font-bold text-gray-900 mb-0.5 md:mb-1 leading-tight">Room Finder</h3>
                <p className="text-[11px] md:text-sm text-gray-500 font-medium leading-tight">Find empty classrooms.</p>
              </button>

              <button onClick={() => setActiveTab('teachers')} className="bg-white border border-gray-200 p-4 md:p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center group active:scale-95">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-2 md:mb-4 transition-colors bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white">
                  <Users className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h3 className="text-sm md:text-xl font-bold text-gray-900 mb-0.5 md:mb-1 leading-tight">Teacher Finder</h3>
                <p className="text-[11px] md:text-sm text-gray-500 font-medium leading-tight">Locate staff status.</p>
              </button>

              <button onClick={() => setActiveTab('timetable')} className="bg-white border border-gray-200 p-4 md:p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center group active:scale-95">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-2 md:mb-4 transition-colors bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white">
                  <CalendarDays className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h3 className="text-sm md:text-xl font-bold text-gray-900 mb-0.5 md:mb-1 leading-tight">Timetable</h3>
                <p className="text-[11px] md:text-sm text-gray-500 font-medium leading-tight">View personal schedule.</p>
              </button>

              <button onClick={() => setActiveTab('leave')} className="bg-white border border-gray-200 p-4 md:p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center group active:scale-95">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-2 md:mb-4 transition-colors bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white">
                  <UserMinus className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h3 className="text-sm md:text-xl font-bold text-gray-900 mb-0.5 md:mb-1 leading-tight">On Leave</h3>
                <p className="text-[11px] md:text-sm text-gray-500 font-medium leading-tight">Today's absent faculty.</p>
              </button>

              <button onClick={() => setActiveTab('societies')} className="bg-white border border-gray-200 p-4 md:p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center group active:scale-95">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-2 md:mb-4 transition-colors bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white">
                  <Megaphone className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h3 className="text-sm md:text-xl font-bold text-gray-900 mb-0.5 md:mb-1 leading-tight">Societies</h3>
                <p className="text-[11px] md:text-sm text-gray-500 font-medium leading-tight">Campus events.</p>
              </button>

              <button onClick={() => setIsInstallModalOpen(true)} className="bg-white border border-gray-200 p-4 md:p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center group active:scale-95">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-2 md:mb-4 transition-colors bg-pink-50 text-pink-600 group-hover:bg-pink-600 group-hover:text-white">
                  <Download className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h3 className="text-sm md:text-xl font-bold text-gray-900 mb-0.5 md:mb-1 leading-tight">Get App</h3>
                <p className="text-[11px] md:text-sm text-gray-500 font-medium leading-tight">Install on your phone.</p>
              </button>

              {/* Admin button stretches across 2 columns on mobile so it doesn't look like an odd one out */}
              <button onClick={() => { setIsAdminOpen(true); setLoginError(''); }} className="col-span-2 sm:col-span-1 bg-white border border-gray-200 p-4 md:p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center group active:scale-95">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-2 md:mb-4 transition-colors bg-gray-100 text-gray-700 group-hover:bg-gray-800 group-hover:text-white">
                  <Lock className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h3 className="text-sm md:text-xl font-bold text-gray-900 mb-0.5 md:mb-1 leading-tight">Admin Login</h3>
                <p className="text-[11px] md:text-sm text-gray-500 font-medium leading-tight">Authorized access only.</p>
              </button>

            </div>
          </div>
        )}

        {/* TIME CONTROLS */}
        {(activeTab === 'rooms' || activeTab === 'teachers') && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
             <div className="flex items-center gap-2 mb-4 text-gray-500 text-xs font-bold uppercase tracking-widest">
                <Clock className="w-4 h-4 text-red-600" /> Global Time Settings
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all">
                    {Object.values(DayOfWeek).map(day => <option key={day} value={day}>{day}</option>)}
                  </select>
                </div>
                <div>
                  <select value={selectedTimeIndex} onChange={(e) => setSelectedTimeIndex(Number(e.target.value))} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all">
                    {TIME_SLOTS.map((slot, index) => <option key={index} value={index}>{slot}</option>)}
                  </select>
                </div>
             </div>
          </div>
        )}

        {/* --- TIMETABLE TAB --- */}
        {activeTab === 'timetable' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-xl shadow-sm flex items-start gap-3">
               <AlertCircle className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
               <div>
                 <h3 className="text-yellow-800 font-bold text-sm uppercase tracking-wide">Notice</h3>
                 <p className="text-yellow-700 text-sm mt-1">
                   Only <b>B.Com (Hons) Sem II, IV & VI</b> has been updated. SEC, VAC & AEC are not yet added properly. Errors can be expected as the timetables are complex and subject to changes. Corrections are ongoing!
                 </p>
               </div>
            </div>

            {!activeTimetable ? (
               <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center max-w-md mx-auto mt-10">
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-10 h-10 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">My Timetable</h2>
                  <p className="text-gray-500 text-sm mb-8">Enter your College Roll Number to view your personalized daily class schedule.</p>
                  
                  <form onSubmit={handleSearchTimetable} className="space-y-4">
                     <div className="relative">
                       <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                       <input 
                         type="text" 
                         placeholder="e.g. 24BC008" 
                         value={timetableRollNo}
                         onChange={(e) => setTimetableRollNo(e.target.value.toUpperCase())}
                         className="w-full text-center text-lg p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all uppercase placeholder:normal-case font-bold text-gray-800"
                       />
                     </div>
                     <button type="submit" className="w-full bg-red-800 text-white font-bold py-3.5 rounded-xl hover:bg-red-900 transition-colors shadow-md active:scale-95">
                       View Schedule
                     </button>
                  </form>
               </div>
            ) : (
               <div className="max-w-3xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                     <div>
                       <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                         <CalendarDays className="w-6 h-6 text-red-600" /> My Schedule
                       </h2>
                       <p className="text-gray-500 font-medium mt-1">Roll No: <span className="text-gray-900 font-bold bg-gray-100 px-2 py-0.5 rounded">{timetableRollNo}</span></p>
                     </div>
                     <button 
                       onClick={() => { setActiveTimetable(null); setTimetableRollNo(''); }} 
                       className="text-sm font-bold text-gray-600 bg-gray-100 px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                     >
                       <Search className="w-4 h-4" /> Change Roll No
                     </button>
                  </div>

                  <div className="flex overflow-x-auto gap-2 pb-4 mb-2 scrollbar-hide">
                    {Object.values(DayOfWeek).map(day => (
                      <button 
                        key={day}
                        onClick={() => setTimetableDay(day)}
                        className={`px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                          timetableDay === day 
                          ? 'bg-red-800 text-white shadow-md scale-105' 
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                     <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                        <span className="font-bold text-gray-800">{timetableDay}'s Classes</span>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{formattedDate}</span>
                     </div>

                     <div className="p-4 space-y-3">
                        {activeTimetable[timetableDay] && activeTimetable[timetableDay].length > 0 ? (
                           TIME_SLOTS.map((timeLabel, index) => {
                              const classData = activeTimetable[timetableDay].find((c: any) => c.periodIndex === index);
                              const hasClass = !!classData;
                              
                              const lastClassIndex = Math.max(...activeTimetable[timetableDay].map((c: any) => c.periodIndex));
                              if (index > lastClassIndex) return null;

                              return (
                                <div key={index} className={`relative flex gap-4 p-3 rounded-xl border transition-all ${
                                   hasClass ? 'bg-white border-red-100 shadow-sm' : 'bg-gray-50 border-gray-100 border-dashed opacity-60'
                                }`}>
                                   
                                   <div className="w-20 shrink-0 flex flex-col justify-center items-center border-r border-gray-100 pr-3">
                                      <span className={`text-sm font-bold ${hasClass ? 'text-red-700' : 'text-gray-500'}`}>{timeLabel.split(' ')[0]}</span>
                                      <span className="text-[10px] text-gray-400 uppercase">{timeLabel.split(' ')[1]}</span>
                                   </div>

                                   <div className="flex-1 flex flex-col justify-center">
                                      {hasClass ? (
                                        <>
                                           <div className="flex justify-between items-start mb-1">
                                             <h4 className="font-bold text-gray-900 text-base leading-tight">
                                               {classData.subject}
                                             </h4>
                                             <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                                classData.type === 'Lecture' ? 'bg-blue-50 text-blue-700' :
                                                classData.type === 'Tutorial' ? 'bg-purple-50 text-purple-700' :
                                                'bg-green-50 text-green-700'
                                             }`}>
                                                {classData.type}
                                             </span>
                                           </div>
                                           <div className="flex items-center gap-3 text-sm mt-1">
                                              <span className="flex items-center gap-1 text-gray-600 font-medium">
                                                <MapPin className="w-3.5 h-3.5 text-red-500" /> Room {classData.room}
                                              </span>
                                              <span className="flex items-center gap-1 text-gray-500">
                                                <Users className="w-3.5 h-3.5" /> {classData.teacher}
                                              </span>
                                           </div>
                                        </>
                                      ) : (
                                        <div className="flex items-center gap-2 text-gray-500">
                                           <Timer className="w-4 h-4" />
                                           <span className="font-medium text-sm">Free Slot / Break</span>
                                        </div>
                                      )}
                                   </div>
                                </div>
                              );
                           })
                        ) : (
                           <div className="text-center py-12">
                             <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                             <p className="font-bold text-lg text-gray-900">No Classes Scheduled!</p>
                             <p className="text-gray-500 text-sm mt-1">Enjoy your day off.</p>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            )}
          </div>
        )}

        {/* --- ROOM FINDER TAB --- */}
        {activeTab === 'rooms' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             
             <TeachersOnLeaveDashboard />

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl text-white p-5 shadow-lg flex items-center justify-between relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                   <div className="relative z-10">
                     <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Available Rooms</p>
                     <p className="text-4xl font-extrabold mt-1 tracking-tight">{roomStats.available}</p>
                   </div>
                   <div className="bg-white/10 p-3 rounded-xl relative z-10"><CheckCircle className="w-6 h-6 text-green-400" /></div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Room Type</label>
                   <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-red-500">
                      <option value="All">All Types</option>
                      <option value="Lecture Hall">Lecture Hall</option>
                      <option value="Lab">Lab</option>
                      <option value="Tutorial Room">Tutorial Room</option>
                   </select>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Search</label>
                   <div className="relative">
                     <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                     <input type="text" placeholder="e.g. T1, R20" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 p-2.5 text-sm font-medium focus:ring-2 focus:ring-red-500" />
                   </div>
                </div>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {availableRooms.map((room) => {
                  const duration = calculateFreeDuration(room, selectedTimeIndex);
                  const isLongDuration = duration >= 3; 

                  return (
                    <button 
                      key={room.id}
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`relative bg-white rounded-xl border p-5 flex flex-col items-center justify-center text-center transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95 group
                        ${(room as any).tags ? 'border-green-400 ring-2 ring-green-50' : 'border-gray-200 hover:border-red-200'}
                      `}
                    >
                      {isLongDuration && !(room as any).tags && (
                         <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-current" /> Best Pick
                         </div>
                      )}

                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 text-xl font-bold shadow-sm transition-colors
                        ${(room as any).tags ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-600 group-hover:bg-red-50 group-hover:text-red-600'}
                      `}>
                        {room.name.replace(/[^0-9]/g, '') || room.name.charAt(0)}
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg">{room.name}</h3>
                      
                      {(room as any).tags ? (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full mt-2 font-bold bg-green-100 text-green-700">
                          FREED UP
                        </span>
                      ) : (
                        <div className="flex items-center gap-1 mt-2 bg-gray-100 px-2 py-1 rounded-full">
                          <Timer className="w-3 h-3 text-gray-500" />
                          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">
                            {duration > 5 ? 'All Day' : `${duration} Hours`}
                          </span>
                        </div>
                      )}

                      <span className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-4 h-4 text-gray-300" />
                      </span>
                    </button>
                  );
                })}
             </div>
          </div>
        )}

        {/* --- TEACHER FINDER TAB --- */}
        {activeTab === 'teachers' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6 sticky top-24 z-30">
               <div className="relative">
                 <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                 <input 
                   type="text" 
                   placeholder="Search teacher..."
                   value={finderSearchQuery}
                   onChange={(e) => setFinderSearchQuery(e.target.value)}
                   className="w-full text-lg pl-12 pr-4 py-3 bg-gray-50 rounded-xl outline-none border border-transparent focus:bg-white focus:border-red-300 transition-all placeholder:text-gray-400"
                 />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {visibleEntities.map((entity: any) => {
                 const statusInfo = getEntityStatus(entity);
                 return (
                   <div key={entity.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start mb-3">
                         <div className="bg-gray-100 p-2.5 rounded-xl text-gray-500 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                           <GraduationCap className="w-6 h-6" />
                         </div>
                         <div className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5
                            ${statusInfo.color === 'red' ? 'bg-red-50 text-red-700' : 
                              statusInfo.color === 'blue' ? 'bg-blue-50 text-blue-700' : 
                              'bg-green-50 text-green-700'}`}>
                             <statusInfo.icon className="w-3 h-3" /> {statusInfo.status}
                         </div>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">{entity.name}</h3>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mt-1">{entity.department}</p>
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-gray-400" /> {statusInfo.detail}
                        </p>
                      </div>
                   </div>
                 );
               })}
            </div>
            {visibleEntities.length === 0 && <div className="text-center py-12 text-gray-500">No matching results found.</div>}
          </div>
        )}

        {/* --- TEACHERS ON LEAVE TAB --- */}
        {activeTab === 'leave' && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <UserMinus className="w-6 h-6 text-orange-500" /> Absent Faculty List
              </h2>
              <TeachersOnLeaveDashboard />
           </div>
        )}

        {/* --- SOCIETY ANNOUNCEMENTS TAB --- */}
        {activeTab === 'societies' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             
             <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl text-white p-6 shadow-lg mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                   <h2 className="text-2xl font-bold flex items-center gap-2"><Megaphone className="w-6 h-6 text-yellow-300" /> Upcoming Society Events</h2>
                   <p className="text-red-100 mt-2">Discover what's happening around campus this week.</p>
                </div>
                <div className="text-center md:text-right">
                   <a 
                      href="mailto:abcddcba121202@gmail.com?subject=List%20Society%20Event&body=Hi,%20I%20would%20like%20to%20list%20an%20event.%0A%0ASociety%20Name:%20%0AEvent%20Name:%20%0ADate:%20%0ATime:%20%0AVenue:%20%0ADescription:%20"
                      className="bg-white text-red-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md hover:bg-gray-100 transition-all active:scale-95"
                   >
                      <Mail className="w-5 h-5" /> List Your Event
                   </a>
                   <p className="text-xs text-red-200 mt-2 font-medium opacity-80">Listing starts @ ₹5/day</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {SOCIETY_EVENTS.map(event => (
                 <div key={event.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
                    
                    <div className="relative z-10">
                       <span className="inline-block bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md mb-3">
                         {event.type}
                       </span>
                       <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1">{event.event}</h3>
                       <p className="text-sm font-semibold text-gray-500 mb-4">{event.society}</p>
                       
                       <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                             <CalendarDays className="w-4 h-4 text-red-500" /> {event.date}
                          </div>
                          <div className="flex items-center gap-2">
                             <Clock className="w-4 h-4 text-red-500" /> {event.time}
                          </div>
                          <div className="flex items-center gap-2">
                             <MapPin className="w-4 h-4 text-red-500" /> {event.location}
                          </div>
                       </div>
                       
                       <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-sm text-gray-600 leading-relaxed italic">"{event.description}"</p>
                       </div>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm space-y-8">
          
          <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100 space-y-3">
            <h3 className="font-semibold text-gray-900">Disclaimer & Contact</h3>
            <p className="leading-relaxed">
              This website is for easing the process of finding empty rooms. It is made out of curiosity 
              and to help students. All the data used to make this website is freely publicly available 
              on the SRCC website. Please note that minor errors may be present and shifts in classes 
              can happen with changes in timetables. There might be 5-10% data mismatch at max due to the complex structure of Timetables and accompanying changes. Any money earned through this website will be used to keep it operational.
            </p>
            <p className="pt-2 font-medium">
              If you want to reach out or give any suggestion, feedback, complaint, or anything else, kindly fill this{' '}
              <a 
                href="https://forms.gle/zeomA3EvBPz2BGmBA" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-red-700 hover:text-red-900 underline decoration-red-300 underline-offset-2"
              >
                Feedback Form
              </a>
              {' '}or mail us at{' '}
              <a 
                href="mailto:abcddcba121202@gmail.com"
                className="text-red-700 hover:text-red-900 underline decoration-red-300 underline-offset-2"
              >
                abcddcba121202@gmail.com
              </a>.
            </p>
          </div>
          
          <div>
            <p>Data derived from SRCC Time Table 2025-26.</p>
            <p className="mt-1">Note: Break time is usually 01:30 PM - 02:00 PM.</p>
            <p>Not an official website.</p>
          </div>
        </div>
      </footer>

      {/* --- MODAL: ROOM TIMELINE --- */}
      {selectedRoomId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-5 bg-gray-900 text-white flex justify-between items-center shrink-0">
                 <div>
                   <h2 className="font-bold text-2xl flex items-center gap-2">
                     {selectedRoomId}
                     <span className="text-xs font-normal bg-white/20 px-2 py-0.5 rounded-full text-gray-200">Timeline</span>
                   </h2>
                   <p className="text-gray-400 text-xs mt-1">{getDayName(selectedDay)} • {formattedDate}</p>
                 </div>
                 <button onClick={() => setSelectedRoomId(null)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all">✕</button>
              </div>

              <div className="overflow-y-auto p-0 bg-gray-50 flex-1">
                 <div className="p-4 bg-white border-b border-gray-100 sticky top-0 z-10">
                   <button 
                     onClick={() => {
                        const text = `Hey! I'm in Room ${selectedRoomId} at SRCC. Come join!`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                     }}
                     className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95"
                   >
                     <MessageCircle className="w-5 h-5" /> Share Location
                   </button>
                 </div>

                 <div className="p-4 space-y-3">
                   {selectedRoomTimeline.map((slot, index) => {
                     const isCurrentSlot = index === selectedTimeIndex;
                     const timeLabel = TIME_SLOTS[index];
                     
                     return (
                       <div key={index} className={`relative flex gap-4 p-3 rounded-xl border transition-all 
                          ${slot ? 
                             (slot.isAbsent ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200 opacity-70') 
                             : 'bg-green-50 border-green-200'}
                          ${isCurrentSlot ? 'ring-2 ring-offset-2 ring-red-500 shadow-lg scale-[1.02] z-10 opacity-100' : ''}
                       `}>
                          <div className="w-16 shrink-0 flex flex-col justify-center items-center border-r border-gray-100 pr-3">
                             <span className="text-sm font-bold text-gray-900">{timeLabel.split(' ')[0]}</span>
                             <span className="text-[10px] text-gray-400 uppercase">{timeLabel.split(' ')[1]}</span>
                          </div>

                          <div className="flex-1 flex flex-col justify-center">
                             {slot ? (
                               <>
                                  <div className="flex justify-between items-start">
                                    <h4 className={`font-bold text-sm ${slot.isAbsent ? 'text-yellow-700' : 'text-gray-800'}`}>
                                      {slot.isAbsent ? 'Freed Up (Absent)' : 'Occupied'}
                                    </h4>
                                    {slot.isAbsent && <span className="bg-yellow-200 text-yellow-800 text-[10px] px-1.5 py-0.5 rounded font-bold">FREE</span>}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                    {slot.teacher} 
                                  </p>
                               </>
                             ) : (
                               <div className="flex items-center gap-2 text-green-700">
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="font-bold text-sm">Empty</span>
                               </div>
                             )}
                          </div>
                       </div>
                     );
                   })}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* INSTALL MODAL */}
      {isInstallModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-red-800 text-white flex justify-between items-center">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Download className="w-5 h-5" /> Install App
              </h2>
              <button onClick={() => setIsInstallModalOpen(false)} className="hover:bg-red-700 p-1 rounded">✕</button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto text-gray-700">
               <div>
                 <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                   📱 Android (Chrome)
                 </h3>
                 <ol className="list-decimal pl-5 space-y-1 text-sm">
                   <li>Open <b>Google Chrome</b> on your Android device.</li>
                   <li>Go to the website you want to add.</li>
                   <li>Tap the <b>three-dot menu</b> in the top-right corner.</li>
                   <li>Select <b>“Add to Home screen.”</b></li>
                   <li>Edit the name if required, then tap <b>Add</b>.</li>
                   <li>The website will now appear on your home screen.</li>
                 </ol>
               </div>
               <div>
                 <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                   <Share className="w-5 h-5 text-blue-600" /> iPhone / iPad (Safari)
                 </h3>
                 <ol className="list-decimal pl-5 space-y-1 text-sm">
                   <li>Open <b>Safari</b> on your iPhone or iPad.</li>
                   <li>Go to the website you want to add.</li>
                   <li>Tap the <b>Share button</b> (square with an upward arrow).</li>
                   <li>Scroll down and tap <b>“Add to Home Screen.”</b></li>
                   <li>Edit the name if required, then tap <b>Add</b>.</li>
                   <li>The website will now appear on your home screen.</li>
                 </ol>
               </div>
            </div>

            <div className="p-4 bg-gray-50 border-t text-center">
              <button 
                onClick={() => setIsInstallModalOpen(false)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold text-gray-700 transition-colors"
              >
                Close Instructions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN MODAL */}
      {isAdminOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-red-800 text-white flex justify-between items-center">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Lock className="w-5 h-5" /> Admin Attendance
              </h2>
              <button onClick={() => setIsAdminOpen(false)} className="hover:bg-red-700 p-1 rounded">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {!isLoggedIn ? (
                <div className="space-y-4">
                  <p className="text-gray-600 text-center">Enter Access Code</p>
                  
                  {loginError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm font-medium animate-pulse">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {loginError}
                    </div>
                  )}

                  <input 
                    type="password" 
                    value={adminPass} 
                    onChange={e => setAdminPass(e.target.value)}
                    className="w-full p-3 border rounded-xl text-center text-lg tracking-widest focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="••••••••"
                  />
                  <button onClick={handleAdminLogin} className="w-full bg-red-800 text-white py-3 rounded-xl font-bold hover:bg-red-900 transition-colors">
                    Unlock Dashboard
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-500">Mark absent teachers to free rooms.</p>
                    <button onClick={() => setIsLoggedIn(false)} className="text-xs text-red-600 flex items-center gap-1">
                      <LogOut className="w-3 h-3" /> Logout
                    </button>
                  </div>

                  <input
                    type="text"
                    className="block w-full p-2 border border-gray-300 rounded-lg bg-white sm:text-sm mb-4"
                    placeholder="Search for a teacher..."
                    value={adminSearchQuery}
                    onChange={(e) => setAdminSearchQuery(e.target.value)}
                  />
                  
                  <div className="space-y-2">
                    {Object.values(TEACHER_SCHEDULES)
                      .filter(t => t.id !== 'ADMIN')
                      .filter(t => t.name.toLowerCase().includes(adminSearchQuery.toLowerCase()))
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                        <div>
                          <p className="font-bold text-gray-800">{t.name}</p>
                          <p className="text-xs text-gray-500">{t.department}</p>
                        </div>
                        <button
                          onClick={() => { toggleAbsence(t.id); }}
                          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                            absentTeachers.includes(t.id)
                              ? 'bg-red-500 text-white shadow-md'
                              : 'bg-white border border-gray-300 text-gray-600'
                          }`}
                        >
                          {absentTeachers.includes(t.id) ? 'ABSENT' : 'Present'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;