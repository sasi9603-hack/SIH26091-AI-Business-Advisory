import { FinancialBreakdown, SocialCategory, BusinessCategory } from '../types';

/**
 * Deterministic Financial Feasibility Calculator based on SIH26091 specifications.
 * All formulas align with standard banking reducing balance EMI and break-even accounting.
 */
export function calculateFinancials(
  category: BusinessCategory,
  availableBudget: number,
  socialCategory: SocialCategory,
  isRural: boolean,
  interestRateAnnual: number = 9.5,
  tenureMonths: number = 60
): FinancialBreakdown {
  // Baseline CapEx benchmarks per sector
  let baseCapEx = 160000;
  let baseOpExBuffer = 40000;
  let grossMargin = 40.0;
  let baseFixedCosts = 4500;

  switch (category) {
    case 'agro-repair':
      baseCapEx = 160000;
      baseOpExBuffer = 40000;
      grossMargin = 40.0;
      baseFixedCosts = 4500;
      break;
    case 'grocery':
      baseCapEx = 100000;
      baseOpExBuffer = 50000;
      grossMargin = 18.0;
      baseFixedCosts = 5000;
      break;
    case 'tailoring':
      baseCapEx = 75000;
      baseOpExBuffer = 25000;
      grossMargin = 50.0;
      baseFixedCosts = 3500;
      break;
    case 'dairy':
      baseCapEx = 200000;
      baseOpExBuffer = 50000;
      grossMargin = 30.0;
      baseFixedCosts = 6000;
      break;
    case 'food-processing':
      baseCapEx = 250000;
      baseOpExBuffer = 60000;
      grossMargin = 35.0;
      baseFixedCosts = 7000;
      break;
    default:
      baseCapEx = 150000;
      baseOpExBuffer = 40000;
      grossMargin = 35.0;
      baseFixedCosts = 4000;
  }

  // Adjust CapEx based on user budget scaling
  const scale = availableBudget > 0 ? Math.max(0.6, Math.min(2.5, availableBudget / (baseCapEx * 0.2))) : 1.0;
  const machinery = Math.round((baseCapEx * 0.8) * scale);
  const setup = Math.round((baseCapEx * 0.2) * scale);
  const workingCapital = Math.round(baseOpExBuffer * scale);
  const totalCost = machinery + setup + workingCapital;

  // Beneficiary Contribution percentage: 5% for Special Category (SC/ST/OBC/Women/Rural), 10% for General
  const isSpecial = socialCategory !== 'GENERAL' || isRural;
  const benEquityPct = isSpecial ? 5.0 : 10.0;
  const benEquityAmt = Math.round((totalCost * benEquityPct) / 100);

  // Subsidy: PMEGP Rural Special = 35%, Rural General = 25%, Urban Special = 25%, Urban General = 15%
  let subsidyPct = 15.0;
  if (isRural && isSpecial) {
    subsidyPct = 35.0;
  } else if (isRural || isSpecial) {
    subsidyPct = 25.0;
  }
  const subsidyAmt = Math.round((totalCost * subsidyPct) / 100);

  // Bank Loan required
  const loanPrincipal = Math.max(0, totalCost - benEquityAmt - subsidyAmt);

  // Reducing balance EMI calculation
  const monthlyRate = (interestRateAnnual / 12) / 100;
  let monthlyEmi = 0;
  if (loanPrincipal > 0 && tenureMonths > 0) {
    monthlyEmi = Math.round(
      (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1)
    );
  }

  // Break-even monthly sales
  const totalMonthlyFixed = baseFixedCosts + monthlyEmi;
  const breakEvenRevenue = Math.round(totalMonthlyFixed / (grossMargin / 100));

  // Risk rating
  let risk: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
  const debtRatio = loanPrincipal / totalCost;
  if (debtRatio > 0.65 || monthlyEmi > 6000) {
    risk = 'HIGH';
  } else if (debtRatio > 0.45 || monthlyEmi > 3500) {
    risk = 'MODERATE';
  }

  return {
    totalProjectCost: totalCost,
    machineryAndEquipment: machinery,
    setupAndLicensing: setup,
    workingCapitalBuffer: workingCapital,
    beneficiaryContributionPct: benEquityPct,
    beneficiaryContributionAmt: benEquityAmt,
    subsidyPercentage: subsidyPct,
    subsidyAmount: subsidyAmt,
    loanPrincipal: loanPrincipal,
    annualInterestRate: interestRateAnnual,
    tenureMonths: tenureMonths,
    monthlyEmi: monthlyEmi,
    fixedMonthlyCosts: totalMonthlyFixed,
    grossMarginPercentage: grossMargin,
    breakEvenMonthlyRevenue: breakEvenRevenue,
    riskRating: risk
  };
}
