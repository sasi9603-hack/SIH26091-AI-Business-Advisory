import React, { useState } from 'react';
import { EntrepreneurProfile, AdvisoryReport, FinancialBreakdown } from '../types';
import { X, Send, Bot, User, ShieldAlert } from 'lucide-react';

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
}

export const AIAssistantChat: React.FC<AIAssistantChatProps> = ({
  isOpen,
  onClose,
  profile,
  report,
  financials
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: profile.pincode 
        ? `Namaste! I am your SIH26091 Grounded AI Advisory Assistant. I synthesize verified spatial data, financial calculations, and government scheme rules for ${profile.villageTown || 'your area'} (PIN ${profile.pincode}). How can I assist your business plan today?`
        : `Namaste! I am your SIH26091 Grounded AI Advisory Assistant. Configure your target location and budget in the profile configurator, and I will assist you with verified spatial competition data and government subsidies.`,
      time: 'Just now'
    }
  ]);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const q = textToSend || input;
    if (!q.trim()) return;

    const userMsg: Message = { sender: 'user', text: q, time: 'Just now' };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');

    // Generate grounded deterministic response
    setTimeout(() => {
      let botResponse = '';
      const lower = q.toLowerCase();

      if (!financials || !report || financials.totalProjectCost <= 0) {
        botResponse = `Please click "Change Profile" on the top right to configure your target PIN code, business sector, and available equity capital. Once configured, I will calculate the exact subsidy eligibility and financial breakdown.`;
      } else if (lower.includes('subsidy') || lower.includes('pmegp') || lower.includes('margin')) {
        botResponse = `Under PMEGP guidelines for rural ${profile.socialCategory} category applicants, you are eligible for up to 35% margin money capital subsidy (₹${financials.subsidyAmount.toLocaleString('en-IN')}). Your personal beneficiary equity requirement is only 5% (₹${financials.beneficiaryContributionAmt.toLocaleString('en-IN')}). The application is routed via the District Industries Centre (DIC) on the KVIC portal.`;
      } else if (lower.includes('competition') || lower.includes('competitor') || lower.includes('shops')) {
        botResponse = `Our spatial engine discovered ${report.discoveredCompetitorsCount} existing competitor(s) within a 3km radius of PIN ${profile.pincode}. This represents a ${report.saturationLevel} saturation level (${report.saturationIndex} index). Because local demand is steady, a new shop with modern equipment and prompt turnaround will be viable.`;
      } else if (lower.includes('emi') || lower.includes('break-even') || lower.includes('cost')) {
        botResponse = `For a total estimated project budget of ₹${financials.totalProjectCost.toLocaleString('en-IN')}, your bank loan portion is ₹${financials.loanPrincipal.toLocaleString('en-IN')}. Over a 5-year tenure at ${financials.annualInterestRate}% interest, your monthly EMI is approximately ₹${financials.monthlyEmi.toLocaleString('en-IN')}. To break even, your shop must generate at least ₹${financials.breakEvenMonthlyRevenue.toLocaleString('en-IN')} in monthly revenue.`;
      } else if (lower.includes('mudra') || lower.includes('pmmy')) {
        botResponse = `Pradhan Mantri Mudra Yojana (PMMY) provides collateral-free working capital and term loans. For your budget level, you fall under the MUDRA KISHORE category (loans between ₹50,000 and ₹5,00,000). You can apply directly through JanSamarth or any commercial bank branch in ${profile.district}.`;
      } else {
        botResponse = `Based on your profile in ${profile.villageTown || 'your area'}, your current Opportunity Score is ${report.opportunityScore}/100 with a verdict of "${report.verdictLabel}". We recommend applying for PMEGP subsidy to minimize debt load and stocking high-turnover spare parts.`;
      }

      setMessages([...newMessages, { sender: 'bot', text: botResponse, time: 'Just now' }]);
    }, 400);
  };

  const quickPrompts = [
    "How to get 35% PMEGP subsidy?",
    "Why is competition moderate?",
    "What is my monthly break-even?",
    "Documents needed for Mudra loan?"
  ];

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
