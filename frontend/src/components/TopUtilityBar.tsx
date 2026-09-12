import React from 'react';
import { Phone, Globe, Lock } from 'lucide-react';

interface TopUtilityBarProps {
  currentLang: string;
  onLanguageChange: (lang: string) => void;
}

export const TopUtilityBar: React.FC<TopUtilityBarProps> = ({ currentLang, onLanguageChange }) => {
  return (
    <div className="bg-sbi-indigo text-white text-xs border-b border-purple-950 select-none">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        {/* Left Utility Links */}
        <div className="flex flex-wrap items-center space-x-3 text-slate-300">
          <a href="#main-content" className="hover:text-white transition">Skip to Main Content</a>
          <span>|</span>
          <a href="#about" className="hover:text-white transition">About Us</a>
          <span>|</span>
          <a href="#schemes" className="hover:text-white transition">Government Schemes</a>
          <span>|</span>
          <a href="https://www.jansamarth.in" target="_blank" rel="noreferrer" className="hover:text-sbi-yellow text-slate-200 transition font-medium">
            JanSamarth Portal ↗
          </a>
          <span>|</span>
          <a href="#grahak-setu" className="hover:text-white transition flex items-center gap-1">
            <span className="text-sbi-yellow">★</span> Grahak Setu
          </a>
          <span>|</span>
          <a href="#feedback" className="hover:text-white transition">Feedback</a>
        </div>

        {/* Right Accessibility & Language Controls */}
        <div className="flex items-center space-x-4">
          {/* Helpline */}
          <div className="hidden md:flex items-center space-x-1 text-slate-300">
            <Phone className="w-3.5 h-3.5 text-sbi-yellow" />
            <span>Toll-Free: <strong className="text-white">1800-11-2211</strong></span>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center space-x-1.5 bg-sbi-indigo-dark px-2 py-0.5 rounded border border-purple-900">
            <Globe className="w-3 h-3 text-sbi-blue-light" />
            <select
              value={currentLang}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
            >
              <option value="en" className="text-slate-900">English</option>
              <option value="hi" className="text-slate-900">हिंदी (Hindi)</option>
              <option value="te" className="text-slate-900">తెలుగు (Telugu)</option>
              <option value="ta" className="text-slate-900">தமிழ் (Tamil)</option>
            </select>
          </div>

          {/* Net Banking / Portal Login CTA */}
          <button
            onClick={() => alert("SIH26091 Advisory Portal Authentication: Prototype mode active. Full JanSamarth Single Sign-On (SSO) integration is planned for production.")}
            className="bg-sbi-yellow hover:bg-yellow-400 text-sbi-indigo font-bold px-3 py-1 rounded text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
          >
            <Lock className="w-3 h-3" />
            <span>Advisory Portal Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};
