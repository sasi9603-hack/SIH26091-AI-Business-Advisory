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
}

export interface CompetitorBusiness {
  id: string;
  name: string;
  category: string;
  source: 'UDYAM' | 'OPENSTREETMAP' | 'COMMUNITY';
  confidenceScore: number;
  verificationStatus: 'VERIFIED' | 'UNVERIFIED';
  distanceKm: number;
  lat: number;
  lng: number;
  address: string;
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
