import React, { useState } from 'react';
import { EntrepreneurProfile, AdvisoryReport, FinancialBreakdown, CompetitorBusiness } from '../types';
import { BRANDING } from '../config/branding';
import { CATEGORY_LABELS } from '../services/mockData';
import { 
  MapPin, 
  Percent, 
  ExternalLink, 
  ShieldCheck, 
  Calculator, 
  Sparkles
} from 'lucide-react';

interface AdvisoryOverviewProps {
  profile: EntrepreneurProfile;
  report: AdvisoryReport;
  financials: FinancialBreakdown;
  competitors: CompetitorBusiness[];
  onNavigateTab: (tab: string) => void;
  onOpenWizard: () => void;
  onOpenChat: () => void;
}

export const AdvisoryOverview: React.FC<AdvisoryOverviewProps> = ({
  profile,
  report,
  financials,
  competitors,
  onNavigateTab,
  onOpenWizard,
  onOpenChat
}) => {
  const [activeSideSubTab, setActiveSideSubTab] = useState<'features' | 'eligibility' | 'terms' | 'stories'>('features');

  return (
    <div className="space-y-6">
      {/* Breadcrumb Path like in SBI Portal */}
      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 pt-1">
        <span className="hover:text-sbi-blue cursor-pointer" onClick={() => onNavigateTab('overview')}>Business Advisory</span>
        <span>|</span>
        <span className="hover:text-sbi-blue cursor-pointer" onClick={() => onNavigateTab('schemes')}>SME &amp; Micro Loans</span>
        <span>|</span>
        <span className="text-sbi-indigo font-bold">PMMY &amp; PMEGP Rural Enterprise Scheme</span>
        <span>|</span>
        <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono">
          PIN {profile.pincode}
        </span>
      </div>

      {/* Main Two-Column Layout (Matching SBI Screenshot) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar (2.5 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Scheme Emblem Card with Cyan Curve Accent */}
          <div className="bg-white rounded-xl shadow-sbi border border-sbi-border p-5 text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-sbi-blue/15 rounded-full blur-sm pointer-events-none" />
            <div className="absolute top-0 left-0 w-2 h-full bg-sbi-blue rounded-l" />

            {/* Emblem Image with Manual Customization Fallback */}
            <div className="w-20 h-20 mx-auto mb-3 bg-sky-50 rounded-full flex items-center justify-center p-2 border-2 border-sky-200 shadow-inner">
              <img
                src={BRANDING.emblemUrl}
                alt="PMMY Emblem"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            <h3 className="font-extrabold text-sbi-indigo text-lg tracking-tight">PMMY &amp; PMEGP</h3>
            <p className="text-[11px] text-slate-500 font-medium">Micro Units Development &amp; Refinance Agency</p>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 py-1 rounded">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Govt. Backed Credit</span>
            </div>
          </div>

          {/* Vertical Menu Buttons (Matching Screenshot) */}
          <div className="bg-white rounded-xl shadow-sbi border border-sbi-border p-2 space-y-1 text-sm font-semibold text-sbi-navy">
            <button
              onClick={() => setActiveSideSubTab('features')}
              className={`w-full text-left px-4 py-2.5 rounded-lg transition flex items-center justify-between ${
                activeSideSubTab === 'features'
                  ? 'bg-purple-50 text-sbi-indigo font-bold border-l-4 border-sbi-indigo'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span>Features</span>
              {activeSideSubTab === 'features' && <span className="text-sbi-indigo text-xs">●</span>}
            </button>

            <button
              onClick={() => setActiveSideSubTab('eligibility')}
              className={`w-full text-left px-4 py-2.5 rounded-lg transition flex items-center justify-between ${
                activeSideSubTab === 'eligibility'
                  ? 'bg-purple-50 text-sbi-indigo font-bold border-l-4 border-sbi-indigo'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span>Eligibility</span>
              {activeSideSubTab === 'eligibility' && <span className="text-sbi-indigo text-xs">●</span>}
            </button>

            <button
              onClick={() => setActiveSideSubTab('terms')}
              className={`w-full text-left px-4 py-2.5 rounded-lg transition flex items-center justify-between ${
                activeSideSubTab === 'terms'
                  ? 'bg-purple-50 text-sbi-indigo font-bold border-l-4 border-sbi-indigo'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span>Terms And Conditions</span>
              {activeSideSubTab === 'terms' && <span className="text-sbi-indigo text-xs">●</span>}
            </button>

            <button
              onClick={() => setActiveSideSubTab('stories')}
              className={`w-full text-left px-4 py-2.5 rounded-lg transition flex items-center justify-between ${
                activeSideSubTab === 'stories'
                  ? 'bg-purple-50 text-sbi-indigo font-bold border-l-4 border-sbi-indigo'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span>Success Stories</span>
              {activeSideSubTab === 'stories' && <span className="text-sbi-indigo text-xs">●</span>}
            </button>
          </div>

          {/* Location & Profile Card */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Configured Profile</span>
              <button onClick={onOpenWizard} className="text-sbi-blue font-bold hover:underline">Edit</button>
            </div>
            <div>
              <span className="text-slate-500 block">Location:</span>
              <span className="font-bold text-sbi-navy">{profile.villageTown}, PIN {profile.pincode} ({profile.district})</span>
            </div>
            <div>
              <span className="text-slate-500 block">Proposed Enterprise:</span>
              <span className="font-bold text-sbi-navy">{CATEGORY_LABELS[profile.category]}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Equity Budget:</span>
              <span className="font-bold text-emerald-700">₹{profile.availableCapital.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Center Main Content Area (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Advisory & Scheme Article Card */}
          <div className="bg-white rounded-xl shadow-sbi border border-sbi-border p-6 sm:p-8 space-y-5 relative">
            {/* Top Prototype Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-sbi-blue uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Advisory Synthesis</span>
              </span>

              <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span>⚠️</span>
                <span>ILLUSTRATIVE DEMO VALUES</span>
              </span>
            </div>

            {/* Scheme Title in Bold Royal Indigo (Exact SBI Styling) */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-sbi-indigo tracking-tight">
                Pradhan Mantri MUDRA Yojana (PMMY) &amp; PMEGP Advisory
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Pradhan Mantri MUDRA Yojana (PMMY) is a scheme launched to provide loans up to ₹10 Lakh to non-corporate, non-farm small/micro enterprises. Integrated with the Prime Minister's Employment Generation Programme (PMEGP), rural applicants can avail up to <strong>35% margin money capital subsidy</strong>. Borrowers can approach commercial banks, RRBs, or apply directly online through the{' '}
                <a href="https://www.jansamarth.in" target="_blank" rel="noreferrer" className="text-sbi-blue font-semibold underline hover:text-sbi-blue-dark">
                  JanSamarth portal (www.jansamarth.in)
                </a>.
              </p>
            </div>

            {/* Conditional Tab Content */}
            {activeSideSubTab === 'features' && (
              <div className="space-y-4 pt-2">
                {/* Yellow Checkmark Bullet List (Matching SBI Screenshot) */}
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-sbi-yellow text-sbi-indigo flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                      ✓
                    </span>
                    <div>
                      <strong className="text-sbi-navy font-bold">Nature of Facility : </strong>
                      <span className="text-slate-700">Working Capital and Term Loan facility backed by CGFMU.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-sbi-yellow text-sbi-indigo flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                      ✓
                    </span>
                    <div>
                      <strong className="text-sbi-navy font-bold">Purpose : </strong>
                      <span className="text-slate-700">Enterprise setup, machinery purchase, capacity expansion, and initial inventory reserve.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-sbi-yellow text-sbi-indigo flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                      ✓
                    </span>
                    <div>
                      <strong className="text-sbi-navy font-bold">Target Group : </strong>
                      <span className="text-slate-700">Micro-Enterprises in Manufacturing, Trading, and Services sector including rural agro-allied activities.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-sbi-yellow text-sbi-indigo flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                      ✓
                    </span>
                    <div>
                      <strong className="text-sbi-navy font-bold">Quantum of Loan (Min/Max) : </strong>
                      <div className="mt-1 pl-1 text-slate-600 space-y-0.5 text-xs font-medium">
                        <p>• Loans up to ₹50,000 are categorized as <strong>SHISHU</strong></p>
                        <p>• Loans from ₹50,001 to ₹5,00,000 are categorized as <strong>KISHORE</strong></p>
                        <p>• Loans from ₹5,00,001 to ₹10,00,000 are categorized as <strong>TARUN</strong></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSideSubTab === 'eligibility' && (
              <div className="space-y-3 text-xs sm:text-sm pt-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-bold text-sbi-navy text-sm">Eligibility Criteria for Beneficiaries:</h4>
                <ul className="space-y-2 text-slate-700 list-disc list-inside">
                  <li>Any Indian citizen having a viable business plan for a non-farm income-generating activity.</li>
                  <li>Applicants must not have defaulted on any prior credit facility with a banking institution.</li>
                  <li>Special category relaxation (35% rural subsidy) applies for SC/ST/OBC/Women/Rural applicants under PMEGP convergence.</li>
                  <li>At least 8th class pass certificate required for projects exceeding ₹10 Lakhs in manufacturing or ₹5 Lakhs in services.</li>
                </ul>
              </div>
            )}

            {activeSideSubTab === 'terms' && (
              <div className="space-y-3 text-xs sm:text-sm pt-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-bold text-sbi-navy text-sm">Terms and Conditions:</h4>
                <ul className="space-y-2 text-slate-700 list-disc list-inside">
                  <li>No collateral security required for loans up to ₹10 Lakhs under CGFMU/CGTMSE coverage.</li>
                  <li>Repayment tenure ranging from 3 to 7 years depending on business cash flows.</li>
                  <li>Interest rate linked to external benchmark (EBLR) + spread, starting typically around 8.5% - 10.5%.</li>
                </ul>
              </div>
            )}

            {activeSideSubTab === 'stories' && (
              <div className="space-y-3 text-xs sm:text-sm pt-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-bold text-sbi-navy text-sm">Field Success Stories (Guntur &amp; Krishna Districts):</h4>
                <p className="text-slate-600">
                  Over 1,200 micro-entrepreneurs in agro-machinery repair and rural tailoring secured PMEGP and Mudra credit in Andhra Pradesh during 2025, maintaining a 94% timely repayment rate.
                </p>
              </div>
            )}

            {/* Opportunity Scorecard & AI Verdict Card */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="bg-gradient-to-br from-slate-50 to-sky-50/50 rounded-xl p-5 border border-sky-200 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-sbi-blue uppercase tracking-wider block">Hyper-Local Intelligence</span>
                    <h3 className="text-lg font-bold text-sbi-navy">Business Opportunity Scorecard</h3>
                  </div>

                  {/* Verdict Badge */}
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase shadow-sm ${
                      report.verdict === 'START'
                        ? 'bg-emerald-600 text-white'
                        : report.verdict === 'CONSIDER'
                        ? 'bg-amber-500 text-white'
                        : 'bg-rose-600 text-white'
                    }`}>
                      {report.verdictLabel}
                    </span>
                  </div>
                </div>

                {/* Score & Metric Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-semibold block">Opportunity Score</span>
                    <span className="text-2xl font-black text-sbi-indigo">{report.opportunityScore}<span className="text-xs text-slate-400 font-normal">/100</span></span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-semibold block">Competition Density</span>
                    <span className="text-sm font-bold text-slate-800 block mt-1">{report.saturationLevel}</span>
                    <span className="text-[10px] text-emerald-600 font-medium">({report.discoveredCompetitorsCount} in 3km)</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-semibold block">Estimated Project Cost</span>
                    <span className="text-sm font-bold text-slate-800 block mt-1">₹{financials.totalProjectCost.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-sbi-blue font-medium">(PMEGP Cap)</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-semibold block">Monthly EMI</span>
                    <span className="text-sm font-bold text-emerald-700 block mt-1">~₹{financials.monthlyEmi.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-slate-400 font-medium">(60 Months)</span>
                  </div>
                </div>

                {/* AI Grounded Narrative Box */}
                <div className="bg-white p-4 rounded-lg border border-sky-200 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-sbi-indigo text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-sbi-blue" />
                    <span>Evidence-Based Advisory Assessment:</span>
                  </div>
                  <p>{report.aiNarrative}</p>
                  {competitors.length > 0 && (
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span>Nearest Competitor: <strong className="text-sbi-navy">{competitors[0].name}</strong> ({competitors[0].distanceKm} km)</span>
                      <span className="text-[10px] bg-sky-100 text-sbi-blue font-bold px-1.5 py-0.2 rounded">{competitors[0].source}</span>
                    </div>
                  )}
                </div>

                {/* Quick Action Navigation CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => onNavigateTab('map')}
                    className="bg-sbi-blue hover:bg-sbi-blue-dark text-white font-bold text-xs px-4 py-2 rounded-md shadow-sm transition active:scale-95 flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>View Competitor Map</span>
                  </button>

                  <button
                    onClick={() => onNavigateTab('calculator')}
                    className="bg-white hover:bg-slate-50 text-sbi-navy font-bold text-xs px-4 py-2 rounded-md border border-slate-300 shadow-sm transition active:scale-95 flex items-center gap-1.5"
                  >
                    <Calculator className="w-3.5 h-3.5 text-sbi-blue" />
                    <span>Adjust Loan &amp; EMI</span>
                  </button>

                  <button
                    onClick={() => onNavigateTab('schemes')}
                    className="bg-white hover:bg-slate-50 text-sbi-navy font-bold text-xs px-4 py-2 rounded-md border border-slate-300 shadow-sm transition active:scale-95 flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
                    <span>Scheme Document Checklist</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Floating Quick-Action Bar (1 Col on Large Screens) */}
        <div className="hidden lg:flex lg:col-span-1 flex-col space-y-3 sticky top-24">
          <button
            onClick={() => onNavigateTab('calculator')}
            className="w-14 h-16 bg-white hover:bg-sky-50 border border-sbi-border rounded-xl shadow-sbi flex flex-col items-center justify-center p-1.5 text-center transition group active:scale-95"
            title="Interest Rates & EMI"
          >
            <Percent className="w-5 h-5 text-sbi-blue group-hover:scale-110 transition" />
            <span className="text-[9px] font-bold text-slate-600 mt-1 leading-tight">Interest Rates</span>
          </button>

          <button
            onClick={() => onNavigateTab('schemes')}
            className="w-14 h-16 bg-white hover:bg-sky-50 border border-sbi-border rounded-xl shadow-sbi flex flex-col items-center justify-center p-1.5 text-center transition group active:scale-95"
            title="JanSamarth & Scheme Links"
          >
            <ExternalLink className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition" />
            <span className="text-[9px] font-bold text-slate-600 mt-1 leading-tight">Quick Links</span>
          </button>

          <button
            onClick={() => onNavigateTab('map')}
            className="w-14 h-16 bg-white hover:bg-sky-50 border border-sbi-border rounded-xl shadow-sbi flex flex-col items-center justify-center p-1.5 text-center transition group active:scale-95"
            title="Local Map"
          >
            <MapPin className="w-5 h-5 text-amber-500 group-hover:scale-110 transition" />
            <span className="text-[9px] font-bold text-slate-600 mt-1 leading-tight">Map View</span>
          </button>

          <button
            onClick={onOpenChat}
            className="w-14 h-16 bg-sbi-indigo hover:bg-purple-950 text-white rounded-xl shadow-lg flex flex-col items-center justify-center p-1.5 text-center transition active:scale-95"
            title="Ask AI Advisory Assistant"
          >
            <Sparkles className="w-5 h-5 text-sbi-yellow animate-pulse" />
            <span className="text-[9px] font-bold text-white mt-1 leading-tight">Ask AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
