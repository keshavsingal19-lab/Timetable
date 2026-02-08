import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Clock, MapPin, Search, Filter, Lock, CheckCircle, XCircle, LogOut, AlertTriangle, AlertCircle, UserMinus, CalendarDays } from 'lucide-react';
import { DayOfWeek, TIME_SLOTS, RoomData } from './types';
import { ROOMS } from './data';
import { TEACHER_SCHEDULES } from './teacherData';

const getDayName = (day: DayOfWeek): string => day;

function App() {
  // --- STATE VARIABLES ---
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(DayOfWeek.Monday);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('All');

  // Admin & Security State
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [absentTeachers, setAbsentTeachers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState(''); 

  // Blocking State
  const [isSiteBlocked, setIsSiteBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');

  // --- HELPER: Get Current Date Details ---
  // We use this to display the date and enforce "Today Only" logic
  const todayDateObj = new Date();
  const currentDayName = todayDateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = todayDateObj.toLocaleDateString('en-GB', { 
    day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' 
  });

  // --- 1. INITIAL CHECKS (Run on Load) ---
  useEffect(() => {
    // A. Set default day to today (if it's a weekday)
    if (Object.values(DayOfWeek).includes(currentDayName as DayOfWeek)) {
      setSelectedDay(currentDayName as DayOfWeek);
    }
    
    // B. Check Block Status
    fetch('/api/check_status')
      .then(res => res.json())
      .then(data => {
        if (data.blocked) {
          setIsSiteBlocked(true);
          setBlockMessage(data.message);
        }
      })
      .catch(err => console.error("Block check failed", err));

    // C. Fetch existing attendance
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
  }, []); // Empty dependency array = runs once on mount

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
        // FIX: Password is NO LONGER cleared here, so it stays available for updates
        setLoginError('');
      } else {
        if (response.status === 403) {
           setIsSiteBlocked(true);
           setBlockMessage(data.message);
           setIsAdminOpen(false); 
        } else {
           if (data.attemptsLeft !== undefined) {
             setLoginError(`Incorrect password. ${data.attemptsLeft} attempts remaining.`);
           } else {
             setLoginError(data.error || "Invalid Access Code");
           }
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
      setLoginError("Connection error. Please try again.");
    }
  };

  const toggleAbsence = async (tid: string) => {
    const isAbsent = !absentTeachers.includes(tid);
    
    // Optimistic UI update
    setAbsentTeachers(prev => isAbsent ? [...prev, tid] : prev.filter(id => id !== tid));

    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          teacherId: tid, 
          isAbsent, 
          password: adminPass 
        })
      });
      
      if (!response.ok) {
        throw new Error("Unauthorized or Failed");
      }
    } catch (e) {
      console.error("Save failed", e);
      alert("Failed to save. Session may have expired.");
      setAbsentTeachers(prev => isAbsent ? prev.filter(id => id !== tid) : [...prev, tid]);
    }
  };

  // --- 3. CALCULATION LOGIC ---

  const freedRooms = useMemo(() => {
    // LOGIC CHECK: Only apply absences if the selected day matches TODAY
    // If user selects "Tuesday" but today is "Monday", absences shouldn't apply.
    if (selectedDay !== currentDayName) {
      return []; 
    }

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
    const staticRooms = ROOMS.filter(room => {
      return room.emptySlots[selectedDay]?.includes(selectedTimeIndex);
    });

    const allRooms = [...staticRooms];
    freedRooms.forEach(freed => {
      if (!allRooms.find(r => r.id === freed.id)) {
        allRooms.push(freed);
      }
    });

    return allRooms.filter(room => {
      const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'All' || room.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [selectedDay, selectedTimeIndex, searchQuery, filterType, freedRooms]);

  const stats = useMemo(() => {
    const total = ROOMS.length;
    const available = availableRooms.length;
    const percentage = Math.round((available / total) * 100);
    return { available, total, percentage };
  }, [availableRooms]);


  // --- 4. RENDER (The UI) ---

  if (isSiteBlocked) {
    return (
      <div className="min-h-screen bg-red-900 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full animate-pulse">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="w-16 h-16 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-red-700 mb-2">ACCESS DENIED</h1>
          <p className="text-gray-800 font-semibold text-lg">
            {blockMessage || "You were trying to breach into admin console, you are blocked for 1 hour."}
          </p>
          <p className="text-gray-500 text-sm mt-4">
            Your IP has been logged and temporarily banned.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      <header className="bg-red-800 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg">
                <MapPin className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold leading-none">SRCC Empty Room Finder</h1>
                <p className="text-red-200 text-sm mt-1">Academic Session 2025-26</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 bg-red-900/50 rounded-lg p-2 px-4 border border-red-700/50">
                 <div className="text-center">
                    <span className="block text-2xl font-bold text-yellow-400">{stats.available}</span>
                    <span className="text-xs text-red-200 uppercase tracking-wider">Free Rooms</span>
                 </div>
                 <div className="h-8 w-px bg-red-700"></div>
                 <div className="text-center">
                    <span className="block text-2xl font-bold">{stats.total}</span>
                    <span className="text-xs text-red-200 uppercase tracking-wider">Total</span>
                 </div>
              </div>

              <button 
                onClick={() => { setIsAdminOpen(true); setLoginError(''); }}
                className="flex items-center gap-2 bg-white text-red-800 hover:bg-gray-100 px-4 py-2 rounded-lg font-bold shadow-sm transition-all text-sm"
              >
                <Lock className="w-4 h-4" />
                Admin Login
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* NEW DASHBOARD: Teachers on Leave */}
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

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Calendar className="w-4 h-4 text-red-600" />
                Select Day
              </label>
              <select 
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5 transition-colors hover:bg-gray-100"
              >
                {Object.values(DayOfWeek).map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Clock className="w-4 h-4 text-red-600" />
                Select Time Slot
              </label>
              <select 
                value={selectedTimeIndex}
                onChange={(e) => setSelectedTimeIndex(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5 transition-colors hover:bg-gray-100"
              >
                {TIME_SLOTS.map((slot, index) => (
                  <option key={index} value={index}>{slot}</option>
                ))}
              </select>
            </div>

             <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Filter className="w-4 h-4 text-red-600" />
                Room Type
              </label>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5 transition-colors hover:bg-gray-100"
              >
                <option value="All">All Types</option>
                <option value="Lecture Hall">Lecture Hall</option>
                <option value="Lab">Lab</option>
                <option value="Seminar Room">Seminar Room</option>
                <option value="Tutorial Room">Tutorial Room</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Search className="w-4 h-4 text-red-600" />
                Search Room
              </label>
              <input 
                type="text"
                placeholder="e.g. T1 or R20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              Available Rooms
              <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {selectedDay} • {TIME_SLOTS[selectedTimeIndex]}
              </span>
            </h2>

            {availableRooms.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {availableRooms.map((room) => (
                  <div 
                    key={room.id}
                    className={`group bg-white rounded-lg border hover:shadow-md transition-all duration-200 p-4 flex flex-col items-center justify-center text-center cursor-default
                      ${(room as any).tags ? 'border-green-400 ring-1 ring-green-100' : 'border-gray-200 hover:border-red-500'}
                    `}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors
                       ${(room as any).tags ? 'bg-green-100 text-green-700' : 'bg-green-50 text-green-600 group-hover:bg-red-50 group-hover:text-red-600'}
                    `}>
                      <span className="font-bold text-lg">{room.name.replace(/[^0-9]/g, '') || room.name.charAt(0)}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">{room.name}</h3>
                    
                    {(room as any).tags ? (
                       <span className="text-xs px-2 py-1 rounded-full mt-2 font-bold bg-green-100 text-green-800 border border-green-200">
                         FREED UP
                       </span>
                    ) : (
                      <span className={`text-xs px-2 py-1 rounded-full mt-2 font-medium
                        ${room.type === 'Lab' ? 'bg-purple-100 text-purple-700' : 
                          room.type === 'Seminar Room' ? 'bg-orange-100 text-orange-700' : 
                          room.type === 'Tutorial Room' ? 'bg-teal-100 text-teal-700' :
                          'bg-blue-100 text-blue-700'}`}
                      >
                        {room.type}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No rooms available</h3>
                <p className="text-gray-500 mt-1">
                  Try selecting a different time slot or day. Labs, Lecture Halls, and Tutorial Rooms might all be occupied.
                </p>
              </div>
            )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm space-y-8">
          
          <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100 space-y-3">
            <h3 className="font-semibold text-gray-900">Disclaimer & Contact</h3>
            <p className="leading-relaxed">
              <b>Corrections have been made in Rooms!</b>
              This website is for easing the process of finding empty rooms. It is made out of curiosity 
              and to help students. All the data used to make this website is freely publicly available 
              on the SRCC website. Please note that minor errors may be present and shifts in classes 
              can happen with changes in timetables.
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
          </div>
        </div>
      </footer>

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
                  
                  <div className="space-y-2">
                    {Object.values(TEACHER_SCHEDULES)
                      .filter(t => t.id !== 'ADMIN')
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
                    {Object.keys(TEACHER_SCHEDULES).length <= 1 && (
                      <p className="text-center text-gray-400 italic p-4">
                        Teacher database is currently empty.
                      </p>
                    )}
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