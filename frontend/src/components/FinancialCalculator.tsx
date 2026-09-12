import React, { useState } from 'react';
import { FinancialBreakdown } from '../types';
import { Calculator, Percent, TrendingUp } from 'lucide-react';

interface FinancialCalculatorProps {
  initialFinancials: FinancialBreakdown | null;
  onUpdateFinancials?: (interest: number, tenure: number) => void;
}

export const FinancialCalculator: React.FC<FinancialCalculatorProps> = ({
  initialFinancials
}) => {
  const [interestRate, setInterestRate] = useState<number>(initialFinancials?.annualInterestRate || 9.5);
  const [tenure, setTenure] = useState<number>(initialFinancials?.tenureMonths || 60);

  const totalCost = initialFinancials?.totalProjectCost || 0;
  const loanPrincipal = initialFinancials?.loanPrincipal || 0;
  const grossMargin = initialFinancials?.grossMarginPercentage || 35.0;

  // Recalculate dynamic EMI based on sliders
  const monthlyRate = (interestRate / 12) / 100;
  const dynamicEmi = loanPrincipal > 0 && tenure > 0
    ? Math.round((loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1))
    : 0;

  const baseFixed = initialFinancials ? Math.max(0, initialFinancials.fixedMonthlyCosts - initialFinancials.monthlyEmi) : 0;
  const dynamicTotalFixed = baseFixed + dynamicEmi;
  const dynamicBreakEven = grossMargin > 0 ? Math.round(dynamicTotalFixed / (grossMargin / 100)) : 0;

  return (
    <div className="bg-white rounded-xl shadow-sbi border border-sbi-border p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-sbi-navy flex items-center gap-2">
          <Calculator className="w-5 h-5 text-sbi-blue" />
          <span>Financial Feasibility &amp; Loan Structuring Simulator</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Standard banking reducing-balance amortization model integrated with PMEGP capital subsidy guidelines
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
            Machinery ({totalCost > 0 ? `₹${(initialFinancials?.machineryAndEquipment || 0).toLocaleString('en-IN')}` : '—'}) + Setup + Buffer
          </span>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4 rounded-xl border border-emerald-200">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Government Subsidy (PMEGP)</span>
          <span className="text-2xl font-black text-emerald-700 block mt-1">
            {totalCost > 0 ? `₹${(initialFinancials?.subsidyAmount || 0).toLocaleString('en-IN')}` : '—'}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
            {initialFinancials ? `${initialFinancials.subsidyPercentage}% Margin Money Grant` : '15% to 35% Margin Money'}
          </span>
        </div>

        <div className="bg-gradient-to-br from-sky-50 to-blue-50/50 p-4 rounded-xl border border-sky-200">
          <span className="text-xs font-bold text-sbi-blue uppercase tracking-wider block">Bank Loan Required</span>
          <span className="text-2xl font-black text-sbi-navy block mt-1">
            {loanPrincipal > 0 ? `₹${loanPrincipal.toLocaleString('en-IN')}` : '—'}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            After Beneficiary Equity ({totalCost > 0 ? `₹${(initialFinancials?.beneficiaryContributionAmt || 0).toLocaleString('en-IN')}` : '—'})
          </span>
        </div>
      </div>

      {/* Interactive Sliders & Amortization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sliders (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-5">
          <h3 className="font-bold text-sbi-navy text-sm flex items-center justify-between">
            <span>Interactive Loan Parameters</span>
            <span className="text-xs text-sbi-blue font-semibold">Real-time simulation</span>
          </h3>

          {/* Interest Rate Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700 flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-sbi-blue" />
                <span>Annual Interest Rate (EBLR + Spread):</span>
              </span>
              <span className="text-sbi-indigo font-bold text-sm bg-white px-2 py-0.5 rounded border border-slate-200">
                {interestRate.toFixed(1)}% p.a.
              </span>
            </div>
            <input
              type="range"
              min="7.0"
              max="14.0"
              step="0.25"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-sbi-blue cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>7.0% (Concessional / Priority)</span>
              <span>9.5% (Standard MSME)</span>
              <span>14.0%</span>
            </div>
          </div>

          {/* Loan Tenure Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700">Repayment Tenure (Months):</span>
              <span className="text-sbi-indigo font-bold text-sm bg-white px-2 py-0.5 rounded border border-slate-200">
                {tenure} Months ({(tenure / 12).toFixed(1)} Years)
              </span>
            </div>
            <input
              type="range"
              min="12"
              max="84"
              step="6"
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              className="w-full accent-sbi-blue cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>12 Months (1 Yr)</span>
              <span>60 Months (5 Yrs)</span>
              <span>84 Months (7 Yrs)</span>
            </div>
          </div>

          {/* Capital Allocation Breakdown Bars */}
          <div className="pt-2 border-t border-slate-200 space-y-2 text-xs">
            <span className="font-bold text-slate-700 block text-[11px]">Capital Utilization Breakdown:</span>
            <div className="flex h-3 rounded-full overflow-hidden shadow-inner bg-slate-200">
              <div
                style={{ width: `${totalCost > 0 ? ((initialFinancials?.machineryAndEquipment || 0) / totalCost) * 100 : 0}%` }}
                className="bg-sbi-indigo"
                title="Machinery & CapEx"
              />
              <div
                style={{ width: `${totalCost > 0 ? ((initialFinancials?.setupAndLicensing || 0) / totalCost) * 100 : 0}%` }}
                className="bg-sbi-blue"
                title="Shop Setup"
              />
              <div
                style={{ width: `${totalCost > 0 ? ((initialFinancials?.workingCapitalBuffer || 0) / totalCost) * 100 : 0}%` }}
                className="bg-emerald-500"
                title="Working Capital Buffer"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-600">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sbi-indigo inline-block"></span> Machinery: ₹{(initialFinancials?.machineryAndEquipment || 0).toLocaleString('en-IN')}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sbi-blue inline-block"></span> Setup: ₹{(initialFinancials?.setupAndLicensing || 0).toLocaleString('en-IN')}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Buffer: ₹{(initialFinancials?.workingCapitalBuffer || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Calculated Results & Break-Even (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-sbi-indigo text-white p-5 rounded-xl shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sbi-yellow uppercase tracking-wider">Computed Monthly Repayment</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white font-mono">Reducing Balance</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">₹{dynamicEmi.toLocaleString('en-IN')}</span>
              <span className="text-xs text-slate-300">/ month</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              At {interestRate}% interest over {tenure} months, total interest payable across the tenure is approximately{' '}
              <strong className="text-white">₹{Math.max(0, (dynamicEmi * tenure) - loanPrincipal).toLocaleString('en-IN')}</strong>.
            </p>
          </div>

          {/* Break-Even Revenue Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sbi-navy text-sm flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Monthly Break-Even Target</span>
              </h4>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                ₹{dynamicBreakEven.toLocaleString('en-IN')} / Mo
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              To comfortably cover all fixed operating overheads (rent, electricity, base labor) plus loan EMI of ₹{dynamicEmi.toLocaleString('en-IN')}, your enterprise must achieve at least{' '}
              <strong className="text-slate-900">₹{dynamicBreakEven.toLocaleString('en-IN')}</strong> in monthly billings at a {grossMargin}% gross margin.
            </p>

            {/* Sensitivity Testing Scenarios */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block">Stress Testing Scenarios:</span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-800 block">Optimistic (100%)</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">₹{(dynamicBreakEven * 1.5).toFixed(0)}</span>
                  <span className="text-[9px] text-emerald-600 font-semibold">High Profit</span>
                </div>

                <div className="p-2 rounded bg-blue-50 border border-blue-200">
                  <span className="text-[10px] font-bold text-blue-800 block">Realistic (75%)</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">₹{(dynamicBreakEven * 1.15).toFixed(0)}</span>
                  <span className="text-[9px] text-blue-600 font-semibold">Sustainable</span>
                </div>

                <div className="p-2 rounded bg-amber-50 border border-amber-200">
                  <span className="text-[10px] font-bold text-amber-800 block">Pessimistic (50%)</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">₹{(dynamicBreakEven * 0.75).toFixed(0)}</span>
                  <span className="text-[9px] text-amber-700 font-semibold">Buffer Needed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
