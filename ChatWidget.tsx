import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Mic, MicOff, Volume2, VolumeX, MapPin, Search, ChevronRight } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  data?: any[];
  suggestions?: string[];
  speakText?: string;
}

function renderText(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  );
}

export function ChatWidget({ studentUser }: { studentUser: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'assistant',
    text: "Hey! 👋 Find rooms, teachers, or your schedule.\nType below or tap the mic to speak.",
    suggestions: ['Available rooms', 'My next class', 'Help']
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recRef = useRef<any>(null);

  const scrollToBottom = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages, isOpen, isLoading]);
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 300); }, [isOpen]);

  // Load voices on mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const resumeIntervalRef = useRef<any>(null);

  const stopSpeaking = useCallback(() => {
    // Stop Edge TTS audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
      audioRef.current = null;
    }
    // Stop browser speechSynthesis
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    // Clear Chrome glitch fix interval
    if (resumeIntervalRef.current) {
      clearInterval(resumeIntervalRef.current);
      resumeIntervalRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  // Humanize text for natural speech cadence
  const humanizeText = (text: string): string => {
    return text
      .replace(/\*\*/g, '')
      .replace(/[•→]/g, ' ')
      .replace(/\n/g, '. ')
      .replace(/(\d+)\s*rooms?\b/gi, (_, n) => `${n} rooms`)
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Primary: Edge TTS neural audio (works on ALL browsers)
  const speakEdgeTTS = useCallback(async (text: string, isHindi: boolean): Promise<boolean> => {
    const clean = humanizeText(text);
    if (!clean || clean.length > 500) return false;
    try {
      const lang = isHindi ? 'hi-IN' : 'en-IN';
      const url = `/api/tts?text=${encodeURIComponent(clean)}&lang=${lang}`;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => { setIsSpeaking(false); audioRef.current = null; };
      audio.onerror = () => { setIsSpeaking(false); audioRef.current = null; };
      await audio.play();
      return true;
    } catch {
      return false;
    }
  }, []);

  // Fallback: Improved browser speechSynthesis
  const getBestVoice = useCallback((isHindi: boolean) => {
    const voices = window.speechSynthesis?.getVoices() || [];
    const langPrefix = isHindi ? 'hi' : 'en';

    // Priority 1: Neural/Natural voices (Edge provides these)
    const neural = voices.find(v =>
      v.lang.startsWith(langPrefix) &&
      (v.name.includes('Neural') || v.name.includes('Natural')) &&
      !v.localService
    );
    if (neural) return neural;

    // Priority 2: Google online voices
    const google = voices.find(v =>
      v.lang.startsWith(langPrefix) && v.name.includes('Google')
    );
    if (google) return google;

    // Priority 3: Any non-local (online/cloud) voice
    const online = voices.find(v =>
      v.lang.startsWith(langPrefix) && !v.localService
    );
    if (online) return online;

    // Priority 4: Any voice for this language
    return voices.find(v => v.lang.startsWith(langPrefix)) || null;
  }, []);

  const speakBrowserFallback = useCallback((text: string, isHindi: boolean) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const clean = humanizeText(text);
    if (!clean) return;

    // Sentence fragmentation: split long text for fluid delivery
    const sentences = clean.match(/[^.!?]+[.!?]?/g) || [clean];
    const voice = getBestVoice(isHindi);

    const speakNext = (index: number) => {
      if (index >= sentences.length) {
        setIsSpeaking(false);
        if (resumeIntervalRef.current) { clearInterval(resumeIntervalRef.current); resumeIntervalRef.current = null; }
        return;
      }
      const s = sentences[index].trim();
      if (!s) { speakNext(index + 1); return; }

      const utt = new SpeechSynthesisUtterance(s);
      if (voice) { utt.voice = voice; utt.lang = voice.lang; }
      else utt.lang = isHindi ? 'hi-IN' : 'en-IN';
      utt.rate = 0.92;
      utt.pitch = 1.0;
      utt.volume = 1.0;
      utt.onstart = () => setIsSpeaking(true);
      utt.onend = () => speakNext(index + 1);
      utt.onerror = () => { setIsSpeaking(false); if (resumeIntervalRef.current) clearInterval(resumeIntervalRef.current); };
      window.speechSynthesis.speak(utt);
    };

    // Chrome 15-second glitch fix: periodically resume to prevent freezing
    resumeIntervalRef.current = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(resumeIntervalRef.current);
        resumeIntervalRef.current = null;
      } else {
        window.speechSynthesis.resume();
      }
    }, 10000);

    speakNext(0);
  }, [getBestVoice]);

  // Hybrid speak: try Edge TTS first, fallback to browser
  const speak = useCallback(async (text: string, isHindi: boolean) => {
    if (!autoSpeak || !text) return;
    stopSpeaking();
    const edgeWorked = await speakEdgeTTS(text, isHindi);
    if (!edgeWorked) {
      speakBrowserFallback(text, isHindi);
    }
  }, [autoSpeak, stopSpeaking, speakEdgeTTS, speakBrowserFallback]);

  // --- Phonetic Correction Dictionary ---
  // Maps common Web Speech API mishearings to correct words (Indian English context)
  const applyPhoneticCorrections = useCallback((raw: string): string => {
    let t = raw.toLowerCase().trim();
    const corrections: Record<string, string> = {
      // Common name mishearings
      'rina': 'reena', 'reena mom': 'reena maam', 'rina mom': 'reena maam',
      'rina mam': 'reena maam', 'rina ma\'am': 'reena maam',
      'mam': 'maam', 'mom': 'maam', 'ma\'am': 'maam', 'mem': 'maam',
      'sar': 'sir', 'sir ji': 'sir',
      // Common word fixes
      'kaha hai': 'kahan hai', 'kha hai': 'kahan hai', 'khan hai': 'kahan hai',
      'kahaan': 'kahan', 'kidher': 'kidhar',
      'cali': 'khali', 'khalli': 'khali', 'collie': 'khali',
      'awailable': 'available', 'avilable': 'available',
      'lekchar': 'lecture', 'lechar': 'lecture',
      'totorial': 'tutorial', 'tuotorial': 'tutorial',
      'rooom': 'room', 'rume': 'room',
      'skedule': 'schedule', 'schedual': 'schedule',
      'tommorow': 'tomorrow', 'tomarow': 'tomorrow', 'tamorrow': 'tomorrow',
      // Room code fixes (speech engines often add spaces or mangle short codes)
      'are 29': 'R29', 'are 30': 'R30', 'are 31': 'R31', 'are 32': 'R32',
      'are one': 'R1', 'are two': 'R2', 'are three': 'R3', 'are four': 'R4',
      'are five': 'R5', 'are six': 'R6', 'are seven': 'R7', 'are eight': 'R8',
      'p b 4': 'PB4', 'p b 3': 'PB3', 'p b 2': 'PB2',
      'pb four': 'PB4', 'pb three': 'PB3', 'pb two': 'PB2',
      'cl one': 'CL1', 'cl two': 'CL2', 'see lib': 'CLIB', 'c lib': 'CLIB',
      't one': 'T1', 't two': 'T2', 't three': 'T3',
      // Hindi query patterns often mangled
      'agla class': 'agla class', 'agle class': 'agla class',
      'next class': 'next class',
    };
    // Apply corrections (longest match first to avoid partial replacements)
    const sortedKeys = Object.keys(corrections).sort((a, b) => b.length - a.length);
    for (const wrong of sortedKeys) {
      if (t.includes(wrong)) {
        t = t.replace(new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), corrections[wrong]);
      }
    }
    // Clean up double spaces
    return t.replace(/\s+/g, ' ').trim();
  }, []);

  const toggleListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Voice not supported. Use Chrome or Safari.'); return; }

    // Always stop speaking first
    stopSpeaking();

    if (isListening && recRef.current) {
      recRef.current.stop();
      setIsListening(false);
      return;
    }

    // Request clean audio stream with noise suppression before starting recognition
    const startRecognition = () => {
      const rec = new SR();
      rec.lang = 'en-IN';
      rec.continuous = false;
      rec.interimResults = true; // Enable real-time visual feedback

      let finalText = '';

      rec.onresult = (e: any) => {
        let interim = '';
        let final = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const transcript = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            final += transcript + ' ';
          } else {
            interim += transcript;
          }
        }
        if (final.trim()) {
          finalText = applyPhoneticCorrections(final);
        }
        // Show interim results live in the input field
        const display = final.trim() ? finalText : applyPhoneticCorrections(interim);
        if (display) setInput(display);
      };

      rec.onend = () => {
        setIsListening(false);
        if (finalText.trim()) {
          setTimeout(() => sendMessage(finalText.trim()), 150);
        }
      };
      rec.onerror = () => setIsListening(false);

      recRef.current = rec;
      rec.start();
      setIsListening(true);
    };

    // Pre-condition audio stream for noise suppression
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      }).then(stream => {
        // Stream obtained = browser now uses noise-suppressed audio pipeline
        // We don't need to do anything with the stream; just having it active
        // conditions the audio hardware for the speech recognition that follows
        stream.getTracks().forEach(t => t.stop()); // Release immediately
        startRecognition();
      }).catch(() => {
        // Fallback: start without audio conditioning
        startRecognition();
      });
    } else {
      startRecognition();
    }
  }, [isListening, stopSpeaking, applyPhoneticCorrections]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    stopSpeaking();

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, rollNo: studentUser?.rollNo || null })
      });
      const r = await res.json();
      const botMsg: ChatMessage = {
        role: 'assistant',
        text: r.response || r.error || "Something went wrong.",
        data: r.data || undefined,
        suggestions: r.suggestions,
        speakText: r.speakText
      };
      setMessages(prev => [...prev, botMsg]);
      // Speak the short version, not the full response
      if (autoSpeak) speak(r.speakText || r.response || '', r.isHindi || false);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Connection error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button id="chatbot-fab" onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
        style={{ background: '#000066', boxShadow: '0 4px 20px rgba(0,0,102,0.35)' }}>
        <Search size={24} className="text-white" strokeWidth={2.5} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-[400px] bg-white sm:rounded-2xl shadow-2xl overflow-hidden z-[100] flex flex-col border-0 sm:border sm:border-gray-200"
      style={{ height: '100dvh', maxHeight: '100dvh', ...(typeof window !== 'undefined' && window.innerWidth >= 640 ? { height: '600px', maxHeight: 'calc(100vh - 100px)' } : {}) }}>

      {/* Header */}
      <div className="shrink-0 px-4 py-3 flex items-center gap-3" style={{ background: '#000066' }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(252,235,8,0.2)' }}>
          <Search size={18} style={{ color: '#FCEB08' }} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white text-sm leading-tight">Campus Finder</div>
          <div className="text-[11px] font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Rooms · Teachers · Schedule</div>
        </div>
        <button onClick={() => { setAutoSpeak(s => !s); if (isSpeaking) stopSpeaking(); }}
          className="p-1.5 rounded-full transition-colors" style={{ background: autoSpeak ? 'rgba(252,235,8,0.2)' : 'rgba(255,255,255,0.1)' }}
          title={autoSpeak ? 'Mute' : 'Unmute'}>
          {autoSpeak ? <Volume2 size={15} style={{ color: '#FCEB08' }} /> : <VolumeX size={15} className="text-white/40" />}
        </button>
        <button onClick={() => { setIsOpen(false); stopSpeaking(); }} className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
          <X size={18} className="text-white/70" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 bg-gray-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-end gap-2 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mb-0.5" style={{ background: '#000066' }}>
                  <Search size={12} className="text-white" strokeWidth={3} />
                </div>
              )}
              <div className={`px-3.5 py-2.5 text-[13px] leading-relaxed ${msg.role === 'user' ? 'text-white rounded-2xl rounded-br-sm shadow-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-sm shadow-sm'}`}
                style={msg.role === 'user' ? { background: '#000066' } : {}}>
                {msg.text.split('\n').map((line, i) => <p key={i} className="mb-1 last:mb-0">{renderText(line)}</p>)}
              </div>
            </div>

            {/* Data Cards */}
            {msg.data && msg.data.length > 0 && msg.role === 'assistant' && (
              <div className="mt-2 ml-8 flex flex-col gap-1.5 w-full max-w-[90%]">
                {msg.data.slice(0, 15).map((item: any, i: number) => (
                  <div key={i} className="bg-white px-3 py-2 rounded-xl border border-gray-100 flex items-center justify-between gap-2 shadow-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#000066' }}></div>
                      <span className="font-semibold text-gray-800 text-[13px] truncate">{item.subject || item.room}</span>
                      {item.subject && item.room && (
                        <span className="text-gray-400 text-[11px] truncate flex items-center gap-0.5"><MapPin size={10} />{item.room}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.time && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ color: '#000066', background: 'rgba(0,0,102,0.06)' }}>{item.time}</span>}
                      <span className="text-[10px] font-medium text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">{item.type}</span>
                    </div>
                  </div>
                ))}
                {msg.data.length > 15 && <div className="text-[11px] text-gray-400 text-center py-1">+{msg.data.length - 15} more</div>}
              </div>
            )}

            {/* Suggestions */}
            {msg.suggestions && msg.role === 'assistant' && idx === messages.length - 1 && !isLoading && (
              <div className="mt-2.5 ml-8 flex flex-wrap gap-1.5 max-w-[90%]">
                {msg.suggestions.map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s)}
                    className="bg-white hover:bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full text-[11px] font-semibold text-gray-700 transition-all active:scale-95 shadow-sm flex items-center gap-1">
                    {s} <ChevronRight size={10} className="text-gray-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-end gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: '#000066' }}>
              <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 p-3 bg-white border-t border-gray-100">
        {isListening && (
          <div className="mb-2 flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-red-500 text-xs font-semibold animate-pulse">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              Listening...
            </div>
            {input && (
              <div className="text-[11px] text-gray-500 font-medium italic max-w-full truncate px-2">
                "{input}"
              </div>
            )}
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex items-center gap-2">
          <button type="button" onClick={toggleListening}
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95 ${isListening ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            {isListening ? <MicOff size={18} strokeWidth={2.5} /> : <Mic size={18} strokeWidth={2.5} />}
          </button>
          <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Type a question..."}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-gray-300 transition-all font-medium text-gray-700 placeholder:text-gray-400"
            style={{ '--tw-ring-color': 'rgba(0,0,102,0.15)' } as any}
            disabled={isLoading || isListening} />
          <button type="submit" disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 hover:opacity-90"
            style={{ background: '#000066' }}>
            <Send size={16} strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
}
