import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, Clock, MapPin, Search, Filter, Lock, CheckCircle, 
  XCircle, LogOut, AlertTriangle, AlertCircle, UserMinus, 
  CalendarDays, Download, Share, Users, GraduationCap, 
  ChevronRight, ArrowRight, MessageCircle 
} from 'lucide-react';
import { DayOfWeek, TIME_SLOTS, RoomData } from './types';
import { ROOMS } from './data';
import { TEACHER_SCHEDULES } from './teacherData';

const getDayName = (day: DayOfWeek): string => day;

function App() {
  // --- STATE VARIABLES ---
  
  // 1. Navigation & Global
  const [activeTab, setActiveTab] = useState<'rooms' | 'teachers'>('rooms'); 
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(DayOfWeek.Monday);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState<number>(0);
  
  // 2. Room Finder
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('All');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null); // <--- NEW: Selected Room for Modal

  // 3. Teacher Finder
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');

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

  // --- HELPER: Get Current Date Details ---
  const todayDateObj = new Date();
  const currentDayName = todayDateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = todayDateObj.toLocaleDateString('en-GB', { 
    day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' 
  });

  // --- 1. INITIAL CHECKS (Run on Load) ---
  useEffect(() => {
    // Set default day
    if (Object.values(DayOfWeek).includes(currentDayName as DayOfWeek)) {
      setSelectedDay(currentDayName as DayOfWeek);
      
      // Auto-select current time slot
      const currentHour = todayDateObj.getHours();
      const currentMinutes = todayDateObj.getMinutes();
      // Simple logic to map hour to slot (approximate)
      // 8:30=0, 9:30=1, etc.
      let estimatedSlot = currentHour - 8; 
      if (currentMinutes < 30) estimatedSlot -= 1;
      if (estimatedSlot >= 0 && estimatedSlot < TIME_SLOTS.length) {
         setSelectedTimeIndex(estimatedSlot);
      }
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

  // --- 3. LOGIC: ROOM FINDER ---

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

    return allRooms.filter(room => {
      const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'All' || room.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [selectedDay, selectedTimeIndex, searchQuery, filterType, freedRooms]);

  const roomStats = useMemo(() => {
    return { available: availableRooms.length, total: ROOMS.length };
  }, [availableRooms]);

  // --- 4. LOGIC: ROOM TIMELINE (The "Better" Feature) ---
  
  const getRoomTimeline = (roomId: string) => {
    const timeline = new Array(TIME_SLOTS.length).fill(null);
    const dayName = getDayName(selectedDay);

    // Scan all teachers to find who is in this room
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

    return timeline; // Returns array where index = slot, value = null (Free) or Object (Occupied)
  };

  const selectedRoomTimeline = useMemo(() => {
    if (!selectedRoomId) return [];
    return getRoomTimeline(selectedRoomId);
  }, [selectedRoomId, selectedDay, absentTeachers]);


  // --- 5. LOGIC: TEACHER FINDER ---

  const getTeacherStatus = (teacher: any) => {
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
        detail: `${currentClass.startTime} - ${currentClass.endTime}` 
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


  // --- 6. RENDER ---

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
               {/* NAV PILLS */}
               <div className="bg-red-900/50 p-1 rounded-xl flex items-center mr-2 border border-red-700/50">
                 <button 
                   onClick={() => setActiveTab('rooms')}
                   className={`px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-200 ${activeTab === 'rooms' ? 'bg-white text-red-900 shadow-sm transform scale-105' : 'text-red-200 hover:bg-white/10'}`}
                 >
                   <MapPin className="w-4 h-4" /> Rooms
                 </button>
                 <button 
                   onClick={() => setActiveTab('teachers')}
                   className={`px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-200 ${activeTab === 'teachers' ? 'bg-white text-red-900 shadow-sm transform scale-105' : 'text-red-200 hover:bg-white/10'}`}
                 >
                   <Users className="w-4 h-4" /> Teachers
                 </button>
               </div>

               <button onClick={() => setIsInstallModalOpen(true)} className="bg-white/10 text-white p-2.5 rounded-xl hover:bg-white/20 transition-all active:scale-95"><Download className="w-5 h-5" /></button>
               <button onClick={() => { setIsAdminOpen(true); setLoginError(''); }} className="bg-white/10 text-white p-2.5 rounded-xl hover:bg-white/20 transition-all active:scale-95"><Lock className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TIME CONTROLS */}
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

        {/* --- ROOM FINDER TAB --- */}
        {activeTab === 'rooms' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             
             {/* Teachers on Leave Alert */}
             {absentTeachers.length > 0 && selectedDay === currentDayName && (
                <div className="bg-red-50 rounded-xl border border-red-100 p-4 mb-6 flex items-start gap-3">
                   <UserMinus className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                   <div>
                      <h3 className="text-sm font-bold text-red-900">
                        {absentTeachers.length} Teachers on Leave Today
                      </h3>
                      <p className="text-xs text-red-700 mt-1 leading-relaxed">
                        Rooms for these teachers have been marked as <b>Freed Up</b> automatically.
                      </p>
                   </div>
                </div>
             )}

             {/* Stats & Filters */}
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
             
             {/* Rooms Grid */}
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {availableRooms.map((room) => (
                  <button 
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`relative bg-white rounded-xl border p-5 flex flex-col items-center justify-center text-center transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95 group
                      ${(room as any).tags ? 'border-green-400 ring-2 ring-green-50' : 'border-gray-200 hover:border-red-200'}
                    `}
                  >
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
                      <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full mt-2 font-bold bg-gray-100 text-gray-500">
                        {room.type}
                      </span>
                    )}

                    {/* Hint for Click */}
                    <span className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-4 h-4 text-gray-300" />
                    </span>
                  </button>
                ))}
             </div>
             {availableRooms.length === 0 && (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
                   <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Search className="w-6 h-6 text-gray-400" /></div>
                   <p>No rooms available. Try a different time slot.</p>
                </div>
             )}
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
                   placeholder="Search teacher by name..." 
                   value={teacherSearchQuery}
                   onChange={(e) => setTeacherSearchQuery(e.target.value)}
                   className="w-full text-lg pl-12 pr-4 py-3 bg-gray-50 rounded-xl outline-none border border-transparent focus:bg-white focus:border-red-300 transition-all placeholder:text-gray-400"
                 />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {visibleTeachers.map((teacher: any) => {
                 const statusInfo = getTeacherStatus(teacher);
                 return (
                   <div key={teacher.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all group">
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
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">{teacher.name}</h3>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mt-1">{teacher.department}</p>
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-gray-400" /> {statusInfo.detail}
                        </p>
                      </div>
                   </div>
                 );
               })}
            </div>
            {visibleTeachers.length === 0 && <div className="text-center py-12 text-gray-500">No teachers found.</div>}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-12 py-8 text-center border-t border-gray-200 bg-white">
         <p className="text-sm text-gray-500 font-medium">Built for SRCC Students</p>
         <p className="text-xs text-gray-400 mt-2">Data updated for Session 2025-26</p>
      </footer>

      {/* --- MODAL: ROOM TIMELINE (NEW) --- */}
      {selectedRoomId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
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

              {/* Timeline Scroll Area */}
              <div className="overflow-y-auto p-0 bg-gray-50 flex-1">
                 {/* WhatsApp Share Button */}
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
                          {/* Time Column */}
                          <div className="w-16 shrink-0 flex flex-col justify-center items-center border-r border-gray-100 pr-3">
                             <span className="text-sm font-bold text-gray-900">{timeLabel.split(' ')[0]}</span>
                             <span className="text-[10px] text-gray-400 uppercase">{timeLabel.split(' ')[1]}</span>
                          </div>

                          {/* Content */}
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
             <div className="mx-auto bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mb-4"><Download className="w-6 h-6 text-red-600" /></div>
             <h2 className="text-xl font-bold mb-2">Install App</h2>
             <p className="text-gray-600 text-sm mb-6 leading-relaxed">
               For <b>iPhone (Safari)</b>: Tap <Share className="w-3 h-3 inline" /> Share & select "Add to Home Screen".
               <br/><br/>
               For <b>Android (Chrome)</b>: Tap ⋮ Menu & select "Add to Home screen".
             </p>
             <button onClick={() => setIsInstallModalOpen(false)} className="w-full bg-gray-100 py-3 rounded-xl font-bold text-gray-800 hover:bg-gray-200">Close</button>
          </div>
        </div>
      )}

      {/* ADMIN MODAL */}
      {isAdminOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-red-800 text-white flex justify-between items-center">
              <h2 className="font-bold text-lg flex items-center gap-2"><Lock className="w-5 h-5" /> Admin Attendance</h2>
              <button onClick={() => setIsAdminOpen(false)} className="hover:bg-red-700 p-1 rounded">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {!isLoggedIn ? (
                <div className="space-y-4">
                  <p className="text-gray-600 text-center">Enter Access Code</p>
                  {loginError && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium">{loginError}</div>}
                  <input type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} className="w-full p-3 border rounded-xl text-center text-lg tracking-widest" placeholder="••••••••" />
                  <button onClick={handleAdminLogin} className="w-full bg-red-800 text-white py-3 rounded-xl font-bold">Unlock</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4"><p className="text-sm text-gray-500">Mark absent teachers.</p><button onClick={() => setIsLoggedIn(false)} className="text-xs text-red-600 flex items-center gap-1"><LogOut className="w-3 h-3" /> Logout</button></div>
                  <input type="text" className="w-full p-2 border rounded-lg text-sm mb-2" placeholder="Search teacher..." value={adminSearchQuery} onChange={(e) => setAdminSearchQuery(e.target.value)} />
                  <div className="space-y-2">
                    {Object.values(TEACHER_SCHEDULES).filter(t => t.id !== 'ADMIN').filter(t => t.name.toLowerCase().includes(adminSearchQuery.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name)).map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div><p className="font-bold text-gray-800">{t.name}</p></div>
                        <button onClick={() => toggleAbsence(t.id)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${absentTeachers.includes(t.id) ? 'bg-red-500 text-white' : 'bg-white border border-gray-300'}`}>{absentTeachers.includes(t.id) ? 'ABSENT' : 'Present'}</button>
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