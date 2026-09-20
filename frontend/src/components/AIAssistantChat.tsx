import React, { useState } from 'react';
import { EntrepreneurProfile, AdvisoryReport, FinancialBreakdown } from '../types';
import { chatWithAdvisor, consultAiAgent } from '../services/api';
import { X, Send, Bot, User, ShieldAlert, Loader2, Sparkles } from 'lucide-react';

interface AIAssistantChatProps {
  isOpen: boolean;
  onClose: () => void;
  profile: EntrepreneurProfile;
  report: AdvisoryReport | null;
  financials: FinancialBreakdown | null;
}

interface Message {
  sender: 'bot' | 'user';
  text: string;
  time: string;
  isAiGenerated?: boolean;
}

export const AIAssistantChat: React.FC<AIAssistantChatProps> = ({
  isOpen,
  onClose,
  profile,
  report,
  financials
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quickPrompts, setQuickPrompts] = useState<string[]>([
    "What is my eligible scheme & loan?",
    "Explain moratorium & repayment",
    "How is project cost calculated?",
    "What is my monthly break-even?"
  ]);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: profile.villageTown || profile.pincode 
        ? `Namaste! I am your SIH26091 Grounded AI Advisory Assistant powered by Gemini. I synthesize verified spatial intelligence, deterministic calculations, and official scheme rules for ${profile.villageTown || 'your area'}. How can I assist your enterprise plan today?`
        : `Namaste! I am your SIH26091 Grounded AI Advisory Assistant. Configure your target location and Available Margin Capital in the profile configurator, and I will assist you with verified spatial competition data and scheme structuring.`,
      time: 'Just now'
    }
  ]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || input;
    if (!q.trim() || isLoading) return;

    const userMsg: Message = { sender: 'user', text: q, time: 'Just now' };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Query real Gemini AI Advisory endpoint
      const result = await chatWithAdvisor(q, {
        village_town: profile.villageTown,
        pincode: profile.pincode,
        category: profile.category,
        available_capital: profile.availableCapital
      });

      setMessages([
        ...newMessages,
        {
          sender: 'bot',
          text: result.response,
          time: 'Just now',
          isAiGenerated: true
        }
      ]);

      if (result.suggested_prompts && result.suggested_prompts.length > 0) {
        setQuickPrompts(result.suggested_prompts);
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          sender: 'bot',
          text: 'Sorry, could not connect to the advisory engine. Please verify the backend service is running.',
          time: 'Just now'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-sbi-border w-full max-w-lg h-[580px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-sbi-indigo text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-sbi-yellow text-sbi-indigo flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm flex items-center gap-1.5">
                <span>Grounded AI Business Advisor</span>
                <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded font-normal">Active</span>
              </h3>
              <p className="text-[11px] text-slate-300">Evidence-based • Anti-hallucination guardrails enabled</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white transition p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Anti-Hallucination Disclaimer */}
        <div className="bg-sky-50 px-4 py-2 border-b border-sky-100 flex items-center gap-2 text-[11px] text-sky-900 shrink-0">
          <ShieldAlert className="w-3.5 h-3.5 text-sbi-blue shrink-0" />
          <span>This AI interprets calculated spatial metrics and scheme policies; it does not invent facts.</span>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white ${
                m.sender === 'user' ? 'bg-sbi-blue' : 'bg-sbi-indigo'
              }`}>
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-sbi-yellow" />}
              </div>

              <div className={`max-w-[80%] p-3 rounded-xl leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-sbi-blue text-white rounded-tr-none'
                  : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
              }`}>
                <p>{m.text}</p>
                <span className={`text-[9px] block mt-1 ${m.sender === 'user' ? 'text-sky-100' : 'text-slate-400'}`}>
                  {m.time}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-sbi-indigo text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-sbi-yellow" />
              </div>
              <div className="bg-slate-100 text-slate-700 p-3 rounded-xl rounded-tl-none border border-slate-200 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sbi-blue" />
                <span className="text-[11px] text-slate-500">Gemini is synthesizing grounded advisory...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-1.5 shrink-0">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              className="text-[11px] bg-white hover:bg-sky-50 text-slate-700 border border-slate-300 rounded-full px-2.5 py-0.5 transition"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question regarding schemes, costs, or competition..."
            className="flex-1 bg-slate-100 border border-slate-300 rounded-full px-4 py-2 text-xs focus:outline-none focus:border-sbi-blue focus:bg-white"
          />
          <button
            onClick={() => handleSend()}
            className="w-9 h-9 rounded-full bg-sbi-indigo hover:bg-purple-950 text-white flex items-center justify-center transition active:scale-95 shadow"
          >
            <Send className="w-4 h-4 text-sbi-yellow" />
          </button>
        </div>
      </div>
    </div>
  );
};
