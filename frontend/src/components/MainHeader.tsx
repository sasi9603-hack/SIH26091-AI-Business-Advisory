import React, { useState } from 'react';
import { BRANDING } from '../config/branding';
import { Search, Sparkles, Leaf, ShieldCheck } from 'lucide-react';

interface MainHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenWizard: () => void;
}

export const MainHeader: React.FC<MainHeaderProps> = ({ activeTab, onTabChange, onOpenWizard }) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-white border-b border-sbi-border shadow-sbi relative z-20">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Customizable Logo & Branding */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('overview')}>
          {/* Logo image with fallback */}
          <img
            src={BRANDING.logoUrl}
            alt={BRANDING.portalName}
            className="h-12 w-auto object-contain"
            onError={(e) => {
              // Fallback to inline SVG if custom logo image not found
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="hidden sm:block border-l border-slate-200 pl-3">
            <span className="text-[10px] uppercase tracking-wider text-sbi-blue font-bold block">
              {BRANDING.sponsorTag}
            </span>
            <span className="text-xs font-semibold text-slate-600 block">
              Problem ID: <strong className="text-sbi-indigo">{BRANDING.problemId}</strong>
            </span>
          </div>
        </div>

        {/* Center: Primary Navigation */}
        <nav className="hidden lg:flex items-center space-x-1 text-sm font-semibold text-sbi-navy">
          <button
            onClick={() => onTabChange('overview')}
            className={`px-3 py-2 rounded-t border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-sbi-blue text-sbi-blue font-bold bg-blue-50/50'
                : 'border-transparent hover:text-sbi-blue hover:bg-slate-50'
            }`}
          >
            ADVISORY DASHBOARD
          </button>
          <button
            onClick={() => onTabChange('market')}
            className={`px-3 py-2 rounded-t border-b-2 transition ${
              activeTab === 'market'
                ? 'border-sbi-blue text-sbi-blue font-bold bg-blue-50/50'
                : 'border-transparent hover:text-sbi-blue hover:bg-slate-50'
            }`}
          >
            MARKET FEASIBILITY
          </button>
          <button
            onClick={() => onTabChange('calculator')}
            className={`px-3 py-2 rounded-t border-b-2 transition ${
              activeTab === 'calculator'
                ? 'border-sbi-blue text-sbi-blue font-bold bg-blue-50/50'
                : 'border-transparent hover:text-sbi-blue hover:bg-slate-50'
            }`}
          >
            FINANCIAL STRUCTURING
          </button>
          <button
            onClick={() => onTabChange('schemes')}
            className={`px-3 py-2 rounded-t border-b-2 transition ${
              activeTab === 'schemes'
                ? 'border-sbi-blue text-sbi-blue font-bold bg-blue-50/50'
                : 'border-transparent hover:text-sbi-blue hover:bg-slate-50'
            }`}
          >
            FINANCIAL SCHEMES
          </button>
        </nav>

        {/* Right: Institutional Badges & Search */}
        <div className="flex items-center space-x-3">
          {/* Institutional Badges like in SBI portal */}
          <div className="hidden xl:flex items-center space-x-2 text-xs font-semibold">
            <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span>MSME GREEN</span>
            </span>
            <span className="flex items-center gap-1 text-sbi-indigo bg-purple-50 px-2 py-1 rounded border border-purple-200">
              <ShieldCheck className="w-3.5 h-3.5 text-sbi-indigo" />
              <span>UDYAM VERIFIED</span>
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search scheme, PIN, trade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-100 text-xs text-slate-800 pl-8 pr-3 py-1.5 rounded-full border border-slate-300 focus:outline-none focus:border-sbi-blue focus:bg-white w-40 sm:w-56 transition"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          {/* Quick Input Parameters Trigger */}
          <button
            onClick={onOpenWizard}
            className="bg-sbi-blue hover:bg-sbi-blue-dark text-white font-bold text-xs px-3.5 py-1.5 rounded-md shadow-sm flex items-center gap-1.5 transition active:scale-95"
            title="Edit Business Parameters & Target PIN"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Change Profile</span>
          </button>
        </div>
      </div>
    </header>
  );
};
