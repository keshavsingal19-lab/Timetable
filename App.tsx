import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Clock, MapPin, Search, Filter, Lock, CheckCircle, XCircle, LogOut, AlertTriangle, AlertCircle, UserMinus, CalendarDays, Download, Share, Users, GraduationCap } from 'lucide-react';
import { DayOfWeek, TIME_SLOTS, RoomData } from './types';
import { ROOMS } from './data';
import { TEACHER_SCHEDULES } from './teacherData';

const getDayName = (day: DayOfWeek): string => day;

function App() {
  // --- STATE VARIABLES ---
  
  // 1. Navigation State
  const [activeTab, setActiveTab] = useState<'rooms' | 'teachers'>('rooms'); 

  // 2. Global Time Settings
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(DayOfWeek.Monday);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState<number>(0);
  
  // 3. Room Finder State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('All');

  // 4. Teacher Finder State
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');

  // 5. Admin & Security State
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [absentTeachers, setAbsentTeachers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState(''); 
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  // 6. Install Modal State
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // 7. Blocking State
  const [isSiteBlocked, setIsSiteBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');

  // --- HELPER: Get Current Date Details ---
  const todayDateObj = new Date();
  const currentDayName = todayDateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = todayDateObj.toLocaleDateString('en-GB', { 
    day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' 
  });

  // --- 1. INITIAL CHECKS (Run on Load) ---
  useEffect(() => {
    // Set default day to today (if it's a weekday)
    if (Object.values(DayOfWeek).includes(currentDayName as DayOfWeek)) {
      setSelectedDay(currentDayName as DayOfWeek);
    }
    
    // Check Block Status
    fetch('/api/check_status')
      .then(res => res.json())
      .then(data => {
        if (data.blocked) {
          setIsSiteBlocked(true);
          setBlockMessage(data.message);
        }
      })
      .catch(err => console.error("Block check failed", err));

    // Fetch Attendance
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

  // --- 3. LOGIC: ROOM FINDER ---

  const freedRooms = useMemo(() => {
    // Only apply absences if the selected day matches TODAY
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

  const roomStats = useMemo(() => {
    const total = ROOMS.length;
    const available = availableRooms.length;
    return { available, total };
  }, [availableRooms]);


  // --- 4. LOGIC: TEACHER FINDER (New Feature) ---

  const getTeacherStatus = (teacher: any) => {
    // A. Check Absent List (Only valid if looking at Today)
    if (absentTeachers.includes(teacher.id) && selectedDay === currentDayName) {
      return { status: 'On Leave', color: 'red', icon: UserMinus, detail: 'Marked Absent' };
    }
    
    // B. Check Schedule
    const daySchedule = teacher.schedule[selectedDay];
    if (!daySchedule) return { status: 'Free', color: 'green', icon: CheckCircle, detail: 'No classes today' };
    
    const currentClass = daySchedule.find((c: any) => c.periods.includes(selectedTimeIndex));
    
    if (currentClass) {
      return { 
        status: `In ${currentClass.room}`, 
        color: 'blue', 
        icon: MapPin, 
        detail: `${currentClass.startTime} - ${currentClass.endTime} • ${currentClass.subject || 'Class'}` 
      };
    }
    
    return { status: 'Free', color: 'green', icon: CheckCircle, detail: 'Staff Room / Free' };
  };

  const visibleTeachers = useMemo(() => {
    return Object.values(TEACHER_SCHEDULES)
      .filter(t => t.id !== 'ADMIN')
      .filter(t => t.name.toLowerCase().includes(teacherSearchQuery.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [teacherSearchQuery]);


  // --- 5. RENDER (The UI) ---

  if (isSiteBlocked) {
    return (
      <div className="min-h-screen bg-red-900 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full animate-pulse">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="w-16 h-16 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-red-700 mb-2">ACCESS DENIED</h1>
          <p className="text-gray-800 font-semibold text-lg">
            {blockMessage || "You are blocked."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      
      {/* HEADER */}
      <header className="bg-red-800 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg">
                <MapPin className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold leading-none">SRCC Finder</h1>
                <p className="text-red-200 text-sm mt-1">Academic Session 2025-26</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
               {/* TAB SWITCHER */}
               <div className="bg-red-900/50 p-1 rounded-lg flex items-center mr-2">
                 <button 
                   onClick={() => setActiveTab('rooms')}
                   className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'rooms' ? 'bg-white text-red-800 shadow-sm' : 'text-red-200 hover:bg-white/10'}`}
                 >
                   <MapPin className="w-4 h-4" /> Rooms
                 </button>
                 <button 
                   onClick={() => setActiveTab('teachers')}
                   className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'teachers' ? 'bg-white text-red-800 shadow-sm' : 'text-red-200 hover:bg-white/10'}`}
                 >
                   <Users className="w-4 h-4" /> Teachers
                 </button>
               </div>

               {/* ACTION BUTTONS */}
               <button 
                onClick={() => setIsInstallModalOpen(true)}
                className="bg-white/10 text-white p-2 rounded-lg hover:bg-white/20 transition-all"
                title="Install App"
               >
                <Download className="w-5 h-5" />
               </button>

               <button 
                onClick={() => { setIsAdminOpen(true); setLoginError(''); }}
                className="bg-white/10 text-white p-2 rounded-lg hover:bg-white/20 transition-all"
                title="Admin Login"
               >
                <Lock className="w-5 h-5" />
               </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* GLOBAL CONTROLS (Day & Time) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
           <div className="flex items-center gap-2 mb-4 text-gray-500 text-sm font-medium uppercase tracking-wider">
              <Clock className="w-4 h-4" /> Global Settings
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900">Select Day</label>
                <select 
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-3 focus:ring-red-500 focus:border-red-500"
                >
                  {Object.values(DayOfWeek).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900">Select Time</label>
                <select 
                  value={selectedTimeIndex}
                  onChange={(e) => setSelectedTimeIndex(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-3 focus:ring-red-500 focus:border-red-500"
                >
                  {TIME_SLOTS.map((slot, index) => (
                    <option key={index} value={index}>{slot}</option>
                  ))}
                </select>
              </div>
           </div>
        </div>

        {/* --- TAB 1: ROOM FINDER --- */}
        {activeTab === 'rooms' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             
             {/* Teachers on Leave Dashboard (Only relevant for Rooms) */}
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
             </div>

             {/* Filters & Stats */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Stats Card */}
                <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl text-white p-6 shadow-md flex items-center justify-between">
                   <div>
                     <p className="text-red-100 text-sm font-medium">Available Rooms</p>
                     <p className="text-4xl font-bold mt-1">{roomStats.available}</p>
                   </div>
                   <div className="bg-white/20 p-3 rounded-lg">
                     <CheckCircle className="w-8 h-8 text-white" />
                   </div>
                </div>

                {/* Type Filter */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-2">
                   <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                     <Filter className="w-4 h-4" /> Filter Type
                   </label>
                   <select 
                     value={filterType}
                     onChange={(e) => setFilterType(e.target.value)}
                     className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm"
                   >
                      <option value="All">All Types</option>
                      <option value="Lecture Hall">Lecture Hall</option>
                      <option value="Lab">Lab</option>
                      <option value="Seminar Room">Seminar Room</option>
                      <option value="Tutorial Room">Tutorial Room</option>
                   </select>
                </div>

                {/* Room Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-2">
                   <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                     <Search className="w-4 h-4" /> Search Room
                   </label>
                   <input 
                     type="text" 
                     placeholder="e.g. T1 or R20" 
                     value={searchQuery} 
                     onChange={(e) => setSearchQuery(e.target.value)} 
                     className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm" 
                   />
                </div>
             </div>
             
             {/* Rooms Grid */}
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {availableRooms.map((room) => (
                  <div 
                    key={room.id}
                    className={`bg-white rounded-lg border p-4 flex flex-col items-center justify-center text-center transition-all hover:shadow-md cursor-default
                      ${(room as any).tags ? 'border-green-400 ring-1 ring-green-100 shadow-sm' : 'border-gray-200'}
                    `}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 font-bold text-lg
                       ${(room as any).tags ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}
                    `}>
                      {room.name.replace(/[^0-9]/g, '') || room.name.charAt(0)}
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
             {availableRooms.length === 0 && (
                <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
                   No rooms available matching your criteria.
                </div>
             )}
          </div>
        )}

        {/* --- TAB 2: TEACHER FINDER --- */}
        {activeTab === 'teachers' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 flex items-center gap-4">
               <Search className="w-5 h-5 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Search teacher by name (e.g. 'Amit')..." 
                 value={teacherSearchQuery}
                 onChange={(e) => setTeacherSearchQuery(e.target.value)}
                 className="w-full text-lg outline-none text-gray-700 placeholder:text-gray-400"
               />
            </div>

            {/* Teachers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {visibleTeachers.map((teacher: any) => {
                 const statusInfo = getTeacherStatus(teacher);
                 return (
                   <div key={teacher.id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-start justify-between hover:shadow-md transition-all">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{teacher.name}</h3>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">{teacher.department}</p>
                        
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold border
                          ${statusInfo.color === 'red' ? 'bg-red-50 text-red-700 border-red-100' : 
                            statusInfo.color === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                            'bg-green-50 text-green-700 border-green-100'}`}>
                           <statusInfo.icon className="w-4 h-4" />
                           {statusInfo.status}
                        </div>
                        <p className="text-sm text-gray-500 mt-2 pl-1">{statusInfo.detail}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-full">
                        <GraduationCap className="w-6 h-6 text-gray-300" />
                      </div>
                   </div>
                 );
               })}
            </div>
            {visibleTeachers.length === 0 && (
                <div className="text-center py-12 text-gray-500">No teachers found.</div>
            )}
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-8 text-center text-gray-500 text-sm space-y-2">
        <p>Data derived from SRCC Time Table 2025-26.</p>
        <p>
           If you spot errors, please <a href="https://forms.gle/zeomA3EvBPz2BGmBA" target="_blank" rel="noopener noreferrer" className="text-red-700 underline">fill this form</a>.
        </p>
        <p className="text-xs text-gray-400 pt-4">Not an official college app.</p>
      </footer>

      {/* MODAL: INSTALL APP */}
      {isInstallModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
             <div className="mx-auto bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
               <Download className="w-6 h-6 text-red-600" />
             </div>
             <h2 className="text-xl font-bold mb-2">Install App</h2>
             <p className="text-gray-600 text-sm mb-6 leading-relaxed">
               For <b>iPhone (Safari)</b>: Tap <Share className="w-3 h-3 inline" /> Share & select "Add to Home Screen".
               <br/><br/>
               For <b>Android (Chrome)</b>: Tap ⋮ Menu & select "Add to Home screen".
             </p>
             <button onClick={() => setIsInstallModalOpen(false)} className="w-full bg-gray-100 py-3 rounded-xl font-bold text-gray-800 hover:bg-gray-200">
               Close
             </button>
          </div>
        </div>
      )}

      {/* MODAL: ADMIN */}
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

                  {/* SEARCH BAR FOR TEACHERS */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="Search for a teacher..."
                      value={adminSearchQuery}
                      onChange={(e) => setAdminSearchQuery(e.target.value)}
                    />
                  </div>
                  
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