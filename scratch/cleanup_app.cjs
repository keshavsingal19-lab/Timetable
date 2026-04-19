const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

// 1. Remove all duplicated sections manually to be safe
// We want exactly one set of imports, one convert function, one aggregated object, one getDayName, and then App.

const header = `import React, { useState, useMemo, useEffect } from 'react';
import {
  Clock, MapPin, Search, Filter, Lock, CheckCircle,
  XCircle, LogOut, AlertTriangle, AlertCircle, UserMinus,
  CalendarDays, Download, Share, Users, GraduationCap,
  ArrowRight, MessageCircle, Star, Timer, Megaphone, Mail, Home,
  BookOpen, User, UserPlus, Key, Settings, Menu, ShieldCheck, ChevronRight, ChevronLeft,
  Eye, MousePointerClick, Edit, Trash2, LayoutDashboard, Contact, CalendarOff, Globe, Map,
  RefreshCw, Layers
} from 'lucide-react';
import { DayOfWeek, TIME_SLOTS, RoomData } from './types';
import { ROOMS } from './data';
// import { TEACHER_SCHEDULES } from './teacherData';
import { SEM2_STUDENT_SCHEDULES } from './Sem2';
import { SEM4_STUDENT_SCHEDULES } from './Sem4';
import { sem6StudentData } from './Sem6';

// Helper function to dynamically fix Sem 6 formatting
const convertSem6Data = (data: any) => {
  const converted: Record<string, any> = {};
  const timeMap: Record<string, number> = {
    "8:30 AM to 9:30 AM": 0, "9:30 AM to 10:30 AM": 1,
    "10:30 AM to 11:30 AM": 2, "11:30 AM to 12:30 PM": 3,
    "12:30 PM to 1:30 PM": 4, "2:00 PM to 3:00 PM": 5,
    "3:00 PM to 4:00 PM": 6, "4:00 PM to 5:00 PM": 7,
    "5:00 PM to 6:00 PM": 8
  };
  const typeMap: Record<string, string> = { "L": "Lecture", "T": "Tutorial", "LAB": "Practical" };

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

// Combined all semesters with safety wrapper
const ALL_STUDENT_SCHEDULES = {
  ...(SEM2_STUDENT_SCHEDULES || {}),
  ...(SEM4_STUDENT_SCHEDULES || {}),
  ...convertSem6Data(sem6StudentData)
};

const getDayName = (day: DayOfWeek): string => day;

function App() {`;

// Locate where function App() really starts (the last occurrence)
const appStartIndex = content.lastIndexOf('function App() {');
if (appStartIndex !== -1) {
    const appBody = content.substring(appStartIndex + 'function App() {'.length);
    fs.writeFileSync('App.tsx', header + appBody);
    console.log('App.tsx cleaned and finalized');
} else {
    console.log('Could not find function App()');
}
