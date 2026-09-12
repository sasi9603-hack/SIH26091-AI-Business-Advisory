import React, { useState } from 'react';
import { OFFICIAL_SCHEMES } from '../services/schemeEngine';
import { GovernmentSchemeItem } from '../types';
import { BookOpen, ExternalLink, CheckCircle2, FileText, ShieldCheck } from 'lucide-react';

interface SchemeMatcherProps {
  onSelectScheme?: (scheme: GovernmentSchemeItem) => void;
}

export const SchemeMatcher: React.FC<SchemeMatcherProps> = () => {
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('term-loan');
  const activeScheme = OFFICIAL_SCHEMES.find(s => s.id === selectedSchemeId) || OFFICIAL_SCHEMES[0];

  return (
    <div className="bg-white rounded-xl shadow-sbi border border-sbi-border p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-sbi-navy flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sbi-blue" />
            <span>SIH26091 Financial Schemes Directory</span>
          </h2>
          <span className="text-[10px] bg-sky-50 text-sbi-blue font-bold px-2.5 py-1 rounded-full border border-sky-200">
            Official SIH26091 Framework
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Scheme specifications based on project cost and 10% beneficiary margin contribution
        </p>
      </div>

      {/* Scheme Selection Tabs */}
      <div className="flex flex-wrap gap-2">
        {OFFICIAL_SCHEMES.map((scheme) => (
          <button
            key={scheme.id}
            onClick={() => setSelectedSchemeId(scheme.id)}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 border ${
              selectedSchemeId === scheme.id
                ? 'bg-sbi-indigo text-white border-sbi-indigo shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>{scheme.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              selectedSchemeId === scheme.id ? 'bg-sbi-yellow text-sbi-indigo' : 'bg-slate-200 text-slate-700'
            }`}>
              {scheme.shortCode}
            </span>
          </button>
        ))}
      </div>

      {/* Active Scheme Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Scheme Specs (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-5">
          <div>
            <span className="text-[10px] font-bold text-sbi-blue uppercase tracking-wider block">
              {activeScheme.ministry}
            </span>
            <h3 className="text-xl font-bold text-sbi-navy mt-1">{activeScheme.name}</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{activeScheme.targetBeneficiaries}</p>
          </div>

          {/* Key Parameters Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Subsidy / Support</span>
              <span className="text-xs font-bold text-emerald-700 block mt-0.5">{activeScheme.subsidyPctRange}</span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Beneficiary Equity</span>
              <span className="text-xs font-bold text-sbi-indigo block mt-0.5">{activeScheme.beneficiaryEquityPct}</span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Project Cost Limit</span>
              <span className="text-xs font-bold text-slate-900 block mt-0.5">Up to ₹{(activeScheme.maxProjectCost / 100000).toFixed(0)} Lakhs</span>
            </div>
          </div>

          {/* Key Scheme Features */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-sbi-navy uppercase tracking-wider">Key Scheme Provisions:</h4>
            <div className="space-y-1.5">
              {activeScheme.keyFeatures.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Eligibility Rules */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold text-sbi-navy uppercase tracking-wider">Mandatory Eligibility:</h4>
            <div className="space-y-1.5">
              {activeScheme.eligibilityConditions.map((cond, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="text-sbi-blue font-bold">•</span>
                  <span>{cond}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Official Link Button */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Nodal Agency: <strong>{activeScheme.nodalAgency}</strong></span>
            <a
              href={activeScheme.portalUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-sbi-blue hover:bg-sbi-blue-dark text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition active:scale-95"
            >
              <span>Visit Official Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Right Required Documents Checklist (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-sbi-navy">
            <FileText className="w-5 h-5 text-sbi-blue" />
            <h3 className="font-bold text-sm">Mandatory Document Checklist</h3>
          </div>

          <p className="text-xs text-slate-500">
            Keep clear scanned copies ready before applying through JanSamarth or the nodal agency portal:
          </p>

          <div className="space-y-2.5">
            {activeScheme.documentChecklist.map((doc, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-700">
                <span className="w-4 h-4 rounded-full bg-sbi-blue text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{doc}</span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Banker's Tip:</strong> Ensure your Aadhaar card is linked to your mobile phone for instant e-KYC authentication on the JanSamarth national platform.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
