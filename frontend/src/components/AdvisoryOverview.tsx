import React, { useState } from 'react';
import { EntrepreneurProfile, AdvisoryReport, FinancialBreakdown, CompetitorBusiness } from '../types';
import { BRANDING } from '../config/branding';
import { CATEGORY_LABELS } from '../services/mockData';
import { SIH_SCHEMES } from '../services/sihSchemes';
import { 
  MapPin, 
  Percent, 
  ExternalLink, 
  ShieldCheck, 
  Calculator, 
  Sparkles,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Info,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

interface AdvisoryOverviewProps {
  profile: EntrepreneurProfile;
  report: AdvisoryReport | null;
  financials: FinancialBreakdown | null;
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
  const [activeSchemeTab, setActiveSchemeTab] = useState<'both' | 'micro' | 'term'>('both');
  const [showFullSchedule, setShowFullSchedule] = useState<boolean>(false);

  const isConfigured = profile.availableCapital > 0;
  const isOutsideRange = financials?.isOutsideRange || false;

  return (
    <div className="space-y-6">
      {/* Breadcrumb Path */}
      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 pt-1">
        <span className="hover:text-sbi-blue cursor-pointer" onClick={() => onNavigateTab('overview')}>Business Advisory</span>
        <span>|</span>
        <span className="hover:text-sbi-blue cursor-pointer" onClick={() => onNavigateTab('schemes')}>Financial Schemes</span>
        <span>|</span>
        <span className="text-sbi-indigo font-bold">SIH26091 Financial Scheme Advisory</span>
        <span>|</span>
        <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono">
          {profile.villageTown ? profile.villageTown : profile.pincode ? `PIN ${profile.pincode}` : 'Location Not Set'}
        </span>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Scheme Emblem Card with Cyan Accent */}
          <div className="bg-white rounded-xl shadow-sbi border border-sbi-border p-5 text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-sbi-blue/15 rounded-full blur-sm pointer-events-none" />
            <div className="absolute top-0 left-0 w-2 h-full bg-sbi-blue rounded-l" />

            {/* Emblem Image */}
            <div className="w-20 h-20 mx-auto mb-3 bg-sky-50 rounded-full flex items-center justify-center p-2 border-2 border-sky-200 shadow-inner">
              <img
                src={BRANDING.emblemUrl}
                alt="State Emblem of India"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            <h3 className="font-extrabold text-sbi-indigo text-lg tracking-tight">SIH26091 Advisory</h3>
            <p className="text-[11px] text-slate-500 font-medium">Micro Finance &amp; Term Loan Advisory</p>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 py-1 rounded">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SIH26091 Framework</span>
            </div>
          </div>

          {/* Configured Profile Card */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Configured Profile</span>
              <button 
                onClick={onOpenWizard} 
                className="text-sbi-blue font-bold hover:underline"
              >
                Change Profile
              </button>
            </div>
            <div>
              <span className="text-slate-500 block">Location:</span>
              <span className="font-bold text-sbi-navy">
                {profile.villageTown || profile.district
                  ? `${profile.villageTown ? profile.villageTown : ''}${profile.block ? `, ${profile.block}` : ''}${profile.district ? `, ${profile.district}` : ''}${profile.pincode ? ` (${profile.pincode})` : ''}`
                  : '[Not Set]'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Proposed Enterprise:</span>
              <span className="font-bold text-sbi-navy">{CATEGORY_LABELS[profile.category] || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Available Margin Capital:</span>
              <span className="font-bold text-emerald-700">
                {profile.availableCapital > 0 ? `₹${profile.availableCapital.toLocaleString('en-IN')}` : '[Not Set]'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                (10% Beneficiary Contribution)
              </span>
            </div>
          </div>

          {/* Scheme Quick Switch Filter */}
          <div className="bg-white rounded-xl shadow-sbi border border-sbi-border p-3 space-y-1.5 text-xs font-semibold text-sbi-navy">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 pb-1">
              Filter Scheme Cards
            </span>
            <button
              onClick={() => setActiveSchemeTab('both')}
              className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center justify-between ${
                activeSchemeTab === 'both'
                  ? 'bg-purple-50 text-sbi-indigo font-bold border-l-4 border-sbi-indigo'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span>Both Schemes Overview</span>
              {activeSchemeTab === 'both' && <span className="text-sbi-indigo text-xs">●</span>}
            </button>
            <button
              onClick={() => setActiveSchemeTab('micro')}
              className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center justify-between ${
                activeSchemeTab === 'micro'
                  ? 'bg-purple-50 text-sbi-indigo font-bold border-l-4 border-sbi-indigo'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span>Micro Finance (&le; ₹1.40L)</span>
              {financials?.schemeId === 'micro-finance' && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">Eligible</span>
              )}
            </button>
            <button
              onClick={() => setActiveSchemeTab('term')}
              className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center justify-between ${
                activeSchemeTab === 'term'
                  ? 'bg-purple-50 text-sbi-indigo font-bold border-l-4 border-sbi-indigo'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span>Term Loan (&gt; ₹1.40L - ₹50L)</span>
              {financials?.schemeId === 'term-loan' && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">Eligible</span>
              )}
            </button>
          </div>
        </div>

        {/* Center Main Content Area (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Advisory & Scheme Article Card */}
          <div className="bg-white rounded-xl shadow-sbi border border-sbi-border p-6 sm:p-8 space-y-6 relative">
            {/* Top Prototype Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-sbi-blue uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SIH26091 Advisory Synthesis</span>
              </span>

              <span className="bg-sky-50 text-sbi-blue border border-sky-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Info className="w-3 h-3" />
                <span>Financial parameters based on SIH26091 problem statement.</span>
              </span>
            </div>

            {/* Scheme Title in Bold Royal Indigo */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-sbi-indigo tracking-tight">
                SIH26091 Financial Scheme Advisory
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Scheme selection based on project cost and available margin capital. The platform evaluates micro-enterprise viability using a <strong>10% beneficiary contribution model</strong> and matches eligible funding under the official <strong>Micro Finance Scheme</strong> or <strong>Term Loan Scheme</strong>.
              </p>
            </div>

            {/* SCHEME AUTO-SELECTION FLOW UI */}
            {isConfigured && (
              <div className="pt-2">
                {isOutsideRange ? (
                  /* Outside Range Warning */
                  <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                      <span>Outside SIH26091 Scheme Range</span>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Your calculated project cost (<strong>₹{financials?.totalProjectCost.toLocaleString('en-IN')}</strong> from an Available Margin Capital of ₹{profile.availableCapital.toLocaleString('en-IN')}) exceeds the <strong>₹50 lakh maximum specified for the Term Loan Scheme</strong>.
                    </p>
                    <p className="text-[11px] text-amber-700">
                      Please adjust your available margin capital to ₹5,00,000 or lower to receive an eligible SIH26091 scheme recommendation.
                    </p>
                  </div>
                ) : (
                  /* Visually Clear Scheme Auto-Selection Flow */
                  <div className="bg-gradient-to-r from-sky-50 via-indigo-50/40 to-emerald-50/50 p-4 rounded-xl border border-sky-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-sbi-blue uppercase tracking-wider">
                        Scheme Auto-Selection Pipeline
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                        Rule Matched
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center items-center">
                      {/* Step 1 */}
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                        <span className="text-[9px] text-slate-500 font-bold uppercase block">Available Margin</span>
                        <span className="text-xs sm:text-sm font-black text-slate-900 block mt-0.5">
                          ₹{profile.availableCapital.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">(10% Contribution)</span>
                      </div>

                      {/* Step 2 */}
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs relative">
                        <span className="text-[9px] text-slate-500 font-bold uppercase block">Project Cost</span>
                        <span className="text-xs sm:text-sm font-black text-sbi-indigo block mt-0.5">
                          ₹{financials?.totalProjectCost.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">(Margin / 10%)</span>
                      </div>

                      {/* Step 3 */}
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                        <span className="text-[9px] text-slate-500 font-bold uppercase block">Maximum Loan</span>
                        <span className="text-xs sm:text-sm font-black text-emerald-700 block mt-0.5">
                          ₹{financials?.eligibleLoan.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">
                          {financials && financials.rawCalculatedLoan > financials.schemeMaximumCap
                            ? `(Cap: ₹${(financials.schemeMaximumCap / 100000).toFixed(2)}L)`
                            : '(90% of Cost)'}
                        </span>
                      </div>

                      {/* Step 4 */}
                      <div className="bg-white p-2.5 rounded-lg border-2 border-sbi-blue shadow-2xs">
                        <span className="text-[9px] text-sbi-blue font-bold uppercase block">Selected Scheme</span>
                        <span className="text-xs font-black text-sbi-navy block mt-0.5 truncate px-1">
                          {financials?.selectedSchemeName}
                        </span>
                        <span className="text-[9px] text-emerald-600 font-bold block">
                          {financials?.annualInterestRate}% p.a.
                        </span>
                      </div>
                    </div>

                    {/* Parameter Summary Bar */}
                    <div className="bg-white/80 p-2 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-700">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="text-sbi-indigo">{financials?.selectedSchemeName}:</span>
                        <span className="text-slate-900">{financials?.annualInterestRate}% p.a.</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-900">{financials?.repaymentTenureYears} Years</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-900">{financials?.moratoriumMonths}-Month Moratorium</span>
                      </div>
                      {financials && financials.rawCalculatedLoan > financials.schemeMaximumCap && (
                        <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Scheme Max Cap Applied (₹{(financials.schemeMaximumCap / 100000).toFixed(2)} Lakh)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CLEAN SCHEME INFORMATION CARDS (2 TIERS) */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-sbi-navy uppercase tracking-wider flex items-center justify-between">
                <span>SIH26091 Financial Scheme Specifications</span>
                <span className="text-[10px] text-slate-500 font-normal">2 Prescribed Tiers</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Micro Finance Scheme Card */}
                {(activeSchemeTab === 'both' || activeSchemeTab === 'micro') && (
                  <div className={`p-5 rounded-xl border transition relative ${
                    financials?.schemeId === 'micro-finance'
                      ? 'bg-gradient-to-br from-purple-50/50 to-white border-sbi-indigo shadow-md ring-2 ring-sbi-indigo/20'
                      : 'bg-slate-50/80 border-slate-200'
                  }`}>
                    {financials?.schemeId === 'micro-finance' && (
                      <span className="absolute top-3 right-3 text-[10px] font-extrabold bg-sbi-indigo text-white px-2 py-0.5 rounded-full shadow-xs">
                        CURRENTLY SELECTED
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-sbi-blue uppercase tracking-wider block">
                      SIH26091 FINANCIAL SCHEME
                    </span>
                    <h4 className="text-base font-extrabold text-sbi-navy mt-1">
                      {SIH_SCHEMES.microFinance.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {SIH_SCHEMES.microFinance.useCase}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Project Cost</span>
                        <span className="font-bold text-slate-900 block mt-0.5">{SIH_SCHEMES.microFinance.projectCostLabel}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Funding</span>
                        <span className="font-bold text-emerald-700 block mt-0.5">{SIH_SCHEMES.microFinance.fundingLabel}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Maximum Loan</span>
                        <span className="font-bold text-sbi-indigo block mt-0.5">{SIH_SCHEMES.microFinance.maxLoanLabel}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Interest Rate</span>
                        <span className="font-bold text-slate-900 block mt-0.5">{SIH_SCHEMES.microFinance.interestRateLabel}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Repayment</span>
                        <span className="font-bold text-slate-900 block mt-0.5">{SIH_SCHEMES.microFinance.tenureLabel}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Moratorium</span>
                        <span className="font-bold text-amber-700 block mt-0.5">{SIH_SCHEMES.microFinance.moratoriumLabel}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Term Loan Scheme Card */}
                {(activeSchemeTab === 'both' || activeSchemeTab === 'term') && (
                  <div className={`p-5 rounded-xl border transition relative ${
                    financials?.schemeId === 'term-loan'
                      ? 'bg-gradient-to-br from-purple-50/50 to-white border-sbi-indigo shadow-md ring-2 ring-sbi-indigo/20'
                      : 'bg-slate-50/80 border-slate-200'
                  }`}>
                    {financials?.schemeId === 'term-loan' && (
                      <span className="absolute top-3 right-3 text-[10px] font-extrabold bg-sbi-indigo text-white px-2 py-0.5 rounded-full shadow-xs">
                        CURRENTLY SELECTED
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-sbi-blue uppercase tracking-wider block">
                      SIH26091 FINANCIAL SCHEME
                    </span>
                    <h4 className="text-base font-extrabold text-sbi-navy mt-1">
                      {SIH_SCHEMES.termLoan.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {SIH_SCHEMES.termLoan.useCase}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Project Cost Range</span>
                        <span className="font-bold text-slate-900 block mt-0.5">{SIH_SCHEMES.termLoan.projectCostLabel}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Funding</span>
                        <span className="font-bold text-emerald-700 block mt-0.5">{SIH_SCHEMES.termLoan.fundingLabel}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Maximum Loan</span>
                        <span className="font-bold text-sbi-indigo block mt-0.5">{SIH_SCHEMES.termLoan.maxLoanLabel}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Interest Rate</span>
                        <span className="font-bold text-slate-900 block mt-0.5">{SIH_SCHEMES.termLoan.interestRateLabel}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Repayment</span>
                        <span className="font-bold text-slate-900 block mt-0.5">{SIH_SCHEMES.termLoan.tenureLabel}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Moratorium</span>
                        <span className="font-bold text-amber-700 block mt-0.5">{SIH_SCHEMES.termLoan.moratoriumLabel}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* OPPORTUNITY SCORECARD SECTION */}
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
                      report && isConfigured
                        ? report.verdict === 'START'
                          ? 'bg-emerald-600 text-white'
                          : report.verdict === 'CONSIDER'
                          ? 'bg-amber-500 text-white'
                          : 'bg-rose-600 text-white'
                        : 'bg-slate-400 text-white'
                    }`}>
                      {report && isConfigured ? report.verdictLabel : 'AWAITING PROFILE INPUT'}
                    </span>
                  </div>
                </div>

                {/* Score & Metric Stats Grid (Row 1) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-semibold block">Opportunity Score</span>
                    <span className="text-2xl font-black text-sbi-indigo">
                      {report && isConfigured ? report.opportunityScore : '—'}
                      {report && isConfigured && <span className="text-xs text-slate-400 font-normal"> / 100</span>}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-semibold block">Competition Density</span>
                    <span className="text-sm font-bold text-slate-800 block mt-1">
                      {report && isConfigured 
                        ? `${competitors.length} businesses` 
                        : (profile.villageTown || profile.pincode ? `${competitors.length} businesses` : 'Awaiting location')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {report && isConfigured ? `(${report.saturationLevel} Saturation)` : 'In radius'}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-semibold block">Estimated Project Cost</span>
                    <span className="text-sm font-bold text-slate-800 block mt-1">
                      {financials && financials.totalProjectCost > 0 ? `₹${financials.totalProjectCost.toLocaleString('en-IN')}` : '—'}
                    </span>
                    <span className="text-[10px] text-sbi-blue font-medium">
                      {isConfigured ? '(10x Margin)' : 'Calculation pending'}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-semibold block">Eligible Loan</span>
                    <span className="text-sm font-bold text-emerald-700 block mt-1">
                      {financials && financials.eligibleLoan > 0 
                        ? `₹${financials.eligibleLoan.toLocaleString('en-IN')}` 
                        : isOutsideRange ? 'Exceeds Ceiling' : '—'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {financials && financials.eligibleLoan > 0 ? `(Max 90% capped)` : 'Calculation pending'}
                    </span>
                  </div>
                </div>

                {/* Separate Financial Row (Row 2) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-1 border-t border-sky-200/60">
                  <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold block">Interest Rate</span>
                    <span className="text-sm font-bold text-slate-900 block mt-0.5">
                      {financials && financials.annualInterestRate > 0 ? `${financials.annualInterestRate}% p.a.` : '—'}
                    </span>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold block">Repayment Period</span>
                    <span className="text-sm font-bold text-slate-900 block mt-0.5">
                      {financials && financials.repaymentTenureYears > 0 ? `${financials.repaymentTenureYears} Years` : '—'}
                    </span>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold block">Moratorium</span>
                    <span className="text-sm font-bold text-amber-700 block mt-0.5">
                      {financials && financials.moratoriumMonths > 0 ? `${financials.moratoriumMonths} Months` : '—'}
                    </span>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold block">Selected Scheme</span>
                    <span className="text-xs font-bold text-sbi-indigo block mt-0.5 truncate px-1">
                      {financials ? financials.selectedSchemeName : 'Awaiting input'}
                    </span>
                  </div>
                </div>

                {/* AI Grounded Narrative Box */}
                <div className="bg-white p-4 rounded-lg border border-sky-200 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-sbi-indigo text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-sbi-blue" />
                    <span>Evidence-Based Advisory Assessment:</span>
                  </div>
                  <p>
                    {report && isConfigured 
                      ? report.aiNarrative 
                      : 'No advisory evaluation performed yet. Please click "Change Profile" above to enter your target location, proposed business trade, and available margin capital.'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* REPAYMENT DISPLAY & QUARTERLY SCHEDULE */}
            <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sbi-blue" />
                  <h3 className="text-base font-bold text-sbi-navy">Repayment Schedule</h3>
                </div>
                {financials && financials.repaymentSchedule.length > 0 && (
                  <button
                    onClick={() => setShowFullSchedule(!showFullSchedule)}
                    className="text-xs text-sbi-blue font-semibold hover:underline"
                  >
                    {showFullSchedule ? 'Collapse Schedule' : 'View Full Schedule'}
                  </button>
                )}
              </div>

              {!isConfigured || isOutsideRange ? (
                /* Unconfirmed state */
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 text-center">
                  <p>
                    {isOutsideRange 
                      ? 'Repayment schedule unavailable: Calculated project cost exceeds the ₹50 lakh ceiling for the Term Loan Scheme.'
                      : 'Repayment schedule will be generated after financial inputs are confirmed.'}
                  </p>
                </div>
              ) : (
                /* Structured Repayment Display */
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-center text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Scheme</span>
                      <span className="font-bold text-sbi-navy block mt-0.5 truncate">{financials?.selectedSchemeName}</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Loan Amount</span>
                      <span className="font-bold text-slate-900 block mt-0.5">₹{financials?.eligibleLoan.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Interest Rate</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{financials?.annualInterestRate}% p.a.</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Tenure</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{financials?.repaymentTenureYears} Years</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Moratorium</span>
                      <span className="font-bold text-amber-700 block mt-0.5">{financials?.moratoriumMonths} Months</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Repayment Frequency</span>
                      <span className="font-bold text-sbi-blue block mt-0.5">{financials?.repaymentFrequency}</span>
                    </div>

                    <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-300 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-emerald-800 font-bold block uppercase">Estimated Repayment</span>
                      <span className="font-black text-emerald-700 block mt-0.5">
                        ₹{financials?.quarterlyInstallment.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[9px] text-emerald-600 block">/ quarter</span>
                    </div>
                  </div>

                  {/* Moratorium & Repayment Explanation */}
                  <div className="p-3 bg-sky-50/70 rounded-lg border border-sky-200 text-xs text-sky-900 flex items-start gap-2">
                    <Info className="w-4 h-4 text-sbi-blue shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>Moratorium Grace Period:</strong> No principal repayments are required during the initial <strong>{financials?.moratoriumMonths} months</strong>. Starting from Quarter {(Math.round((financials?.moratoriumMonths || 3) / 3) + 1)}, quarterly repayments of approximately <strong>₹{financials?.quarterlyInstallment.toLocaleString('en-IN')}</strong> will be due across the remaining {(financials?.repaymentTenureYears || 3) * 4 - Math.round((financials?.moratoriumMonths || 3) / 3)} quarters.
                    </p>
                  </div>

                  {/* Quarterly Repayment Table (Expandable) */}
                  {showFullSchedule && financials && financials.repaymentSchedule.length > 0 && (
                    <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-64 overflow-y-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 text-slate-700 sticky top-0">
                          <tr>
                            <th className="py-2 px-3 font-semibold border-b">Quarter</th>
                            <th className="py-2 px-3 font-semibold border-b">Status</th>
                            <th className="py-2 px-3 font-semibold border-b">Opening Balance</th>
                            <th className="py-2 px-3 font-semibold border-b">Installment</th>
                            <th className="py-2 px-3 font-semibold border-b">Principal</th>
                            <th className="py-2 px-3 font-semibold border-b">Interest</th>
                            <th className="py-2 px-3 font-semibold border-b">Closing Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {financials.repaymentSchedule.map((item) => (
                            <tr key={item.quarterNumber} className={item.isMoratorium ? 'bg-amber-50/40' : 'hover:bg-slate-50'}>
                              <td className="py-1.5 px-3 font-bold text-slate-800">{item.quarterLabel}</td>
                              <td className="py-1.5 px-3">
                                {item.isMoratorium ? (
                                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                                    Moratorium
                                  </span>
                                ) : (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                                    Active Payment
                                  </span>
                                )}
                              </td>
                              <td className="py-1.5 px-3">₹{item.startingBalance.toLocaleString('en-IN')}</td>
                              <td className="py-1.5 px-3 font-bold text-slate-900">
                                {item.installment > 0 ? `₹${item.installment.toLocaleString('en-IN')}` : '—'}
                              </td>
                              <td className="py-1.5 px-3">
                                {item.principalComponent > 0 ? `₹${item.principalComponent.toLocaleString('en-IN')}` : '—'}
                              </td>
                              <td className="py-1.5 px-3 text-slate-600">
                                {item.interestComponent > 0 ? `₹${item.interestComponent.toLocaleString('en-IN')}` : '—'}
                              </td>
                              <td className="py-1.5 px-3 font-bold text-sbi-navy">
                                ₹{item.closingBalance.toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Action Navigation CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => onNavigateTab('market')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-md shadow-sm transition active:scale-95 flex items-center gap-1.5"
              >
                <TrendingUp className="w-3.5 h-3.5 text-white" />
                <span>Local Demand &amp; Feasibility</span>
              </button>

              <button
                onClick={() => onNavigateTab('schemes')}
                className="bg-sbi-blue hover:bg-sbi-blue-dark text-white font-bold text-xs px-4 py-2 rounded-md shadow-sm transition active:scale-95 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-sbi-yellow" />
                <span>View Eligible Schemes</span>
              </button>

              <button
                onClick={() => onNavigateTab('calculator')}
                className="bg-white hover:bg-slate-50 text-sbi-navy font-bold text-xs px-4 py-2 rounded-md border border-slate-300 shadow-sm transition active:scale-95 flex items-center gap-1.5"
              >
                <Calculator className="w-3.5 h-3.5 text-sbi-blue" />
                <span>Financial Simulator</span>
              </button>

              <button
                onClick={onOpenWizard}
                className="bg-white hover:bg-slate-50 text-sbi-navy font-bold text-xs px-4 py-2 rounded-md border border-slate-300 shadow-sm transition active:scale-95 flex items-center gap-1.5"
              >
                <ArrowRight className="w-3.5 h-3.5 text-sbi-indigo" />
                <span>Change Margin Capital</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Floating Quick-Action Bar */}
        <div className="hidden lg:flex lg:col-span-1 flex-col space-y-3 sticky top-24">
          <button
            onClick={() => onNavigateTab('market')}
            className="w-14 h-16 bg-white hover:bg-sky-50 border border-sbi-border rounded-xl shadow-sbi flex flex-col items-center justify-center p-1.5 text-center transition group active:scale-95"
            title="Local Market Feasibility"
          >
            <TrendingUp className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition" />
            <span className="text-[9px] font-bold text-slate-600 mt-1 leading-tight">Demand</span>
          </button>

          <button
            onClick={() => onNavigateTab('calculator')}
            className="w-14 h-16 bg-white hover:bg-sky-50 border border-sbi-border rounded-xl shadow-sbi flex flex-col items-center justify-center p-1.5 text-center transition group active:scale-95"
            title="Financial Structuring & Repayments"
          >
            <Percent className="w-5 h-5 text-sbi-blue group-hover:scale-110 transition" />
            <span className="text-[9px] font-bold text-slate-600 mt-1 leading-tight">Interest</span>
          </button>

          <button
            onClick={() => onNavigateTab('schemes')}
            className="w-14 h-16 bg-white hover:bg-sky-50 border border-sbi-border rounded-xl shadow-sbi flex flex-col items-center justify-center p-1.5 text-center transition group active:scale-95"
            title="SIH26091 Scheme Specs"
          >
            <ExternalLink className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition" />
            <span className="text-[9px] font-bold text-slate-600 mt-1 leading-tight">Schemes</span>
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
