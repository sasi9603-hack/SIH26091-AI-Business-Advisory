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
  }
];

export function getMatchingSchemes(
  _category: string,
  projectCost: number,
  _isRural?: boolean
): GovernmentSchemeItem[] {
  return OFFICIAL_SCHEMES.filter(s => {
    if (s.id === 'micro-finance' && projectCost <= 140000) return true;
    if (s.id === 'term-loan' && projectCost > 140000 && projectCost <= 5000000) return true;
    return false;
  });
}
