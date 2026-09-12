import { QuarterlyRepaymentScheduleItem } from '../types';

export interface SIHSchemeDefinition {
  id: 'micro-finance' | 'term-loan';
  name: string;
  projectCostLabel: string;
  minProjectCost: number;
  maxProjectCost: number;
  fundingPercentage: number;
  fundingLabel: string;
  maxLoanCap: number;
  maxLoanLabel: string;
  annualInterestRate: number;
  interestRateLabel: string;
  tenureYears: number;
  tenureMonths: number;
  tenureLabel: string;
  moratoriumMonths: number;
  moratoriumLabel: string;
  repaymentFrequency: string;
  useCase: string;
  description: string;
}

/**
 * Central SIH26091 Scheme Configuration
 * Source: SIH26091 Problem Statement
 */
export const SIH_SCHEMES: Record<'microFinance' | 'termLoan', SIHSchemeDefinition> = {
  microFinance: {
    id: 'micro-finance',
    name: 'Micro Finance Scheme',
    projectCostLabel: 'Up to ₹1.40 Lakh',
    minProjectCost: 0,
    maxProjectCost: 140000,
    fundingPercentage: 90,
    fundingLabel: 'Up to 90%',
    maxLoanCap: 125000,
    maxLoanLabel: '₹1.25 Lakh',
    annualInterestRate: 6.5,
    interestRateLabel: '6.5% p.a.',
    tenureYears: 3,
    tenureMonths: 36,
    tenureLabel: '3 Years',
    moratoriumMonths: 3,
    moratoriumLabel: '3 Months',
    repaymentFrequency: 'Quarterly',
    useCase: 'Small/micro business units.',
    description: 'Targeted credit facility for small and micro rural entrepreneurial activities.'
  },
  termLoan: {
    id: 'term-loan',
    name: 'Term Loan Scheme',
    projectCostLabel: '₹1.40 Lakh – ₹50 Lakh',
    minProjectCost: 140000.01,
    maxProjectCost: 5000000,
    fundingPercentage: 90,
    fundingLabel: 'Up to 90%',
    maxLoanCap: 4500000,
    maxLoanLabel: '₹45 Lakh',
    annualInterestRate: 8.0,
    interestRateLabel: '8% p.a.',
    tenureYears: 7,
    tenureMonths: 84,
    tenureLabel: '7 Years',
    moratoriumMonths: 6,
    moratoriumLabel: '6 Months',
    repaymentFrequency: 'Quarterly',
    useCase: 'Larger micro-enterprise projects.',
    description: 'Higher quantum term loan for scalable rural enterprise setups and machinery CapEx.'
  }
};

export interface SIHEvaluationResult {
  isConfigured: boolean;
  availableMargin: number;
  projectCost: number;
  rawLoan: number;
  selectedScheme: SIHSchemeDefinition | null;
  schemeName: string;
  eligibleLoan: number;
  schemeCap: number;
  interestRate: number;
  tenureYears: number;
  tenureMonths: number;
  moratoriumMonths: number;
  repaymentFrequency: string;
  isOutsideRange: boolean;
  warningMessage: string;
  quarterlyInstallment: number;
  repaymentSchedule: QuarterlyRepaymentScheduleItem[];
}

/**
 * Evaluates the SIH26091 scheme tier, caps, and repayment structure
 * based strictly on the user's Available Margin Capital (10% beneficiary contribution).
 */
export function evaluateSIHScheme(availableMargin: number): SIHEvaluationResult {
  if (!availableMargin || availableMargin <= 0) {
    return {
      isConfigured: false,
      availableMargin: 0,
      projectCost: 0,
      rawLoan: 0,
      selectedScheme: null,
      schemeName: 'Awaiting profile input',
      eligibleLoan: 0,
      schemeCap: 0,
      interestRate: 0,
      tenureYears: 0,
      tenureMonths: 0,
      moratoriumMonths: 0,
      repaymentFrequency: 'Quarterly',
      isOutsideRange: false,
      warningMessage: '',
      quarterlyInstallment: 0,
      repaymentSchedule: []
    };
  }

  // 10% Beneficiary Contribution Model
  const projectCost = Math.round(availableMargin / 0.10);
  const rawLoan = Math.round(projectCost * 0.90);

  if (projectCost <= 140000) {
    const scheme = SIH_SCHEMES.microFinance;
    const eligibleLoan = Math.min(rawLoan, scheme.maxLoanCap);
    const schedule = generateRepaymentSchedule(
      eligibleLoan,
      scheme.annualInterestRate,
      scheme.tenureYears,
      scheme.moratoriumMonths
    );
    const activeInstallment = schedule.find(s => !s.isMoratorium)?.installment || 0;

    return {
      isConfigured: true,
      availableMargin,
      projectCost,
      rawLoan,
      selectedScheme: scheme,
      schemeName: scheme.name,
      eligibleLoan,
      schemeCap: scheme.maxLoanCap,
      interestRate: scheme.annualInterestRate,
      tenureYears: scheme.tenureYears,
      tenureMonths: scheme.tenureMonths,
      moratoriumMonths: scheme.moratoriumMonths,
      repaymentFrequency: scheme.repaymentFrequency,
      isOutsideRange: false,
      warningMessage: '',
      quarterlyInstallment: activeInstallment,
      repaymentSchedule: schedule
    };
  } else if (projectCost > 140000 && projectCost <= 5000000) {
    const scheme = SIH_SCHEMES.termLoan;
    const eligibleLoan = Math.min(rawLoan, scheme.maxLoanCap);
    const schedule = generateRepaymentSchedule(
      eligibleLoan,
      scheme.annualInterestRate,
      scheme.tenureYears,
      scheme.moratoriumMonths
    );
    const activeInstallment = schedule.find(s => !s.isMoratorium)?.installment || 0;

    return {
      isConfigured: true,
      availableMargin,
      projectCost,
      rawLoan,
      selectedScheme: scheme,
      schemeName: scheme.name,
      eligibleLoan,
      schemeCap: scheme.maxLoanCap,
      interestRate: scheme.annualInterestRate,
      tenureYears: scheme.tenureYears,
      tenureMonths: scheme.tenureMonths,
      moratoriumMonths: scheme.moratoriumMonths,
      repaymentFrequency: scheme.repaymentFrequency,
      isOutsideRange: false,
      warningMessage: '',
      quarterlyInstallment: activeInstallment,
      repaymentSchedule: schedule
    };
  } else {
    return {
      isConfigured: true,
      availableMargin,
      projectCost,
      rawLoan,
      selectedScheme: null,
      schemeName: 'Outside SIH26091 Scheme Range',
      eligibleLoan: 0,
      schemeCap: 0,
      interestRate: 0,
      tenureYears: 0,
      tenureMonths: 0,
      moratoriumMonths: 0,
      repaymentFrequency: 'Quarterly',
      isOutsideRange: true,
      warningMessage: 'Your calculated project cost exceeds the ₹50 lakh maximum specified for the Term Loan Scheme.',
      quarterlyInstallment: 0,
      repaymentSchedule: []
    };
  }
}

/**
 * Generates an amortized quarterly repayment schedule factoring in the initial moratorium.
 */
export function generateRepaymentSchedule(
  eligibleLoan: number,
  annualInterestRate: number,
  tenureYears: number,
  moratoriumMonths: number
): QuarterlyRepaymentScheduleItem[] {
  if (eligibleLoan <= 0 || tenureYears <= 0 || annualInterestRate <= 0) {
    return [];
  }

  const totalQuarters = tenureYears * 4;
  const moratoriumQuarters = Math.round(moratoriumMonths / 3);
  const repaymentQuarters = totalQuarters - moratoriumQuarters;

  if (repaymentQuarters <= 0) return [];

  // Quarterly interest rate
  const r = (annualInterestRate / 100) / 4;

  // Quarterly installment post-moratorium
  const installment = Math.round(
    (eligibleLoan * r * Math.pow(1 + r, repaymentQuarters)) /
    (Math.pow(1 + r, repaymentQuarters) - 1)
  );

  const schedule: QuarterlyRepaymentScheduleItem[] = [];
  let balance = eligibleLoan;

  for (let q = 1; q <= totalQuarters; q++) {
    const isMoratorium = q <= moratoriumQuarters;
    if (isMoratorium) {
      schedule.push({
        quarterNumber: q,
        quarterLabel: `Q${q} (Moratorium Month ${((q - 1) * 3) + 1}–${q * 3})`,
        isMoratorium: true,
        startingBalance: balance,
        installment: 0,
        principalComponent: 0,
        interestComponent: 0,
        closingBalance: balance
      });
    } else {
      const interest = Math.round(balance * r);
      let principal = installment - interest;
      if (q === totalQuarters || principal > balance) {
        principal = balance;
      }
      const closing = Math.max(0, balance - principal);

      schedule.push({
        quarterNumber: q,
        quarterLabel: `Q${q} (Quarterly Repayment)`,
        isMoratorium: false,
        startingBalance: balance,
        installment: q === totalQuarters ? principal + interest : installment,
        principalComponent: principal,
        interestComponent: interest,
        closingBalance: closing
      });

      balance = closing;
    }
  }

  return schedule;
}
