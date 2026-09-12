import React from 'react';
import { EntrepreneurProfile, FinancialBreakdown } from '../types';
import { generateMarketFeasibility } from '../services/marketFeasibilityEngine';
import { CATEGORY_LABELS } from '../services/mockData';
import { 
  Users, 
  TrendingUp, 
  Store, 
  Truck, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  Sparkles,
  Calculator,
  Layers
} from 'lucide-react';

interface MarketFeasibilityAnalyzerProps {
  profile: EntrepreneurProfile;
  financials: FinancialBreakdown | null;
  onNavigateTab: (tab: string) => void;
  onOpenWizard: () => void;
}

export const MarketFeasibilityAnalyzer: React.FC<MarketFeasibilityAnalyzerProps> = ({
  profile,
  financials,
  onNavigateTab,
  onOpenWizard
}) => {
  const data = generateMarketFeasibility(profile);
  const tradeLabel = CATEGORY_LABELS[profile.category] || profile.category;
  const locationText = profile.villageTown 
    ? `${profile.villageTown}, PIN ${profile.pincode}` 
    : `PIN ${profile.pincode || '522201'}`;

  return (
    <div className="space-y-6">
      {/* 1. Header & Location Context Banner */}
      <div className="bg-white rounded-xl shadow-sbi border border-sbi-border p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-sky-100 text-sbi-blue text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border border-sky-200">
                <Sparkles className="w-3 h-3 text-sbi-blue" />
                SIH26091 Market Intelligence
              </span>
              <span className="bg-purple-100 text-sbi-indigo text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-purple-200">
                <MapPin className="w-3 h-3 text-sbi-indigo" />
                {locationText}
              </span>
            </div>
            <h2 className="text-xl font-bold text-sbi-navy mt-2">
              Hyper-Local Market Demand &amp; Feasibility Analyzer
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Empirical footfall estimation, saturation index, and procurement logistics for <strong className="text-sbi-navy">{tradeLabel}</strong>
            </p>
          </div>

          {/* AI Viability Gauge Badge */}
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 shrink-0">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border-4 border-emerald-500 flex flex-col items-center justify-center text-emerald-800 font-bold shadow-inner">
              <span className="text-base leading-none">{data.feasibilityScore}</span>
              <span className="text-[9px] font-medium text-emerald-600">/ 100</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Demand Rating</span>
              <span className="text-xs font-bold text-emerald-700 block">{data.feasibilityVerdict}</span>
              <button
                onClick={onOpenWizard}
                className="text-[11px] text-sbi-blue hover:underline font-semibold flex items-center gap-1 mt-0.5"
              >
                <span>Change Trade / PIN</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Catchment Population */}
        <div className="bg-white p-4 rounded-xl border border-sbi-border shadow-sbi space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Catchment Radius</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-sbi-blue">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-sbi-navy">
            ~{data.catchmentPopulation.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500">Residents in 3–5 km local trade basin</p>
        </div>

        {/* Metric 2: Estimated Footfall */}
        <div className="bg-white p-4 rounded-xl border border-sbi-border shadow-sbi space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Daily Customer Traffic</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-700">
            {data.dailyFootfallRange.min} – {data.dailyFootfallRange.max} <span className="text-xs font-normal text-slate-600">visits/day</span>
          </div>
          <p className="text-[11px] text-slate-500">Projected daily customer footfall</p>
        </div>

        {/* Metric 3: Market Saturation */}
        <div className="bg-white p-4 rounded-xl border border-sbi-border shadow-sbi space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Market Saturation</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-sbi-indigo">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xl font-bold text-sbi-navy">
              {data.saturationIndexPct}%
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
              {data.saturationRating} Density
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight truncate" title={data.opportunityGapLabel}>
            {data.opportunityGapLabel}
          </p>
        </div>

        {/* Metric 4: Nearest Supply Hub */}
        <div className="bg-white p-4 rounded-xl border border-sbi-border shadow-sbi space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Wholesale Supply Hub</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-sbi-navy">
            {data.nearestHub.distanceKm} km
          </div>
          <p className="text-[11px] text-slate-500 leading-tight truncate" title={data.nearestHub.name}>
            {data.nearestHub.name}
          </p>
        </div>
      </div>

      {/* 3. Deep-Dive Analysis Sections (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Customer Segments & Peak Traffic Hours (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section A: Customer Segments */}
          <div className="bg-white p-5 rounded-xl border border-sbi-border shadow-sbi space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-sbi-navy flex items-center gap-2">
                <Users className="w-4 h-4 text-sbi-blue" />
                <span>Primary Local Customer Profile</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">Empirical Catchment Distribution</span>
            </div>

            <div className="space-y-3.5">
              {data.customerSegments.map((seg, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{seg.label}</span>
                    <span className="font-mono font-bold text-sbi-indigo">{seg.pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        idx === 0 ? 'bg-sbi-blue' : idx === 1 ? 'bg-emerald-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${seg.pct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">{seg.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section B: Peak Business Hours */}
          <div className="bg-white p-5 rounded-xl border border-sbi-border shadow-sbi space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-sbi-navy flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Optimal Business Operating Windows</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">Daily Demand Flow</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {data.peakBusinessHours.map((window, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sbi-navy">{window.window}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        window.trafficLevel === 'Peak'
                          ? 'bg-rose-100 text-rose-800'
                          : window.trafficLevel === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {window.trafficLevel}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">
                      {window.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Seasonal Sensitivity & Logistics (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Section C: Seasonal Trends */}
          <div className="bg-white p-5 rounded-xl border border-sbi-border shadow-sbi space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-sbi-navy flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Seasonal Revenue Sensitivity</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">Agrarian Cycle</span>
            </div>

            <div className="space-y-3">
              {data.seasonalTrends.map((season, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-sbi-navy block">{season.season}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{season.months}</span>
                    </div>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      season.trend === 'peak' 
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {season.impactPct > 0 ? `+${season.impactPct}%` : `${season.impactPct}%`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                    {season.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section D: Sourcing Logistics */}
          <div className="bg-white p-5 rounded-xl border border-sbi-border shadow-sbi space-y-3">
            <h3 className="text-sm font-bold text-sbi-navy flex items-center gap-2 border-b border-slate-100 pb-3">
              <Truck className="w-4 h-4 text-sbi-indigo" />
              <span>Sourcing &amp; Working Capital Logistics</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Primary Sourcing:</span>
                <span className="font-semibold text-slate-800 text-right">{data.logistics.primarySupplier}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Restock Frequency:</span>
                <span className="font-semibold text-slate-800">{data.logistics.procurementFrequency}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Transit Cost:</span>
                <span className="font-semibold text-slate-800">{data.logistics.avgTripCost}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Inventory Turnover:</span>
                <span className="font-semibold text-emerald-700">~{data.logistics.turnoverDays} Days Cycle</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Actionable Directives & DPR Guidelines Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 text-white p-6 rounded-xl shadow-sbi space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-sbi-yellow" />
          <h3 className="text-base font-bold">Strategic Directives for Bank Appraisal &amp; DPR Viability</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.actionableInsights.map((insight, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-sm p-3.5 rounded-lg border border-white/15 space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-sbi-yellow uppercase tracking-wide">Directive #{idx + 1}</span>
              </div>
              <p className="text-xs text-sky-50 leading-relaxed">
                {insight}
              </p>
            </div>
          ))}
        </div>

        {/* Navigation CTAs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/20">
          <span className="text-xs text-sky-200">
            Align this local demand analysis with your project loan structuring and government schemes:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('calculator')}
              className="bg-sbi-yellow hover:bg-amber-400 text-sbi-indigo font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition active:scale-95 flex items-center gap-1.5"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Simulate Loan &amp; Cash Flow</span>
            </button>

            <button
              onClick={() => onNavigateTab('schemes')}
              className="bg-white/15 hover:bg-white/25 text-white font-semibold text-xs px-4 py-2 rounded-lg border border-white/30 transition active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Match SIH26091 Schemes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
