import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, MessageCircle, Info, Loader2 } from 'lucide-react';
import { useChatQuestions, useChatAnswer, useChatExpert } from '@/hooks/useChat';
import { useTranslation } from "react-i18next";

const AIChatbot = ({ isOpen, onClose, location = 'GENERAL' }) => {
  const { t, i18n } = useTranslation("user");
  const { t: tc } = useTranslation("common");
  const isAr = i18n.language === 'ar';

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });
  
  const [messages, setMessages] = useState([
    { role: 'ai', text: tc("chatbot.welcome") }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  // Queries & Mutations
  const { data: questionsData, isLoading: isQLoading } = useChatQuestions(location);
  const getAnswerMutation = useChatAnswer();
  const expertMutation = useChatExpert();

  const isThinking = getAnswerMutation.isPending || expertMutation.isPending;

  // Initialize position to bottom right only once
  useEffect(() => {
    if (isOpen && !isInitialized) {
      setPosition({
        x: window.innerWidth - 380 - 20,
        y: window.innerHeight - 600 - 20
      });
      setIsInitialized(true);
    }
  }, [isOpen, isInitialized]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isThinking]);

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

  const handleSend = async (customText) => {
    const msg = customText || inputValue.trim();
    if (!msg || isThinking) return;

    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInputValue("");

    try {
      const response = await expertMutation.mutateAsync(msg);
      setMessages(prev => [...prev, { role: 'ai', text: response.message }]);
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || tc("error");
      setMessages(prev => [...prev, { role: 'ai', text: errorMsg, isError: true }]);
    }
  };

  const handleQuestionClick = async (q) => {
    if (isThinking) return;
    const questionText = isAr ? q.language.ar : q.language.en;
    setMessages(prev => [...prev, { role: 'user', text: questionText }]);

    try {
      const response = await getAnswerMutation.mutateAsync({ 
        questionId: q.id, 
        language: i18n.language 
      });
      const answerText = isAr ? response.answer.ar : response.answer.en;
      setMessages(prev => [...prev, { role: 'ai', text: answerText }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: tc("error"), isError: true }]);
    }
  };

  if (!isOpen) return null;

  const suggestions = questionsData?.questions || [];

  return (
    <div 
      className="fixed z-[1000] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-700 w-[380px] h-[600px] max-h-[90vh] overflow-hidden transition-colors"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'auto'
      }}
    >
      {/* ─── Header (Draggable Zone) ─── */}
      <div 
        onMouseDown={handleMouseDown}
        className="bg-gradient-to-r from-primary to-blue-500 p-4 text-white cursor-grab active:cursor-grabbing flex items-center justify-between shrink-0 select-none"
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-black tracking-wide text-sm">{t("chatbot.name")}</h3>
            <p className="text-[10px] font-medium text-white/80 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {t("chatbot.aiPowered")}
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
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" /> {t("chatbot.suggestions")}
        </p>
        <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto pr-1">
          {isQLoading ? (
            <div className="flex justify-center p-2"><Loader2 className="w-4 h-4 animate-spin text-slate-300" /></div>
          ) : suggestions.length > 0 ? (
            suggestions.map((q) => (
              <button 
                key={q.id}
                onClick={() => handleQuestionClick(q)}
                disabled={isThinking}
                className="text-left text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition-all flex items-center gap-2 group disabled:opacity-50"
              >
                <MessageCircle className="w-3 h-3 shrink-0 text-slate-300 group-hover:text-primary" /> 
                <span className="line-clamp-1">{isAr ? q.language.ar : q.language.en}</span>
              </button>
            ))
          ) : (
            <p className="text-[10px] text-slate-400 italic text-center">{t("chatbot.noSuggestions")}</p>
          )}
        </div>
      </div>

      {/* ─── Chat History ─── */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-white dark:bg-slate-900 scroll-smooth">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-br-sm shadow-md shadow-primary/10' 
                  : `bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-sm border border-slate-200 dark:border-slate-700 ${msg.isError ? 'border-red-200 bg-red-50 text-red-600' : ''}`
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl rounded-bl-sm border border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
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
            disabled={isThinking}
            placeholder={t("chatbot.placeholder")}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-900 dark:text-white disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!inputValue.trim() || isThinking}
            className="absolute right-2 p-1.5 bg-primary text-white rounded-lg disabled:opacity-50 disabled:bg-slate-300 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            {isThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChatbot;
