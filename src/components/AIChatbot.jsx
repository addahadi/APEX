import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, MessageCircle, Info } from 'lucide-react';

const PREDEFINED_QUESTIONS = [
  "How do I add a new project?",
  "Where can I view calculation history?",
  "How do the estimator formulas work?",
  "Can I export my project data?"
];

const AIChatbot = ({ isOpen, onClose }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });
  
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am your APEX Assistant. How can I help you navigate the system today?' }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  // Initialize position to bottom right only once
  useEffect(() => {
    if (isOpen && !isInitialized) {
      setPosition({
        x: window.innerWidth - 380 - 20, // 380 width, 20px padding
        y: window.innerHeight - 600 - 20 // 600 height, 20px padding
      });
      setIsInitialized(true);
    }
  }, [isOpen, isInitialized]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Dragging logic
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPosition({
        x: dragRef.current.initialX + dx,
        y: dragRef.current.initialY + dy
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleSend = (text) => {
    const msg = text || inputValue.trim();
    if (!msg) return;

    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInputValue("");

    // Mock AI Response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: `I understand you are asking about: "${msg}". Currently, I am operating in demonstration mode. Once fully integrated, I will pull exact schema instructions and project history to answer this!` 
      }]);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed z-[100] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-700 w-[380px] h-[600px] max-h-[90vh] overflow-hidden"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'auto'
      }}
    >
      {/* ─── Header (Draggable Zone) ─── */}
      <div 
        onMouseDown={handleMouseDown}
        className="bg-gradient-to-r from-primary to-blue-500 p-4 text-white p-4 cursor-grab active:cursor-grabbing flex items-center justify-between shrink-0"
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-black tracking-wide text-sm">APEX Assistant</h3>
            <p className="text-[10px] font-medium text-white/80 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Powered
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ─── Predefined Prompts ─── */}
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Info className="w-4 h-4" /> Suggested Actions
        </p>
        <div className="flex flex-col gap-2">
          {PREDEFINED_QUESTIONS.map((q, idx) => (
            <button 
              key={idx}
              onClick={() => handleSend(q)}
              className="text-left text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-3 h-3 shrink-0" /> {q}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Chat History ─── */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-white dark:bg-slate-900">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-br-sm' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-sm border border-slate-200 dark:border-slate-700'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ─── Input Area ─── */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-center"
        >
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a custom question..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-900 dark:text-white"
          />
          <button 
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-2 p-1.5 bg-primary text-white rounded-lg disabled:opacity-50 disabled:bg-slate-300 hover:bg-primary/90 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};

export default AIChatbot;
