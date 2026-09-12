import { EntrepreneurProfile, AdvisoryReport, CompetitorBusiness, FinancialBreakdown } from '../types';
import { calculateFinancials } from './financialEngine';
import { INITIAL_COMPETITORS } from './mockData';

export async function fetchAdvisoryEvaluation(profile: EntrepreneurProfile, existingCompetitors: CompetitorBusiness[] = []): Promise<{
  report: AdvisoryReport | null;
  financials: FinancialBreakdown | null;
  competitors: CompetitorBusiness[];
}> {
  // If backend is available, attempt to query live API
  if (profile.pincode && profile.availableCapital > 0) {
    try {
      const res = await fetch('/api/v1/ai-agent/evaluate-viability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pincode: profile.pincode,
          business_category: profile.category,
          proposed_budget: profile.availableCapital,
          gender: profile.gender,
          social_category: profile.socialCategory,
          is_rural: profile.isRural
        })
      });

      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (_err) {
      // Backend not running; proceed with formula layout
    }
  }

  // If user hasn't configured profile yet, return clean layout state
  if (!profile.pincode || profile.availableCapital <= 0) {
    return {
      report: null,
      financials: null,
      competitors: existingCompetitors
    };
  }

  // Calculate purely mathematical financial structure based on user-provided budget
  const financials = calculateFinancials(
    profile.category,
    profile.availableCapital,
    profile.socialCategory,
    profile.isRural
  );

  const competitors = existingCompetitors;
  const competitorCount = competitors.length;

  // Real formula-driven Saturation Index based only on actual mapped entries
  const sumConfidence = competitors.reduce((acc, c) => acc + c.confidenceScore, 0);
  const saturationIndex = competitorCount > 0 ? +(sumConfidence / 4.0).toFixed(2) : 0;

  let saturationLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (saturationIndex > 1.0) saturationLevel = 'CRITICAL';
  else if (saturationIndex > 0.75) saturationLevel = 'HIGH';
  else if (saturationIndex > 0.40) saturationLevel = 'MODERATE';

  let opportunityScore = 0;
  let verdict: 'START' | 'CONSIDER' | 'AVOID' = 'CONSIDER';
  let verdictLabel = 'EVALUATION PENDING';
  let verdictReason = 'Awaiting sufficient spatial data points.';

  if (profile.availableCapital > 0) {
    if (competitorCount === 0) {
      opportunityScore = 85;
      verdict = 'START';
      verdictLabel = 'HIGH OPPORTUNITY (NO MAPPED COMPETITORS)';
      verdictReason = 'No registered competitors found in target radius. Verify informal vendors locally.';
    } else if (saturationLevel === 'LOW') {
      opportunityScore = 80;
      verdict = 'START';
      verdictLabel = 'FEASIBLE / LOW SATURATION';
      verdictReason = 'Low competitor density in immediate radius.';
    } else if (saturationLevel === 'MODERATE') {
      opportunityScore = 65;
      verdict = 'CONSIDER';
      verdictLabel = 'MODERATE COMPETITION';
      verdictReason = 'Market has existing vendors. Differentiation recommended.';
    } else {
      opportunityScore = 40;
      verdict = 'AVOID';
      verdictLabel = 'HIGH SATURATION / RISK';
      verdictReason = 'Dense competitor saturation identified in target radius.';
    }
  }

  const aiNarrative = `Location: PIN ${profile.pincode} (${profile.villageTown || 'Target Location'}). Identified mapped businesses in radius: ${competitorCount}. For a planned equity of ₹${profile.availableCapital.toLocaleString('en-IN')}, the estimated project cost is ₹${financials.totalProjectCost.toLocaleString('en-IN')}. Applicable capital subsidy (PMEGP): ${financials.subsidyPercentage}% (₹${financials.subsidyAmount.toLocaleString('en-IN')}). Estimated monthly EMI: ₹${financials.monthlyEmi.toLocaleString('en-IN')}. Required monthly break-even sales turnover: ₹${financials.breakEvenMonthlyRevenue.toLocaleString('en-IN')}.`;

  const report: AdvisoryReport = {
    opportunityScore,
    verdict,
    verdictLabel,
    verdictReason,
    saturationIndex,
    saturationLevel,
    discoveredCompetitorsCount: competitorCount,
    financialFeasibilityScore: financials.riskRating === 'LOW' ? 85 : 60,
    aiNarrative,
    recommendationsList: [
      `Review eligibility for ${financials.subsidyPercentage}% capital subsidy under PMEGP or collateral-free loan under Mudra.`,
      `Maintain a working capital buffer of at least ₹${financials.workingCapitalBuffer.toLocaleString('en-IN')}.`,
      `Conduct local ground verification to check for unmapped weekly markets or informal vendors.`
    ],
    riskWarnings: [
      `Loan repayment requires consistent monthly turnover above ₹${financials.breakEvenMonthlyRevenue.toLocaleString('en-IN')}.`,
      `Verify official registration with local District Industries Centre (DIC).`
    ]
  };

  return { report, financials, competitors };
}
