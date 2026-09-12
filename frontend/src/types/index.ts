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
  district: string;
  state: string;
  category: BusinessCategory;
  availableCapital: number;
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

export interface FinancialBreakdown {
  totalProjectCost: number;
  machineryAndEquipment: number;
  setupAndLicensing: number;
  workingCapitalBuffer: number;
  beneficiaryContributionPct: number;
  beneficiaryContributionAmt: number;
  subsidyPercentage: number;
  subsidyAmount: number;
  loanPrincipal: number;
  annualInterestRate: number;
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
