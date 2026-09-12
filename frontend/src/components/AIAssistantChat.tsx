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
      text: profile.villageTown || profile.pincode 
        ? `Namaste! I am your SIH26091 Grounded AI Advisory Assistant. I synthesize verified spatial intelligence, financial calculations, and official SIH26091 scheme rules (Micro Finance & Term Loan) for ${profile.villageTown || 'your area'}. How can I assist your enterprise plan today?`
        : `Namaste! I am your SIH26091 Grounded AI Advisory Assistant. Configure your target location and Available Margin Capital in the profile configurator, and I will assist you with verified spatial competition data and scheme structuring.`,
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
        botResponse = `Please click "Change Profile" to configure your target location and Available Margin Capital. Once entered, I will calculate your estimated project cost (10x margin) and match the Micro Finance Scheme or Term Loan Scheme under SIH26091 guidelines.`;
      } else if (financials.isOutsideRange) {
        botResponse = `Your calculated project cost of ₹${financials.totalProjectCost.toLocaleString('en-IN')} (from an available margin of ₹${profile.availableCapital.toLocaleString('en-IN')}) exceeds the ₹50 lakh ceiling specified for the Term Loan Scheme under the SIH26091 framework. Please adjust your available margin capital to ₹5,00,000 or below.`;
      } else if (lower.includes('scheme') || lower.includes('loan') || lower.includes('margin') || lower.includes('cap')) {
        botResponse = `Under the SIH26091 10% beneficiary contribution model, your available margin of ₹${profile.availableCapital.toLocaleString('en-IN')} establishes an estimated project cost of ₹${financials.totalProjectCost.toLocaleString('en-IN')}. You qualify for the ${financials.selectedSchemeName} with an eligible loan of ₹${financials.eligibleLoan.toLocaleString('en-IN')} (capped at ₹${financials.schemeMaximumCap.toLocaleString('en-IN')}) at ${financials.annualInterestRate}% p.a. interest over ${financials.repaymentTenureYears} years.`;
      } else if (lower.includes('competition') || lower.includes('competitor') || lower.includes('shops')) {
        botResponse = `Our spatial engine discovered ${report.discoveredCompetitorsCount} existing competitor(s) in radius. This represents a ${report.saturationLevel} saturation level (${report.saturationIndex} index). Because local demand is steady, a well-equipped enterprise with prompt turnaround will be viable.`;
      } else if (lower.includes('moratorium') || lower.includes('repayment') || lower.includes('quarter') || lower.includes('emi')) {
        botResponse = `Under the ${financials.selectedSchemeName}, you receive an initial ${financials.moratoriumMonths}-month moratorium where no principal repayment is required. Following this grace period, your estimated quarterly repayment is approximately ₹${financials.quarterlyInstallment.toLocaleString('en-IN')} per quarter across ${(financials.repaymentTenureYears * 4) - Math.round(financials.moratoriumMonths / 3)} quarters.`;
      } else if (lower.includes('break-even') || lower.includes('cost') || lower.includes('revenue')) {
        botResponse = `To comfortably cover operating overheads plus quarterly debt servicing (~₹${Math.round(financials.quarterlyInstallment / 3).toLocaleString('en-IN')}/month equivalent), your enterprise in ${profile.villageTown || 'your area'} must generate at least ₹${financials.breakEvenMonthlyRevenue.toLocaleString('en-IN')} in monthly sales at a ${financials.grossMarginPercentage}% gross margin.`;
      } else {
        botResponse = `Based on your profile in ${profile.villageTown || 'your target area'}, your Opportunity Score is ${report.opportunityScore}/100 with a verdict of "${report.verdictLabel}". Your eligible funding tier is the ${financials.selectedSchemeName} with a ₹${financials.eligibleLoan.toLocaleString('en-IN')} loan and a ${financials.moratoriumMonths}-month moratorium.`;
      }

      setMessages([...newMessages, { sender: 'bot', text: botResponse, time: 'Just now' }]);
    }, 400);
  };

  const quickPrompts = [
    "What is my eligible scheme & loan?",
    "Explain moratorium & repayment",
    "How is project cost calculated?",
    "What is my monthly break-even?"
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
