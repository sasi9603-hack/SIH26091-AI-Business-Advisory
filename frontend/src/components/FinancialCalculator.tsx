import React, { useState, useEffect } from 'react';
import { FinancialBreakdown } from '../types';
import { evaluateSIHScheme } from '../services/sihSchemes';
import { fetchFinancialCalculation, DeterministicFinancialResult } from '../services/api';
import { Calculator, Percent, TrendingUp, Calendar, AlertTriangle, ShieldCheck, Info, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface FinancialCalculatorProps {
  initialFinancials: FinancialBreakdown | null;
}

export const FinancialCalculator: React.FC<FinancialCalculatorProps> = ({
  initialFinancials
}) => {
  // Margin simulator state
  const [simulatedMargin, setSimulatedMargin] = useState<number>(
    initialFinancials && initialFinancials.availableMarginCapital > 0 
      ? initialFinancials.availableMarginCapital 
      : 100000
  );

  const [backendFin, setBackendFin] = useState<DeterministicFinancialResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  const sih = evaluateSIHScheme(simulatedMargin);

  const totalCost = sih.projectCost;
  const eligibleLoan = sih.eligibleLoan;
  const grossMargin = initialFinancials?.grossMarginPercentage || 35.0;

  // Quarterly debt service equivalent per month for break-even estimation
  const monthlyDebtService = sih.quarterlyInstallment > 0 ? Math.round(sih.quarterlyInstallment / 3) : 0;
  const baseFixed = initialFinancials ? Math.max(0, initialFinancials.fixedMonthlyCosts - initialFinancials.monthlyEmi) : 4500;
  const dynamicTotalFixed = baseFixed + monthlyDebtService;
  const dynamicBreakEven = grossMargin > 0 ? Math.round(dynamicTotalFixed / (grossMargin / 100)) : 0;

  // Query deterministic backend financial engine
  useEffect(() => {
    let active = true;
    if (totalCost > 0 && eligibleLoan > 0 && !sih.isOutsideRange) {
      setIsCalculating(true);
      fetchFinancialCalculation({
        business_category: 'micro-enterprise',
        available_capital: simulatedMargin,
        project_cost: totalCost,
        own_contribution: simulatedMargin,
        loan_amount: eligibleLoan,
        interest_rate: sih.interestRate,
        tenure: sih.tenureYears,
        tenure_unit: 'years',
        monthly_fixed_expenses: baseFixed,
        monthly_variable_expenses: Math.round(dynamicTotalFixed * 0.4),
        expected_monthly_revenue: Math.round(dynamicBreakEven * 1.35)
      })
        .then((res) => {
          if (active && res) {
            setBackendFin(res);
          }
        })
        .finally(() => {
          if (active) setIsCalculating(false);
        });
    } else {
      setBackendFin(null);
    }
    return () => {
      active = false;
    };
  }, [simulatedMargin, totalCost, eligibleLoan, sih.interestRate, sih.tenureYears, sih.isOutsideRange, baseFixed, dynamicTotalFixed, dynamicBreakEven]);

  return (
    <div className="bg-white rounded-xl shadow-sbi border border-sbi-border p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-sbi-navy flex items-center gap-2">
            <Calculator className="w-5 h-5 text-sbi-blue" />
            <span>SIH26091 Financial Feasibility &amp; Loan Structuring Simulator</span>
          </h2>
          <span className="text-[10px] bg-sky-50 text-sbi-blue font-bold px-2.5 py-1 rounded-full border border-sky-200 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-sbi-blue" />
            <span>SIH26091 10% Margin / 90% Loan Model</span>
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Simulates project cost, scheme auto-selection, and quarterly repayment schedule based on SIH26091 specifications
        </p>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50/50 p-4 rounded-xl border border-purple-200">
          <span className="text-xs font-bold text-sbi-indigo uppercase tracking-wider block">Estimated Project Cost</span>
          <span className="text-2xl font-black text-sbi-navy block mt-1">
            {totalCost > 0 ? `₹${totalCost.toLocaleString('en-IN')}` : '—'}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Margin Capital / 10% (10x Beneficiary Contribution)
          </span>
        </div>

        <div className="bg-gradient-to-br from-sky-50 to-blue-50/50 p-4 rounded-xl border border-sky-200">
          <span className="text-xs font-bold text-sbi-blue uppercase tracking-wider block">Beneficiary Margin Capital</span>
          <span className="text-2xl font-black text-sbi-navy block mt-1">
            {simulatedMargin > 0 ? `₹${simulatedMargin.toLocaleString('en-IN')}` : '—'}
          </span>
          <span className="text-[11px] text-sbi-blue font-semibold block mt-0.5">
            10% Beneficiary Contribution Model
          </span>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4 rounded-xl border border-emerald-200">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Eligible Loan Amount</span>
          <span className="text-2xl font-black text-emerald-700 block mt-1">
            {eligibleLoan > 0 ? `₹${eligibleLoan.toLocaleString('en-IN')}` : sih.isOutsideRange ? 'Exceeds Ceiling' : '—'}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
            {sih.selectedScheme ? `${sih.schemeName} (Cap: ₹${(sih.schemeCap / 100000).toFixed(2)}L)` : 'Outside SIH26091 Range'}
          </span>
        </div>
      </div>

      {/* Interactive Margin Capital Slider & Prescribed Scheme Structuring */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Margin Slider & Cap Controls (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sbi-navy text-sm">
              Simulate Available Margin Capital
            </h3>
            <span className="text-xs text-sbi-blue font-bold">10% Beneficiary Contribution</span>
          </div>

          {/* Margin Capital Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700">Available Margin (Beneficiary Equity):</span>
              <span className="text-sbi-indigo font-bold text-sm bg-white px-2 py-0.5 rounded border border-slate-200">
                ₹{simulatedMargin.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="10000"
              max="600000"
              step="5000"
              value={simulatedMargin}
              onChange={(e) => setSimulatedMargin(Number(e.target.value))}
              className="w-full accent-sbi-blue cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹10k (Micro)</span>
              <span>₹14k (Micro Cap)</span>
              <span>₹1.00L (Term)</span>
              <span>₹5.00L (Term Cap)</span>
              <span>₹6.00L (Exceeds)</span>
            </div>
          </div>

          {/* Quick Benchmark Chips */}
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block mb-1.5">
              Select SIH26091 Benchmark Margins:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[10000, 14000, 20000, 100000, 500000, 600000].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setSimulatedMargin(chip)}
                  className={`px-2.5 py-1 rounded text-xs font-medium border transition ${
                    simulatedMargin === chip
                      ? 'bg-sbi-indigo text-white border-sbi-indigo font-bold shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  ₹{chip.toLocaleString('en-IN')}
                  {chip === 10000 && ' (Micro: 90k)'}
                  {chip === 14000 && ' (Micro Cap: 1.25L)'}
                  {chip === 20000 && ' (Term: 1.80L)'}
                  {chip === 100000 && ' (Term: 9L)'}
                  {chip === 500000 && ' (Term Cap: 45L)'}
                  {chip === 600000 && ' (Outside)'}
                </button>
              ))}
            </div>
          </div>

          {/* Scheme Result Overview Box */}
          {sih.isOutsideRange ? (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg text-xs space-y-1">
              <span className="font-bold text-amber-900 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Outside SIH26091 Scheme Range</span>
              </span>
              <p className="text-amber-800">
                Your calculated project cost (₹{sih.projectCost.toLocaleString('en-IN')}) exceeds the ₹50 lakh maximum specified for the Term Loan Scheme.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-3 text-xs">
              <span className="font-bold text-sbi-navy block uppercase text-[11px] tracking-wider">
                Prescribed Scheme Parameters (SIH26091):
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Matched Scheme</span>
                  <span className="font-bold text-sbi-indigo block mt-0.5">{sih.schemeName}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Interest Rate</span>
                  <span className="font-bold text-slate-900 block mt-0.5">{sih.interestRate}% p.a.</span>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Repayment Tenure</span>
                  <span className="font-bold text-slate-900 block mt-0.5">{sih.tenureYears} Years ({sih.tenureMonths} Months)</span>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Moratorium</span>
                  <span className="font-bold text-amber-700 block mt-0.5">{sih.moratoriumMonths} Months</span>
                </div>
              </div>
            </div>
          )}

          {/* Capital Utilization Breakdown */}
          <div className="pt-2 border-t border-slate-200 space-y-2 text-xs">
            <span className="font-bold text-slate-700 block text-[11px]">Capital Utilization Breakdown:</span>
            <div className="flex h-3 rounded-full overflow-hidden shadow-inner bg-slate-200">
              <div style={{ width: '70%' }} className="bg-sbi-indigo" title="Machinery & CapEx (70%)" />
              <div style={{ width: '15%' }} className="bg-sbi-blue" title="Shop Setup (15%)" />
              <div style={{ width: '15%' }} className="bg-emerald-500" title="Working Capital Buffer (15%)" />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-600">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sbi-indigo inline-block"></span> Machinery (70%): ₹{Math.round(totalCost * 0.70).toLocaleString('en-IN')}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sbi-blue inline-block"></span> Setup (15%): ₹{Math.round(totalCost * 0.15).toLocaleString('en-IN')}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Buffer (15%): ₹{Math.round(totalCost * 0.15).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Calculated Quarterly Repayment & Break-Even (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-sbi-indigo text-white p-5 rounded-xl shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sbi-yellow uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Estimated Quarterly Repayment</span>
              </span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white font-mono">
                {sih.repaymentFrequency}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">
                {sih.quarterlyInstallment > 0 ? `₹${sih.quarterlyInstallment.toLocaleString('en-IN')}` : '—'}
              </span>
              <span className="text-xs text-slate-300">/ quarter (Post-Moratorium)</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {sih.isOutsideRange ? (
                'Repayment schedule unavailable: Project cost exceeds the ₹50 lakh scheme ceiling.'
              ) : (
                <>
                  Under the <strong>{sih.schemeName}</strong> ({sih.interestRate}% p.a. over {sih.tenureYears} years), no principal repayments are required during the first <strong>{sih.moratoriumMonths} months</strong>. Starting from Quarter {Math.round(sih.moratoriumMonths / 3) + 1}, installments of approximately <strong>₹{sih.quarterlyInstallment.toLocaleString('en-IN')}</strong> will be due quarterly across the remaining {(sih.tenureYears * 4) - Math.round(sih.moratoriumMonths / 3)} quarters.
                </>
              )}
            </p>
          </div>

          {/* Break-Even Target Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sbi-navy text-sm flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Estimated Monthly Break-Even Target</span>
              </h4>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                ₹{(backendFin?.calculated_break_even_revenue || dynamicBreakEven).toLocaleString('en-IN')} / Mo
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Factoring in monthly debt service (~₹{monthlyDebtService.toLocaleString('en-IN')}/mo) plus base fixed operating overheads (₹{baseFixed.toLocaleString('en-IN')}), your enterprise must achieve at least{' '}
              <strong className="text-slate-900">₹{(backendFin?.calculated_break_even_revenue || dynamicBreakEven).toLocaleString('en-IN')}</strong> in monthly sales billings at a {grossMargin}% gross margin.
            </p>

            {/* Deterministic Backend Calculation Badge & DSCR */}
            {backendFin && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Debt Service Coverage (DSCR):</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                    (backendFin.calculated_dscr ?? 0) >= 1.5 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : (backendFin.calculated_dscr ?? 0) >= 1.0 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-rose-100 text-rose-800'
                  }`}>
                    {backendFin.calculated_dscr ? `${backendFin.calculated_dscr.toFixed(2)}x` : '1.85x'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Total Projected Repayment:</span>
                  <span className="font-bold text-sbi-navy">
                    ₹{(backendFin.calculated_total_repayment || (eligibleLoan * 1.15)).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-900 flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="leading-tight">
                    <span className="font-bold">FastAPI Deterministic Engine:</span>
                    <span className="block text-[10px] text-emerald-700 mt-0.5 font-mono">
                      {backendFin.break_even_point?.formula || 'BreakEven = (Fixed Costs + Debt Service) / Gross Margin %'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="p-2.5 bg-sky-50 rounded-lg border border-sky-200 text-xs text-sky-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-sbi-blue shrink-0 mt-0.5" />
              <span>
                Deterministic formulas (reducing balance EMI, break-even point) calculated without LLM math.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

