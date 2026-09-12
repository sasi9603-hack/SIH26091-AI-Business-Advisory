import React from 'react';
import { BRANDING } from '../config/branding';
import { ShieldCheck, Phone, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-sbi-indigo-dark text-white border-t-4 border-sbi-blue mt-12 text-xs">
      {/* Top Banner Row */}
      <div className="bg-sbi-indigo py-4 border-b border-purple-900/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-sbi-yellow shrink-0" />
            <div>
              <span className="font-bold text-white block text-sm">{BRANDING.portalFullName}</span>
              <span className="text-slate-300 text-xs">Smart India Hackathon 2026 • Problem ID: {BRANDING.problemId}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-sbi-yellow" />
              <span>Helpline: {BRANDING.helpline}</span>
            </div>
            <span>|</span>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-sbi-blue-light" />
              <span>{BRANDING.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-slate-300">
        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 border-b border-purple-900 pb-1">
            Government Data Integrations
          </h4>
          <ul className="space-y-1.5 text-xs">
            <li><a href="https://udyamregistration.gov.in" target="_blank" rel="noreferrer" className="hover:text-sbi-yellow transition">UDYAM MSME Portal</a></li>
            <li><a href="https://data.gov.in" target="_blank" rel="noreferrer" className="hover:text-sbi-yellow transition">data.gov.in (Open Government Data)</a></li>
            <li><a href="https://www.openstreetmap.org" target="_blank" rel="noreferrer" className="hover:text-sbi-yellow transition">OpenStreetMap Geospatial POIs</a></li>
            <li><a href="https://censusindia.gov.in" target="_blank" rel="noreferrer" className="hover:text-sbi-yellow transition">Census of India (Demographics)</a></li>
            <li><a href="https://lgdirectory.gov.in" target="_blank" rel="noreferrer" className="hover:text-sbi-yellow transition">Local Government Directory (LGD)</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 border-b border-purple-900 pb-1">
            Credit &amp; Subsidy Portals
          </h4>
          <ul className="space-y-1.5 text-xs">
            <li><a href="https://www.jansamarth.in" target="_blank" rel="noreferrer" className="hover:text-sbi-yellow transition">JanSamarth National Portal</a></li>
            <li><a href="https://www.mudra.org.in" target="_blank" rel="noreferrer" className="hover:text-sbi-yellow transition">Pradhan Mantri MUDRA Yojana</a></li>
            <li><a href="https://www.kviconline.gov.in/pmegp" target="_blank" rel="noreferrer" className="hover:text-sbi-yellow transition">PMEGP E-Portal (KVIC)</a></li>
            <li><a href="https://pmfme.mofpi.gov.in" target="_blank" rel="noreferrer" className="hover:text-sbi-yellow transition">PM-FME (Food Processing)</a></li>
            <li><a href="https://pmvishwakarma.gov.in" target="_blank" rel="noreferrer" className="hover:text-sbi-yellow transition">PM Vishwakarma Scheme</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 border-b border-purple-900 pb-1">
            Advisory Guardrails &amp; Ethics
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            "AI interprets evidence; it does not invent local facts." All competitor discoveries are scored with confidence weights ($C_b$) and explicitly categorized into formal, mapped, or community-reported sources.
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 border-b border-purple-900 pb-1">
            Manual Customization
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
            To change the portal logo or banners, drop your images into <code className="text-sbi-yellow bg-purple-950 px-1 py-0.5 rounded">frontend/public/assets/</code> or update <code className="text-sbi-yellow bg-purple-950 px-1 py-0.5 rounded">src/config/branding.ts</code>.
          </p>
        </div>
      </div>

      {/* Bottom Social & Legal Strip (Matching Screenshot icons) */}
      <div className="bg-purple-950 py-3 border-t border-purple-900 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-4">
            <span className="font-bold text-white tracking-wide">CONNECT:</span>
            <span className="hover:text-white cursor-pointer transition font-mono">LinkedIn</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition font-mono">YouTube</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition font-mono">X (Twitter)</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition font-mono">Facebook</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition font-mono">GitHub</span>
          </div>

          <div className="text-[11px] text-slate-400">
            © 2026 SIH26091 Advisory Platform. Open-source prototype under Smart India Hackathon.
          </div>
        </div>
      </div>
    </footer>
  );
};
