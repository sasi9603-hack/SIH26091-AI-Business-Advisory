import React, { useState, useEffect } from 'react';
import { OFFICIAL_SCHEMES } from '../services/schemeEngine';
import { GovernmentSchemeItem, RAGQueryResponse } from '../types';
import { fetchSchemesList, fetchRagQuery } from '../services/api';
import { 
  BookOpen, 
  ExternalLink, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  Search, 
  Sparkles, 
  Loader2, 
  Info, 
  FileCheck,
  Building 
} from 'lucide-react';

interface SchemeMatcherProps {
  onSelectScheme?: (scheme: GovernmentSchemeItem) => void;
}

export const SchemeMatcher: React.FC<SchemeMatcherProps> = () => {
  const [schemes, setSchemes] = useState<GovernmentSchemeItem[]>(OFFICIAL_SCHEMES);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('term-loan');

  // RAG query state
  const [ragQuery, setRagQuery] = useState<string>('');
  const [ragResult, setRagResult] = useState<RAGQueryResponse | null>(null);
  const [isRagLoading, setIsRagLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchSchemesList().then((res) => {
      if (res && res.length > 0) {
        setSchemes(res);
      }
    });
  }, []);

  const activeScheme = schemes.find((s) => s.id === selectedSchemeId) || schemes[0];

  const handleRagSearch = async (queryText?: string) => {
    const q = queryText || ragQuery;
    if (!q.trim()) return;
    setIsRagLoading(true);
    try {
      const res = await fetchRagQuery(q);
      setRagResult(res);
    } catch (err) {
      console.warn('RAG query failed:', err);
    } finally {
      setIsRagLoading(false);
    }
  };

  const ragSuggestions = [
    "What government financial support may be available for a rural entrepreneur starting a bakery?",
    "What is the subsidy percentage under PMEGP for rural OBC beneficiaries?",
    "What are the loan limits under PM Mudra Yojana for small units?",
    "What official documents are required for Jan Samarth portal application?"
  ];

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
        {schemes.map((scheme) => (
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
              {(activeScheme.keyFeatures || []).map((feat, idx) => (
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
              {(activeScheme.eligibilityConditions || []).map((cond, idx) => (
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
            {(activeScheme.documentChecklist || []).map((doc, idx) => (
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

      {/* RAG Government Document Retrieval & Verification Section */}
      <div className="bg-gradient-to-br from-slate-900 to-sbi-indigo text-white p-6 rounded-xl shadow-lg space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-sbi-yellow text-sbi-indigo flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Official Scheme Policy RAG Search</span>
                <span className="text-[10px] bg-sky-400/20 text-sky-200 font-normal px-2 py-0.5 rounded border border-sky-300/30">
                  pgvector + Gemini Embeddings
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Retrieve verified policy evidence from official guidelines (PMEGP, PMFME, MUDRA, Jan Samarth)
              </p>
            </div>
          </div>
        </div>

        {/* Search Query Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRagSearch();
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={ragQuery}
              onChange={(e) => setRagQuery(e.target.value)}
              placeholder="Ask a policy question (e.g. 'What subsidy is available for rural women in bakery?')"
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-sky-300 focus:bg-white/15"
            />
          </div>
          <button
            type="submit"
            disabled={isRagLoading || !ragQuery.trim()}
            className="bg-sbi-yellow hover:bg-yellow-400 text-sbi-indigo font-bold text-xs px-5 py-2 rounded-lg transition disabled:opacity-50 flex items-center gap-1.5 shadow-md shrink-0"
          >
            {isRagLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{isRagLoading ? 'Retrieving Chunks...' : 'Query Guidelines'}</span>
          </button>
        </form>

        {/* Query Suggestions */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] mr-1">Suggested Inquiries:</span>
          {ragSuggestions.map((sug, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setRagQuery(sug);
                handleRagSearch(sug);
              }}
              className="text-[11px] bg-white/10 hover:bg-white/20 text-slate-200 px-2.5 py-1 rounded-full border border-white/15 transition text-left"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* RAG Results Display */}
        {ragResult && (
          <div className="bg-white text-slate-900 rounded-xl p-5 space-y-4 shadow-md animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-xs text-sbi-navy">Relevant Scheme:</span>
                <span className="text-xs font-bold bg-purple-100 text-sbi-indigo px-2.5 py-0.5 rounded">
                  {ragResult.relevant_scheme}
                </span>
              </div>
              <a
                href={ragResult.official_source.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-sbi-blue hover:underline font-semibold flex items-center gap-1"
              >
                <span>{ragResult.official_source.title}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Answer */}
            <div className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="text-xs font-bold text-sbi-navy uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-sbi-blue" />
                <span>Retrieved Grounded Policy Answer:</span>
              </h4>
              <p>{ragResult.answer}</p>
            </div>

            {/* Evidence Chunks */}
            {ragResult.evidence && ragResult.evidence.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                  <span>Retrieved Official Document Evidence ({ragResult.evidence.length} Chunks):</span>
                  <span className="text-[10px] text-slate-400 font-normal">Ranked by Cosine Similarity</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ragResult.evidence.map((chunk, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-sbi-indigo truncate">{chunk.document_title}</span>
                        <span className="bg-emerald-100 text-emerald-800 font-mono font-bold px-1.5 py-0.2 rounded">
                          {(chunk.similarity_score * 100).toFixed(1)}% match
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] line-clamp-3 leading-relaxed font-sans">
                        "{chunk.text}"
                      </p>
                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                        <span>{chunk.nodal_ministry || 'Govt of India'}</span>
                        <a
                          href={chunk.official_source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sbi-blue hover:underline"
                        >
                          Source Link &rarr;
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verification Note */}
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Official Verification Note:</strong> {ragResult.verification_note}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
