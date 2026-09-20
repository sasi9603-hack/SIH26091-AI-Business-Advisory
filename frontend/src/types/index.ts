export type VerdictType = 'START' | 'CONSIDER' | 'AVOID';

export type BusinessCategory = 
  | 'agro-repair'
  | 'grocery'
  | 'tailoring'
  | 'dairy'
  | 'food-processing'
  | 'bakery'
  | 'solar-repair';

export type SocialCategory = 'GENERAL' | 'OBC' | 'SC' | 'ST' | 'MINORITY';

export interface EntrepreneurProfile {
  pincode: string;
  villageTown: string;
  block?: string;
  district: string;
  state: string;
  category: BusinessCategory;
  availableCapital: number; // Represents Available Margin Capital (Beneficiary Contribution)
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  socialCategory: SocialCategory;
  isRural: boolean;
  age: number;
  lat?: number;
  lng?: number;
  radiusKm?: number;
}

export interface CompetitorBusiness {
  id: string;
  name: string;
  category: string;
  source: 'GOOGLE_MAPS' | 'OPENSTREETMAP' | 'UDYAM' | 'COMMUNITY';
  confidenceScore: number;
  verificationStatus: 'VERIFIED' | 'UNVERIFIED';
  distanceKm: number;
  lat: number;
  lng: number;
  address: string;
  googleMapsUrl?: string;
  reportedDate?: string;
  upvotes?: number;
}

export interface QuarterlyRepaymentScheduleItem {
  quarterNumber: number;
  quarterLabel: string;
  isMoratorium: boolean;
  startingBalance: number;
  installment: number;
  principalComponent: number;
  interestComponent: number;
  closingBalance: number;
}

export interface FinancialBreakdown {
  // SIH26091 Scheme Fields
  selectedSchemeName: string;
  schemeId: 'micro-finance' | 'term-loan' | 'outside-range' | null;
  isOutsideRange: boolean;
  rangeWarning?: string;
  availableMarginCapital: number;
  totalProjectCost: number;
  rawCalculatedLoan: number;
  schemeMaximumCap: number;
  eligibleLoan: number;
  annualInterestRate: number;
  repaymentTenureYears: number;
  moratoriumMonths: number;
  repaymentFrequency: string;
  quarterlyInstallment: number;
  repaymentSchedule: QuarterlyRepaymentScheduleItem[];

  // Allocation & Operational Feasibility
  machineryAndEquipment: number;
  setupAndLicensing: number;
  workingCapitalBuffer: number;
  beneficiaryContributionPct: number;
  beneficiaryContributionAmt: number;
  subsidyPercentage: number;
  subsidyAmount: number;
  loanPrincipal: number;
  tenureMonths: number;
  monthlyEmi: number;
  fixedMonthlyCosts: number;
  grossMarginPercentage: number;
  breakEvenMonthlyRevenue: number;
  riskRating: 'LOW' | 'MODERATE' | 'HIGH';
}

export interface GovernmentSchemeItem {
  id: string;
  name: string;
  shortCode: string;
  ministry: string;
  maxProjectCost: number;
  subsidyPctRange: string;
  beneficiaryEquityPct: string;
  targetBeneficiaries: string;
  keyFeatures: string[];
  eligibilityConditions: string[];
  documentChecklist: string[];
  portalUrl: string;
  nodalAgency: string;
}

export interface AdvisoryReport {
  opportunityScore: number;
  verdict: VerdictType;
  verdictLabel: string;
  verdictReason: string;
  saturationIndex: number;
  saturationLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  discoveredCompetitorsCount: number;
  financialFeasibilityScore: number;
  aiNarrative: string;
  recommendationsList: string[];
  riskWarnings: string[];
}

export type ProvenanceCategory = 'VERIFIED_DATA' | 'CALCULATED_VALUES' | 'ESTIMATES' | 'AI_GENERATED_SUGGESTIONS';

export interface ProvenanceItem {
  statement: string;
  category: ProvenanceCategory;
  source: string;
  source_url?: string | null;
}

export interface DataSourceItem {
  dataset_name: string;
  authority: string;
  official_url: string;
  data_type: string;
  retrieved_at: string;
  notes: string;
}

export interface ExplainableAdvisoryResponse {
  report_id: string;
  created_at: string;
  business_plan_id?: string | null;
  financial_plan_id?: string | null;
  synthesis_mode: string;
  section_1_business_summary: {
    venture_name: string;
    category: string;
    target_location: string;
    scale: string;
    executive_narrative: string;
    provenance: ProvenanceItem[];
  };
  section_2_local_market_overview: {
    demographic_catchment: string;
    total_population?: number | null;
    total_households?: number | null;
    workforce_participation_pct?: number | null;
    literacy_rate_pct?: number | null;
    purchasing_power_tier: string;
    catchment_disclaimer: string;
    provenance: ProvenanceItem[];
  };
  section_3_nearby_competition: {
    competitor_count_radius: number;
    nearest_competitor_km?: number | null;
    competitors_1km: number;
    competitors_3km: number;
    competitors_5km: number;
    competitor_density_per_sqkm: number;
    market_saturation_level: string;
    nearby_facilities_summary: string;
    competitor_list_sample: any[];
    provenance: ProvenanceItem[];
  };
  section_4_financial_feasibility: {
    project_cost: number;
    beneficiary_equity: number;
    loan_requirement: number;
    monthly_emi: number;
    annual_interest_rate_pct: number;
    repayment_tenure_months: number;
    total_repayment: number;
    total_interest: number;
    monthly_operating_expenses: number;
    estimated_monthly_profit: number;
    break_even_monthly_revenue: number;
    dscr?: number | null;
    payback_years?: number | null;
    calculation_method: string;
    provenance: ProvenanceItem[];
  };
  section_5_potential_government_schemes: {
    primary_recommended_scheme: string;
    matched_schemes: any[];
    subsidy_details: string;
    official_portal_urls: string[];
    rag_guideline_citations: any[];
    provenance: ProvenanceItem[];
  };
  section_6_key_risks: {
    risks: Array<{
      risk_factor: string;
      risk_level: string;
      mitigation_strategy: string;
      contingency: string;
    }>;
    provenance: ProvenanceItem[];
  };
  section_7_opportunities: {
    opportunities: Array<{
      title: string;
      impact: string;
      rationale: string;
    }>;
    provenance: ProvenanceItem[];
  };
  section_8_important_assumptions: {
    assumptions: Array<{
      category: string;
      assumption: string;
      confidence: string;
    }>;
    provenance: ProvenanceItem[];
  };
  section_9_recommended_validation_steps: {
    validation_steps: Array<{
      step_number: number;
      action: string;
      authority: string;
      purpose: string;
    }>;
    provenance: ProvenanceItem[];
  };
  section_10_data_sources: {
    sources: DataSourceItem[];
  };
  provenance_audit: {
    verified_data_count: number;
    calculated_values_count: number;
    estimates_count: number;
    ai_generated_suggestions_count: number;
    verified_data_items: string[];
    calculated_values_items: string[];
    estimates_items: string[];
    ai_suggestions_items: string[];
  };
}

export interface RAGEvidenceItem {
  chunk_id: string;
  scheme_name: string;
  document_title: string;
  text: string;
  official_source_url: string;
  nodal_ministry?: string | null;
  publication_date?: string | null;
  similarity_score: number;
}

export interface RAGOfficialSource {
  title: string;
  url: string;
  nodal_ministry: string;
  publication_date?: string | null;
}

export interface RAGQueryResponse {
  query: string;
  answer: string;
  relevant_scheme: string;
  evidence: RAGEvidenceItem[];
  official_source: RAGOfficialSource;
  verification_note: string;
  has_sufficient_context: boolean;
  retrieval_method: string;
}

export interface AgentConsultResponse {
  query: string;
  session_id: string;
  timestamp: string;
  consultation_summary: string;
  intermediate_steps?: any[];
  tool_executions?: any[];
  final_advisory: string;
  recommended_actions: string[];
  confidence_level: string;
  disclaimer: string;
}

