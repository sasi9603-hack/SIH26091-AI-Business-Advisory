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

  let aiNarrative = '';
  const recommendationsList: string[] = [];
  const riskWarnings: string[] = [];

  if (financials.isOutsideRange) {
    aiNarrative = `Location: PIN ${profile.pincode} (${profile.villageTown || 'Target Location'}). Mapped businesses in radius: ${competitorCount}. For an Available Margin Capital of ₹${profile.availableCapital.toLocaleString('en-IN')}, the calculated project cost is ₹${financials.totalProjectCost.toLocaleString('en-IN')}, which exceeds the ₹50.00 Lakh upper ceiling specified for the Term Loan Scheme under the SIH26091 framework.`;
    recommendationsList.push('Adjust available margin capital to ₹5,00,000 or below to qualify within the SIH26091 Term Loan Scheme threshold.');
    riskWarnings.push('Calculated project cost exceeds the ₹50 Lakh maximum ceiling for SIH26091 financial schemes.');
  } else {
    aiNarrative = `Location: PIN ${profile.pincode} (${profile.villageTown || 'Target Location'}). Identified mapped businesses in radius: ${competitorCount}. Based on Available Margin Capital of ₹${profile.availableCapital.toLocaleString('en-IN')} (10% contribution), Estimated Project Cost is ₹${financials.totalProjectCost.toLocaleString('en-IN')}. Recommended Scheme: ${financials.selectedSchemeName} (${financials.annualInterestRate}% p.a., ${financials.repaymentTenureYears} Years tenure, ${financials.moratoriumMonths}-Month Moratorium). Eligible Loan: ₹${financials.eligibleLoan.toLocaleString('en-IN')} (maximum cap: ₹${financials.schemeMaximumCap.toLocaleString('en-IN')}). Estimated Repayment: ₹${financials.quarterlyInstallment.toLocaleString('en-IN')} / quarter.`;
    recommendationsList.push(
      `Apply under ${financials.selectedSchemeName} with ${financials.annualInterestRate}% p.a. interest and ${financials.moratoriumMonths}-month moratorium.`,
      `Ensure 10% margin contribution (₹${(financials.totalProjectCost * 0.10).toLocaleString('en-IN')}) is maintained in your enterprise bank account.`,
      `Maintain working capital liquidity of at least ₹${financials.workingCapitalBuffer.toLocaleString('en-IN')} during setup and moratorium.`
    );
    riskWarnings.push(
      `Quarterly debt servicing of ~₹${financials.quarterlyInstallment.toLocaleString('en-IN')} commences following the ${financials.moratoriumMonths}-month moratorium.`,
      `Ensure business operations break-even above ₹${financials.breakEvenMonthlyRevenue.toLocaleString('en-IN')} in monthly sales revenue.`
    );
  }

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
    recommendationsList,
    riskWarnings
  };

  return { report, financials, competitors };
}
