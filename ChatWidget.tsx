import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot, Sparkles, Loader2, MapPin, Clock } from 'lucide-react';

interface ChatWidgetProps {
  studentUser: any;
}

/** Renders text with **bold** markdown support */
function renderMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export function ChatWidget({ studentUser }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string; data?: any; suggestions?: string[] }[]>([
    { 
      role: 'bot', 
      text: "Hey! 👋 I'm your SRCC Timetable Assistant.\nAsk me about free rooms, your next class, or a room's status!", 
      suggestions: ['Rooms free right now', 'My next class', 'Help'] 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    const userMsg = { role: 'user' as const, text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          rollNo: studentUser?.rollNo || null
        })
      });
      
      const result = await response.json();
      
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: result.response || result.error || "Sorry, something went wrong.", 
        data: result.data,
        suggestions: result.suggestions
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Connection error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        id="chatbot-fab"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[100] p-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center"
        style={{ boxShadow: '0 4px 24px rgba(249, 115, 22, 0.4)' }}
      >
        {isOpen ? <X size={26} strokeWidth={2.5} /> : <MessageCircle size={26} strokeWidth={2.5} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] bg-white rounded-3xl shadow-2xl overflow-hidden z-[100] flex flex-col border border-gray-200/80"
          style={{ height: '600px', maxHeight: 'calc(100vh - 120px)', boxShadow: '0 8px 48px rgba(0,0,0,0.12)' }}
        >
          {/* ---- Header ---- */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white flex items-center gap-3 shrink-0">
            <div className="bg-white/20 p-2.5 rounded-xl">
              <Sparkles size={20} className="text-yellow-200" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-base leading-tight">Timetable Assistant</div>
              <div className="text-orange-100 text-[11px] font-medium mt-0.5">Ask anything about rooms, classes & teachers</div>
            </div>
            <button onClick={() => setIsOpen(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors shrink-0">
              <X size={18} />
            </button>
          </div>

          {/* ---- Messages ---- */}
          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-orange-50/30 to-white flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {/* Message bubble */}
                <div className={`flex items-end gap-2 max-w-[88%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' 
                      ? 'bg-orange-100 text-orange-600' 
                      : 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-sm'
                  }`}>
                    {msg.role === 'user' ? <User size={14} strokeWidth={2.5} /> : <Bot size={14} strokeWidth={2.5} />}
                  </div>
                  <div className={`px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl rounded-br-sm shadow-sm' 
                      : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-sm shadow-sm'
                  }`}>
                    {msg.text.split('\n').map((line, i) => (
                      <p key={i} className="mb-1 last:mb-0">{renderMarkdown(line)}</p>
                    ))}
                  </div>
                </div>
                
                {/* ---- Data Cards ---- */}
                {msg.data && Array.isArray(msg.data) && msg.data.length > 0 && msg.role === 'bot' && (
                  <div className="mt-2 ml-9 flex flex-col gap-1.5 w-full max-w-[88%]">
                    {msg.data.slice(0, 15).map((item: any, i: number) => (
                      <div key={i} className="bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between gap-2 hover:border-orange-200 transition-colors">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0"></div>
                          <span className="font-semibold text-gray-800 text-[13px] truncate">{item.room || item.subject}</span>
                          {item.room && item.subject && (
                            <span className="text-gray-400 text-[11px] truncate">in {item.room}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.time && (
                            <span className="text-[10px] font-medium text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">{item.time}</span>
                          )}
                          <span className="text-[10px] font-medium text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">{item.type || item.class_type}</span>
                        </div>
                      </div>
                    ))}
                    {msg.data.length > 15 && (
                      <div className="text-[11px] text-gray-400 text-center py-1">
                        +{msg.data.length - 15} more rooms
                      </div>
                    )}
                  </div>
                )}
                
                {/* ---- Suggestion Chips (only on last bot message) ---- */}
                {msg.suggestions && msg.suggestions.length > 0 && msg.role === 'bot' && idx === messages.length - 1 && !isLoading && (
                  <div className="mt-2.5 ml-9 flex flex-wrap gap-1.5 max-w-[88%]">
                    {msg.suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(s)}
                        className="bg-white hover:bg-orange-50 text-orange-600 border border-orange-200 hover:border-orange-300 px-3 py-1 rounded-full text-[11px] font-semibold transition-all shadow-sm active:scale-95"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing indicator */}
            {isLoading && (
              <div className="flex items-end gap-2 max-w-[88%]">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Loader2 size={14} className="animate-spin" strokeWidth={3} />
                </div>
                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ---- Input ---- */}
          <div className="p-3 bg-white border-t border-gray-100 shrink-0">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about rooms, classes, teachers..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 focus:bg-white transition-all font-medium text-gray-700 placeholder:text-gray-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 active:scale-95"
              >
                <Send size={16} strokeWidth={2.5} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
