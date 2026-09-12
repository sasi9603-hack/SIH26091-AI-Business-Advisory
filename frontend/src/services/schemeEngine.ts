import { GovernmentSchemeItem } from '../types';

export const OFFICIAL_SCHEMES: GovernmentSchemeItem[] = [
  {
    id: 'micro-finance',
    name: 'Micro Finance Scheme',
    shortCode: 'MICRO-FIN',
    ministry: 'Ministry of MSME / SIH26091 Priority Credit Facility',
    maxProjectCost: 140000,
    subsidyPctRange: 'Funding Up to 90% of Project Cost (Max ₹1.25 Lakh)',
    beneficiaryEquityPct: '10% Available Margin Capital',
    targetBeneficiaries: 'Small and micro business units in rural and semi-urban localities',
    keyFeatures: [
      'Project cost ceiling: Up to ₹1.40 Lakh',
      'Maximum eligible loan: ₹1.25 Lakh',
      'Concessional interest rate: 6.5% per annum',
      'Repayment tenure: 3 Years with 3-Month Moratorium period',
      'Quarterly debt servicing schedule'
    ],
    eligibilityConditions: [
      'Total estimated project cost must not exceed ₹1,40,000',
      'Beneficiary contribution (Margin Capital) of at least 10%',
      'Applicable for small/micro business trade and rural repair units',
      'No prior institutional banking default'
    ],
    documentChecklist: [
      'Aadhaar Card for biometric authentication',
      'Proof of business location / Gram Panchayat NOC',
      'Quotation of initial machinery/tools',
      'Bank passbook for direct benefit disbursement'
    ],
    portalUrl: 'https://www.jansamarth.in',
    nodalAgency: 'Public Sector Banks, Regional Rural Banks (RRBs), and MFIs'
  },
  {
    id: 'term-loan',
    name: 'Term Loan Scheme',
    shortCode: 'TERM-LOAN',
    ministry: 'Ministry of MSME / SIH26091 Scalable Enterprise Credit',
    maxProjectCost: 5000000,
    subsidyPctRange: 'Funding Up to 90% of Project Cost (Max ₹45.00 Lakh)',
    beneficiaryEquityPct: '10% Available Margin Capital',
    targetBeneficiaries: 'Larger micro-enterprise projects in rural & semi-urban clusters',
    keyFeatures: [
      'Project cost eligibility: > ₹1.40 Lakh and <= ₹50.00 Lakh',
      'Maximum eligible loan: ₹45.00 Lakh',
      'Interest rate: 8% per annum',
      'Repayment tenure: 7 Years with 6-Month Moratorium period',
      'Quarterly debt servicing schedule'
    ],
    eligibilityConditions: [
      'Project cost must be between ₹1.40 Lakh and ₹50.00 Lakh',
      'Beneficiary contribution (Margin Capital) of at least 10%',
      'Viable project plan for greenfield or capacity expansion micro-enterprise',
      'Regular banking KYC verification'
    ],
    documentChecklist: [
      'Detailed Project Report (DPR) with equipment cost estimates',
      'Aadhaar Card and PAN card',
      'Land/lease agreement for business premises',
      'Bank account statement for the last 6 months'
    ],
    portalUrl: 'https://www.jansamarth.in',
    nodalAgency: 'Commercial Banks, SIDBI, and Public Sector Lending Institutions'
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
      'One member per family eligible; not currently availing similar credit subsidy scheme'
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
  projectCost: number,
  isRural: boolean
): GovernmentSchemeItem[] {
  return OFFICIAL_SCHEMES.filter(s => {
    if (s.id === 'micro-finance' && projectCost <= 140000) return true;
    if (s.id === 'term-loan' && projectCost > 140000 && projectCost <= 5000000) return true;
    if (isRural && s.id === 'pm-fme') return true;
    return true;
  });
}
