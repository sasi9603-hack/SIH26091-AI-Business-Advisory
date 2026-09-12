import { GovernmentSchemeItem } from '../types';

export const OFFICIAL_SCHEMES: GovernmentSchemeItem[] = [
  {
    id: 'pmmy',
    name: 'Pradhan Mantri MUDRA Yojana (PMMY)',
    shortCode: 'MUDRA',
    ministry: 'Department of Financial Services (DFS), Ministry of Finance',
    maxProjectCost: 1000000,
    subsidyPctRange: 'Collateral-free credit up to ₹10 Lakhs',
    beneficiaryEquityPct: 'Nil to 10%',
    targetBeneficiaries: 'Non-Corporate, Non-Farm Small/Micro Enterprises (Shishu: up to ₹50k, Kishore: ₹50k-₹5L, Tarun: ₹5L-₹10L)',
    keyFeatures: [
      'Collateral-free loan backed by Credit Guarantee Fund (CGFMU)',
      'Working capital overdraft and term loan facility',
      'No processing fee for Shishu and Kishore category loans',
      'Direct online application via JanSamarth portal'
    ],
    eligibilityConditions: [
      'Indian citizen with viable business plan in trading, manufacturing, or services',
      'No prior default record with any commercial bank or cooperative',
      'Age between 18 and 65 years'
    ],
    documentChecklist: [
      'Aadhaar Card & Voter ID for KYC proof',
      'Passport size photographs (2)',
      'Proof of business location / trade license or village panchayat NOC',
      'Quotation of machinery/tools to be purchased',
      'Last 6 months bank statement (if available)'
    ],
    portalUrl: 'https://www.mudra.org.in',
    nodalAgency: 'Commercial Banks, RRBs, Micro Finance Institutions (MFIs)'
  },
  {
    id: 'pmegp',
    name: "Prime Minister's Employment Generation Programme (PMEGP)",
    shortCode: 'PMEGP',
    ministry: 'Ministry of Micro, Small & Medium Enterprises (MoMSME) / KVIC',
    maxProjectCost: 5000000,
    subsidyPctRange: '15% to 35% Credit-Linked Capital Subsidy',
    beneficiaryEquityPct: '5% (Special Category) / 10% (General)',
    targetBeneficiaries: 'New micro-enterprises in manufacturing (up to ₹50L) and services (up to ₹20L) in rural & urban regions',
    keyFeatures: [
      'Highest margin money subsidy (35% for rural special category applicants)',
      'Direct credit-linked subsidy routed through nodal banks',
      'Mandatory Entrepreneurship Development Programme (EDP) training',
      'CGTMSE collateral-free loan coverage available'
    ],
    eligibilityConditions: [
      'Individuals above 18 years of age',
      'At least 8th standard pass for manufacturing units above ₹10L or service units above ₹5L',
      'Only applicable for greenfield / new business units'
    ],
    documentChecklist: [
      'Detailed Project Report (DPR) with cash-flow projections',
      'Educational qualification certificate (8th/10th mark sheet)',
      'Caste/Category certificate for special category margin money subsidy',
      'Rural area certificate issued by Block Development Officer (BDO) / Sarpanch',
      'Aadhaar card & PAN card'
    ],
    portalUrl: 'https://www.kviconline.gov.in/pmegp',
    nodalAgency: 'KVIC, KVIB, District Industries Centres (DIC), and Public Sector Banks'
  },
  {
    id: 'pm-fme',
    name: 'PM Formalisation of Micro Food Processing Enterprises (PM-FME)',
    shortCode: 'PM-FME',
    ministry: 'Ministry of Food Processing Industries (MoFPI)',
    maxProjectCost: 1000000,
    subsidyPctRange: '35% Credit-linked Capital Subsidy (Max ₹10 Lakhs)',
    beneficiaryEquityPct: '10% of total project cost',
    targetBeneficiaries: 'Micro food processing units, SHGs, FPOs, and rural agro-produce processors under One District One Product (ODOP)',
    keyFeatures: [
      'Financial support for capital investment, branding, and packaging',
      'Technical support and food safety training (FSSAI norms)',
      'Seed capital for Self-Help Group (SHG) members (₹40,000 per member)'
    ],
    eligibilityConditions: [
      'Existing or new micro food processing enterprise',
      'Alignment with designated One District One Product (ODOP) produce preferred',
      'Ownership by individual entrepreneur, partnership, or cooperative'
    ],
    documentChecklist: [
      'UDYAM registration certificate',
      'Land/lease agreement of processing premises',
      'FSSAI basic registration or intent declaration',
      'Quotations for food-grade machinery and cold-storage units'
    ],
    portalUrl: 'https://pmfme.mofpi.gov.in',
    nodalAgency: 'State Nodal Agencies (SNA) and District Level Committees (DLC)'
  },
  {
    id: 'pm-vishwakarma',
    name: 'PM Vishwakarma Scheme',
    shortCode: 'VISHWAKARMA',
    ministry: 'Ministry of MSME and Ministry of Skill Development',
    maxProjectCost: 300000,
    subsidyPctRange: 'Collateral-free Enterprise Loan @ Concessional 5% Interest',
    beneficiaryEquityPct: '0% (Nil)',
    targetBeneficiaries: 'Artisans and craftspeople across 18 traditional trades (Blacksmith, Carpenter, Tailor, Cobbler, Potter, Repair workers)',
    keyFeatures: [
      'Collateral-free loan: 1st tranche ₹1 Lakh, 2nd tranche ₹2 Lakhs @ 5% interest',
      'Modern tool kit incentive grant of ₹15,000',
      'Skill training stipend (₹500/day during 5-7 days training)',
      'PM Vishwakarma digital identity card and certificate'
    ],
    eligibilityConditions: [
      'Practicing traditional trade / craft hands-on',
      'Minimum age 18 years on the date of application',
      'One member per family eligible; not currently availing similar credit scheme (PMEGP/Mudra)'
    ],
    documentChecklist: [
      'Aadhaar card with mobile link for biometric verification',
      'Bank passbook photocopy showing IFSC and Account number',
      'Ration card or family declaration proof'
    ],
    portalUrl: 'https://pmvishwakarma.gov.in',
    nodalAgency: 'Common Service Centres (CSC), Gram Panchayats, Urban Local Bodies'
  }
];

export function getMatchingSchemes(
  _category: string,
  _projectCost: number,
  isRural: boolean
): GovernmentSchemeItem[] {
  // Return schemes prioritised for rural entrepreneurship
  return OFFICIAL_SCHEMES.filter(s => {
    if (s.id === 'pmegp') return true;
    if (s.id === 'pmmy') return true;
    if (isRural && s.id === 'pm-fme') return true;
    return true;
  });
}
