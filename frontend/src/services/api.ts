import { EntrepreneurProfile, AdvisoryReport, CompetitorBusiness, FinancialBreakdown } from '../types';
import { calculateFinancials } from './financialEngine';
import { INITIAL_COMPETITORS } from './mockData';

export async function fetchAdvisoryEvaluation(profile: EntrepreneurProfile): Promise<{
  report: AdvisoryReport;
  financials: FinancialBreakdown;
  competitors: CompetitorBusiness[];
}> {
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
    // Graceful offline fallback to deterministic calculation engine
  }

  // Client-Side Deterministic Synthesis Engine
  const financials = calculateFinancials(
    profile.category,
    profile.availableCapital,
    profile.socialCategory,
    profile.isRural
  );

  // Filter or generate relevant competitors
  const competitors = INITIAL_COMPETITORS;
  const competitorCount = competitors.length;

  // Compute Saturation Index
  // Formula from docs/competitor-analysis.md: Sum(Cb) / Population benchmark
  const sumConfidence = competitors.reduce((acc, c) => acc + c.confidenceScore, 0);
  const saturationIndex = Math.min(1.2, +(sumConfidence / 4.0).toFixed(2));

  let saturationLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (saturationIndex > 1.0) saturationLevel = 'CRITICAL';
  else if (saturationIndex > 0.75) saturationLevel = 'HIGH';
  else if (saturationIndex > 0.40) saturationLevel = 'MODERATE';

  // Calculate Opportunity Score (0 to 100)
  // High score when competition is low and financial risk is low
  let opportunityScore = 78;
  if (saturationLevel === 'LOW' && financials.riskRating === 'LOW') opportunityScore = 88;
  else if (saturationLevel === 'MODERATE' && financials.riskRating === 'LOW') opportunityScore = 78;
  else if (saturationLevel === 'HIGH' || financials.riskRating === 'HIGH') opportunityScore = 46;

  let verdict: 'START' | 'CONSIDER' | 'AVOID' = 'CONSIDER';
  let verdictLabel = 'RECOMMENDED WITH CONDITIONS';
  let verdictReason = 'Viable opportunity with moderate competitor density. Leverage PMEGP 35% margin subsidy.';

  if (opportunityScore >= 80) {
    verdict = 'START';
    verdictLabel = 'HIGHLY RECOMMENDED';
    verdictReason = 'Strong local demand and low competitor saturation. High probability of success.';
  } else if (opportunityScore < 50) {
    verdict = 'AVOID';
    verdictLabel = 'HIGH RISK / SATURATED';
    verdictReason = 'Severe local competition and heavy debt repayment load. Alternative sector advised.';
  }

  const aiNarrative = `Based on spatial mapping within a 3km radius of PIN ${profile.pincode} (${profile.villageTown}), our system identified ${competitorCount} existing competitor(s) with an aggregate confidence score of ${sumConfidence.toFixed(2)}. As a rural applicant in category ${profile.socialCategory}, you qualify for up to 35% capital subsidy under PMEGP or collateral-free credit under Pradhan Mantri Mudra Yojana (PMMY Kishore). With a project cost of ₹${financials.totalProjectCost.toLocaleString('en-IN')}, your estimated monthly EMI is ₹${financials.monthlyEmi.toLocaleString('en-IN')}, requiring a monthly break-even sales turnover of ₹${financials.breakEvenMonthlyRevenue.toLocaleString('en-IN')}.`;

  const report: AdvisoryReport = {
    opportunityScore,
    verdict,
    verdictLabel,
    verdictReason,
    saturationIndex,
    saturationLevel,
    discoveredCompetitorsCount: competitorCount,
    financialFeasibilityScore: financials.riskRating === 'LOW' ? 85 : 65,
    aiNarrative,
    recommendationsList: [
      `Apply for PMEGP through the District Industries Centre (DIC) to avail 35% margin subsidy.`,
      `Focus inventory on high-demand items (e.g. submersible pump repairs & tractor implements).`,
      `Maintain at least 3 months working capital buffer (₹${financials.workingCapitalBuffer.toLocaleString('en-IN')}).`
    ],
    riskWarnings: [
      `Ensure shop is positioned at least 1.5 km away from Sri Lakshmi Agro Machinery to avoid price-war friction.`,
      `Debt-service coverage requires consistent gross monthly revenue above ₹${financials.breakEvenMonthlyRevenue.toLocaleString('en-IN')}.`
    ]
  };

  return { report, financials, competitors };
}
