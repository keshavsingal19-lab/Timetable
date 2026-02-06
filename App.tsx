import React, { useState, useMemo } from 'react';
import { Calendar, Clock, MapPin, Search, Filter } from 'lucide-react';
import { DayOfWeek, TIME_SLOTS, RoomData } from './types';
import { ROOMS } from './data';

function App() {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(DayOfWeek.Monday);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('All');

  const availableRooms = useMemo(() => {
    return ROOMS.filter(room => {
      // 1. Check if room is free at selected slot
      const isFree = room.emptySlots[selectedDay].includes(selectedTimeIndex);
      
      // 2. Check search query
      const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 3. Check type filter
      const matchesType = filterType === 'All' || room.type === filterType;

      return isFree && matchesSearch && matchesType;
    });
  }, [selectedDay, selectedTimeIndex, searchQuery, filterType]);

  const stats = useMemo(() => {
    const total = ROOMS.length;
    const available = availableRooms.length;
    const percentage = Math.round((available / total) * 100);
    return { available, total, percentage };
  }, [availableRooms]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* Header */}
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Day Selector */}
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

            {/* Time Selector */}
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

             {/* Room Type Filter */}
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

            {/* Search */}
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

        {/* Results Grid */}
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
                    className="group bg-white rounded-lg border border-gray-200 hover:border-red-500 hover:shadow-md transition-all duration-200 p-4 flex flex-col items-center justify-center text-center cursor-default"
                  >
                    <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-3 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                      <span className="font-bold text-lg">{room.name.replace(/[^0-9]/g, '') || room.name.charAt(0)}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">{room.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full mt-2 font-medium
                      ${room.type === 'Lab' ? 'bg-purple-100 text-purple-700' : 
                        room.type === 'Seminar Room' ? 'bg-orange-100 text-orange-700' : 
                        room.type === 'Tutorial Room' ? 'bg-teal-100 text-teal-700' :
                        'bg-blue-100 text-blue-700'}`}
                    >
                      {room.type}
                    </span>
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

       {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm space-y-8">
          
          {/* Disclaimer & Contact Section */}
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
          
          {/* Original Footer Info */}
          <div>
            <p>Data derived from SRCC Time Table 2025-26.</p>
            <p className="mt-1">Note: Break time is usually 01:30 PM - 02:00 PM.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;