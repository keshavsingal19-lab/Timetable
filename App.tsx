import React, { useState, useMemo, useEffect } from 'react';
import {
  Clock, MapPin, Search, Filter, Lock, CheckCircle,
  XCircle, LogOut, AlertTriangle, AlertCircle, UserMinus,
  CalendarDays, Download, Share, Users, GraduationCap,
  ArrowRight, MessageCircle, Star, Timer, Megaphone, Mail, Home,
  BookOpen, User, UserPlus, Key, Settings, Menu, ShieldCheck, ChevronRight, ChevronLeft,
  Eye, MousePointerClick, Edit, Trash2, LayoutDashboard, Contact, CalendarOff, Globe, Map as LucideMap,
  RefreshCw, Layers, X, Copy, ClipboardCheck, TrendingUp, Calendar, BarChart3, Target, ChevronDown, ChevronUp, ArrowLeft
} from 'lucide-react';
import { DayOfWeek, TIME_SLOTS, RoomData } from './types';
import { ROOMS } from './data';
// --- CONSTANTS & CONFIG ---
const IS_MAINTENANCE = true;
const getDayName = (day: DayOfWeek): string => day;

function App() {
  // --- NAVIGATION & GLOBAL STATES ---
  
    const [activeTab, setActiveTab] = useState<'menu' | 'rooms' | 'teachers' | 'societies' | 'timetable' | 'leave' | 'student_portal' | 'attendance_tracker'>('student_portal');
    
    const [selectedDay, setSelectedDay] = useState<DayOfWeek>(DayOfWeek.Monday);
    const [selectedTimeIndex, setSelectedTimeIndex] = useState<number>(0);

    // --- ROOM & TEACHER FINDER STATES ---
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filterType, setFilterType] = useState<string>('All');
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    
    const [liveRooms, setLiveRooms] = useState<RoomData[]>(ROOMS);
    const [liveTeachers, setLiveTeachers] = useState<any>({});
    
    useEffect(() => {
      // Load cached teachers immediately for instant UI response
      const cached = localStorage.getItem('srcc_teachers_cache');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            setLiveTeachers(parsed);
          }
        } catch (e) {
          console.warn("Failed to parse cached teachers", e);
        }
      }

      fetch('/api/rooms').then(res => res.json()).then(data => {
        if (Array.isArray(data) && data.length > 0) setLiveRooms(data);
      }).catch(() => { });

      fetch('/api/teachers').then(res => res.json()).then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const map: any = {};
          data.forEach((t: any) => map[t.id] = t);
          setLiveTeachers(map);
          localStorage.setItem('srcc_teachers_cache', JSON.stringify(map));
        }
      }).catch(() => { });
    }, []);
  const [finderSearchQuery, setFinderSearchQuery] = useState('');

  // --- ADMIN STATES ---
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [absentTeachers, setAbsentTeachers] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [adminTab, setAdminTab] = useState<'attendance' | 'events' | 'rooms_update'>('attendance');
  const [isRoomUpdateLoading, setIsRoomUpdateLoading] = useState(false);
  const [roomUpdateMsg, setRoomUpdateMsg] = useState('');
  
  // --- STREAMING ROOM SYNC STATES ---
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncTotal, setSyncTotal] = useState(0);
  const [currentRoom, setCurrentRoom] = useState('');
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [syncCompleted, setSyncCompleted] = useState(false);
  const logRef = React.useRef<HTMLDivElement>(null);

  const startSync = async () => {
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

    setSyncing(true);
    setSyncProgress(0);
    setSyncTotal(ALL_ROOM_IDS.length);
    setSyncLogs([]);
    setSyncCompleted(false);
    setCurrentRoom('');
    setRoomUpdateMsg('');

    const BATCH_SIZE = 15;
    const batches: string[][] = [];
    for (let i = 0; i < ALL_ROOM_IDS.length; i += BATCH_SIZE) {
      batches.push(ALL_ROOM_IDS.slice(i, i + BATCH_SIZE));
    }

    let globalProcessed = 0;

    try {
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const isFirstBatch = i === 0;
        
        const response = await fetch('/api/sync_rooms', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomIds: batch,
            totalRooms: ALL_ROOM_IDS.length,
            isFirstBatch,
            processedCount: globalProcessed,
            password: adminPass
          })
        });

        if (!response.ok || !response.body) {
          if (response.status === 401) throw new Error("Unauthorized");
          throw new Error('Batch ' + (i+1) + ' failed to start.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const event = JSON.parse(line.slice(6));

              if (event.type === 'start') {
                if (isFirstBatch) setSyncLogs(prev => [...prev, '🚀 ' + event.message]);
              } else if (event.type === 'progress') {
                setSyncProgress(event.processed);
                globalProcessed = event.processed;
                setCurrentRoom(event.room);
                setSyncLogs(prev => [...prev, event.message]);
              } else if (event.type === 'skip') {
                setSyncProgress(event.processed);
                globalProcessed = event.processed;
                setSyncLogs(prev => [...prev, '⏭️ ' + event.message]);
              } else if (event.type === 'error') {
                setSyncProgress(event.processed);
                globalProcessed = event.processed;
                setSyncLogs(prev => [...prev, event.message]);
              } else if (event.type === 'complete') {
                if (i === batches.length - 1) {
                  setSyncCompleted(true);
                  setSyncLogs(prev => [...prev, '🎉 ' + event.message]);
                  setRoomUpdateMsg('Updated smoothly!');
                  
                  // Reload fresh DB
                  const freshRooms = await fetch('/api/rooms').then(r => r.json());
                  if (Array.isArray(freshRooms) && freshRooms.length > 0) setLiveRooms(freshRooms);
                } else {
                  setSyncLogs(prev => [...prev, '📦 Batch ' + (i+1) + ' complete. Starting next...']);
                }
              } else if (event.type === 'fatal') {
                throw new Error(event.message);
              }
            } catch (e) {}
          }

          if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
          }
        }
      }
    } catch (err: any) {
      setRoomUpdateMsg('Sync failed: ' + err.message);
      setSyncLogs(prev => [...prev, '💀 ' + err.message]);
    } finally {
      setSyncing(false);
    }
  };

  // --- MODAL & PWA STATES ---
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isSiteBlocked, setIsSiteBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // --- SEARCH TIMETABLE STATES ---
  const [timetableRollNo, setTimetableRollNo] = useState('');
  const [activeSearchTimetable, setActiveSearchTimetable] = useState<any>(null);
  const [searchTimetableDay, setSearchTimetableDay] = useState<DayOfWeek>(DayOfWeek.Monday);

  // --- FRIENDS FEATURE STATES ---
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
  const [blockedList, setBlockedList] = useState<any[]>([]);
  const [friendSearchRoll, setFriendSearchRoll] = useState('');
  const [friendsError, setFriendsError] = useState('');
  const [friendsSuccess, setFriendsSuccess] = useState('');
  const [isFriendsLoading, setIsFriendsLoading] = useState(false);
  const [viewingFriendName, setViewingFriendName] = useState('');

  // --- STUDENT AUTH STATES ---
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);
  const [studentUser, setStudentUser] = useState<any>(null);
  const [portalMode, setPortalMode] = useState<'login' | 'setup_access' | 'change_access' | 'settings' | 'master_access'>('login');

  const [authToken, setAuthToken] = useState('');
  const [setupRollNo, setSetupRollNo] = useState('');
  const [onboardingProfile, setOnboardingProfile] = useState<any>(null);
  const [dseGeOptions, setDseGeOptions] = useState<string[]>([]);
  const [aecOptions, setAecOptions] = useState<string[]>([]);
  const [dseGeCode, setDseGeCode] = useState('');
  const [dseCode, setDseCode] = useState('');
  const [geCode, setGeCode] = useState('');
  const [aecCode, setAecCode] = useState('');
  const [isSem1to4, setIsSem1to4] = useState(false);
  const [isSem5or6, setIsSem5or6] = useState(false);
  const [dseGeRequired, setDseGeRequired] = useState(false);
  const [aecRequired, setAecRequired] = useState(false);
  const [newAccessCode, setNewAccessCode] = useState('');
  const [studentPasscode, setStudentPasscode] = useState('');
  const [portalError, setPortalError] = useState('');
  const [portalMsg, setPortalMsg] = useState('');
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [manualPasscode, setManualPasscode] = useState('');
  const [manualRollNo, setManualRollNo] = useState('');

  const [myTimetableData, setMyTimetableData] = useState<any>(null);
  const [myScheduleDay, setMyScheduleDay] = useState<DayOfWeek>(DayOfWeek.Monday);

  // --- ATTENDANCE TRACKER STATES ---
  const [attendanceConnected, setAttendanceConnected] = useState(false);
  const [attendanceEmail, setAttendanceEmail] = useState('');
  const [attendanceSheetUrl, setAttendanceSheetUrl] = useState('');
  const [attendanceDashboard, setAttendanceDashboard] = useState<any>(null);
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(false);
  const [attendanceMarking, setAttendanceMarking] = useState<any>(null);
  const [todayMarkedSlots, setTodayMarkedSlots] = useState<Record<number, string>>({});
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [attendanceTab, setAttendanceTab] = useState<'overview' | 'subjects' | 'calendar' | 'projections'>('overview');
  const [calendarDate, setCalendarDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [calendarMonth, setCalendarMonth] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; });

  // --- SOCIETY EVENTS STATES ---
  const [societyEvents, setSocietyEvents] = useState<any[]>([]);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [eventForm, setEventForm] = useState({
    type: 'Featured', society: '', eventName: '', date: '', time: '', location: '', description: '', link: ''
  });
  const [eventMsg, setEventMsg] = useState('');
  const [isEventSubmitting, setIsEventSubmitting] = useState(false);

  // --- AD TRACKING & MEMORY ---
  const [dismissedAds, setDismissedAds] = useState<number[]>([]);
  const [trackedViews, setTrackedViews] = useState<number[]>([]);

  // --- SIDEBAR LAYOUT STATES ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const todayDateObj = new Date();
  const currentDayName = todayDateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = todayDateObj.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', weekday: 'long'
  });

  // --- ATTENDANCE TRACKER EFFECTS ---
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('view') === 'attendance') {
      setActiveTab('attendance_tracker');
      // Replace state to clean URL but keep it simple
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if ((activeTab === 'attendance_tracker' || activeTab === 'student_portal') && isStudentLoggedIn && authToken && !attendanceConnected) {
      setIsAttendanceLoading(true);
      fetch('/api/attendance_tracker/status', {
        headers: { Authorization: `Bearer ${authToken}` }
      }).then(res => res.json()).then(data => {
        if (data.connected) {
          setAttendanceConnected(true);
          setAttendanceSheetUrl(data.spreadsheetUrl);
          setAttendanceEmail(data.email);
          
          fetch('/api/attendance_tracker/dashboard', {
            headers: { Authorization: `Bearer ${authToken}` }
          }).then(r => r.json()).then(dash => {
            setAttendanceDashboard(dash);
            
            // Parse today's marked slots
            const entriesToCheck = dash.allEntries || dash.recentEntries;
            if (entriesToCheck) {
              const todayStr = new Date().toISOString().split('T')[0];
              const todaySlots: {[key: number]: string} = {};
              entriesToCheck.forEach((entry: any) => {
                if (entry.date === todayStr) {
                  const pIndex = TIME_SLOTS.indexOf(entry.timeSlot);
                  if (pIndex !== -1) {
                    todaySlots[pIndex] = entry.status;
                  }
                }
              });
              setTodayMarkedSlots(todaySlots);
            }
          });
        } else {
          setAttendanceConnected(false);
        }
      }).catch(() => {
        setAttendanceConnected(false);
      }).finally(() => {
        setIsAttendanceLoading(false);
      });
    }
  }, [activeTab, isStudentLoggedIn, authToken, attendanceConnected]);

  // --- 1. INITIAL CHECKS (Run on Load) ---
  useEffect(() => {
    // Sync UI to current time
    if (Object.values(DayOfWeek).includes(currentDayName as DayOfWeek)) {
      setSelectedDay(currentDayName as DayOfWeek);
      setSearchTimetableDay(currentDayName as DayOfWeek);
      setMyScheduleDay(currentDayName as DayOfWeek);

      const currentHour = todayDateObj.getHours();
      const currentMinutes = todayDateObj.getMinutes();
      let estimatedSlot = currentHour - 8;
      if (currentMinutes < 30) estimatedSlot -= 1;
      if (estimatedSlot >= 0 && estimatedSlot < TIME_SLOTS.length) {
        setSelectedTimeIndex(estimatedSlot);
      }
    }

    // PWA Prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Load dismissed ads
    const savedDismissed = localStorage.getItem('dismissedAds');
    if (savedDismissed) {
      try { setDismissedAds(JSON.parse(savedDismissed)); } catch (e) { }
    }

    // Check Auth Token
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('auth_token');

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setAuthToken(token);
        localStorage.setItem("authToken", token);

        if (payload.isMaster) {
          setPortalMode('master_access');
        } else if (payload.isNewUser) {
          setPortalMode('setup_access');
          if (payload.rollNo) {
            const extractedRoll = payload.rollNo;
            setSetupRollNo(extractedRoll);
            
            // Fetch onboarding options for the new user
            setIsPortalLoading(true);
            fetch(`/api/onboarding_options?rollNo=${encodeURIComponent(extractedRoll)}`)
              .then(res => res.json())
              .then(data => {
                setIsPortalLoading(false);
                if (data.success) {
                  setOnboardingProfile(data.profile);
                  setIsSem1to4(data.isSem1to4);
                  setIsSem5or6(data.isSem5or6);
                  setDseGeOptions(data.dseGeOptions);
                  setAecOptions(data.aecOptions);
                  setDseGeRequired(data.dseGeRequired);
                  setAecRequired(data.aecRequired);
                } else {
                  setPortalError(data.error || "Failed to load profile. Contact Admin.");
                }
              })
              .catch(err => {
                setIsPortalLoading(false);
                setPortalError("Network error fetching profile details.");
              });
          }
        } else {
          setPortalMode('change_access');
          const syncRoll = payload.rollNo || '';
          setSetupRollNo(syncRoll);
        }
        window.history.replaceState({}, document.title, "/");
        setActiveTab('student_portal');
      } catch (e) {
        setPortalError("Authentication failed. Please try again.");
      }
    } else {
      const savedUser = localStorage.getItem("studentUser");
      const savedToken = localStorage.getItem("authToken");
      if (savedUser) {
        try { 
          completeLogin(JSON.parse(savedUser)); 
          if (savedToken) setAuthToken(savedToken);
        } catch (e) { }
      }
    }

    // Handle redirect from Attendance OAuth
    if (urlParams.get('view') === 'attendance') {
      setActiveTab('attendance_tracker');
      window.history.replaceState({}, document.title, "/");
    }

    const authError = urlParams.get('error');
    if (authError === 'missing_token' || authError === 'invalid_token') {
      alert("Your session has expired or is missing. Please log out of the student portal and log back in to connect your Google Sheets.");
      window.history.replaceState({}, document.title, "/");
    }

    // Restore Admin login for local dev/reloads
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
      setIsLoggedIn(true);
    }

    // Fetch Dynamic Events
    fetch('/api/events')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setSocietyEvents(data); })
      .catch(err => console.error("Events fetch error:", err));

    fetch('/api/check_status')
      .then(res => res.json())
      .then(data => {
        if (data.blocked) { setIsSiteBlocked(true); setBlockMessage(data.message); }
      }).catch(err => console.error("Block check failed", err));

    fetch('/api/attendance')
      .then(res => res.json())
      .then(data => {
        setAbsentTeachers(Array.isArray(data) ? data : []);
        setLoading(false);
      }).catch(err => setLoading(false));

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const fetchFriendsData = async (rollNo: string) => {
    if (!rollNo) return;
    try {
      const res = await fetch(`/api/friends?rollNo=${encodeURIComponent(rollNo)}`);
      if (res.ok) {
        const data = await res.json();
        setFriendsList(data.friends || []);
        setIncomingRequests(data.incomingRequests || []);
        setOutgoingRequests(data.outgoingRequests || []);
        setBlockedList(data.blocks || []);
      }
    } catch (e) {
      console.error("Failed to fetch friends data:", e);
    }
  };

  useEffect(() => {
    if (activeTab === 'timetable' && isStudentLoggedIn && studentUser?.rollNo) {
      fetchFriendsData(studentUser.rollNo);
    }
  }, [activeTab, isStudentLoggedIn, studentUser]);

  const completeLogin = (user: any) => {
    setIsStudentLoggedIn(true);
    setStudentUser(user);
    fetchFriendsData(user.rollNo);

    setMyTimetableData({ Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [] });
    setPortalMode('login');

    // Fetch dynamic DB-driven schedule
    fetch(`/api/student_schedule?rollNo=${encodeURIComponent(user.rollNo)}`)
      .then(res => {
        if (res.ok) return res.json();
        return null;
      })
      .then(data => {
        if (data?.schedule) {
          setMyTimetableData(data.schedule);
        }
      })
      .catch(e => console.warn("Dynamic schedule fetch failed:", e));
  };

  // --- NEW: DAILY RESET TRACKING LOGIC ---

  // Generate a key based on the current date (YYYY-MM-DD)
  const todayKey = new Date().toISOString().split('T')[0];

  const featuredAd = useMemo(() => {
    return societyEvents.find(event => {
      if (!event.is_active) return false;

      // Check if user dismissed this specific ad TODAY
      // We store it as 'dismissed_ADID' with the date as the value
      const lastDismissedDate = localStorage.getItem(`dismissed_${event.id}`);

      // If the stored date is today, hide it. Otherwise, show it!
      return lastDismissedDate !== todayKey;
    });
  }, [societyEvents, todayKey]);

  // Track view only once per day per session
  useEffect(() => {
    if (featuredAd && !trackedViews.includes(featuredAd.id)) {
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'track', type: 'view', eventId: featuredAd.id })
      }).catch(() => { });

      // Prevent multiple view pings in the same browser session
      setTrackedViews(prev => [...prev, featuredAd.id]);
    }
  }, [featuredAd, trackedViews]);

  const handleTrackClick = (eventId: number, link: string) => {
    // Record the click in the daily database
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'track', type: 'click', eventId })
    }).catch(() => { });

    // Open the link
    window.open(link, '_blank');
  };

  const handleTeacherClick = (teacher: any) => {
    setSelectedTeacher(teacher);
  };

  const handleDismissAd = (id: number) => {
    // Save the dismissal with today's date tag
    localStorage.setItem(`dismissed_${id}`, todayKey);

    // Force the useMemo to re-run and hide the ad instantly
    // We do this by triggering a shallow refresh of the events state
    setSocietyEvents(prev => [...prev]);
  };

  const renderFeaturedAd = () => {
    if (!featuredAd) return null;
    return (
      <div className="relative bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-4 fade-in duration-500 mb-6 mx-auto max-w-3xl">
        <button
          onClick={() => handleDismissAd(featuredAd.id)}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors z-10"
        >
          <XCircle className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3">
          <div className="bg-gradient-to-br from-yellow-100 to-orange-100 p-2.5 rounded-xl border border-yellow-200 text-yellow-600 shrink-0">
            <Megaphone className="w-6 h-6" />
          </div>
          <div className="pr-6">
            <span className="bg-yellow-200 text-yellow-800 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1 inline-block shadow-sm">
              Featured • {featuredAd.event_type}
            </span>
            <h3 className="font-bold text-gray-900 leading-tight">{featuredAd.event_name}</h3>
            <p className="text-xs font-semibold text-gray-600 mt-0.5">{featuredAd.society_name} • {featuredAd.event_date}</p>
          </div>
        </div>

        <button
          onClick={() => handleTrackClick(featuredAd.id, featuredAd.registration_link)}
          className="w-full sm:w-auto text-center bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-orange-950 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap"
        >
          View Details
        </button>
      </div>
    );
  };

  // --- AUTH HANDLERS ---
  const handleGoogleLogin = () => window.location.href = "/api/auth/google";
  const handleMicrosoftLogin = () => window.location.href = "/api/auth/microsoft";

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPortalError('');
    if (!manualRollNo || !manualPasscode) return setPortalError('Enter Roll No and Access Code.');

    setIsPortalLoading(true);

    try {
      const res = await fetch('/api/student_login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNo: manualRollNo.toUpperCase(), password: manualPasscode })
      });
      const data = await res.json();
      if (res.ok) {
        completeLogin(data.user);
        localStorage.setItem("studentUser", JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem("authToken", data.token);
          setAuthToken(data.token);
        }
        setManualPasscode('');
      } else {
        if (res.status === 403) {
          setIsSiteBlocked(true);
          setBlockMessage(data.message);
        } else {
          setPortalError(data.message || data.error || 'Invalid credentials.');
        }
      }
    } catch (err) { setPortalError('Connection error.'); }
    finally { setIsPortalLoading(false); }
  };

  const handleSetAccessCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setPortalError('');
    if (!newAccessCode) return setPortalError("Please enter an access code.");
    
    if (portalMode === 'setup_access') {
      if (!onboardingProfile) return setPortalError("Profile not loaded. Cannot proceed.");
      if (dseGeRequired && !dseGeCode && isSem1to4) return setPortalError("Please select your DSE/GE Subject.");
      if (dseGeRequired && (!dseCode || !geCode) && isSem5or6) return setPortalError("Please select both DSE and GE Subjects.");
      if (aecRequired && !aecCode) return setPortalError("Please select your AEC Option.");
    }

    setIsPortalLoading(true);
    try {
      const res = await fetch('/api/set_access_code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: authToken,
          accessCode: newAccessCode,
          dseGeCode,
          dseCode,
          geCode,
          aecCode
        })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("studentUser", JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem("authToken", data.token);
          setAuthToken(data.token);
        }
        completeLogin(data.user);
        setPortalMsg("Access Code Set Successfully!");
        setPortalMode('login');
      } else { setPortalError(data.error || "Failed to set code."); }
    } catch (err) { setPortalError("Connection error."); }
    finally { setIsPortalLoading(false); }
  };

  const handleChangeSettingsPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setPortalError(''); setPortalMsg('');
    if (!studentPasscode || !newAccessCode) return setPortalError('Please fill both fields.');

    setIsPortalLoading(true);
    try {
      const res = await fetch('/api/student_change_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNo: studentUser.rollNo, oldPassword: studentPasscode, newPassword: newAccessCode })
      });
      const data = await res.json();
      if (res.ok) {
        setPortalMsg(data.message);
        setStudentPasscode(''); setNewAccessCode('');
        setTimeout(() => setPortalMode('login'), 2000);
      } else { setPortalError(data.error || 'Failed to change passcode.'); }
    } catch (err) { setPortalError('Connection error.'); }
    finally { setIsPortalLoading(false); }
  };

  const handleSkipChange = () => {
    setPortalMode('login');
    if (setupRollNo) alert("Please login manually with your existing Access Code below.");
  };

  const handleStudentLogout = () => {
    setIsStudentLoggedIn(false);
    setStudentUser(null);
    setMyTimetableData(null);
    setAuthToken('');
    localStorage.removeItem("studentUser");
    localStorage.removeItem("authToken");
    setPortalMode('login');
  };

  const handleInstallAppClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      setIsInstallModalOpen(true);
    }
  };

  // --- ADMIN ACTIONS ---
  const fetchAdminEvents = async () => {
    try {
      const res = await fetch('/api/events?admin=true');
      const data = await res.json();
      if (Array.isArray(data)) setSocietyEvents(data);
    } catch (e) { console.error(e); }
  };

  const handleAdminLogin = async () => {
    setLoginError('');

    // --- LOCAL DEV BYPASS ---
    if (import.meta.env.DEV) {
      setIsLoggedIn(true);
      setLoginError('');
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPass })
      });
      const data = await response.json();
      if (response.ok) {
        setIsLoggedIn(true);
        sessionStorage.setItem('adminLoggedIn', 'true');
        setLoginError('');
        fetchAdminEvents();
      } else {
        if (response.status === 429) {
          // Rate-limited — show inline error, not full block
          setLoginError(data.error || 'Too many failed attempts.');
        } else if (response.status === 403) {
          setLoginError(data.error || 'Too many failed attempts. Try again later.');
        } else {
          setLoginError(data.message || data.error || `Incorrect password.`);
        }
      }
    } catch (error) { setLoginError("Connection error."); }
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
      if (!response.ok) throw new Error("Failed");
    } catch (e) {
      alert("Failed to save. Session may have expired.");
      setAbsentTeachers(prev => isAbsent ? prev.filter(id => id !== tid) : [...prev, tid]);
    }
  };

  // Create or Update Event
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEventSubmitting(true);
    setEventMsg('');

    // Check if we are creating or updating
    const actionType = editingEventId ? 'edit' : 'create';

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          password: adminPass,
          eventId: editingEventId, // only used if editing
          ...eventForm
        })
      });
      const data = await res.json();

      if (res.ok) {
        setEventMsg(editingEventId ? "Event Updated Successfully!" : "Event Listed Successfully!");
        setEventForm({ type: 'Featured', society: '', eventName: '', date: '', time: '', location: '', description: '', link: '' });
        setEditingEventId(null);
        fetchAdminEvents();
      } else {
        setEventMsg(data.error || "Failed to save event.");
      }
    } catch (e) { setEventMsg("Connection error."); }
    finally { setIsEventSubmitting(false); }
  };

  const handleToggleEvent = async (id: number, currentStatus: number) => {
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', password: adminPass, eventId: id, isActive: !currentStatus })
      });
      fetchAdminEvents();
    } catch (e) { console.error(e); }
  };

  const handlePinEvent = async (id: number) => {
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pin', password: adminPass, eventId: id })
      });
      fetchAdminEvents();
    } catch (e) { console.error(e); }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!window.confirm("Are you sure you want to completely delete this ad? This action cannot be undone.")) return;
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', password: adminPass, eventId: id })
      });
      fetchAdminEvents();
    } catch (e) { console.error(e); }
  };

  const handleEditClick = (event: any) => {
    setEditingEventId(event.id);
    setEventForm({
      type: event.event_type,
      society: event.society_name,
      eventName: event.event_name,
      date: event.event_date,
      time: event.event_time,
      location: event.location,
      description: event.description,
      link: event.registration_link
    });
    setEventMsg('');
  };

  const handleCancelEdit = () => {
    setEditingEventId(null);
    setEventForm({ type: 'Featured', society: '', eventName: '', date: '', time: '', location: '', description: '', link: '' });
    setEventMsg('');
  };

  const handleSendFriendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFriendsError('');
    setFriendsSuccess('');
    const targetRoll = friendSearchRoll.trim().toUpperCase();
    if (!targetRoll) return;

    if (!studentUser?.rollNo) {
      setFriendsError("Please log in to add friends.");
      return;
    }

    setIsFriendsLoading(true);
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_request',
          senderRoll: studentUser.rollNo,
          receiverRoll: targetRoll
        })
      });
      const data = await res.json();
      if (res.ok) {
        setFriendsSuccess(data.message || "Friend request sent!");
        setFriendSearchRoll('');
        fetchFriendsData(studentUser.rollNo);
      } else {
        setFriendsError(data.error || "Failed to send request.");
      }
    } catch (err) {
      setFriendsError("Connection error.");
    } finally {
      setIsFriendsLoading(false);
    }
  };

  const handleAcceptRequest = async (reqRoll: string) => {
    setFriendsError('');
    setFriendsSuccess('');
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept_request',
          senderRoll: reqRoll,
          receiverRoll: studentUser.rollNo
        })
      });
      const data = await res.json();
      if (res.ok) {
        setFriendsSuccess(data.message || "Request accepted!");
        fetchFriendsData(studentUser.rollNo);
      } else {
        setFriendsError(data.error || "Failed to accept request.");
      }
    } catch (err) {
      setFriendsError("Connection error.");
    }
  };

  const handleRejectRequest = async (reqRoll: string) => {
    setFriendsError('');
    setFriendsSuccess('');
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject_request',
          senderRoll: reqRoll,
          receiverRoll: studentUser.rollNo
        })
      });
      const data = await res.json();
      if (res.ok) {
        setFriendsSuccess(data.message || "Request rejected.");
        fetchFriendsData(studentUser.rollNo);
      } else {
        setFriendsError(data.error || "Failed to reject request.");
      }
    } catch (err) {
      setFriendsError("Connection error.");
    }
  };

  const handleRemoveFriend = async (friendRoll: string) => {
    if (!window.confirm("Are you sure you want to remove this friend?")) return;
    setFriendsError('');
    setFriendsSuccess('');
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove_friend',
          senderRoll: studentUser.rollNo,
          receiverRoll: friendRoll
        })
      });
      const data = await res.json();
      if (res.ok) {
        setFriendsSuccess(data.message || "Friend removed.");
        fetchFriendsData(studentUser.rollNo);
        if (activeSearchTimetable && timetableRollNo === friendRoll) {
          setActiveSearchTimetable(null);
          setViewingFriendName('');
        }
      } else {
        setFriendsError(data.error || "Failed to remove friend.");
      }
    } catch (err) {
      setFriendsError("Connection error.");
    }
  };

  const handleBlockUser = async (targetRoll: string) => {
    if (!window.confirm(`Are you sure you want to permanently block ${targetRoll}? They won't be able to send you friend requests.`)) return;
    setFriendsError('');
    setFriendsSuccess('');
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'block_user',
          senderRoll: studentUser.rollNo,
          receiverRoll: targetRoll
        })
      });
      const data = await res.json();
      if (res.ok) {
        setFriendsSuccess(data.message || "User blocked.");
        fetchFriendsData(studentUser.rollNo);
        if (activeSearchTimetable && timetableRollNo === targetRoll) {
          setActiveSearchTimetable(null);
          setViewingFriendName('');
        }
      } else {
        setFriendsError(data.error || "Failed to block user.");
      }
    } catch (err) {
      setFriendsError("Connection error.");
    }
  };

  const handleUnblockUser = async (targetRoll: string) => {
    setFriendsError('');
    setFriendsSuccess('');
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'unblock_user',
          senderRoll: studentUser.rollNo,
          receiverRoll: targetRoll
        })
      });
      const data = await res.json();
      if (res.ok) {
        setFriendsSuccess(data.message || "User unblocked.");
        fetchFriendsData(studentUser.rollNo);
      } else {
        setFriendsError(data.error || "Failed to unblock user.");
      }
    } catch (err) {
      setFriendsError("Connection error.");
    }
  };

  const handleViewFriendSchedule = async (friendRoll: string, friendName: string) => {
    setFriendsError('');
    try {
      const res = await fetch(`/api/student_schedule?rollNo=${encodeURIComponent(friendRoll)}`);
      const data = await res.json();
      if (data.schedule) {
        setActiveSearchTimetable(data.schedule);
        setTimetableRollNo(friendRoll);
        setViewingFriendName(friendName);
        setSearchTimetableDay(Object.values(DayOfWeek).includes(currentDayName as DayOfWeek) ? (currentDayName as DayOfWeek) : DayOfWeek.Monday);
      } else {
        alert("This friend has no schedule data in the database.");
      }
    } catch (e) {
      alert("Failed to fetch schedule.");
    }
  };

  // --- LOGIC FUNCTIONS ---
  const calculateFreeDuration = (room: any, startSlotIndex: number) => {
    let freeSlots = 0;
    for (let i = startSlotIndex; i < TIME_SLOTS.length; i++) {
      if (room.emptySlots[selectedDay]?.includes(i)) freeSlots++;
      else break;
    }
    return freeSlots;
  };

  // --- FREED ROOM ALGORITHM (Section 3 of room_finder_logic.md) ---
  // Implements strict multi-occupancy verification:
  // A room is only freed if ALL teachers scheduled there are absent.
    const freedRooms = useMemo(() => {
    if (selectedDay !== currentDayName) return [];
    const freed: any[] = [];

    // Step 1: Identify rooms that absent teachers might have potentially occupied
    const potentialFreedRooms = new Map<string, string[]>();

    liveRooms.forEach(room => {
      const occupants = (room as any).occupiedBy?.[selectedDay]?.[selectedTimeIndex] || [];
      const absentees = occupants.filter((code: string) => absentTeachers.some(a => a.teacher_id === code));
      
      if (absentees.length > 0) {
        potentialFreedRooms.set(room.id, absentees.map((code: string) => liveTeachers[code]?.name || code));
      }
    });

    // Step 2: Strict Occupancy Verification
    potentialFreedRooms.forEach((absentNames, roomId) => {
      const room = liveRooms.find(r => r.id === roomId);
      if (!room) return;

      const occupants = (room as any).occupiedBy?.[selectedDay]?.[selectedTimeIndex] || [];
      const presentOccupants = occupants.filter((code: string) => !absentTeachers.some(a => a.teacher_id === code));

      if (presentOccupants.length === 0) {
        freed.push({
          id: roomId,
          name: room.name,
          type: room.type || 'Lecture Hall',
          emptySlots: { [selectedDay]: [selectedTimeIndex] } as any,
          tags: [`Released: ${absentNames.join(', ')}`]
        });
      }
    });

    return freed;
  }, [absentTeachers, selectedDay, selectedTimeIndex, currentDayName, liveTeachers, liveRooms]);

  const availableRooms = useMemo(() => {
    const staticRooms = liveRooms.filter(room => room.emptySlots[selectedDay]?.includes(selectedTimeIndex)).map(room => {
       let isTaken = false;
       if (room.occupiedBy && room.occupiedBy[selectedDay] && room.occupiedBy[selectedDay][selectedTimeIndex]) {
           const occupants = room.occupiedBy[selectedDay][selectedTimeIndex];
           isTaken = Array.isArray(occupants) && occupants.some(c => typeof c === 'string' && c.includes('(Extra)'));
       }
       return { ...room, isTaken };
    });
    const allRooms = [...staticRooms];

    freedRooms.forEach(freed => {
      if (!allRooms.find(r => r.id === freed.id)) allRooms.push(freed);
    });

    const filtered = allRooms.filter(room => {
      const matchesSearch = (room.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'All' || room.type === filterType;
      return matchesSearch && matchesType;
    });

    return filtered.sort((a, b) => calculateFreeDuration(b, selectedTimeIndex) - calculateFreeDuration(a, selectedTimeIndex));
  }, [selectedDay, selectedTimeIndex, searchQuery, filterType, freedRooms]);

  const getRoomTimeline = (roomId: string) => {
    const timeline = new Array(TIME_SLOTS.length).fill(null);
    const room = liveRooms.find(r => r.id === roomId);
    if (!room || !room.occupiedBy?.[selectedDay]) return timeline;

    const dayOccupancy = room.occupiedBy[selectedDay];
    Object.entries(dayOccupancy).forEach(([slotIdx, teacherCodes]) => {
      const codes = teacherCodes as string[];
      const idx = parseInt(slotIdx);
      if (codes.length > 0 && idx < timeline.length) {
        const names = codes.map(c => liveTeachers[c]?.name || c);
        const allAbsent = codes.every(c => absentTeachers.some(a => a.teacher_id === c));
        timeline[idx] = {
          status: 'Occupied',
          teacher: names.join(' + '),
          isAbsent: allAbsent && (selectedDay === currentDayName)
        };
      }
    });
    return timeline;
  };

  const selectedRoomTimeline = useMemo(() => {
    if (!selectedRoomId) return [];
    return getRoomTimeline(selectedRoomId);
  }, [selectedRoomId, selectedDay, absentTeachers, liveTeachers, liveRooms]);

  const getEntityStatus = (teacher: any) => {
    // 1. Check leave status
    if (absentTeachers.some(a => a.teacher_id === teacher.id) && selectedDay === currentDayName) {
      return { status: 'On Leave', color: 'red', icon: UserMinus, detail: 'Marked Absent' };
    }

    // 2. Direct matching (now perfectly aligned between CSV and Scraper)
    let locatedRoomName = '';
    liveRooms.forEach(room => {
      if (locatedRoomName) return;
      
      const occupants = room.occupiedBy?.[selectedDay]?.[selectedTimeIndex.toString()] || [];
      
      // Match against: ID directly (CSV IDs like SLK match Scraper codes like SLK)
      if (occupants.includes(teacher.id)) {
        locatedRoomName = room.name;
      }
    });

    if (locatedRoomName) {
      return { status: `In ${locatedRoomName}`, color: 'blue', icon: MapPin, detail: 'Scheduled Lecture' };
    }

    return { status: 'Free', color: 'green', icon: CheckCircle, detail: 'No Class Scheduled' };
  };

  const visibleEntities = useMemo(() => {
    const query = finderSearchQuery.toLowerCase();
    return (Object.values(liveTeachers) as any[])
      .filter((t: any) => t.id !== 'ADMIN')
      .filter((t: any) => (t.name || '').toLowerCase().includes(query))
      .map((t: any) => ({ ...t, type: 'teacher' }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [finderSearchQuery, liveTeachers]);

  // --- REUSABLE COMPONENTS ---
  const TeachersOnLeaveDashboard = () => (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-srcc-portalNavy mb-1">FACULTY ON LEAVE</h2>
          <p className="text-gray-500 text-sm font-medium">Daily absence directory for {currentDayName}, {formattedDate}</p>
        </div>
        {absentTeachers.length > 0 && (
          <div className="bg-red-100 text-red-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-red-200">
            {absentTeachers.length} Absent Today
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-srcc-portalNavy text-white">
              <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">S.No</th>
              <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">From</th>
              <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">To</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {absentTeachers.length > 0 ? (
              absentTeachers.map((abs, index) => {
                const teacher = liveTeachers[abs.teacher_id];
                return (
                  <tr key={abs.teacher_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-gray-400">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-srcc-portalNavy leading-tight">{teacher?.name || abs.teacher_id}</span>
                        <span className="text-[10px] uppercase font-black text-srcc-yellow bg-srcc-portalNavy px-1.5 py-0.5 rounded w-fit mt-1">{teacher?.department || 'Faculty'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{abs.start_date}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{abs.end_date}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium whitespace-nowrap">
                  No faculty absences reported for today.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const TeacherContactModal = () => {
    if (!selectedTeacher) return null;
    
    const email = selectedTeacher.email || null;
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      if (email) {
        navigator.clipboard.writeText(email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col relative">
          <div className="p-8 bg-srcc-portalNavy text-white text-center">
            <button 
              onClick={() => setSelectedTeacher(null)}
              className="absolute top-4 right-4 bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-20 h-20 bg-srcc-yellow rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
              <GraduationCap className="w-10 h-10 text-srcc-portalNavy" />
            </div>
            <h2 className="text-2xl font-black mb-1">{selectedTeacher.name}</h2>
            <p className="text-srcc-yellow font-bold text-xs uppercase tracking-widest">{selectedTeacher.department}</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Email Address</span>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                  <span className="font-bold text-gray-700 truncate mr-2">
                    {email || 'Not available'}
                  </span>
                  {email && (
                    <button 
                      onClick={handleCopy}
                      className="shrink-0 p-2 hover:bg-white rounded-lg transition-colors text-srcc-portalNavy"
                    >
                      {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {email ? (
                <a 
                  href={`mailto:${email}`}
                  className="w-full bg-srcc-portalNavy text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-900 transition-all shadow-md active:scale-95"
                >
                  <Mail className="w-5 h-5 text-srcc-yellow" /> Send Email
                </a>
              ) : (
                <div className="w-full bg-gray-100 text-gray-400 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                  <Mail className="w-5 h-5" /> Email Not Provided
                </div>
              )}
              <button 
                onClick={() => setSelectedTeacher(null)}
                className="w-full text-gray-500 font-bold py-2 hover:text-srcc-portalNavy transition-colors text-sm"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTimetableSlots = (timetableData: any, day: DayOfWeek) => {
    if (!timetableData || !timetableData[day] || timetableData[day].length === 0) {
      return (
        <div className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="font-bold text-lg text-gray-900">No Classes Scheduled!</p>
          <p className="text-gray-500 text-sm mt-1">Enjoy your day off.</p>
        </div>
      );
    }

    return TIME_SLOTS.map((timeLabel, index) => {
      const classesAtSlot = timetableData[day].filter((c: any) => c.periodIndex === index);
      const hasClass = classesAtSlot.length > 0;
      const classData = classesAtSlot.find((c: any) => c.type === 'Extra') || classesAtSlot[0];
      const lastClassIndex = Math.max(...timetableData[day].map((c: any) => c.periodIndex));

      if (index > lastClassIndex) return null;

      const isCurrentlyActive = (day === currentDayName) && (index === selectedTimeIndex);

      // Only show marked status if we are looking at today's schedule
      const markedStatus = (day === currentDayName) ? todayMarkedSlots[index] : null;

      return (
        <div 
          key={index} 
          onClick={() => {
            // Only allow marking for today's classes if logged in and connected
            if (hasClass && isStudentLoggedIn && attendanceConnected && activeTab === 'student_portal' && day === currentDayName) {
              setAttendanceMarking({ ...classData, periodIndex: index, timeSlot: timeLabel, date: todayDateObj.toISOString().split('T')[0], day: day });
            }
          }}
          className={`relative flex gap-4 p-3 rounded-xl border transition-all ${hasClass ? 'bg-white shadow-sm' : 'bg-gray-50 border-gray-100 border-dashed opacity-60'
          } ${isCurrentlyActive && hasClass ? 'border-indigo-400 ring-1 ring-indigo-400 scale-[1.01]' : hasClass ? 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/10 cursor-pointer' : ''}`}>

          {isCurrentlyActive && hasClass && (
            <div className="absolute top-1 right-2 flex items-center gap-1 text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>Live
            </div>
          )}

          {markedStatus && (
            <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center z-10">
              {markedStatus === 'Present' && <CheckCircle className="w-4 h-4 text-green-500" />}
              {markedStatus === 'Absent' && <XCircle className="w-4 h-4 text-red-500" />}
              {markedStatus === 'Cancelled' && <CalendarOff className="w-4 h-4 text-gray-500" />}
            </div>
          )}

          <div className="w-20 shrink-0 flex flex-col justify-center items-center border-r border-gray-100 pr-3">
            <span className={`text-sm font-bold ${hasClass ? 'text-gray-900' : 'text-gray-500'}`}>{timeLabel.split(' ')[0]}</span>
            <span className="text-[10px] text-gray-400 uppercase">{timeLabel.split(' ')[1]}</span>
          </div>

          <div className="flex-1 flex flex-col justify-center relative">
            {hasClass ? (
              <>
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-gray-900 text-base leading-tight pr-10">{classData.subject}</h4>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                      classData.type === 'Lecture' ? 'bg-blue-50 text-blue-700' :
                      classData.type === 'Tutorial' ? 'bg-purple-50 text-purple-700' : 
                      classData.type === 'Extra' ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300' :
                      'bg-green-50 text-green-700'
                    }`}>{classData.type}</span>
                </div>
                {classData.date && (
                  <div className="text-xs font-bold text-amber-600 mb-1 flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" /> Scheduled for: {new Date(classData.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm mt-1">
                  <span className="flex items-center gap-1 text-gray-600 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Room {classData.room}
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
    });
  };

  // --- RENDER BLOCK ---
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

  if (IS_MAINTENANCE && !isLoggedIn) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden font-sans" 
           style={{ backgroundImage: 'url(/bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        {/* Deep branding overlay */}
        <div className="absolute inset-0 bg-srcc-portalNavy/65 backdrop-blur-[3px] z-0" />
        
        <div className="relative z-10 w-full max-w-lg mx-4 text-center">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-10 sm:p-14 shadow-2xl animate-in zoom-in-95 fade-in duration-700">
            {/* Gear Icon Group */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-srcc-yellow rounded-3xl rotate-6 animate-pulse opacity-20"></div>
              <div className="absolute inset-0 bg-srcc-yellow rounded-3xl -rotate-3 transition-transform hover:rotate-0 flex items-center justify-center shadow-lg">
                <Settings className="w-12 h-12 text-srcc-portalNavy animate-[spin_5s_linear_infinite]" />
              </div>
            </div>

            <img src="/SRCC100.svg" alt="SRCC Logo" className="w-16 h-16 mx-auto mb-6 opacity-90 drop-shadow-md" />
            
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight" 
                style={{ fontFamily: "'Trajan Pro', 'Trajan', 'Cinzel', serif" }}>
              UNDER MAINTENANCE
            </h1>
            
            <div className="w-16 h-1 bg-srcc-yellow mx-auto mb-6 rounded-full opacity-50"></div>
            
            <p className="text-gray-100 text-sm sm:text-base leading-relaxed font-medium mb-8">
              We are currently enhancing the SRCC Assist portal to provide you with a smoother, faster, and more robust experience. 
              <br/><br/>
              <b>The portal will be back online shortly.</b>
            </p>

            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-srcc-yellow/10 border border-srcc-yellow/20 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest text-srcc-yellow">
              <span className="w-2 h-2 bg-srcc-yellow rounded-full animate-ping"></span>
              Optimization In Progress
            </div>

            <div className="mt-8 border-t border-white/20 pt-8">
               <p className="text-white/60 text-xs font-medium mb-4 uppercase tracking-widest">Admin Access</p>
               {loginError && (
                 <div className="mb-4 text-red-400 text-xs font-bold bg-red-500/10 py-2 rounded border border-red-500/20">
                   {loginError}
                 </div>
               )}
               <div className="flex flex-col gap-3">
                 <input 
                   type="password" 
                   value={adminPass}
                   onChange={e => setAdminPass(e.target.value)}
                   placeholder="Admin Password"
                   className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 text-center outline-none focus:border-srcc-yellow transition-colors tracking-widest"
                 />
                 <button 
                   onClick={handleAdminLogin}
                   className="w-full bg-srcc-yellow hover:bg-yellow-400 text-srcc-portalNavy font-bold py-3 rounded-xl transition-all shadow-lg uppercase text-sm tracking-wide"
                 >
                   Bypass Maintenance
                 </button>
               </div>
            </div>
          </div>
          
          <p className="mt-8 text-white/40 text-[10px] uppercase font-black tracking-widest">
            SHRI RAM COLLEGE OF COMMERCE • UNIVERSITY OF DELHI
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100 font-outfit overflow-hidden">
      
      {/* DESKTOP SIDEBAR */}
      <aside className={`bg-srcc-portalNavy text-white transition-all shadow-xl z-40 hidden md:flex flex-col flex-shrink-0 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`p-6 border-b border-white/10 flex items-center justify-between`}>
          <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'hidden' : 'flex'}`}>
            <img src="/SRCC.svg" alt="SRCC" className="w-20 h-20" />
            <div>
              <h1 className="font-serif font-bold text-xl leading-tight tracking-wide text-white">SRCC ASSIST</h1>
              <p className="text-srcc-yellow text-[10px] font-medium tracking-widest uppercase">Student Portal</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-1.5 bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all">
            {isSidebarCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-4 space-y-2">
           <button onClick={() => { setActiveTab('student_portal'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} gap-3 py-3 rounded-[5px] font-bold transition-all group ${activeTab === 'student_portal' ? 'bg-srcc-yellow text-gray-100' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
             <LayoutDashboard className={`w-5 h-5 shrink-0 ${isSidebarCollapsed && activeTab !== 'student_portal' ? 'group-hover:text-white group-hover:scale-110 transition-transform' : ''}`} /> 
             <span className={`whitespace-nowrap transition-all duration-300 origin-left ${isSidebarCollapsed ? 'opacity-0 w-0 scale-0' : 'opacity-100 w-auto scale-100'}`}>Dashboard</span>
           </button>
           <button onClick={() => { setActiveTab('rooms'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} gap-3 py-3 rounded-[5px] font-bold transition-all group ${activeTab === 'rooms' ? 'bg-srcc-yellow text-gray-100' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
             <LucideMap className={`w-5 h-5 shrink-0 ${isSidebarCollapsed && activeTab !== 'rooms' ? 'group-hover:text-white group-hover:scale-110 transition-transform' : ''}`} /> 
             <span className={`whitespace-nowrap transition-all duration-300 origin-left ${isSidebarCollapsed ? 'opacity-0 w-0 scale-0' : 'opacity-100 w-auto scale-100'}`}>Room Finder</span>
           </button>
           <button onClick={() => { setActiveTab('teachers'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} gap-3 py-3 rounded-[5px] font-bold transition-all group ${activeTab === 'teachers' ? 'bg-srcc-yellow text-gray-100' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
             <Contact className={`w-5 h-5 shrink-0 ${isSidebarCollapsed && activeTab !== 'teachers' ? 'group-hover:text-white group-hover:scale-110 transition-transform' : ''}`} /> 
             <span className={`whitespace-nowrap transition-all duration-300 origin-left ${isSidebarCollapsed ? 'opacity-0 w-0 scale-0' : 'opacity-100 w-auto scale-100'}`}>Staff Info</span>
           </button>
           <button onClick={() => { setActiveTab('timetable'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} gap-3 py-3 rounded-[5px] font-bold transition-all group ${activeTab === 'timetable' ? 'bg-srcc-yellow text-gray-100' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
             <Users className={`w-5 h-5 shrink-0 ${isSidebarCollapsed && activeTab !== 'timetable' ? 'group-hover:text-white group-hover:scale-110 transition-transform' : ''}`} /> 
             <span className={`whitespace-nowrap transition-all duration-300 origin-left ${isSidebarCollapsed ? 'opacity-0 w-0 scale-0' : 'opacity-100 w-auto scale-100'}`}>Friends</span>
           </button>
           <button onClick={() => { setActiveTab('leave'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} gap-3 py-3 rounded-[5px] font-bold transition-all group ${activeTab === 'leave' ? 'bg-srcc-yellow text-gray-100' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
             <CalendarOff className={`w-5 h-5 shrink-0 ${isSidebarCollapsed && activeTab !== 'leave' ? 'group-hover:text-white group-hover:scale-110 transition-transform' : ''}`} /> 
             <span className={`whitespace-nowrap transition-all duration-300 origin-left ${isSidebarCollapsed ? 'opacity-0 w-0 scale-0' : 'opacity-100 w-auto scale-100'}`}>On Leave</span>
           </button>
           <button onClick={() => { setActiveTab('attendance_tracker'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} gap-3 py-3 rounded-[5px] font-bold transition-all group ${activeTab === 'attendance_tracker' ? 'bg-srcc-yellow text-gray-100' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
             <ClipboardCheck className={`w-5 h-5 shrink-0 ${isSidebarCollapsed && activeTab !== 'attendance_tracker' ? 'group-hover:text-white group-hover:scale-110 transition-transform' : ''}`} /> 
             <span className={`whitespace-nowrap transition-all duration-300 origin-left ${isSidebarCollapsed ? 'opacity-0 w-0 scale-0' : 'opacity-100 w-auto scale-100'}`}>Attendance</span>
           </button>
           <button onClick={() => { setActiveTab('societies'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} gap-3 py-3 rounded-[5px] font-bold transition-all group ${activeTab === 'societies' ? 'bg-srcc-yellow text-gray-100' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
             <Globe className={`w-5 h-5 shrink-0 ${isSidebarCollapsed && activeTab !== 'societies' ? 'group-hover:text-white group-hover:scale-110 transition-transform' : ''}`} /> 
             <span className={`whitespace-nowrap transition-all duration-300 origin-left ${isSidebarCollapsed ? 'opacity-0 w-0 scale-0' : 'opacity-100 w-auto scale-100'}`}>Societies</span>
           </button>
        </nav>

        <div className={`p-4 border-t border-white/10 ${isSidebarCollapsed ? 'flex flex-col items-center px-2' : ''}`}>
           <button onClick={() => { setIsAdminOpen(true); setLoginError(''); setIsMobileMenuOpen(false); }} className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-center py-3 gap-2'} bg-white/10 text-white rounded-[5px] font-bold hover:bg-white/20 transition-all shadow-sm group`}>
             <Lock className={`w-4 h-4 shrink-0 ${isSidebarCollapsed ? 'group-hover:scale-110 transition-transform' : ''}`} /> 
             <span className={`whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>Admin Login</span>
           </button>
           <button onClick={handleInstallAppClick} className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-center py-3 gap-2'} bg-srcc-yellow/10 border border-srcc-yellow/40 text-srcc-yellow mt-2 rounded-[5px] font-bold hover:bg-srcc-yellow hover:text-srcc-portalNavy transition-all group`}>
             <Download className="w-4 h-4 shrink-0" /> 
             <span className={`whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>Install App</span>
           </button>
        </div>
      </aside>

      {/* MOBILE SIDEBAR MODAL */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-transparent z-50 md:hidden flex justify-start">
           <aside className="w-64 bg-srcc-portalNavy text-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300 relative">
             <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src="/SRCC.svg" alt="SRCC" className="w-8 h-8" />
                  <div>
                    <h1 className="font-serif font-bold text-xl leading-tight tracking-wide text-white">SRCC ASSIST</h1>
                    <p className="text-srcc-yellow text-[10px] font-medium tracking-widest uppercase">Student Portal</p>
                  </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white bg-white/10 p-2 rounded-full hover:bg-red-500 transition-colors shadow-lg">
                  <XCircle className="w-5 h-5" />
                </button>
             </div>
             <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
               <button onClick={() => { setActiveTab('student_portal'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-start px-4 gap-3 py-3 rounded-[5px] font-bold transition-all ${activeTab === 'student_portal' ? 'bg-srcc-yellow text-gray-100' : 'text-gray-300'}`}>
                 <LayoutDashboard className="w-5 h-5 shrink-0" /> <span>Dashboard</span>
               </button>
               <button onClick={() => { setActiveTab('rooms'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-start px-4 gap-3 py-3 rounded-[5px] font-bold transition-all ${activeTab === 'rooms' ? 'bg-srcc-yellow text-gray-100' : 'text-gray-300'}`}>
                 <LucideMap className="w-5 h-5 shrink-0" /> <span>Room Finder</span>
               </button>
               <button onClick={() => { setActiveTab('teachers'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-start px-4 gap-3 py-3 rounded-[5px] font-bold transition-all ${activeTab === 'teachers' ? 'bg-srcc-yellow text-gray-100' : 'text-gray-300'}`}>
                 <Contact className="w-5 h-5 shrink-0" /> <span>Staff Info</span>
               </button>
               <button onClick={() => { setActiveTab('timetable'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-start px-4 gap-3 py-3 rounded-[5px] font-bold transition-all ${activeTab === 'timetable' ? 'bg-srcc-yellow text-gray-100' : 'text-gray-300'}`}>
                 <Users className="w-5 h-5 shrink-0" /> <span>Friends</span>
               </button>
               <button onClick={() => { setActiveTab('leave'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-start px-4 gap-3 py-3 rounded-[5px] font-bold transition-all ${activeTab === 'leave' ? 'bg-srcc-yellow text-gray-100' : 'text-gray-300'}`}>
                 <CalendarOff className="w-5 h-5 shrink-0" /> <span>On Leave</span>
               </button>
               <button onClick={() => { setActiveTab('attendance_tracker'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-start px-4 gap-3 py-3 rounded-[5px] font-bold transition-all ${activeTab === 'attendance_tracker' ? 'bg-srcc-yellow text-gray-100' : 'text-gray-300'}`}>
                 <ClipboardCheck className="w-5 h-5 shrink-0" /> <span>Attendance</span>
               </button>
               <button onClick={() => { setActiveTab('societies'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-start px-4 gap-3 py-3 rounded-[5px] font-bold transition-all ${activeTab === 'societies' ? 'bg-srcc-yellow text-gray-100' : 'text-gray-300'}`}>
                 <Globe className="w-5 h-5 shrink-0" /> <span>Societies</span>
               </button>
             </nav>
             <div className="p-4 border-t border-white/10">
               <button onClick={() => { setIsAdminOpen(true); setLoginError(''); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-center py-3 gap-2 bg-white/10 text-white rounded-[5px] font-bold">
                 <Lock className="w-4 h-4 shrink-0" /> <span>Admin Login</span>
               </button>
             </div>
           </aside>
        </div>
      )}

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* MOBILE HEADER FOR HAMBURGER */}
        <header className="absolute top-0 left-0 w-full z-30 md:hidden pointer-events-none pt-[max(env(safe-area-inset-top),1.25rem)]">
          <div className="px-4 py-3 flex items-center">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-gray-700 bg-white/70 backdrop-blur-md shadow-sm border border-gray-200/50 rounded-xl hover:bg-white transition-all pointer-events-auto">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* SCROLLING MAIN CONTENT */}
        <main
          className={`flex-1 overflow-x-hidden overflow-y-auto pb-48 relative ${activeTab === 'student_portal' && !isStudentLoggedIn && portalMode === 'login' ? '' : 'bg-gray-50'}`}
          style={activeTab === 'student_portal' && !isStudentLoggedIn && portalMode === 'login' ? { backgroundImage: 'url(/bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' } : {}}
        >
          {/* Overlay for login page - light so bg.jpg stays very visible */}
          {activeTab === 'student_portal' && !isStudentLoggedIn && portalMode === 'login' && (
            <div className="fixed inset-0 bg-srcc-portalNavy/25 pointer-events-none z-0" />
          )}
          <div className={activeTab === 'student_portal' && !isStudentLoggedIn && portalMode === 'login' ? "relative z-10 w-full min-h-full flex flex-col items-center justify-center" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32"}>

        {/* --- ATTENDANCE TRACKER TAB --- */}
        {activeTab === 'attendance_tracker' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 pt-[env(safe-area-inset-top)] mt-12 md:mt-0">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-srcc-yellow/20 text-srcc-portalNavy rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                  <ClipboardCheck className="w-4 h-4" /> Attendance Tracker V2
                </div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 tracking-tight leading-tight">
                  Track Your <span className="text-srcc-portalNavy">Presence</span>
                </h1>
                <p className="text-gray-500 mt-2 max-w-xl text-sm leading-relaxed">
                  Manage your attendance securely. Your data stays in your personal Google Sheet.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsInstructionsOpen(true)} className="p-2 bg-white text-gray-600 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">
                  <AlertCircle className="w-5 h-5" />
                </button>
                {attendanceConnected && (
                  <a href={attendanceSheetUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 font-bold text-sm rounded-lg hover:bg-green-100 transition-colors border border-green-200 shadow-sm">
                    <LucideMap className="w-4 h-4" /> Open Sheet
                  </a>
                )}
                {attendanceConnected && (
                  <button onClick={() => {
                    if (window.confirm('WARNING: Reset past records? This will delete all rows from your attendance spreadsheet and clear the data.')) {
                      fetch('/api/attendance_tracker/reset', { method: 'POST', headers: { Authorization: `Bearer ${authToken}` } }).then(() => {
                        window.location.reload();
                      });
                    }
                  }} className="p-2 bg-yellow-50 text-yellow-600 rounded-lg shadow-sm border border-yellow-100 hover:bg-yellow-100 transition-colors" title="Reset Past Records">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                {attendanceConnected && (
                  <button onClick={() => {
                    if (window.confirm('Disconnect Google Sheets? This will stop syncing your attendance. Your spreadsheet will not be deleted.')) {
                      fetch('/api/attendance_tracker/disconnect', { method: 'POST', headers: { Authorization: `Bearer ${authToken}` } }).then(() => setAttendanceConnected(false));
                    }
                  }} className="p-2 bg-red-50 text-red-600 rounded-lg shadow-sm border border-red-100 hover:bg-red-100 transition-colors" title="Disconnect Google Sheets">
                    <LogOut className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {!isStudentLoggedIn ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center max-w-md mx-auto mt-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Student Login Required</h2>
                <p className="text-gray-500 mb-6 text-sm">You need to log into your student portal to track your attendance.</p>
                <button onClick={() => setActiveTab('student_portal')} className="w-full py-3 bg-srcc-portalNavy text-white font-bold rounded-xl hover:bg-srcc-portalNavy/90 transition-colors">
                  Go to Login
                </button>
              </div>
            ) : isAttendanceLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <RefreshCw className="w-8 h-8 animate-spin mb-4" />
                <p>Loading attendance tracker...</p>
              </div>
            ) : !attendanceConnected ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center max-w-lg mx-auto mt-12 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-srcc-yellow to-green-400"></div>
                <div className="w-20 h-20 bg-blue-50 rounded-full mx-auto flex items-center justify-center mb-6">
                  <ClipboardCheck className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Connect Google Sheets</h2>
                <p className="text-gray-500 mb-8 leading-relaxed text-sm">
                  Track your attendance effortlessly. Connect your Google account to automatically create a professional attendance spreadsheet in your Google Drive. 
                  <br/><br/>
                  <span className="font-medium text-gray-700">If you connected previously, your existing sheet will be reused. We only request permission to manage files created by this app.</span>
                </p>
                <a href={`/api/auth/google_sheets?token=${authToken}`} className="inline-flex items-center justify-center gap-3 w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95">
                  <svg className="w-5 h-5 bg-white rounded-full p-1 text-blue-600" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z" /></svg>
                  Connect with Google
                </a>
              </div>
            ) : attendanceDashboard ? (
              <div className="space-y-6">
                
                {/* SUB-TABS NAVIGATION */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 flex flex-wrap gap-1 sticky top-16 z-20">
                  <button onClick={() => setAttendanceTab('overview')} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${attendanceTab === 'overview' ? 'bg-srcc-portalNavy text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                    <LayoutDashboard className="w-4 h-4" /> Overview
                  </button>
                  <button onClick={() => setAttendanceTab('subjects')} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${attendanceTab === 'subjects' ? 'bg-srcc-portalNavy text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                    <BookOpen className="w-4 h-4" /> Subjects
                  </button>
                  <button onClick={() => setAttendanceTab('projections')} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${attendanceTab === 'projections' ? 'bg-srcc-portalNavy text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                    <Target className="w-4 h-4" /> Projections
                  </button>
                  <button onClick={() => setAttendanceTab('calendar')} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${attendanceTab === 'calendar' ? 'bg-srcc-portalNavy text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                    <Calendar className="w-4 h-4" /> Calendar
                  </button>
                </div>

                {/* TAB CONTENT: OVERVIEW */}
                {attendanceTab === 'overview' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Projections Banner */}
                    {attendanceDashboard.projections?.status === 'at_risk' ? (
                      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-4 shadow-sm">
                        <div className="bg-red-100 p-2 rounded-full text-red-600 shrink-0"><AlertTriangle className="w-6 h-6" /></div>
                        <div>
                          <h4 className="font-bold text-red-900">Attendance Warning</h4>
                          <p className="text-red-700 text-sm mt-1">Based on current estimates, you need to attend <span className="font-bold">{attendanceDashboard.projections.classesNeededFor67}</span> more classes to maintain 66.67% across all subjects.</p>
                        </div>
                      </div>
                    ) : attendanceDashboard.projections?.canSkip > 0 ? (
                      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-4 shadow-sm">
                        <div className="bg-green-100 p-2 rounded-full text-green-600 shrink-0"><ShieldCheck className="w-6 h-6" /></div>
                        <div>
                          <h4 className="font-bold text-green-900">On Track</h4>
                          <p className="text-green-700 text-sm mt-1">You are maintaining a safe margin. You can afford to miss <span className="font-bold">{attendanceDashboard.projections.canSkip}</span> classes across the session and stay above 66.67%.</p>
                        </div>
                      </div>
                    ) : null}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 font-medium mb-1">Overall Attendance</p>
                          <div className="flex items-baseline gap-2">
                            <h3 className="text-4xl font-black text-gray-900">{attendanceDashboard.overallPercentage}%</h3>
                            <span className="text-sm text-gray-400 font-medium tracking-wide">TARGET: 66.67%</span>
                          </div>
                        </div>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${parseFloat(attendanceDashboard.overallPercentage) >= 66.67 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          <Target className="w-8 h-8" />
                        </div>
                      </div>
                      
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Attended</p>
                        <h3 className="text-2xl font-bold text-gray-900">{attendanceDashboard.present}</h3>
                      </div>
                      
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-3">
                          <XCircle className="w-5 h-5" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Missed</p>
                        <h3 className="text-2xl font-bold text-gray-900">{attendanceDashboard.absent}</h3>
                      </div>
                    </div>

                    {/* Recent Entries */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2"><Clock className="w-4 h-4 text-srcc-portalNavy" /> Recent Entries</h3>
                        <button onClick={() => setAttendanceTab('calendar')} className="text-sm font-bold text-blue-600 hover:text-blue-700">View Calendar &rarr;</button>
                      </div>
                      <div className="p-0">
                        {attendanceDashboard.recentEntries.length === 0 ? (
                          <div className="p-8 text-center text-gray-500 text-sm">No entries logged yet. Tap a class on your portal to mark attendance.</div>
                        ) : (
                          <ul className="divide-y divide-gray-100">
                            {attendanceDashboard.recentEntries.slice(0, 5).map((entry: any, i: number) => (
                              <li key={i} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-bold text-gray-900 truncate">{entry.subject}</p>
                                  <p className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {entry.timeSlot}</p>
                                </div>
                                {entry.status === 'Present' && <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-green-100 text-green-800 border border-green-200 shadow-sm">Present</span>}
                                {entry.status === 'Absent' && <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-red-100 text-red-800 border border-red-200 shadow-sm">Absent</span>}
                                {entry.status === 'Cancelled' && <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200 shadow-sm">Cancelled</span>}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: SUBJECTS */}
                {attendanceTab === 'subjects' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    {attendanceDashboard.subjects.length === 0 ? (
                      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500">
                        No subject data yet.
                      </div>
                    ) : attendanceDashboard.subjects.map((subj: any, i: number) => (
                      <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">{subj.name}</h4>
                            <p className="text-sm text-gray-500 font-medium mt-1">Total Classes Held: {subj.total - subj.cancelled} <span className="text-gray-300 mx-1">|</span> {subj.cancelled > 0 ? `${subj.cancelled} Cancelled` : 'No Cancellations'}</p>
                          </div>
                          <div className={`text-xl font-black ${subj.percentage >= 66.67 ? 'text-green-600' : 'text-red-600'}`}>
                            {subj.percentage}%
                          </div>
                        </div>
                        
                        <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden relative">
                          <div className="absolute top-0 bottom-0 left-[66.67%] w-0.5 bg-gray-400 z-10" title="66.67% Target"></div>
                          <div className={`h-full rounded-full transition-all duration-1000 ${subj.percentage >= 66.67 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, subj.percentage)}%` }}></div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-green-50 rounded-xl p-3 border border-green-100 flex justify-between items-center">
                            <span className="text-sm font-bold text-green-800">Attended</span>
                            <span className="text-lg font-black text-green-600">{subj.present}</span>
                          </div>
                          <div className="bg-red-50 rounded-xl p-3 border border-red-100 flex justify-between items-center">
                            <span className="text-sm font-bold text-red-800">Missed</span>
                            <span className="text-lg font-black text-red-600">{subj.absent}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB CONTENT: PROJECTIONS */}
                {attendanceTab === 'projections' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600 shrink-0"><Target className="w-5 h-5" /></div>
                        <div>
                          <h4 className="font-bold text-blue-900 text-lg">Target: 66.67%</h4>
                          <p className="text-blue-700 text-sm mt-1">This tool estimates remaining classes based on your timetable and current progression to help you plan your absences.</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white/60 p-3 rounded-xl">
                          <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">Weeks Elapsed</p>
                          <p className="text-xl font-black text-blue-900">{attendanceDashboard.projections?.weeksElapsed || 1}</p>
                        </div>
                        <div className="bg-white/60 p-3 rounded-xl">
                          <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">Weeks Left</p>
                          <p className="text-xl font-black text-blue-900">{attendanceDashboard.projections?.weeksRemaining || 15}</p>
                        </div>
                        <div className="bg-white/60 p-3 rounded-xl">
                          <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">Target Needs</p>
                          <p className="text-xl font-black text-blue-900">{attendanceDashboard.projections?.classesNeededFor67 || 0} classes</p>
                        </div>
                        <div className="bg-white/60 p-3 rounded-xl">
                          <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">Safe Absences</p>
                          <p className="text-xl font-black text-blue-900">{attendanceDashboard.projections?.canSkip || 0} classes</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="font-bold text-gray-900">Subject Breakdown</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                              <th className="p-4 font-bold">Subject</th>
                              <th className="p-4 font-bold text-center">Remaining</th>
                              <th className="p-4 font-bold text-center text-srcc-portalNavy">Must Attend</th>
                              <th className="p-4 font-bold text-center text-green-600">Can Skip</th>
                              <th className="p-4 font-bold">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {attendanceDashboard.subjectProjections?.map((proj: any, i: number) => (
                              <tr key={i} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-medium text-gray-900 text-sm">{proj.subject}</td>
                                <td className="p-4 text-center text-sm font-bold text-gray-500">{proj.remaining}</td>
                                <td className="p-4 text-center text-sm font-black text-srcc-portalNavy">{proj.mustAttend}</td>
                                <td className="p-4 text-center text-sm font-black text-green-600">{proj.canSkip}</td>
                                <td className="p-4">
                                  {proj.verdict === 'safe' ? (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-green-100 text-green-800">Safe</span>
                                  ) : (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-800">At Risk</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                            {(!attendanceDashboard.subjectProjections || attendanceDashboard.subjectProjections.length === 0) && (
                              <tr><td colSpan={5} className="p-8 text-center text-gray-500 text-sm">No projection data available yet.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: CALENDAR (BACKDATED MARKING) */}
                {attendanceTab === 'calendar' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                          <CalendarDays className="w-5 h-5 text-blue-600" /> Daily Record
                        </h3>
                        <input 
                          type="date" 
                          value={calendarDate}
                          onChange={(e) => setCalendarDate(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          className="px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                          <p className="text-sm text-blue-800 font-medium">Select a date above to view and manage past attendance records.</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4 border border-green-200 flex flex-col justify-center items-start sm:items-end sm:text-right">
                          <button 
                            onClick={() => {
                              setAttendanceMarking({ 
                                subject: 'Select Subject', type: 'Extra', 
                                timeSlot: `Extra-${Date.now()}`, 
                                room: '', teacher: '',
                                targetDate: calendarDate, targetDay: new Date(calendarDate).toLocaleDateString('en-US', { weekday: 'long' })
                              });
                            }}
                            className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm"
                          >
                            + Log Extra Class
                          </button>
                        </div>
                      </div>

                      {/* Display schedule for the selected date */}
                      {(() => {
                        const selDateObj = new Date(calendarDate);
                        const selDayNameStr = selDateObj.toLocaleDateString('en-US', { weekday: 'long' });
                        
                        if (selDayNameStr === 'Sunday') {
                          return <div className="text-center p-8 bg-gray-50 rounded-xl text-gray-500 font-medium border border-gray-100">No classes scheduled on Sunday.</div>;
                        }

                        const selDayName = selDayNameStr as DayOfWeek;

                        if (!myTimetableData || !myTimetableData[selDayName] || myTimetableData[selDayName].length === 0) {
                          return <div className="text-center p-8 bg-gray-50 rounded-xl text-gray-500 font-medium border border-gray-100">No classes found in your timetable for {selDayName}.</div>;
                        }

                        // We have classes. Let's find any existing entries for this date.
                        const dayEntries = attendanceDashboard.allEntries?.filter((e: any) => e.date === calendarDate) || [];

                        return (
                          <div className="space-y-3">
                            <h4 className="font-bold text-gray-700 text-sm mb-3 uppercase tracking-wider">{selDateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h4>
                            {myTimetableData[selDayName].map((cls: any, i: number) => {
                              // Find if this class is marked
                              const markedEntry = dayEntries.find((e: any) => e.timeSlot === cls.time);
                              
                              return (
                                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors bg-white">
                                  <div>
                                    <h5 className="font-bold text-gray-900">{cls.subject}</h5>
                                    <p className="text-xs text-gray-500 font-medium mt-1">{cls.time} • {cls.room} • {cls.teacher}</p>
                                  </div>
                                  
                                  <div className="flex items-center gap-3">
                                    {markedEntry ? (
                                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm ${
                                        markedEntry.status === 'Present' ? 'bg-green-100 text-green-800 border-green-200' :
                                        markedEntry.status === 'Absent' ? 'bg-red-100 text-red-800 border-red-200' :
                                        'bg-gray-100 text-gray-800 border-gray-200'
                                      }`}>
                                        {markedEntry.status}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                        Not Marked
                                      </span>
                                    )}
                                    
                                    <button 
                                      onClick={() => {
                                        setAttendanceMarking({
                                          ...cls,
                                          periodIndex: TIME_SLOTS.indexOf(cls.time), // Not strictly needed for backdated, but keeps struct
                                          targetDate: calendarDate,
                                          targetDay: selDayName
                                        });
                                      }}
                                      className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 shadow-sm transition-colors whitespace-nowrap"
                                    >
                                      {markedEntry ? 'Edit' : 'Mark'}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* --- STUDENT PORTAL TAB --- */}
        {activeTab === 'student_portal' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* 1. SETUP MODE */}
            {!isStudentLoggedIn && portalMode === 'setup_access' && (
              <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-50 rounded-full mx-auto flex items-center justify-center mb-4">
                    <ShieldCheck className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">One-Time Setup</h2>
                  <p className="text-gray-500 text-sm">Verification Successful! Please set up your profile.</p>
                </div>

                {portalError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />{portalError}
                  </div>
                )}
                
                <form onSubmit={handleSetAccessCode} className="space-y-4">
                  {onboardingProfile ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left mb-4">
                      <div className="flex justify-between items-start border-b border-gray-200 pb-2 mb-2">
                        <div>
                          <p className="font-bold text-gray-900">{onboardingProfile.name}</p>
                          <p className="text-sm font-medium text-gray-600">{onboardingProfile.rollNo}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Sem {onboardingProfile.semester}</p>
                          <p className="text-xs font-bold text-gray-500 mt-1">Sec {onboardingProfile.section}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">
                        {onboardingProfile.course} • Tut: {onboardingProfile.tutGroup || 'None'} • Prac: {onboardingProfile.pracGroup || 'None'}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-sm font-bold text-gray-500 mb-4 animate-pulse">
                      Loading profile...
                    </div>
                  )}

                  {dseGeRequired && isSem1to4 && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2 text-center">Select your DSE/GE Subject</label>
                      <select
                        value={dseGeCode}
                        onChange={e => setDseGeCode(e.target.value)}
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none"
                        required
                      >
                        <option value="">-- Choose Option --</option>
                        {dseGeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  )}

                  {dseGeRequired && isSem5or6 && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 text-center">Select DSE</label>
                        <select
                          value={dseCode}
                          onChange={e => setDseCode(e.target.value)}
                          className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none"
                          required
                        >
                          <option value="">-- DSE --</option>
                          {dseGeOptions.filter(opt => opt !== geCode).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 text-center">Select GE</label>
                        <select
                          value={geCode}
                          onChange={e => setGeCode(e.target.value)}
                          className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none"
                          required
                        >
                          <option value="">-- GE --</option>
                          {dseGeOptions.filter(opt => opt !== dseCode).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  {aecRequired && isSem1to4 && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2 text-center">Select your AEC</label>
                      <select
                        value={aecCode}
                        onChange={e => setAecCode(e.target.value)}
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none"
                        required
                      >
                        <option value="">-- Choose Option --</option>
                        {aecOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="pt-4 border-t border-gray-100">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 text-center">Set Your Access Code</label>
                    <input
                      type="password"
                      value={newAccessCode}
                      onChange={e => setNewAccessCode(e.target.value)}
                      placeholder="Enter a secret code"
                      className="w-full p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl text-center text-lg tracking-widest font-bold text-indigo-900 outline-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isPortalLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg mt-2 transition-all"
                  >
                    {isPortalLoading ? 'Saving...' : 'Save & Login'}
                  </button>
                </form>
              </div>
            )}

            {/* 2. CHANGE ACCESS MODE */}
            {!isStudentLoggedIn && portalMode === 'change_access' && (
              <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-200 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full mx-auto flex items-center justify-center mb-4">
                  <Key className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Welcome Back!</h2>
                <p className="text-gray-500 text-sm mb-6">Do you want to change your existing Access Code?</p>

                <div className="mb-6">
                  <input
                    type="password"
                    value={newAccessCode}
                    onChange={e => setNewAccessCode(e.target.value)}
                    placeholder="Enter new code"
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-center text-lg tracking-widest outline-none"
                  />
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handleSetAccessCode}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold shadow-md"
                  >
                    Update Code
                  </button>
                  <button
                    onClick={handleSkipChange}
                    className="w-full bg-white text-gray-500 py-3 rounded-xl font-bold border hover:bg-gray-50"
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}
            {/* 3. MASTER ACCESS MODE */}
            {!isStudentLoggedIn && portalMode === 'master_access' && (
              <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-200 text-center">
                <div className="w-16 h-16 bg-purple-50 rounded-full mx-auto flex items-center justify-center mb-4">
                  <Key className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Master Access</h2>
                <p className="text-gray-500 text-sm mb-6">Enter the Roll Number you wish to login as.</p>

                {portalError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />{portalError}
                  </div>
                )}

                <div className="mb-6">
                  <input
                    type="text"
                    value={setupRollNo}
                    onChange={e => setSetupRollNo(e.target.value.toUpperCase())}
                    placeholder="e.g. 24BC123"
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-center text-lg font-bold outline-none"
                  />
                </div>
                <div className="space-y-3">
                  <button
                    onClick={async () => {
                      setIsPortalLoading(true);
                      setPortalError('');
                      try {
                        const res = await fetch('/api/auth/master_login', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ token: authToken, rollNo: setupRollNo })
                        });
                        const data = await res.json();
                        if (res.ok) {
                          completeLogin(data.user);
                          localStorage.setItem("studentUser", JSON.stringify(data.user));
                        } else {
                          setPortalError(data.error || "Failed to master login.");
                        }
                      } catch (e) {
                        setPortalError("Connection error.");
                      } finally {
                        setIsPortalLoading(false);
                      }
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-bold shadow-md"
                  >
                    {isPortalLoading ? 'Loading...' : 'Login as Student'}
                  </button>
                  <button
                    onClick={() => setPortalMode('login')}
                    className="w-full bg-white text-gray-500 py-3 rounded-xl font-bold border hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* 4. LOGIN MODE */}
            {!isStudentLoggedIn && portalMode === 'login' && (
              <div className="w-full flex items-center justify-center pt-16 pb-8 px-4">

                {/* Glassmorphism login card - wider on desktop, perfectly centred */}
                <div className="w-full max-w-lg md:max-w-2xl lg:max-w-3xl text-white bg-white/8 backdrop-blur-2xl border border-white/25 rounded-2xl p-8 sm:p-10 lg:p-14 text-center shadow-[0_20px_60px_0_rgba(0,0,0,0.6)]">
                  <img src="/SRCC100.svg" alt="SRCC Assist" className="w-16 h-16 sm:w-20 sm:h-20 lg:w-28 lg:h-28 mx-auto mb-4 sm:mb-6 lg:mb-8 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:scale-110 transition-transform duration-500" />
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white mb-1 sm:mb-3 tracking-wide" style={{ fontFamily: "'Trajan Pro', 'Trajan', 'Cinzel', serif" }}>SRCC ASSIST</h2>
                  <p className="text-gray-300 text-xs sm:text-sm mb-4 sm:mb-6 font-light">Sign in with your college email.</p>

                  <div className="space-y-3 mb-4">
                    <button
                      onClick={handleGoogleLogin}
                      className="w-full bg-white/10 border border-white/20 text-white font-semibold py-3.5 rounded-[5px] flex items-center justify-center gap-3 hover:bg-white/20 transition-all"
                    >
                      <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                      Continue with Google
                    </button>
                    <button
                      onClick={handleMicrosoftLogin}
                      className="w-full bg-white/10 border border-white/20 text-white font-semibold py-3.5 rounded-[5px] flex items-center justify-center gap-3 hover:bg-white/20 transition-all"
                    >
                      <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" className="w-5 h-5" alt="Microsoft" />
                      Continue with Microsoft
                    </button>
                  </div>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-transparent text-gray-300 font-medium">OR</span>
                    </div>
                  </div>

                  <form onSubmit={handleManualLogin} className="space-y-5">
                    {portalError && (
                      <div className="text-red-400 text-sm font-bold flex items-center justify-center gap-1 bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                        <AlertCircle className="w-4 h-4" />{portalError}
                      </div>
                    )}

                    <div className="relative group text-left">
                      <input
                        type="text"
                        required
                        value={manualRollNo}
                        onChange={e => setManualRollNo(e.target.value.toUpperCase())}
                        className="w-full bg-transparent border border-[#DADADA] rounded-[5px] h-[45px] text-white px-4 pt-2 pb-1 focus:ring-0 focus:border-white transition-colors peer uppercase"
                      />
                      <label className="absolute left-4 top-[14px] text-[13px] tracking-[2px] text-[#DADADA] transition-all pointer-events-none peer-focus:top-[-8px] peer-focus:left-3 peer-focus:text-[11px] peer-focus:bg-srcc-portalNavy peer-focus:px-1 peer-valid:top-[-8px] peer-valid:left-3 peer-valid:text-[11px] peer-valid:bg-srcc-portalNavy peer-valid:px-1">
                        ROLL NO
                      </label>
                    </div>

                    <div className="relative group text-left">
                      <input
                        type="password"
                        required
                        value={manualPasscode}
                        onChange={e => setManualPasscode(e.target.value)}
                        className="w-full bg-transparent border border-[#DADADA] rounded-[5px] h-[45px] text-white tracking-widest px-4 pt-2 pb-1 focus:ring-0 focus:border-white transition-colors peer"
                      />
                      <label className="absolute left-4 top-[14px] text-[13px] tracking-[2px] text-[#DADADA] transition-all pointer-events-none peer-focus:top-[-8px] peer-focus:left-3 peer-focus:text-[11px] peer-focus:bg-srcc-portalNavy peer-focus:px-1 peer-valid:top-[-8px] peer-valid:left-3 peer-valid:text-[11px] peer-valid:bg-srcc-portalNavy peer-valid:px-1">
                        PASSCODE
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isPortalLoading}
                      className="w-full bg-srcc-yellow hover:bg-yellow-400 text-srcc-portalNavy py-[12px] mt-2 rounded-[5px] font-bold transition-all shadow-[0_4px_14px_0_rgba(252,235,8,0.39)] uppercase tracking-wide text-sm"
                    >
                      {isPortalLoading ? 'Logging in...' : 'Login with Code'}
                    </button>
                  </form>

                  {/* MOBILE INSTALL BUTTON — shown only on mobile, hidden when already installed */}
                  {!window.matchMedia('(display-mode: standalone)').matches && (
                    <div className="mt-5 md:hidden">
                      <button
                        onClick={handleInstallAppClick}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-[5px] border border-srcc-yellow/50 text-srcc-yellow bg-srcc-yellow/10 hover:bg-srcc-yellow hover:text-srcc-portalNavy font-bold text-sm transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Install App on Your Phone
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. DASHBOARD */}
            {isStudentLoggedIn && portalMode !== 'settings' && (
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-2xl p-6 shadow-lg flex justify-between items-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                  <div className="relative z-10">
                    <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                      <User className="w-4 h-4" /> My Dashboard
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-black mt-1 tracking-tight">{studentUser?.rollNo}</h2>
                    <p className="text-indigo-100 font-medium mt-1">{studentUser?.semester} • Section {studentUser?.section}</p>
                  </div>
                  <div className="relative z-10 flex gap-2">
                    <button
                      onClick={() => setPortalMode('settings')}
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all shadow-sm active:scale-95"
                    >
                      <Settings className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={handleStudentLogout}
                      className="p-3 bg-red-500/80 hover:bg-red-500 rounded-xl transition-all shadow-sm active:scale-95"
                    >
                      <LogOut className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* FEATURED AD BANNER LOGGED IN */}
                {renderFeaturedAd()}

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="font-bold text-gray-800 text-lg flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-indigo-600" /> Weekly Schedule
                    </span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{formattedDate}</span>
                  </div>

                  <div className="flex overflow-x-auto gap-2 p-4 border-b border-gray-100 scrollbar-hide bg-white">
                    {Object.values(DayOfWeek).map(day => (
                      <button
                        key={day}
                        onClick={() => setMyScheduleDay(day)}
                        className={`px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all flex-shrink-0 ${myScheduleDay === day
                            ? 'bg-indigo-600 text-white shadow-md scale-105'
                            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                          }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>

                  {attendanceConnected && myScheduleDay === currentDayName && (
                    <div className="px-5 py-2 mt-2">
                      <p className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg p-2 flex items-center justify-center gap-1.5 shadow-sm">
                        <CheckCircle className="w-3.5 h-3.5" /> Tap on a class to mark your attendance
                      </p>
                    </div>
                  )}

                  <div className="p-4 space-y-3 bg-gray-50/30">
                    {myTimetableData ? renderTimetableSlots(myTimetableData, myScheduleDay) : (
                      <div className="text-center py-12 text-gray-500">No schedule data found.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 5. SETTINGS MODE */}
            {isStudentLoggedIn && portalMode === 'settings' && (
              <div className="max-w-md mx-auto mt-6 bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Settings className="w-6 h-6 text-indigo-600" /> Settings
                </h2>

                {portalError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />{portalError}
                  </div>
                )}

                {portalMsg && (
                  <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm font-medium rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />{portalMsg}
                  </div>
                )}

                <form onSubmit={handleChangeSettingsPasscode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Current Passcode</label>
                    <input
                      type="password"
                      value={studentPasscode}
                      onChange={e => setStudentPasscode(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl outline-none"
                      placeholder="Enter current code"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">New Passcode</label>
                    <input
                      type="password"
                      value={newAccessCode}
                      onChange={e => setNewAccessCode(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl outline-none"
                      placeholder="Enter new code"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isPortalLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold shadow-md transition-all mt-2"
                  >
                    {isPortalLoading ? 'Updating...' : 'Update Passcode'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPortalMode('login'); setPortalError(''); setPortalMsg(''); }}
                    className="w-full text-gray-500 py-2 font-semibold hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            )}

          </div>
        )}

        {/* TIME CONTROLS FOR ROOMS & TEACHERS */}
        {(activeTab === 'rooms' || activeTab === 'teachers') && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 mb-4 text-gray-500 text-xs font-bold uppercase tracking-widest">
              <Clock className="w-4 h-4 text-red-600" /> Global Time Settings
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-xl p-3 outline-none"
              >
                {Object.values(DayOfWeek).map(day => <option key={day} value={day}>{day}</option>)}
              </select>
              <select
                value={selectedTimeIndex}
                onChange={(e) => setSelectedTimeIndex(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-xl p-3 outline-none"
              >
                {TIME_SLOTS.map((slot, index) => <option key={index} value={index}>{slot}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* --- FRIENDS TAB --- */}
        {activeTab === 'timetable' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {!isStudentLoggedIn ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center max-w-md mx-auto mt-10">
                <div className="w-20 h-20 bg-srcc-portalNavy/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-srcc-portalNavy" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Friends Portal</h2>
                <p className="text-gray-500 mb-6">
                  Log in to your student portal to connect with classmates, send/receive friend requests, and view their live schedules!
                </p>
                <button
                  onClick={() => setActiveTab('student_portal')}
                  className="w-full bg-srcc-portalNavy hover:bg-srcc-yellow text-gray-100 hover:text-srcc-portalNavy font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95"
                >
                  Go to Student Login
                </button>
              </div>
            ) : activeSearchTimetable ? (
              /* Viewing Friend's Timetable */
              <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6 bg-white p-5 rounded-2xl border shadow-sm items-start sm:items-center">
                  <div>
                    <span className="bg-srcc-yellow/20 text-srcc-portalNavy font-black text-xs px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Shared Schedule
                    </span>
                    <h2 className="text-2xl font-bold flex items-center gap-2 mt-2">
                      <Users className="w-6 h-6 text-srcc-portalNavy" /> {viewingFriendName}
                    </h2>
                    <p className="text-gray-500 font-medium mt-1">
                      Roll No: <span className="text-gray-900 font-bold bg-gray-100 px-2.5 py-0.5 rounded text-sm">{timetableRollNo}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                      value={searchTimetableDay}
                      onChange={(e) => setSearchTimetableDay(e.target.value as DayOfWeek)}
                      className="bg-gray-100 border-none text-gray-900 text-sm font-bold rounded-xl p-2.5 outline-none shadow-sm cursor-pointer"
                    >
                      {Object.values(DayOfWeek).map(day => <option key={day} value={day}>{day}</option>)}
                    </select>
                    <button
                      onClick={() => { setActiveSearchTimetable(null); setViewingFriendName(''); }}
                      className="text-sm font-bold text-gray-600 bg-gray-100 px-4 py-2.5 rounded-xl hover:bg-gray-200 flex items-center gap-2 transition-all"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" /> Back
                    </button>
                  </div>
                </div>
                <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-4 space-y-3 bg-gray-50/30">
                    {renderTimetableSlots(activeSearchTimetable, searchTimetableDay)}
                  </div>
                </div>
              </div>
            ) : (
              /* Friends Main Dashboard */
              <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
                
                {/* Header and Add Friend Row */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black text-srcc-portalNavy flex items-center gap-2">
                      Friends Connection
                    </h2>
                    <p className="text-gray-500 font-medium">
                      Manage classmate connections. Limit: <span className="font-bold text-srcc-portalNavy bg-gray-100 px-2 py-0.5 rounded">{friendsList.length}/10 friends</span>.
                    </p>
                  </div>

                  {/* Add Friend Form */}
                  <div className="w-full md:max-w-xs">
                    <form onSubmit={handleSendFriendRequest} className="relative">
                      <input
                        type="text"
                        placeholder="Enter Friend's Roll No"
                        value={friendSearchRoll}
                        onChange={(e) => setFriendSearchRoll(e.target.value.toUpperCase())}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none pr-12 text-sm font-bold placeholder-gray-400 focus:ring-2 focus:ring-srcc-portalNavy/20 uppercase"
                        disabled={isFriendsLoading}
                      />
                      <button
                        type="submit"
                        className="absolute right-2 top-2 p-1.5 bg-srcc-portalNavy hover:bg-srcc-yellow text-white hover:text-srcc-portalNavy rounded-lg transition-all"
                        title="Send Friend Request"
                        disabled={isFriendsLoading}
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>

                {/* Notifications & Feedback Messages */}
                {friendsError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    {friendsError}
                  </div>
                )}
                {friendsSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    {friendsSuccess}
                  </div>
                )}

                {/* Received Pending Friend Requests */}
                {incomingRequests.length > 0 && (
                  <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-amber-900 flex items-center gap-2 text-lg">
                      <Timer className="w-5 h-5 text-amber-600 animate-pulse" /> Pending Friend Requests ({incomingRequests.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {incomingRequests.map(req => (
                        <div key={req.roll_no} className="bg-white border border-amber-100 rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-amber-200 transition-all">
                          <div>
                            <p className="font-bold text-gray-900">{req.name || "Unknown Student"}</p>
                            <p className="text-xs font-semibold text-gray-500 uppercase">{req.roll_no}</p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleAcceptRequest(req.roll_no)}
                              className="px-3 py-1.5 bg-srcc-portalNavy hover:bg-srcc-yellow text-white hover:text-srcc-portalNavy font-bold rounded-lg text-xs transition-all"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectRequest(req.roll_no)}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 font-bold rounded-lg text-xs transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Friends List (Highlighted Name if Accepted) */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-srcc-portalNavy" /> My Friends ({friendsList.length})
                  </h3>
                  
                  {friendsList.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 font-medium">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      No friends added yet. Connect with roll numbers above!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {friendsList.map(friend => (
                        <div 
                          key={friend.roll_no} 
                          className="bg-white hover:bg-indigo-50/20 border border-gray-200 hover:border-indigo-300 rounded-2xl p-5 shadow-sm transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                        >
                          {/* Accent highlight strip on side */}
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600"></div>
                          
                          <div className="pl-2 space-y-2 cursor-pointer" onClick={() => handleViewFriendSchedule(friend.roll_no, friend.name)}>
                            {/* Friend Name - Highlighted premium indigo font since accepted */}
                            <h4 className="font-extrabold text-indigo-700 group-hover:text-indigo-900 transition-colors text-base flex items-center gap-1.5">
                              {friend.name || "Classmate"}
                              <CheckCircle className="w-3.5 h-3.5 text-indigo-500 fill-indigo-100 shrink-0" />
                            </h4>
                            <div>
                              <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">{friend.roll_no}</p>
                              <p className="text-[11px] font-semibold text-gray-500 mt-0.5">{friend.semester} • {friend.section}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-4 pl-2">
                            <button
                              onClick={() => handleViewFriendSchedule(friend.roll_no, friend.name)}
                              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                            >
                              <Search className="w-3 h-3" /> View Timetable
                            </button>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleRemoveFriend(friend.roll_no)}
                                className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
                                title="Remove Friend"
                              >
                                <UserMinus className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleBlockUser(friend.roll_no)}
                                className="text-gray-400 hover:text-red-700 p-1 rounded transition-colors"
                                title="Permanently Block"
                              >
                                <XCircle className="w-4 h-4 text-red-400/80" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sent Friend Requests (Pending) - Not highlighted / Grayed out */}
                {outgoingRequests.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      Sent Requests Pending ({outgoingRequests.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 opacity-60">
                      {outgoingRequests.map(req => (
                        <div key={req.roll_no} className="bg-gray-100 border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                          <div>
                            {/* Sender's view of sent request: unhighlighted gray, no clicking/highlighting */}
                            <p className="font-semibold text-gray-700">{req.name || "Unknown Student"}</p>
                            <p className="text-xs font-semibold text-gray-500 uppercase">{req.roll_no}</p>
                          </div>
                          <span className="text-[10px] font-bold text-gray-500 uppercase bg-gray-200 px-2 py-1 rounded">
                            Pending
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Blocked Users Section */}
                {blockedList.length > 0 && (
                  <div className="border-t border-gray-200 pt-6 space-y-3">
                    <h3 className="text-sm font-bold text-red-600/80 uppercase tracking-widest">
                      Blocked Connections ({blockedList.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {blockedList.map(blocked => (
                        <div key={blocked.roll_no} className="bg-red-50/50 border border-red-100 rounded-xl px-3 py-2 flex items-center gap-3 text-xs font-bold text-red-800">
                          <span>{blocked.name || blocked.roll_no} ({blocked.roll_no})</span>
                          <button
                            onClick={() => handleUnblockUser(blocked.roll_no)}
                            className="text-red-500 hover:text-red-700 hover:underline"
                          >
                            Unblock
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {/* --- ROOM FINDER TAB --- */}
        {activeTab === 'rooms' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             
             <h2 className="text-3xl font-black text-srcc-portalNavy mb-6 mt-2 flex items-center gap-3">
                <span className="w-2 h-8 bg-srcc-gold rounded-full"></span>
                Vacant Rooms
             </h2>
             
             {/* --- NEW: SEARCH & FILTER CONTROLS --- */}
             <div className="flex flex-col md:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                   <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Search className="w-5 h-5 text-gray-400" />
                   </div>
                   <input 
                     type="text" 
                     placeholder="Search room (e.g. 104)" 
                     value={searchQuery} 
                     onChange={(e) => setSearchQuery(e.target.value)} 
                     className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none shadow-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                   />
                </div>
                <div className="relative shrink-0 md:w-56">
                   <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Filter className="w-5 h-5 text-gray-400" />
                   </div>
                   <select 
                     value={filterType} 
                     onChange={(e) => setFilterType(e.target.value)} 
                     className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none shadow-sm font-bold text-gray-700 appearance-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                   >
                     <option value="All">All Rooms</option>
                     <option value="Lecture Hall">Lecture Halls</option>
                     <option value="Tutorial Room">Tutorial Rooms</option>
                     <option value="Computer Lab">Computer Labs</option>
                     <option value="Seminar Room">Seminar Rooms</option>
                   </select>
                </div>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {availableRooms.map((room) => {
                const duration = calculateFreeDuration(room, selectedTimeIndex);
                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`relative bg-white rounded-xl border p-5 flex flex-col items-center justify-center text-center transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95 group ${(room as any).tags ? 'border-green-400 ring-2 ring-green-50' : (room as any).isTaken ? 'border-orange-400 ring-2 ring-orange-50 bg-orange-50/50 opacity-80' : 'border-gray-200'}`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 text-xl font-bold shadow-sm ${(room as any).tags ? 'bg-green-100 text-green-700' : (room as any).isTaken ? 'bg-orange-100 text-orange-700' : 'bg-srcc-portalNavy/10 text-srcc-portalNavy group-hover:bg-srcc-portalNavy group-hover:text-srcc-yellow transition-colors'}`}>
                      {room.name.replace(/[^0-9]/g, '') || room.name.charAt(0)}
                    </div>
                    <h3 className={`font-bold text-lg ${ (room as any).isTaken ? 'text-orange-900' : 'text-gray-900' }`}>{room.name}</h3>

                    {(room as any).tags ? (
                      <span className="text-[10px] uppercase px-2 py-1 rounded-full mt-2 font-bold bg-green-100 text-green-700">FREED UP</span>
                    ) : (room as any).isTaken ? (
                      <span className="text-[10px] uppercase px-2 py-1 rounded-full mt-2 font-bold bg-orange-100 text-orange-700">TAKEN</span>
                    ) : (
                      <div className="flex items-center gap-1 mt-2 bg-gray-100 px-2 py-1 rounded-full">
                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">
                          {duration > 5 ? 'All Day' : `${duration} Hours`}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* --- TEACHER FINDER TAB --- */}
        {activeTab === 'teachers' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-2xl shadow-sm border p-4 mb-6 sticky top-24 z-30">
              <input
                type="text"
                placeholder="Search teacher..."
                value={finderSearchQuery}
                onChange={(e) => setFinderSearchQuery(e.target.value)}
                className="w-full text-lg pl-4 pr-4 py-3 bg-gray-50 rounded-xl outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleEntities.map((entity: any) => {
                const statusInfo = getEntityStatus(entity);
                const StatusIcon = statusInfo.icon;
                return (
                  <button 
                    key={entity.id} 
                    onClick={() => handleTeacherClick(entity)}
                    className="bg-white border rounded-xl p-5 hover:shadow-md transition-all text-left group active:scale-95"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-srcc-portalNavy/10 p-2.5 rounded-xl text-srcc-portalNavy group-hover:bg-srcc-portalNavy group-hover:text-srcc-yellow transition-colors">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div className={`px-3.5 py-1.5 rounded-lg text-sm font-black flex items-center gap-1.5 shadow-sm ${statusInfo.color === 'red' ? 'bg-red-50 text-red-700' : statusInfo.color === 'blue' ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-200' : 'bg-green-50 text-green-700'}`}>
                        <StatusIcon className="w-4 h-4" /> {statusInfo.status}
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{entity.name}</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mt-1">{entity.department}</p>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" /> {statusInfo.detail}
                      </p>
                      <div className="text-srcc-portalNavy opacity-0 group-hover:opacity-100 transition-opacity">
                         <Mail className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* --- LEAVE TAB --- */}
        {activeTab === 'leave' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TeachersOnLeaveDashboard />
          </div>
        )}

        {/* --- SOCIETIES TAB --- */}
        {activeTab === 'societies' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* 1. EVENTS GRID ON TOP */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {societyEvents.map((event) => (
                <div key={event.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all group relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-srcc-portalNavy/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
                    <div className="relative z-10">
                      <span className="inline-block bg-srcc-portalNavy/10 text-srcc-portalNavy text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md mb-3">
                        {event.event_type}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1">{event.event_name}</h3>
                      <p className="text-sm font-semibold text-gray-500 mb-4">{event.society_name}</p>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-srcc-portalNavy" /> {event.event_date}</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-srcc-portalNavy" /> {event.event_time}</div>
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-srcc-portalNavy" /> {event.location}</div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 mb-6">
                        {/* whitespace-pre-wrap ensures paragraph formatting works */}
                        <p className="text-sm text-gray-600 leading-relaxed italic whitespace-pre-wrap">{event.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Event Tracking Button */}
                  <button
                    onClick={() => handleTrackClick(event.id, event.registration_link)}
                    className="relative z-10 w-full text-center bg-srcc-portalNavy/5 text-srcc-portalNavy hover:bg-srcc-portalNavy hover:text-srcc-yellow py-3 rounded-xl font-bold transition-colors"
                  >
                    View / Register Now
                  </button>
                </div>
              ))}

              {societyEvents.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-200">
                  No upcoming events listed at the moment.
                </div>
              )}
            </div>

            {/* 2. PROMO BANNER AT BOTTOM */}
            <div className="bg-gradient-to-r from-srcc-portalNavy to-blue-900 rounded-2xl text-white p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2"><Megaphone className="w-6 h-6 text-srcc-yellow" /> Upcoming Society Events</h2>
                <p className="text-blue-100 mt-2">Discover what's happening around campus this week.</p>
              </div>
              <div className="text-center md:text-right">
                <a href="mailto:abcddcba121202@gmail.com" className="bg-white text-srcc-portalNavy hover:bg-srcc-yellow hover:text-srcc-portalNavy px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all">
                  <Mail className="w-5 h-5" /> List Your Event
                </a>
                
              </div>
            </div>

          </div>
        )}

        {/* --- LEGAL PAGES --- */}
        {activeTab.startsWith('legal_') && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto py-12 px-4 sm:px-6 mb-20">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <h2 className="text-3xl font-black text-srcc-portalNavy mb-6 border-b border-gray-100 pb-4">
                {activeTab === 'legal_disclaimer' ? 'Disclaimer' : 
                 activeTab === 'legal_terms' ? 'Terms Of Use' : 
                 activeTab === 'legal_policies' ? 'Website Policies' : 
                 activeTab === 'legal_contact' ? 'Contact Us' : ''}
              </h2>
              <div className="prose prose-indigo max-w-none text-gray-600 text-sm leading-relaxed space-y-4">
                {activeTab === 'legal_disclaimer' && (
                  <>
                    <p>The terms of use of the SRCC Assist portal are governed by our Website Terms of Use. Users and visitors are expected to have reviewed and consented to these terms.</p>
                    <p>The information contained in this portal (SRCC Assist) is for general information purposes only. The information is provided by Shri Ram College of Commerce (SRCC) and while it is endeavoured to keep the information up to date and correct, no representations or warranties of any kind, express or implied, are made about the completeness, accuracy, reliability, suitability or availability with respect to the portal or the information services contained on the portal for any purpose. Any reliance you place on such information is therefore strictly at your own risk.</p>
                    <p>In no event will the College be liable for any loss or damage including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this portal.</p>
                    <p>Every effort is made to keep the SRCC Assist portal up and running smoothly. However, Shri Ram College of Commerce takes no responsibility for, and will not be liable for, the portal being temporarily unavailable due to technical issues beyond its control.</p>
                  </>
                )}
                {activeTab === 'legal_terms' && (
                  <>
                    <p>The SRCC Assist portal (the 'Host' application) is a copyrighted work belonging to Shri Ram College of Commerce, University of Delhi. Certain features of the portal may be subject to additional guidelines, terms, or rules, which will be posted on the portal in connection with such features.</p>
                    <h3 className="text-lg font-bold text-gray-800 mt-6 mb-2">A. General</h3>
                    <p>A.1. The SRCC Assist portal is owned and operated by Shri Ram College of Commerce. Any person, individual or organization visiting the portal is termed as a “user”.</p>
                    <p>A.2. The Terms of Use describe the legally binding terms and conditions that oversee the user’s use of the portal.</p>
                    <p>A.3. By logging into this portal via student or administrator access, the user agrees compliance and consent to these terms. If the user disagrees with any/all of the provisions of these terms, they are requested to not log into and/or use the portal.</p>
                    <h3 className="text-lg font-bold text-gray-800 mt-6 mb-2">B. Access to the Portal</h3>
                    <p>B.1. User Rights: Subject to these Terms, the Host grants the user a non-transferable, non-exclusive, revocable, limited access to the portal solely for academic, non-commercial use.</p>
                    <p>B.2. Certain Restrictions: The user shall not sell, rent, lease, transfer, assign, distribute, host, or otherwise commercially exploit the portal. The user shall not change, make derivative works of, disassemble, reverse compile or reverse engineer any part of the portal.</p>
                    <p>B.3. Excluding any User Content that the user may provide, the user is aware that all the intellectual property rights, including copyrights, patents, trademarks, and trade secrets, in the portal and its content are owned by the Host.</p>
                    <h3 className="text-lg font-bold text-gray-800 mt-6 mb-2">C. Dispute Resolution & Liability</h3>
                    <p>To the maximum extent permitted by law, in no event shall the Host be liable to the user or any third-party for any lost profits, lost data, costs of procurement of substitute products, or any indirect, consequential, exemplary, incidental, special or punitive damages arising from or relating to these terms or the user’s use of the portal. Access to and use of the portal is at the user’s own discretion and risk.</p>
                  </>
                )}
                {activeTab === 'legal_policies' && (
                  <>
                    <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">A. Copyright Policy</h3>
                    <p>No part of the SRCC Assist portal may be copied, reproduced, distributed, republished, downloaded, displayed, posted or transmitted in any form or by any means unless otherwise indicated or through explicit consent of the Host.</p>
                    <h3 className="text-lg font-bold text-gray-800 mt-6 mb-2">B. Content Policy</h3>
                    <p>Though all efforts have been made to ensure the accuracy and currency of the content (including timetables, teacher schedules, and events) on this portal, the same should not be construed as a statement of law or used for any legal purposes. Information related to timetables and student data is provided for academic convenience and may be subject to real-time changes by the administration.</p>
                    <h3 className="text-lg font-bold text-gray-800 mt-6 mb-2">C. Local Storage & Caching Policy</h3>
                    <p>SRCC Assist utilizes local storage and Progressive Web App (PWA) caching strategies (like Stale-While-Revalidate) to securely store session information and static assets on your device. This is done strictly to ensure the portal operates efficiently under offline constraints and to keep the user logged securely over time without requiring repetitive access code entries.</p>
                    <h3 className="text-lg font-bold text-gray-800 mt-6 mb-2">D. Privacy & Security Policy</h3>
                    <p>The portal does not automatically capture any specific personal information from the user without explicit consent. Personal Information, where sought via student roll numbers or admin access codes, is collected, stored and addressed only with respect to the purpose of academic administration. To protect from unauthorized access and brute-force attempts, strict IP-based rate limiting is implemented alongside industry-standard data protection policies.</p>
                  </>
                )}
                {activeTab === 'legal_contact' && (
                  <>
                    <p>For any queries, support, or feedback regarding the SRCC Assist portal, please reach out to the college administration team.</p>
                    <div className="bg-gray-50 p-4 border rounded-lg mt-4 w-fit">
                      <p className="font-bold text-gray-800 mb-1">Shri Ram College of Commerce (SRCC)</p>
                      <p>University of Delhi, Maurice Nagar</p>
                      <p>New Delhi - 110007</p>
                      <br/>
                      <p><span className="font-semibold text-gray-700">Email:</span> principaloffice@srcc.du.ac.in</p>
                      <p><span className="font-semibold text-gray-700">Phone:</span> 011 - 27667905</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

          </div>
        </main>

        {/* GLOBAL FOOTER - Locks permanently to the bottom of the viewport beneath <main> */}
        <footer className="absolute bottom-0 w-full bg-srcc-portalNavy/95 border-t border-white/10 z-40 backdrop-blur-md">
          <div className="max-w-4xl mx-auto px-4 py-2 md:py-3 flex flex-col items-center justify-center -mt-1 md:mt-0">
            <div className="flex flex-wrap justify-center items-center gap-x-4 md:gap-x-6 gap-y-1 text-[10px] md:text-sm font-medium text-white/80 mb-1">
              <button onClick={() => setActiveTab('legal_disclaimer')} className="hover:text-white transition-colors focus:outline-none">Disclaimer</button>
              <span className="text-white/20">|</span>
              <button onClick={() => setActiveTab('legal_terms')} className="hover:text-white transition-colors focus:outline-none">Terms Of Use</button>
              <span className="text-white/20">|</span>
              <button onClick={() => setActiveTab('legal_policies')} className="hover:text-white transition-colors focus:outline-none">Policies</button>
              <span className="text-white/20">|</span>
              <button onClick={() => setActiveTab('legal_contact')} className="hover:text-white transition-colors focus:outline-none">Contact</button>
            </div>
            
            <div className="text-white/60 text-[11px] md:text-xs flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-center pb-0.5">
              <p>Developed with Curiosity by <a href="https://linkedin.com/in/keshavsingal" target="_blank" rel="noopener noreferrer" className="text-srcc-yellow hover:text-yellow-300 font-medium transition-colors"><b>Keshav Singal (24BC702)</b></a></p>
            </div>
          </div>
        </footer>
      </div>

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
                    <div key={index} className={`relative flex gap-4 p-3 rounded-xl border transition-all ${slot ? (slot.isAbsent ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200 opacity-70') : 'bg-green-50 border-green-200'} ${isCurrentSlot ? 'ring-2 ring-offset-2 ring-red-500 shadow-lg scale-[1.02] z-10 opacity-100' : ''}`}>
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
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{slot.teacher}</p>
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
              <h2 className="font-bold text-lg flex items-center gap-2"><Download className="w-5 h-5" /> Install App</h2>
              <button onClick={() => setIsInstallModalOpen(false)} className="hover:bg-red-700 p-1 rounded">✕</button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto text-gray-700">
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">📱 Android (Chrome)</h3>
                <ol className="list-decimal pl-5 space-y-1 text-sm">
                  <li>Open <b>Google Chrome</b> on your Android device.</li>
                  <li>Tap the <b>three-dot menu</b> in the top-right corner.</li>
                  <li>Select <b>“Add to Home screen.”</b></li>
                  <li>Edit the name if required, then tap <b>Add</b>.</li>
                </ol>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2"><Share className="w-5 h-5 text-blue-600" /> iPhone / iPad (Safari)</h3>
                <ol className="list-decimal pl-5 space-y-1 text-sm">
                  <li>Open <b>Safari</b> on your iPhone or iPad.</li>
                  <li>Tap the <b>Share button</b> (square with an upward arrow).</li>
                  <li>Scroll down and tap <b>“Add to Home Screen.”</b></li>
                  <li>Edit the name if required, then tap <b>Add</b>.</li>
                </ol>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t text-center">
              <button onClick={() => setIsInstallModalOpen(false)} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold text-gray-700 transition-colors">Close Instructions</button>
            </div>

          </div>
        </div>
      )}

      {/* ADMIN MODAL */}
      {isAdminOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">

            <div className="p-4 bg-red-800 text-white flex justify-between items-center">
              <h2 className="font-bold text-lg flex items-center gap-2"><Lock className="w-5 h-5" /> Admin Portal</h2>
              <button onClick={() => setIsAdminOpen(false)} className="hover:bg-red-700 p-1 rounded">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {!isLoggedIn ? (
                <div className="space-y-4">
                  <p className="text-gray-600 text-center">Enter Access Code</p>

                  {loginError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg border text-sm font-medium">
                      <AlertCircle className="w-4 h-4" />{loginError}
                    </div>
                  )}

                  <input
                    type="password"
                    value={adminPass}
                    onChange={e => setAdminPass(e.target.value)}
                    className="w-full p-3 border rounded-xl text-center text-lg tracking-widest outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    onClick={handleAdminLogin}
                    className="w-full bg-red-800 text-white py-3 rounded-xl font-bold hover:bg-red-900 transition-colors"
                  >
                    Unlock Dashboard
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-bold text-gray-800">Welcome, Admin</p>
                    <button onClick={() => setIsLoggedIn(false)} className="text-xs text-red-600 font-bold flex items-center gap-1">
                      <LogOut className="w-3 h-3" /> Logout
                    </button>
                  </div>

                  {/* ADMIN TABS */}
                  <div className="flex border-b border-gray-200 mb-4">
                    <button onClick={() => setAdminTab('attendance')} className={`flex-1 py-2 font-bold text-sm transition-colors ${adminTab === 'attendance' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-400 hover:text-gray-600'}`}>Attendance</button>
                    <button onClick={() => setAdminTab('rooms_update')} className={`flex-1 py-2 font-bold text-sm transition-colors ${adminTab === 'rooms_update' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-400 hover:text-gray-600'}`}>Room Data</button>
                    <button onClick={() => setAdminTab('events')} className={`flex-1 py-2 font-bold text-sm transition-colors ${adminTab === 'events' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-400 hover:text-gray-600'}`}>Manage Ads</button>
                  </div>

                  {/* ATTENDANCE TAB */}
                  {adminTab === 'attendance' && (
                    <>
                      <input
                        type="text"
                        className="block w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm mb-4 outline-none"
                        placeholder="Search for a teacher..."
                        value={adminSearchQuery}
                        onChange={(e) => setAdminSearchQuery(e.target.value)}
                      />
                      <div className="space-y-2">
                        {(Object.values(liveTeachers) as any[])
                          .filter(t => t.id !== 'ADMIN')
                          .filter(t => (t.name || '').toLowerCase().includes(adminSearchQuery.toLowerCase()))
                          .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                          .map((t: any) => (
                            <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <div><p className="font-bold text-gray-800 text-sm">{t.name}</p></div>
                              <button onClick={() => toggleAbsence(t.id)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${absentTeachers.includes(t.id) ? 'bg-red-500 text-white shadow-md' : 'bg-white border text-gray-600'}`}>
                                {absentTeachers.includes(t.id) ? 'ABSENT' : 'Present'}
                              </button>
                            </div>
                          ))}
                      </div>
                    </>
                  )}

                  {/* ROOM DATA UPDATE TAB */}
                  {adminTab === 'rooms_update' && (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-white p-2 rounded-lg shadow-sm text-indigo-600">
                            <Layers className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm">Room Data Engine</h3>
                            <p className="text-xs text-gray-500">Scrapes live data from srcccollegetimetable.in</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                          This will fetch the latest timetable for all <b>70 campus rooms</b> from the official SRCC website,
                          parse empty slots and teacher assignments, and update the database.
                        </p>
                        
                        <div className="flex flex-col gap-4 mb-4">
                          <button
                            onClick={startSync}
                            disabled={syncing}
                            className={`inline-flex items-center justify-center gap-2 px-5 py-3 font-bold text-sm rounded-lg transition-all shadow-sm active:scale-95 ${
                              syncing ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                            }`}
                          >
                            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                            {syncing ? 'Syncing...' : 'Sync All Rooms from Website'}
                          </button>
                          
                          {syncing && (
                            <div className="flex justify-between items-center text-sm text-gray-500 bg-white p-2 border border-gray-100 rounded-md">
                              <span>
                                {currentRoom && <span className="font-bold text-indigo-600">{currentRoom}</span>}
                              </span>
                              <span>{syncProgress} / {syncTotal} ({syncTotal > 0 ? Math.round((syncProgress/syncTotal)*100) : 0}%)</span>
                            </div>
                          )}
                        </div>

                        {/* Progress Bar */}
                        {(syncing || syncCompleted) && syncTotal > 0 && (
                          <div className="w-full bg-indigo-100 rounded-full h-2 overflow-hidden mb-4 border border-indigo-200">
                            <div
                              className={`h-full transition-all duration-300 ${syncCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                              style={{ width: `${Math.round((syncProgress / syncTotal) * 100)}%` }}
                            />
                          </div>
                        )}

                        {/* Live Log */}
                        {syncLogs.length > 0 && (
                          <div
                            ref={logRef}
                            className="bg-gray-900 text-gray-200 rounded-lg p-4 h-48 overflow-y-auto font-mono text-[11px] space-y-1 border border-indigo-200/50 shadow-inner"
                          >
                            {syncLogs.map((line, i) => (
                              <div key={i} className="leading-relaxed border-b border-gray-800 pb-1">{line}</div>
                            ))}
                          </div>
                        )}
                        
                      </div>

                      {roomUpdateMsg && (
                        <div className={`p-3 rounded-lg text-sm font-medium border ${
                          roomUpdateMsg.includes('smoothly')
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {roomUpdateMsg}
                        </div>
                      )}
                    </div>
                  )}

                  {/* EVENTS / ADS TAB */}
                  {adminTab === 'events' && (
                    <div className="space-y-6">

                      <form onSubmit={handleCreateEvent} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                          <Megaphone className="w-4 h-4 text-indigo-500" />
                          {editingEventId ? '✏️ Edit Listing' : '📢 Create New Listing'}
                        </h3>

                        {eventMsg && <div className="text-xs font-bold text-indigo-600 bg-indigo-50 p-2 rounded">{eventMsg}</div>}

                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" placeholder="Society Name" value={eventForm.society} onChange={e => setEventForm({ ...eventForm, society: e.target.value })} className="p-2.5 border border-gray-200 rounded-lg text-xs w-full outline-none" required />
                          <input type="text" placeholder="Event Name" value={eventForm.eventName} onChange={e => setEventForm({ ...eventForm, eventName: e.target.value })} className="p-2.5 border border-gray-200 rounded-lg text-xs w-full outline-none" required />
                          <input type="text" placeholder="Date (e.g. 15 Mar)" value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} className="p-2.5 border border-gray-200 rounded-lg text-xs w-full outline-none" required />
                          <input type="text" placeholder="Time (e.g. 10 AM)" value={eventForm.time} onChange={e => setEventForm({ ...eventForm, time: e.target.value })} className="p-2.5 border border-gray-200 rounded-lg text-xs w-full outline-none" required />
                          <input type="text" placeholder="Venue / Location" value={eventForm.location} onChange={e => setEventForm({ ...eventForm, location: e.target.value })} className="p-2.5 border border-gray-200 rounded-lg text-xs w-full outline-none" required />
                          <select value={eventForm.type} onChange={e => setEventForm({ ...eventForm, type: e.target.value })} className="p-2.5 border border-gray-200 rounded-lg text-xs w-full outline-none font-bold text-gray-600">
                            <option>Featured</option>
                            <option>Competition</option>
                            <option>Workshop</option>
                            <option>Speaker Session</option>
                          </select>
                        </div>

                        <input type="url" placeholder="Registration Link URL" value={eventForm.link} onChange={e => setEventForm({ ...eventForm, link: e.target.value })} className="p-2.5 border border-gray-200 rounded-lg text-xs w-full outline-none" required />
                        <textarea placeholder="Write a short description..." value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} className="p-2.5 border border-gray-200 rounded-lg text-xs w-full h-16 outline-none" required></textarea>

                        <div className="flex gap-2">
                          <button type="submit" disabled={isEventSubmitting} className="flex-1 bg-indigo-600 text-white font-bold py-2.5 rounded-lg shadow-md hover:bg-indigo-700 active:scale-95 transition-all text-sm">
                            {isEventSubmitting ? 'Saving...' : (editingEventId ? 'Update Ad' : 'Launch Ad')}
                          </button>
                          {editingEventId && (
                            <button type="button" onClick={handleCancelEdit} className="px-4 bg-gray-200 text-gray-700 font-bold py-2.5 rounded-lg hover:bg-gray-300 transition-all text-sm">
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>

                      <div className="space-y-3">
                        <h3 className="font-bold text-gray-800 text-sm border-b pb-2">Live & Past Listings Tracker</h3>
                        {societyEvents.map(event => (
                          <div key={event.id} className={`p-3 border rounded-xl flex flex-col gap-3 transition-all ${event.is_active ? 'bg-white border-green-200 shadow-sm' : 'bg-gray-100 border-gray-200 opacity-60'}`}>

                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-bold text-sm text-gray-900 leading-tight">{event.event_name}</p>
                                <p className="text-[10px] font-bold text-gray-500 uppercase">{event.society_name}</p>
                                <div className="flex gap-1 mt-2">
                                  <button onClick={() => handleEditClick(event)} className="text-[10px] font-black uppercase px-2 py-1 rounded shadow-sm bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center gap-1">
                                    <Edit className="w-3 h-3" /> Edit
                                  </button>
                                  <button onClick={() => handleDeleteEvent(event.id)} className="text-[10px] font-black uppercase px-2 py-1 rounded shadow-sm bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-1">
                                    <Trash2 className="w-3 h-3" /> Delete
                                  </button>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1 items-end">
                                <button onClick={() => handleToggleEvent(event.id, event.is_active)} className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded shadow-sm ${event.is_active ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700' : 'bg-gray-200 text-gray-600 hover:bg-green-100 hover:text-green-700'}`}>
                                  {event.is_active ? 'Live (Turn Off)' : 'Off (Turn On)'}
                                </button>
                                <button onClick={() => handlePinEvent(event.id)} className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded shadow-sm ${event.is_pinned ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' : 'bg-gray-100 text-gray-500 hover:bg-yellow-50'}`}>
                                  {event.is_pinned ? '★ Featured' : 'Make Featured'}
                                </button>
                              </div>
                            </div>

                            {/* Enhanced Daily & Total Analytics Board */}
                            <div className="grid grid-cols-2 gap-2 mt-2">

                              {/* VIEWS COLUMN */}
                              <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-3 flex flex-col items-center justify-center">
                                <span className="text-[9px] text-blue-600 font-black uppercase tracking-widest flex items-center gap-1 mb-1">
                                  <Eye className="w-3 h-3" /> Views
                                </span>
                                <div className="flex items-baseline gap-1">
                                  <span className="text-xl font-black text-blue-900">{event.total_views || 0}</span>
                                  <span className="text-[10px] font-bold text-blue-500">Total</span>
                                </div>
                                <div className="mt-1 pt-1 border-t border-blue-100 w-full text-center">
                                  <span className="text-[10px] font-bold text-blue-600/70">
                                    Today: <span className="text-blue-800 font-black">{event.today_views || 0}</span>
                                  </span>
                                </div>
                              </div>

                              {/* CLICKS COLUMN */}
                              <div className="bg-pink-50/50 rounded-xl border border-pink-100 p-3 flex flex-col items-center justify-center">
                                <span className="text-[9px] text-pink-600 font-black uppercase tracking-widest flex items-center gap-1 mb-1">
                                  <MousePointerClick className="w-3 h-3" /> Clicks
                                </span>
                                <div className="flex items-baseline gap-1">
                                  <span className="text-xl font-black text-pink-900">{event.total_clicks || 0}</span>
                                  <span className="text-[10px] font-bold text-pink-500">Total</span>
                                </div>
                                <div className="mt-1 pt-1 border-t border-pink-100 w-full text-center">
                                  <span className="text-[10px] font-bold text-pink-600/70">
                                    Today: <span className="text-pink-800 font-black">{event.today_clicks || 0}</span>
                                  </span>
                                </div>
                              </div>

                            </div>

                          </div>
                        ))}

                        {societyEvents.length === 0 && <p className="text-xs text-gray-500 text-center py-4 italic">No advertisements in the database.</p>}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: TEACHER CONTACT --- */}
      <TeacherContactModal />

      {/* --- MODAL: ATTENDANCE MARKING --- */}
      {attendanceMarking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col relative animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0">
            <div className="p-6 bg-srcc-portalNavy text-white">
              <button 
                onClick={() => setAttendanceMarking(null)}
                className="absolute top-4 right-4 bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              {attendanceMarking.type === 'Extra' ? (
                <div className="mb-2">
                  <select 
                    className="text-gray-900 bg-white font-bold w-full p-2 rounded-xl outline-none border border-gray-200 text-sm"
                    value={attendanceMarking.subject}
                    onChange={(e) => setAttendanceMarking({...attendanceMarking, subject: e.target.value})}
                  >
                    <option value="Select Subject">-- Select Subject --</option>
                    {attendanceDashboard?.subjects?.map((s:any) => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              ) : (
                <h2 className="text-xl font-black mb-1">{attendanceMarking.subject}</h2>
              )}
              <p className="text-srcc-yellow font-bold text-xs uppercase tracking-widest">{attendanceMarking.timeSlot || attendanceMarking.time} {attendanceMarking.room ? ` • Room ${attendanceMarking.room}` : ''}</p>
              {attendanceMarking.targetDate && (
                <p className="mt-2 text-sm text-blue-200 bg-black/20 inline-block px-2 py-1 rounded">
                  Backdated: {new Date(attendanceMarking.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              )}
            </div>
            <div className="p-6">
              <p className="text-gray-500 font-medium text-sm mb-4 text-center">Mark your attendance for this class.</p>
              <div className="grid grid-cols-3 gap-3">
                <button 
                  onClick={() => {
                    if (attendanceMarking.type === 'Extra' && attendanceMarking.subject === 'Select Subject') {
                      alert('Please select a subject for the extra attendance.');
                      return;
                    }
                    const payload = { 
                      ...attendanceMarking, 
                      status: 'Present', 
                      rollNo: studentUser?.rollNo,
                      date: attendanceMarking.targetDate || attendanceMarking.date,
                      day: attendanceMarking.targetDay || attendanceMarking.day,
                      timeSlot: attendanceMarking.timeSlot || attendanceMarking.time
                    };
                    if (!attendanceMarking.targetDate && attendanceMarking.type !== 'Extra') setTodayMarkedSlots(prev => ({ ...prev, [attendanceMarking.periodIndex]: 'Present' }));
                    setAttendanceMarking(null);
                    fetch('/api/attendance_tracker/mark', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
                      body: JSON.stringify(payload)
                    });
                  }}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-green-100 bg-green-50 hover:bg-green-100 hover:border-green-300 transition-all active:scale-95 ${attendanceMarking.type === 'Extra' ? 'col-span-3' : ''}`}
                >
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <span className="font-bold text-green-700 text-sm">{attendanceMarking.type === 'Extra' ? 'Log Extra Present' : 'Present'}</span>
                </button>
                {attendanceMarking.type !== 'Extra' && (
                  <>
                    <button 
                      onClick={() => {
                        const payload = { 
                          ...attendanceMarking, 
                          status: 'Absent', 
                          rollNo: studentUser?.rollNo,
                          date: attendanceMarking.targetDate || attendanceMarking.date,
                          day: attendanceMarking.targetDay || attendanceMarking.day,
                          timeSlot: attendanceMarking.timeSlot || attendanceMarking.time
                        };
                        if (!attendanceMarking.targetDate) setTodayMarkedSlots(prev => ({ ...prev, [attendanceMarking.periodIndex]: 'Absent' }));
                        setAttendanceMarking(null);
                        fetch('/api/attendance_tracker/mark', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
                          body: JSON.stringify(payload)
                        });
                      }}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-red-100 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all active:scale-95"
                    >
                      <XCircle className="w-8 h-8 text-red-500" />
                      <span className="font-bold text-red-700 text-sm">Absent</span>
                    </button>
                    <button 
                      onClick={() => {
                        const payload = { 
                          ...attendanceMarking, 
                          status: 'Cancelled', 
                          rollNo: studentUser?.rollNo,
                          date: attendanceMarking.targetDate || attendanceMarking.date,
                          day: attendanceMarking.targetDay || attendanceMarking.day,
                          timeSlot: attendanceMarking.timeSlot || attendanceMarking.time
                        };
                        if (!attendanceMarking.targetDate) setTodayMarkedSlots(prev => ({ ...prev, [attendanceMarking.periodIndex]: 'Cancelled' }));
                        setAttendanceMarking(null);
                        fetch('/api/attendance_tracker/mark', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
                          body: JSON.stringify(payload)
                        });
                      }}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-all active:scale-95"
                    >
                      <CalendarOff className="w-8 h-8 text-gray-500" />
                      <span className="font-bold text-gray-700 text-sm">Cancelled</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: ATTENDANCE INSTRUCTIONS --- */}
      {isInstructionsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative max-h-[90vh]">
            <div className="p-6 bg-blue-600 text-white shrink-0">
              <button onClick={() => setIsInstructionsOpen(false)} className="absolute top-4 right-4 bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-black mb-1 flex items-center gap-2"><ClipboardCheck className="w-6 h-6" /> How to use Tracker</h2>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="flex gap-3">
                <div className="w-8 h-8 shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black">1</div>
                <div>
                  <p className="font-bold text-gray-900">Go to your Dashboard</p>
                  <p className="text-sm text-gray-500 mt-0.5">Open the "Student Portal" tab to view your live weekly schedule.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black">2</div>
                <div>
                  <p className="font-bold text-gray-900">Tap on any class today</p>
                  <p className="text-sm text-gray-500 mt-0.5">Classes that are scheduled for today can be tapped. A prompt will appear asking you to mark your status.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black">3</div>
                <div>
                  <p className="font-bold text-gray-900">Backdated Marking</p>
                  <p className="text-sm text-gray-500 mt-0.5">Missed marking a class? Use the Calendar tab inside the Attendance Tracker to mark classes for any past date.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black">4</div>
                <div>
                  <p className="font-bold text-gray-900">Data goes to Google Sheets</p>
                  <p className="text-sm text-gray-500 mt-0.5">Your attendance is saved in your connected Google Spreadsheet. You can open it anytime to view raw data or make manual edits.</p>
                </div>
              </div>
              
              <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                <h4 className="font-bold text-red-900 flex items-center gap-2 mb-1"><AlertTriangle className="w-4 h-4" /> Disclaimer</h4>
                <p className="text-xs text-red-700 leading-relaxed">
                  This tracker is entirely based on your manual inputs and is meant strictly for personal record-keeping. It does <b>not</b> represent official college attendance records and should not be used as such. The college bears no responsibility for discrepancies.
                </p>
              </div>

              <button onClick={() => setIsInstructionsOpen(false)} className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 rounded-xl transition-colors">
                Got it, I understand
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;