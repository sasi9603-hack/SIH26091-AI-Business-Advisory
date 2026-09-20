import { 
  EntrepreneurProfile, 
  AdvisoryReport, 
  CompetitorBusiness, 
  FinancialBreakdown,
  GovernmentSchemeItem,
  ExplainableAdvisoryResponse,
  RAGQueryResponse,
  AgentConsultResponse
} from '../types';
import { calculateFinancials } from './financialEngine';

const rawApiBase = (import.meta as any).env?.VITE_API_BASE_URL || '';
export const API_BASE = typeof rawApiBase === 'string' ? rawApiBase.replace(/\/+$/, '') : '';

export async function apiFetch(path: string, options: RequestInit = {}, timeoutMs: number = 20000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchAdvisoryEvaluation(profile: EntrepreneurProfile, existingCompetitors: CompetitorBusiness[] = []): Promise<{
  report: AdvisoryReport | null;
  financials: FinancialBreakdown | null;
  competitors: CompetitorBusiness[];
}> {
  // If backend is available, attempt to query live API
  if ((profile.pincode || profile.villageTown || profile.district) && profile.availableCapital > 0) {
    try {
      const res = await apiFetch('/api/v1/ai-agent/evaluate-viability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pincode: profile.pincode || '',
          village_town: profile.villageTown || '',
          district: profile.district || '',
          state: profile.state || '',
          business_category: profile.category,
          proposed_budget: profile.availableCapital,
          gender: profile.gender,
          social_category: profile.socialCategory,
          is_rural: profile.isRural,
          radius_km: profile.radiusKm || 3.0
        })
      });

      if (res.ok) {
        const data = await res.json();
        return {
          report: data.report,
          financials: data.financials,
          competitors: (data.competitors || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            category: c.category,
            source: c.source,
            confidenceScore: c.confidenceScore ?? c.confidence_score ?? 0.85,
            verificationStatus: c.verificationStatus ?? c.verification_status ?? 'VERIFIED',
            distanceKm: c.distanceKm ?? c.distance_km ?? 0,
            lat: c.lat ?? c.latitude,
            lng: c.lng ?? c.longitude,
            address: c.address,
            reportedDate: c.reportedDate ?? c.reported_date,
            upvotes: c.upvotes
          }))
        };
      }
    } catch (_err) {
      // Backend temporarily unreachable; continue with deterministic fallback
    }
  }

  // If user hasn't configured profile yet, return clean layout state
  if ((!profile.pincode && !profile.villageTown) || profile.availableCapital <= 0) {
    return {
      report: null,
      financials: null,
      competitors: existingCompetitors
    };
  }

  // Calculate deterministic financial structure based on user-provided budget
  const financials = calculateFinancials(
    profile.category,
    profile.availableCapital,
    profile.socialCategory,
    profile.isRural
  );

  const competitors = existingCompetitors;
  const competitorCount = competitors.length;

  // Saturation Index calculation
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

  const locName = profile.villageTown || (profile.pincode ? `PIN ${profile.pincode}` : 'Target Location');

  if (financials.isOutsideRange) {
    aiNarrative = `Location: ${locName}. Mapped businesses in radius: ${competitorCount}. For an Available Margin Capital of ?${profile.availableCapital.toLocaleString('en-IN')}, the calculated project cost is ?${financials.totalProjectCost.toLocaleString('en-IN')}, which exceeds the ?50.00 Lakh upper ceiling specified for the Term Loan Scheme under the SIH26091 framework.`;
    recommendationsList.push('Adjust available margin capital to ?5,00,000 or below to qualify within the SIH26091 Term Loan Scheme threshold.');
    riskWarnings.push('Calculated project cost exceeds the ?50 Lakh maximum ceiling for SIH26091 financial schemes.');
  } else {
    aiNarrative = `Location: ${locName}. Identified mapped businesses in radius: ${competitorCount}. Based on Available Margin Capital of ?${profile.availableCapital.toLocaleString('en-IN')} (10% contribution), Estimated Project Cost is ?${financials.totalProjectCost.toLocaleString('en-IN')}. Recommended Scheme: ${financials.selectedSchemeName} (${financials.annualInterestRate}% p.a., ${financials.repaymentTenureYears} Years tenure, ${financials.moratoriumMonths}-Month Moratorium). Eligible Loan: ?${financials.eligibleLoan.toLocaleString('en-IN')} (maximum cap: ?${financials.schemeMaximumCap.toLocaleString('en-IN')}). Estimated Repayment: ?${financials.quarterlyInstallment.toLocaleString('en-IN')} / quarter.`;
    recommendationsList.push(
      `Apply under ${financials.selectedSchemeName} with ${financials.annualInterestRate}% p.a. interest and ${financials.moratoriumMonths}-month moratorium.`,
      `Ensure 10% margin contribution (?${(financials.totalProjectCost * 0.10).toLocaleString('en-IN')}) is maintained in your enterprise bank account.`,
      `Maintain working capital liquidity of at least ?${financials.workingCapitalBuffer.toLocaleString('en-IN')} during setup and moratorium.`
    );
    riskWarnings.push(
      `Quarterly debt servicing of ~?${financials.quarterlyInstallment.toLocaleString('en-IN')} commences following the ${financials.moratoriumMonths}-month moratorium.`,
      `Ensure business operations break-even above ?${financials.breakEvenMonthlyRevenue.toLocaleString('en-IN')} in monthly sales revenue.`
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

export async function geocodeLocation(params: {
  villageTown?: string;
  block?: string;
  district?: string;
  state?: string;
  pincode?: string;
  query?: string;
}): Promise<{
  latitude: number;
  longitude: number;
  displayName: string;
  villageTown: string;
  block?: string;
  district: string;
  state: string;
  pincode: string;
  formattedAddress: string;
  isApproximate: boolean;
}> {
  try {
    const res = await apiFetch('/api/location/geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        villageTown: params.villageTown,
        mandal: params.block,
        district: params.district,
        state: params.state,
        pincode: params.pincode,
        query: params.query
      })
    });
    if (res.ok) {
      const data = await res.json();
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        displayName: data.display_name,
        villageTown: data.village_town,
        block: data.block,
        district: data.district,
        state: data.state,
        pincode: data.pincode,
        formattedAddress: data.formatted_address,
        isApproximate: data.is_approximate
      };
    }
  } catch (err) {
    console.warn('Geocoding request error:', err);
  }
  return {
    latitude: 16.3067,
    longitude: 80.4365,
    displayName: `${params.villageTown || params.district || 'Guntur'}, Andhra Pradesh`,
    villageTown: params.villageTown || 'Guntur',
    district: params.district || 'Guntur',
    state: params.state || 'Andhra Pradesh',
    pincode: params.pincode || '522002',
    formattedAddress: `${params.villageTown || 'Guntur'}, ${params.district || 'Guntur'}, Andhra Pradesh`,
    isApproximate: true
  };
}

export async function searchNearbyCompetitors(
  latitude: number,
  longitude: number,
  category: string,
  radiusKm: number = 3.0
): Promise<{
  competitorCount: number;
  businessCategory: string;
  radiusKm: number;
  disclaimer: string;
  businesses: CompetitorBusiness[];
}> {
  try {
    const res = await apiFetch('/api/competitors/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude,
        longitude,
        business_category: category,
        radius_km: radiusKm
      })
    });
    if (res.ok) {
      const data = await res.json();
      return {
        competitorCount: data.competitor_count,
        businessCategory: data.business_category,
        radiusKm: data.radius_km,
        disclaimer: data.disclaimer,
        businesses: (data.businesses || []).map((b: any) => ({
          id: b.id,
          name: b.name,
          category: b.category,
          source: b.source,
          confidenceScore: b.confidenceScore ?? b.confidence_score ?? 0.85,
          verificationStatus: b.verificationStatus ?? b.verification_status ?? 'VERIFIED',
          distanceKm: b.distanceKm ?? b.distance_km ?? 0,
          lat: b.lat ?? b.latitude,
          lng: b.lng ?? b.longitude,
          address: b.address,
          reportedDate: b.reportedDate ?? b.reported_date,
          upvotes: b.upvotes
        }))
      };
    }
  } catch (err) {
    console.warn('Competitors search error:', err);
  }
  return {
    competitorCount: 0,
    businessCategory: category,
    radiusKm,
    disclaimer: '0 businesses found in available map data.',
    businesses: []
  };
}

export async function submitCommunityReport(report: {
  businessName: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string;
  pincode?: string;
}): Promise<boolean> {
  try {
    const res = await apiFetch('/api/competitors/community-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_name: report.businessName,
        category: report.category,
        latitude: report.latitude,
        longitude: report.longitude,
        address: report.address,
        pincode: report.pincode
      })
    });
    return res.ok;
  } catch (_e) {
    return false;
  }
}

export interface MarketAnalysisResult {
  location_summary: {
    resolved_name: string;
    pincode?: string;
    district: string;
    state: string;
    latitude: number;
    longitude: number;
    radius_km: number;
  };
  business_category: string;
  competitor_rings: {
    within_1km: number;
    within_3km: number;
    within_5km: number;
    total_in_radius: number;
    nearest_competitor_distance_km?: number | null;
    nearest_competitor_name?: string | null;
    competitor_density_per_sq_km: number;
    density_formula: string;
    source: string;
    data_freshness: string;
    disclaimer: string;
  };
  census_demographics: {
    total_population?: number | null;
    total_households?: number | null;
    rural_population_pct?: number | null;
    working_population_pct?: number | null;
    literacy_rate_pct?: number | null;
    purchasing_power_tier?: string | null;
    source: string;
    source_url: string;
    data_freshness: string;
    caveat: string;
  };
  udyam_enterprises: {
    total_registered_msmes: number;
    micro_enterprises_count: number;
    small_enterprises_count: number;
    medium_enterprises_count: number;
    micro_dominance_pct: number;
    manufacturing_units?: number | null;
    services_units?: number | null;
    category_registered_count?: number | null;
    category_nic_code?: string | null;
    source: string;
    data_freshness: string;
    disclaimer: string;
  };
  nearby_facilities: {
    total_facilities_count: number;
    financial_facilities_count: number;
    commercial_facilities_count: number;
    transit_facilities_count: number;
    civic_facilities_count: number;
    facilities_list: Array<{
      id: string;
      name: string;
      facility_type: string;
      distance_km: number;
      lat: number;
      lng: number;
      address?: string;
    }>;
    source: string;
    data_freshness: string;
  };
  feasibility_score: number;
  feasibility_verdict: 'HIGH VIABILITY' | 'MODERATE VIABILITY' | 'NEEDS CAUTION';
  saturation_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  opportunity_label: string;
  nearest_hub: { name: string; distanceKm: number };
  operating_windows: Array<{ title: string; timing: string; level: string; description: string }>;
  seasonal_factors: Array<{ title: string; timing: string; level: string; description: string }>;
  sourcing_logistics: {
    primarySupplier: string;
    procurementFrequency: string;
    avgTripCost: string;
    turnoverDays: number;
  };
  actionable_recommendations: string[];
  provenance_disclaimer: string;
}

export async function fetchMarketAnalysis(
  profile: EntrepreneurProfile
): Promise<MarketAnalysisResult | null> {
  try {
    const res = await apiFetch('/api/market/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_category: profile.category,
        latitude: profile.lat || null,
        longitude: profile.lng || null,
        radius_km: profile.radiusKm || 3.0,
        pincode: profile.pincode || null,
        district: profile.district || null,
        state: profile.state || null,
        village_town: profile.villageTown || null
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Market analysis fetch fallback:', err);
  }
  return null;
}

export interface DeterministicFinancialMetric {
  value: number | null;
  status: 'calculated' | 'insufficient_data' | 'not_applicable';
  reason: string | null;
  formula: string | null;
}

export interface DeterministicFinancialResult {
  business_category: string | null;
  calculation_method: string;
  engine_note: string;
  project_cost: DeterministicFinancialMetric;
  own_contribution: DeterministicFinancialMetric;
  loan_requirement: DeterministicFinancialMetric;
  monthly_emi: DeterministicFinancialMetric;
  total_repayment: DeterministicFinancialMetric;
  monthly_expenses: DeterministicFinancialMetric;
  estimated_monthly_profit: DeterministicFinancialMetric;
  break_even_point: DeterministicFinancialMetric;
  annual_revenue: DeterministicFinancialMetric;
  annual_expenses: DeterministicFinancialMetric;
  cash_flow_indicators: {
    net_monthly_cash_flow: DeterministicFinancialMetric;
    annual_net_cash_flow: DeterministicFinancialMetric;
    debt_service_coverage_ratio: DeterministicFinancialMetric;
    payback_period_years: DeterministicFinancialMetric;
    status: 'calculated' | 'partial' | 'insufficient_data';
    summary: string;
  };
  calculated_project_cost: number | null;
  calculated_own_contribution: number | null;
  calculated_loan_requirement: number | null;
  calculated_monthly_emi: number | null;
  calculated_total_repayment: number | null;
  calculated_total_interest: number | null;
  calculated_monthly_expenses: number | null;
  calculated_monthly_profit: number | null;
  calculated_break_even_revenue: number | null;
  calculated_annual_revenue: number | null;
  calculated_annual_expenses: number | null;
  calculated_dscr: number | null;
  calculated_payback_years: number | null;
  missing_inputs: string[];
  has_insufficient_data: boolean;
}

export async function fetchFinancialCalculation(params: {
  business_category?: string;
  project_cost?: number;
  available_capital?: number;
  own_contribution?: number;
  loan_amount?: number;
  interest_rate?: number;
  tenure?: number;
  tenure_unit?: 'months' | 'years';
  equipment_cost?: number;
  working_capital?: number;
  monthly_fixed_expenses?: number;
  monthly_variable_expenses?: number;
  expected_monthly_revenue?: number;
}): Promise<DeterministicFinancialResult | null> {
  try {
    const res = await apiFetch('/api/finance/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Deterministic financial calculation fetch error:', err);
  }
  return null;
}

export async function fetchSchemesList(): Promise<GovernmentSchemeItem[]> {
  try {
    const res = await apiFetch('/api/schemes/all');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Schemes list fetch error:', err);
  }
  return [];
}

export async function fetchRagQuery(
  query: string,
  businessCategory?: string,
  topK: number = 4
): Promise<RAGQueryResponse | null> {
  try {
    const res = await apiFetch('/api/rag/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        business_category: businessCategory || null,
        top_k: topK
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('RAG query fetch error:', err);
  }
  return null;
}

export async function fetchExplainableAdvisory(params: {
  query?: string;
  user_profile?: {
    name?: string;
    social_category?: string;
    is_rural?: boolean;
    educational_background?: string;
    prior_experience?: string;
  };
  business_plan?: {
    business_category: string;
    proposed_capital: number;
    scale?: string;
    target_timeline_months?: number;
  };
  location?: {
    pincode?: string;
    village_town?: string;
    district?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
    search_radius_km?: number;
  };
}): Promise<ExplainableAdvisoryResponse | null> {
  try {
    const res = await apiFetch('/api/advisory/explainable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    }, 30000);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Explainable advisory fetch error:', err);
  }
  return null;
}

export async function chatWithAdvisor(
  message: string,
  context?: {
    village_town?: string;
    pincode?: string;
    category?: string;
    available_capital?: number;
  }
): Promise<{
  response: string;
  grounded_context?: any;
  suggested_prompts?: string[];
}> {
  try {
    const res = await apiFetch('/api/ai-agent/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        village_town: context?.village_town,
        pincode: context?.pincode,
        category: context?.category,
        available_capital: context?.available_capital
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('AI Chat request error:', err);
  }
  return {
    response: 'Apologies, the AI Advisory engine could not be reached. Please check your connection or try again.',
    suggested_prompts: [
      'What is my eligible scheme & loan?',
      'Explain moratorium & repayment schedule',
      'How is project cost calculated?',
      'What is my monthly break-even?'
    ]
  };
}

export async function consultAiAgent(params: {
  query: string;
  business_category?: string;
  proposed_budget?: number;
  village_town?: string;
  pincode?: string;
  district?: string;
  state?: string;
  social_category?: string;
  is_rural?: boolean;
}): Promise<AgentConsultResponse | null> {
  try {
    const res = await apiFetch('/api/ai-agent/consult', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: params.query,
        business_category: params.business_category,
        proposed_budget: params.proposed_budget,
        village_town: params.village_town,
        pincode: params.pincode,
        district: params.district,
        state: params.state,
        social_category: params.social_category,
        is_rural: params.is_rural
      })
    }, 45000);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Agent consult fetch error:', err);
  }
  return null;
}


