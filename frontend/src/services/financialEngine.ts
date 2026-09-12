import { FinancialBreakdown, SocialCategory, BusinessCategory } from '../types';
import { evaluateSIHScheme } from './sihSchemes';

/**
 * Deterministic Financial Feasibility Calculator based on SIH26091 specifications.
 * Uses the 10% Beneficiary Contribution (Margin Capital) model and the official
 * Micro Finance Scheme (<= ₹1.40L) & Term Loan Scheme (> ₹1.40L to ₹50L).
 */
export function calculateFinancials(
  category: BusinessCategory,
  availableMargin: number,
  _socialCategory?: SocialCategory,
  _isRural?: boolean
): FinancialBreakdown {
  const sih = evaluateSIHScheme(availableMargin);

  // Sector margin and fixed cost benchmarks
  let grossMargin = 35.0;
  let baseFixedCosts = 4500;

  switch (category) {
    case 'agro-repair':
      grossMargin = 40.0;
      baseFixedCosts = 4500;
      break;
    case 'grocery':
      grossMargin = 18.0;
      baseFixedCosts = 5000;
      break;
    case 'tailoring':
      grossMargin = 50.0;
      baseFixedCosts = 3500;
      break;
    case 'dairy':
      grossMargin = 30.0;
      baseFixedCosts = 6000;
      break;
    case 'food-processing':
      grossMargin = 35.0;
      baseFixedCosts = 7000;
      break;
    default:
      grossMargin = 35.0;
      baseFixedCosts = 4000;
  }

  const totalCost = sih.projectCost;
  const machinery = Math.round(totalCost * 0.70);
  const setup = Math.round(totalCost * 0.15);
  const workingCapital = Math.round(totalCost * 0.15);

  const benEquityAmt = Math.round(totalCost * 0.10);
  const loanPrincipal = sih.eligibleLoan;

  // Monthly amortized equivalent for comparative evaluation
  const monthlyRate = (sih.interestRate / 12) / 100;
  let monthlyEmi = 0;
  if (loanPrincipal > 0 && sih.tenureMonths > 0 && monthlyRate > 0) {
    monthlyEmi = Math.round(
      (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, sih.tenureMonths)) /
      (Math.pow(1 + monthlyRate, sih.tenureMonths) - 1)
    );
  }

  // Break-even monthly sales based on quarterly/monthly overheads
  const monthlyDebtService = sih.quarterlyInstallment > 0 ? Math.round(sih.quarterlyInstallment / 3) : monthlyEmi;
  const totalMonthlyFixed = baseFixedCosts + monthlyDebtService;
  const breakEvenRevenue = grossMargin > 0 ? Math.round(totalMonthlyFixed / (grossMargin / 100)) : 0;

  // Risk rating
  let risk: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
  if (sih.isOutsideRange) {
    risk = 'HIGH';
  } else if (totalCost > 0) {
    const debtRatio = loanPrincipal / totalCost;
    if (debtRatio > 0.85 || monthlyDebtService > 25000) {
      risk = 'MODERATE';
    }
  }

  return {
    // SIH26091 Scheme Fields
    selectedSchemeName: sih.schemeName,
    schemeId: sih.selectedScheme ? sih.selectedScheme.id : (sih.isOutsideRange ? 'outside-range' : null),
    isOutsideRange: sih.isOutsideRange,
    rangeWarning: sih.warningMessage,
    availableMarginCapital: availableMargin,
    totalProjectCost: totalCost,
    rawCalculatedLoan: sih.rawLoan,
    schemeMaximumCap: sih.schemeCap,
    eligibleLoan: sih.eligibleLoan,
    annualInterestRate: sih.interestRate,
    repaymentTenureYears: sih.tenureYears,
    moratoriumMonths: sih.moratoriumMonths,
    repaymentFrequency: sih.repaymentFrequency,
    quarterlyInstallment: sih.quarterlyInstallment,
    repaymentSchedule: sih.repaymentSchedule,

    // CapEx breakdown & viability
    machineryAndEquipment: machinery,
    setupAndLicensing: setup,
    workingCapitalBuffer: workingCapital,
    beneficiaryContributionPct: 10.0,
    beneficiaryContributionAmt: benEquityAmt,
    subsidyPercentage: 0,
    subsidyAmount: 0,
    loanPrincipal: loanPrincipal,
    tenureMonths: sih.tenureMonths,
    monthlyEmi: monthlyEmi,
    fixedMonthlyCosts: totalMonthlyFixed,
    grossMarginPercentage: grossMargin,
    breakEvenMonthlyRevenue: breakEvenRevenue,
    riskRating: risk
  };
}

