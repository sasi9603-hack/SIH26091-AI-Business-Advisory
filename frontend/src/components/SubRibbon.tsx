import React from 'react';
import { Calculator, BookOpen, MessageSquareText, CheckCircle2, TrendingUp } from 'lucide-react';

interface SubRibbonProps {
  activeModule: string;
  onSelectModule: (mod: string) => void;
  onOpenChat: () => void;
}

export const SubRibbon: React.FC<SubRibbonProps> = ({
  activeModule,
  onSelectModule,
  onOpenChat
}) => {
  return (
    <div className="bg-gradient-to-r from-[#00A5DF] via-[#0099DB] to-[#0077B6] text-white shadow-sm border-b border-sky-400 select-none">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-x-auto no-scrollbar">
        {/* Ribbon Tab Links */}
        <div className="flex items-center space-x-1 py-1 text-xs font-semibold whitespace-nowrap">
          <button
            onClick={() => onSelectModule('overview')}
            className={`px-3 py-2 rounded flex items-center gap-1.5 transition ${
              activeModule === 'overview'
                ? 'bg-sbi-indigo text-white font-bold shadow-inner'
                : 'hover:bg-white/15 text-sky-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-sbi-yellow" />
            <span>SIH26091 Scheme Advisory</span>
          </button>

          <button
            onClick={() => onSelectModule('market')}
            className={`px-3 py-2 rounded flex items-center gap-1.5 transition ${
              activeModule === 'market'
                ? 'bg-sbi-indigo text-white font-bold shadow-inner'
                : 'hover:bg-white/15 text-sky-50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
            <span>Local Demand &amp; Feasibility</span>
          </button>

          <button
            onClick={() => onSelectModule('calculator')}
            className={`px-3 py-2 rounded flex items-center gap-1.5 transition ${
              activeModule === 'calculator'
                ? 'bg-sbi-indigo text-white font-bold shadow-inner'
                : 'hover:bg-white/15 text-sky-50'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-amber-300" />
            <span>Financial Structuring</span>
          </button>

          <button
            onClick={() => onSelectModule('schemes')}
            className={`px-3 py-2 rounded flex items-center gap-1.5 transition ${
              activeModule === 'schemes'
                ? 'bg-sbi-indigo text-white font-bold shadow-inner'
                : 'hover:bg-white/15 text-sky-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-white" />
            <span>Government Schemes</span>
          </button>
        </div>

        {/* Action Buttons: AI Chat */}
        <div className="flex items-center space-x-2 py-1 pl-4">
          <button
            onClick={onOpenChat}
            className="bg-sbi-indigo hover:bg-purple-950 text-white font-bold text-xs px-3 py-1.5 rounded flex items-center gap-1.5 shadow-md border border-purple-400/30 transition active:scale-95"
            title="Open AI Business Advisor Chat"
          >
            <MessageSquareText className="w-3.5 h-3.5 text-sbi-yellow" />
            <span>Ask AI Advisor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
