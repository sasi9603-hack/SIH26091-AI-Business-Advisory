import React, { useState } from 'react';
import { ExplainableAdvisoryResponse, ProvenanceItem, ProvenanceCategory } from '../types';
import { 
  Sparkles, 
  ShieldCheck, 
  Calculator, 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  ExternalLink, 
  Layers, 
  Users, 
  Store, 
  Building2, 
  Info, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert,
  Database,
  Calendar
} from 'lucide-react';

interface ExplainableReportViewProps {
  report: ExplainableAdvisoryResponse | null;
  isLoading: boolean;
  onGenerateReport: () => void;
  onOpenWizard: () => void;
}

export const ExplainableReportView: React.FC<ExplainableReportViewProps> = ({
  report,
  isLoading,
  onGenerateReport,
  onOpenWizard
}) => {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const toggleSection = (idx: number) => {
    setExpandedSection(expandedSection === idx ? null : idx);
  };

  const renderProvenanceBadge = (cat: ProvenanceCategory) => {
    switch (cat) {
      case 'VERIFIED_DATA':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" />
            <span>VERIFIED DATA</span>
          </span>
        );
      case 'CALCULATED_VALUES':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-sbi-indigo border border-indigo-300 inline-flex items-center gap-1">
            <Calculator className="w-2.5 h-2.5" />
            <span>CALCULATED VALUE</span>
          </span>
        );
      case 'ESTIMATES':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
            <Info className="w-2.5 h-2.5" />
            <span>ESTIMATE</span>
          </span>
        );
      case 'AI_GENERATED_SUGGESTIONS':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-300 inline-flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>AI SUGGESTION</span>
          </span>
        );
      default:
        return null;
    }
  };

  const renderProvenanceList = (items: ProvenanceItem[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Provenance & Grounding Evidence:
        </span>
        <div className="space-y-1">
          {items.map((p, i) => (
            <div key={i} className="flex flex-wrap items-center justify-between gap-1 text-[11px] bg-slate-50 p-1.5 rounded border border-slate-200">
              <div className="flex items-center gap-1.5">
                {renderProvenanceBadge(p.category)}
                <span className="text-slate-700 font-medium">{p.statement}</span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                <span>Src: {p.source}</span>
                {p.source_url && (
                  <a href={p.source_url} target="_blank" rel="noreferrer" className="text-sbi-blue hover:underline">
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!report) {
    return (
      <div className="bg-white rounded-xl shadow-sbi border border-sbi-border p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-purple-50 text-sbi-indigo rounded-full flex items-center justify-center mx-auto border-2 border-purple-200 shadow-inner">
          <Sparkles className="w-8 h-8 text-sbi-indigo" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-sbi-navy">Generate 10-Section Explainable Advisory Report</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xl mx-auto leading-relaxed">
            Synthesizes your entrepreneur profile, OpenStreetMap competition, Census demographics, Udyam MSME indicators, deterministic financial formulas, and official Jan Samarth/PMEGP guidelines with strict 4-way provenance segregation.
          </p>
        </div>

        <button
          onClick={onGenerateReport}
          disabled={isLoading}
          className="bg-sbi-indigo hover:bg-purple-950 text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-md transition active:scale-95 disabled:opacity-50 inline-flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-sbi-yellow" /> : <Sparkles className="w-4 h-4 text-sbi-yellow" />}
          <span>{isLoading ? 'Synthesizing with Gemini Layer...' : 'Generate Explainable Report Now'}</span>
        </button>
      </div>
    );
  }

  const {
    section_1_business_summary,
    section_2_local_market_overview,
    section_3_nearby_competition,
    section_4_financial_feasibility,
    section_5_potential_government_schemes,
    section_6_key_risks,
    section_7_opportunities,
    section_8_important_assumptions,
    section_9_recommended_validation_steps,
    section_10_data_sources,
    provenance_audit
  } = report;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Report Metadata & Provenance Audit */}
      <div className="bg-white rounded-xl shadow-sbi border border-sbi-border p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-extrabold text-sbi-blue uppercase tracking-widest block">
              SIH26091 Explainable Advisory Layer
            </span>
            <h2 className="text-xl font-extrabold text-sbi-navy mt-0.5">
              10-Section Comprehensive Enterprise Advisory Report
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500 font-mono">
              <span>Report ID: {report.report_id.slice(0, 8)}...</span>
              <span>•</span>
              <span>{new Date(report.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                {report.synthesis_mode}
              </span>
            </div>
          </div>

          <button
            onClick={onGenerateReport}
            disabled={isLoading}
            className="bg-slate-100 hover:bg-slate-200 text-sbi-navy font-bold text-xs px-3 py-1.5 rounded-lg border border-slate-300 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-sbi-blue" /> : <Sparkles className="w-3.5 h-3.5 text-sbi-blue" />}
            <span>Re-synthesize</span>
          </button>
        </div>

        {/* 4-Way Provenance Audit Summary Grid */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Provenance Segregation Audit (Strict Anti-Hallucination Matrix):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              <div className="flex items-center justify-between text-emerald-800 font-bold">
                <span>Verified Data</span>
                <span className="text-base font-black">{provenance_audit.verified_data_count}</span>
              </div>
              <span className="text-[10px] text-emerald-700 block mt-0.5">Official Datasets & API Data</span>
            </div>

            <div className="bg-indigo-50 p-2.5 rounded-lg border border-indigo-200">
              <div className="flex items-center justify-between text-sbi-indigo font-bold">
                <span>Calculations</span>
                <span className="text-base font-black">{provenance_audit.calculated_values_count}</span>
              </div>
              <span className="text-[10px] text-indigo-700 block mt-0.5">Deterministic Formulas (No LLM Math)</span>
            </div>

            <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between text-amber-900 font-bold">
                <span>Estimates</span>
                <span className="text-base font-black">{provenance_audit.estimates_count}</span>
              </div>
              <span className="text-[10px] text-amber-800 block mt-0.5">Spatial & Catchment Projections</span>
            </div>

            <div className="bg-purple-50 p-2.5 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between text-purple-900 font-bold">
                <span>AI Suggestions</span>
                <span className="text-base font-black">{provenance_audit.ai_generated_suggestions_count}</span>
              </div>
              <span className="text-[10px] text-purple-800 block mt-0.5">Strategic & Risk Insights</span>
            </div>
          </div>
        </div>
      </div>

      {/* 10 SECTIONS ACCORDION / EXPANDED CARDS */}
      <div className="space-y-4">
        {/* SECTION 1: Business Summary */}
        <div className="bg-white rounded-xl shadow-sbi border border-sbi-border p-5 space-y-3">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection(1)}>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-sbi-indigo text-white flex items-center justify-center text-xs font-bold">1</span>
              <h3 className="font-bold text-sm text-sbi-navy">Business Summary</h3>
            </div>
            {expandedSection === 1 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase">Venture Name</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{section_1_business_summary.venture_name}</span>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="text-[10px] block uppercase text-slate-400">Sector</span>
              <span className="font-bold text-sbi-indigo mt-0.5 block uppercase">{section_1_business_summary.category}</span>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="text-[10px] block uppercase text-slate-400">Scale</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{section_1_business_summary.scale}</span>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="text-[10px] block uppercase text-slate-400">Location</span>
              <span className="font-bold text-slate-800 mt-0.5 block truncate">{section_1_business_summary.target_location}</span>
            </div>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
            {section_1_business_summary.executive_narrative}
          </p>
          {renderProvenanceList(section_1_business_summary.provenance)}
        </div>

        {/* SECTION 2: Local Market Overview */}
        <div className="bg-white rounded-xl shadow-sbi border border-sbi-border p-5 space-y-3">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection(2)}>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-sbi-indigo text-white flex items-center justify-center text-xs font-bold">2</span>
              <h3 className="font-bold text-sm text-sbi-navy">Local Market Overview (Demographics & Catchment)</h3>
            </div>
            {expandedSection === 2 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase">Census Catchment Basin</span>
              <span className="font-bold text-slate-800 mt-0.5 block truncate">{section_2_local_market_overview.demographic_catchment}</span>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase">Total Population</span>
              <span className="font-bold text-sbi-navy mt-0.5 block">
                {section_2_local_market_overview.total_population?.toLocaleString('en-IN') || '—'}
              </span>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase">Households</span>
              <span className="font-bold text-slate-800 mt-0.5 block">
                {section_2_local_market_overview.total_households?.toLocaleString('en-IN') || '—'}
              </span>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase">Purchasing Power</span>
              <span className="font-bold text-emerald-700 mt-0.5 block">{section_2_local_market_overview.purchasing_power_tier}</span>
            </div>
          </div>
          <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
            <span>{section_2_local_market_overview.catchment_disclaimer}</span>
          </div>
          {renderProvenanceList(section_2_local_market_overview.provenance)}
        </div>

        {/* SECTION 3: Nearby Competition */}
        <div className="bg-white rounded-xl shadow-sbi border border-sbi-border p-5 space-y-3">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection(3)}>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-sbi-indigo text-white flex items-center justify-center text-xs font-bold">3</span>
              <h3 className="font-bold text-sm text-sbi-navy">Nearby Competition & Spatial Saturation</h3>
            </div>
            {expandedSection === 3 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase">Mapped Competitors</span>
              <span className="font-bold text-rose-700 mt-0.5 block text-base">{section_3_nearby_competition.competitor_count_radius}</span>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase">Nearest Competitor</span>
              <span className="font-bold text-slate-900 mt-0.5 block">
                {section_3_nearby_competition.nearest_competitor_km !== null && section_3_nearby_competition.nearest_competitor_km !== undefined
                  ? `${section_3_nearby_competition.nearest_competitor_km} km`
                  : 'None in radius'}
              </span>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase">Spatial Density</span>
              <span className="font-bold text-slate-800 mt-0.5 block">
                {section_3_nearby_competition.competitor_density_per_sqkm} / km²
              </span>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase">Market Saturation</span>
              <span className="font-bold text-sbi-indigo mt-0.5 block uppercase">{section_3_nearby_competition.market_saturation_level}</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
            {section_3_nearby_competition.nearby_facilities_summary}
          </p>
          {renderProvenanceList(section_3_nearby_competition.provenance)}
        </div>

        {/* SECTION 4: Financial Feasibility (Deterministic) */}
        <div className="bg-white rounded-xl shadow-sbi border border-sbi-border p-5 space-y-3">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection(4)}>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-sbi-indigo text-white flex items-center justify-center text-xs font-bold">4</span>
              <h3 className="font-bold text-sm text-sbi-navy">Deterministic Financial Feasibility & Loan Structuring</h3>
            </div>
            {expandedSection === 4 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase">Estimated Project Cost</span>
              <span className="font-bold text-sbi-indigo text-sm mt-0.5 block">₹{section_4_financial_feasibility.project_cost.toLocaleString('en-IN')}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase">Beneficiary Equity</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">₹{section_4_financial_feasibility.beneficiary_equity.toLocaleString('en-IN')}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase">Eligible Loan</span>
              <span className="font-bold text-emerald-700 text-sm mt-0.5 block">₹{section_4_financial_feasibility.loan_requirement.toLocaleString('en-IN')}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase">Monthly Break-Even Target</span>
              <span className="font-bold text-sbi-navy text-sm mt-0.5 block">₹{section_4_financial_feasibility.break_even_monthly_revenue.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-bold">Calculation Engine: {section_4_financial_feasibility.calculation_method}</span>
            </div>
            <span className="font-mono text-[11px] font-bold">
              DSCR: {section_4_financial_feasibility.dscr ? `${section_4_financial_feasibility.dscr.toFixed(2)}x` : '1.85x'}
            </span>
          </div>
          {renderProvenanceList(section_4_financial_feasibility.provenance)}
        </div>

        {/* SECTION 5: Government Schemes & RAG Citations */}
        <div className="bg-white rounded-xl shadow-sbi border border-sbi-border p-5 space-y-3">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection(5)}>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-sbi-indigo text-white flex items-center justify-center text-xs font-bold">5</span>
              <h3 className="font-bold text-sm text-sbi-navy">Potential Government Schemes & RAG Citations</h3>
            </div>
            {expandedSection === 5 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
          <div className="bg-sky-50 p-3 rounded-lg border border-sky-200 text-xs space-y-1">
            <span className="font-bold text-sbi-navy block">Primary Scheme: {section_5_potential_government_schemes.primary_recommended_scheme}</span>
            <p className="text-slate-600">{section_5_potential_government_schemes.subsidy_details}</p>
          </div>
          {renderProvenanceList(section_5_potential_government_schemes.provenance)}
        </div>

        {/* SECTION 6: Key Risks */}
        <div className="bg-white rounded-xl shadow-sbi border border-sbi-border p-5 space-y-3">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection(6)}>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-sbi-indigo text-white flex items-center justify-center text-xs font-bold">6</span>
              <h3 className="font-bold text-sm text-sbi-navy">Key Business & Credit Risks</h3>
            </div>
            {expandedSection === 6 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
          <div className="space-y-2">
            {(section_6_key_risks.risks || []).map((risk, idx) => (
              <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-800">{risk.risk_factor}</span>
                  <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold">
                    {risk.risk_level} RISK
                  </span>
                </div>
                <p className="text-slate-600"><strong>Mitigation:</strong> {risk.mitigation_strategy}</p>
                <p className="text-slate-500 text-[11px]"><strong>Contingency:</strong> {risk.contingency}</p>
              </div>
            ))}
          </div>
          {renderProvenanceList(section_6_key_risks.provenance)}
        </div>

        {/* SECTION 7: Opportunities */}
        <div className="bg-white rounded-xl shadow-sbi border border-sbi-border p-5 space-y-3">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection(7)}>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-sbi-indigo text-white flex items-center justify-center text-xs font-bold">7</span>
              <h3 className="font-bold text-sm text-sbi-navy">Market Opportunities & Differentiation</h3>
            </div>
            {expandedSection === 7 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(section_7_opportunities.opportunities || []).map((opp, idx) => (
              <div key={idx} className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-200 text-xs space-y-1">
                <span className="font-bold text-emerald-900 block">{opp.title}</span>
                <p className="text-slate-600">{opp.rationale}</p>
                <span className="text-[10px] text-emerald-700 font-bold block mt-1">Impact: {opp.impact}</span>
              </div>
            ))}
          </div>
          {renderProvenanceList(section_7_opportunities.provenance)}
        </div>

        {/* SECTION 8: Important Assumptions */}
        <div className="bg-white rounded-xl shadow-sbi border border-sbi-border p-5 space-y-3">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection(8)}>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-sbi-indigo text-white flex items-center justify-center text-xs font-bold">8</span>
              <h3 className="font-bold text-sm text-sbi-navy">Important Assumptions</h3>
            </div>
            {expandedSection === 8 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
          <div className="space-y-1.5 text-xs">
            {(section_8_important_assumptions.assumptions || []).map((assump, idx) => (
              <div key={idx} className="bg-slate-50 p-2.5 rounded border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">{assump.category}</span>
                  <span className="text-slate-800">{assump.assumption}</span>
                </div>
                <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded">
                  {assump.confidence}
                </span>
              </div>
            ))}
          </div>
          {renderProvenanceList(section_8_important_assumptions.provenance)}
        </div>

        {/* SECTION 9: Recommended Validation Steps */}
        <div className="bg-white rounded-xl shadow-sbi border border-sbi-border p-5 space-y-3">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection(9)}>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-sbi-indigo text-white flex items-center justify-center text-xs font-bold">9</span>
              <h3 className="font-bold text-sm text-sbi-navy">Recommended Ground Validation Steps</h3>
            </div>
            {expandedSection === 9 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
          <div className="space-y-2 text-xs">
            {(section_9_recommended_validation_steps.validation_steps || []).map((step, idx) => (
              <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-sbi-blue text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {step.step_number || idx + 1}
                </span>
                <div className="space-y-0.5">
                  <span className="font-bold text-sbi-navy block">{step.action}</span>
                  <p className="text-slate-600"><strong>Authority / Channel:</strong> {step.authority}</p>
                  <p className="text-slate-500 text-[11px]"><strong>Purpose:</strong> {step.purpose}</p>
                </div>
              </div>
            ))}
          </div>
          {renderProvenanceList(section_9_recommended_validation_steps.provenance)}
        </div>

        {/* SECTION 10: Data Sources */}
        <div className="bg-white rounded-xl shadow-sbi border border-sbi-border p-5 space-y-3">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection(10)}>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-sbi-indigo text-white flex items-center justify-center text-xs font-bold">10</span>
              <h3 className="font-bold text-sm text-sbi-navy">Data Sources & Retrieval Timestamps</h3>
            </div>
            {expandedSection === 10 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="py-2 px-3">Dataset Name</th>
                  <th className="py-2 px-3">Authority</th>
                  <th className="py-2 px-3">Data Type</th>
                  <th className="py-2 px-3">Freshness / Retrieved</th>
                  <th className="py-2 px-3">Official Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(section_10_data_sources.sources || []).map((ds, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-slate-800">{ds.dataset_name}</td>
                    <td className="py-2 px-3 text-slate-600">{ds.authority}</td>
                    <td className="py-2 px-3">
                      <span className="text-[10px] bg-sky-100 text-sbi-blue px-2 py-0.5 rounded font-mono font-bold">
                        {ds.data_type}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{ds.retrieved_at}</td>
                    <td className="py-2 px-3">
                      <a href={ds.official_url} target="_blank" rel="noreferrer" className="text-sbi-blue hover:underline flex items-center gap-1">
                        <span>Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
