import math
from typing import Dict, Any, List, Optional
from ..schemas.finance import (
    FinancialBreakdownResponse,
    RepaymentScheduleItem,
    DeterministicFinancialRequest,
    DeterministicFinancialResponse,
    FinancialMetricResult,
    CashFlowIndicatorsResult
)

SECTOR_BENCHMARKS = {
    'agro-repair': {'gross_margin': 40.0, 'base_fixed_costs': 4500},
    'grocery': {'gross_margin': 18.0, 'base_fixed_costs': 5000},
    'tailoring': {'gross_margin': 50.0, 'base_fixed_costs': 3500},
    'dairy': {'gross_margin': 30.0, 'base_fixed_costs': 6000},
    'food-processing': {'gross_margin': 35.0, 'base_fixed_costs': 7000},
    'bakery': {'gross_margin': 35.0, 'base_fixed_costs': 5500},
    'solar-repair': {'gross_margin': 45.0, 'base_fixed_costs': 4000},
}

SIH_SCHEMES = {
    'micro_finance': {
        'id': 'micro-finance',
        'name': 'Micro Finance Scheme',
        'min_cost': 0.0,
        'max_cost': 140000.0,
        'max_loan_cap': 125000.0,
        'annual_interest_rate': 6.5,
        'tenure_years': 3,
        'tenure_months': 36,
        'moratorium_months': 3,
        'repayment_frequency': 'Quarterly'
    },
    'term_loan': {
        'id': 'term-loan',
        'name': 'Term Loan Scheme',
        'min_cost': 140000.01,
        'max_cost': 5000000.0,
        'max_loan_cap': 4500000.0,
        'annual_interest_rate': 8.0,
        'tenure_years': 7,
        'tenure_months': 84,
        'moratorium_months': 6,
        'repayment_frequency': 'Quarterly'
    }
}

def generate_repayment_schedule(
    eligible_loan: float,
    annual_interest_rate: float,
    tenure_years: int,
    moratorium_months: int
) -> List[RepaymentScheduleItem]:
    if eligible_loan <= 0 or tenure_years <= 0 or annual_interest_rate <= 0:
        return []

    total_quarters = tenure_years * 4
    moratorium_quarters = round(moratorium_months / 3)
    repayment_quarters = total_quarters - moratorium_quarters

    if repayment_quarters <= 0:
        return []

    # Quarterly interest rate
    r = (annual_interest_rate / 100.0) / 4.0

    # Quarterly installment post-moratorium (standard reducing balance formula)
    installment = round(
        (eligible_loan * r * math.pow(1 + r, repayment_quarters)) /
        (math.pow(1 + r, repayment_quarters) - 1)
    )

    schedule: List[RepaymentScheduleItem] = []
    balance = float(eligible_loan)

    for q in range(1, total_quarters + 1):
        is_moratorium = q <= moratorium_quarters
        if is_moratorium:
            schedule.append(RepaymentScheduleItem(
                quarterNumber=q,
                quarterLabel=f"Q{q} (Moratorium Month {((q - 1) * 3) + 1}�{q * 3})",
                isMoratorium=True,
                startingBalance=round(balance, 2),
                installment=0.0,
                principalComponent=0.0,
                interestComponent=0.0,
                closingBalance=round(balance, 2)
            ))
        else:
            interest = round(balance * r, 2)
            principal = round(installment - interest, 2)
            if q == total_quarters or principal > balance:
                principal = balance
                installment_val = principal + interest
            else:
                installment_val = float(installment)
            
            closing = max(0.0, round(balance - principal, 2))

            schedule.append(RepaymentScheduleItem(
                quarterNumber=q,
                quarterLabel=f"Q{q} (Quarterly Repayment)",
                isMoratorium=False,
                startingBalance=round(balance, 2),
                installment=round(installment_val, 2),
                principalComponent=round(principal, 2),
                interestComponent=round(interest, 2),
                closingBalance=round(closing, 2)
            ))
            balance = closing

    return schedule

def calculate_financials(
    category: str,
    available_margin: float,
    social_category: str = "GENERAL",
    is_rural: bool = True
) -> FinancialBreakdownResponse:
    benchmark = SECTOR_BENCHMARKS.get(category, {'gross_margin': 35.0, 'base_fixed_costs': 4500})
    gross_margin = benchmark['gross_margin']
    base_fixed_costs = benchmark['base_fixed_costs']

    if available_margin <= 0:
        return FinancialBreakdownResponse(
            selectedSchemeName="Awaiting profile input",
            schemeId=None,
            isOutsideRange=False,
            rangeWarning=None,
            availableMarginCapital=0.0,
            totalProjectCost=0.0,
            rawCalculatedLoan=0.0,
            schemeMaximumCap=0.0,
            eligibleLoan=0.0,
            annualInterestRate=0.0,
            repaymentTenureYears=0,
            moratoriumMonths=0,
            repaymentFrequency="Quarterly",
            quarterlyInstallment=0.0,
            repaymentSchedule=[],
            machineryAndEquipment=0.0,
            setupAndLicensing=0.0,
            workingCapitalBuffer=0.0,
            beneficiaryContributionPct=10.0,
            beneficiaryContributionAmt=0.0,
            subsidyPercentage=0.0,
            subsidyAmount=0.0,
            loanPrincipal=0.0,
            tenureMonths=0,
            monthlyEmi=0.0,
            fixedMonthlyCosts=base_fixed_costs,
            grossMarginPercentage=gross_margin,
            breakEvenMonthlyRevenue=0.0,
            riskRating="LOW"
        )

    # 10% Beneficiary Contribution Model
    total_cost = round(available_margin / 0.10)
    raw_loan = round(total_cost * 0.90)

    machinery = round(total_cost * 0.70)
    setup = round(total_cost * 0.15)
    working_capital = round(total_cost * 0.15)
    ben_equity_amt = round(total_cost * 0.10)

    if total_cost <= 140000:
        scheme = SIH_SCHEMES['micro_finance']
        eligible_loan = min(raw_loan, scheme['max_loan_cap'])
        annual_rate = scheme['annual_interest_rate']
        tenure_years = scheme['tenure_years']
        tenure_months = scheme['tenure_months']
        moratorium_months = scheme['moratorium_months']
        repayment_frequency = scheme['repayment_frequency']
        scheme_name = scheme['name']
        scheme_id = scheme['id']
        scheme_cap = scheme['max_loan_cap']
        is_outside = False
        range_warning = None
    elif 140000 < total_cost <= 5000000:
        scheme = SIH_SCHEMES['term_loan']
        eligible_loan = min(raw_loan, scheme['max_loan_cap'])
        annual_rate = scheme['annual_interest_rate']
        tenure_years = scheme['tenure_years']
        tenure_months = scheme['tenure_months']
        moratorium_months = scheme['moratorium_months']
        repayment_frequency = scheme['repayment_frequency']
        scheme_name = scheme['name']
        scheme_id = scheme['id']
        scheme_cap = scheme['max_loan_cap']
        is_outside = False
        range_warning = None
    else:
        eligible_loan = 0.0
        annual_rate = 0.0
        tenure_years = 0
        tenure_months = 0
        moratorium_months = 0
        repayment_frequency = "Quarterly"
        scheme_name = "Outside SIH26091 Scheme Range"
        scheme_id = "outside-range"
        scheme_cap = 0.0
        is_outside = True
        range_warning = "Your calculated project cost exceeds the ?50 lakh maximum specified for the Term Loan Scheme."

    # Repayment schedule
    schedule = generate_repayment_schedule(eligible_loan, annual_rate, tenure_years, moratorium_months)
    active_installment = 0.0
    for s in schedule:
        if not s.isMoratorium:
            active_installment = s.installment
            break

    # Monthly EMI equivalent for comparison
    monthly_rate = (annual_rate / 12.0) / 100.0
    monthly_emi = 0.0
    if eligible_loan > 0 and tenure_months > 0 and monthly_rate > 0:
        monthly_emi = round(
            (eligible_loan * monthly_rate * math.pow(1 + monthly_rate, tenure_months)) /
            (math.pow(1 + monthly_rate, tenure_months) - 1)
        )

    monthly_debt_service = round(active_installment / 3) if active_installment > 0 else monthly_emi
    total_monthly_fixed = base_fixed_costs + monthly_debt_service
    break_even_revenue = round(total_monthly_fixed / (gross_margin / 100.0)) if gross_margin > 0 else 0.0

    # Risk rating
    risk = "LOW"
    if is_outside:
        risk = "HIGH"
    elif total_cost > 0:
        debt_ratio = eligible_loan / total_cost if total_cost > 0 else 0
        if debt_ratio > 0.85 or monthly_debt_service > 25000:
            risk = "MODERATE"

    return FinancialBreakdownResponse(
        selectedSchemeName=scheme_name,
        schemeId=scheme_id,
        isOutsideRange=is_outside,
        rangeWarning=range_warning,
        availableMarginCapital=available_margin,
        totalProjectCost=total_cost,
        rawCalculatedLoan=raw_loan,
        schemeMaximumCap=scheme_cap,
        eligibleLoan=eligible_loan,
        annualInterestRate=annual_rate,
        repaymentTenureYears=tenure_years,
        moratoriumMonths=moratorium_months,
        repaymentFrequency=repayment_frequency,
        quarterlyInstallment=active_installment,
        repaymentSchedule=schedule,
        machineryAndEquipment=machinery,
        setupAndLicensing=setup,
        workingCapitalBuffer=working_capital,
        beneficiaryContributionPct=10.0,
        beneficiaryContributionAmt=ben_equity_amt,
        subsidyPercentage=0.0,
        subsidyAmount=0.0,
        loanPrincipal=eligible_loan,
        tenureMonths=tenure_months,
        monthlyEmi=monthly_emi,
        fixedMonthlyCosts=total_monthly_fixed,
        grossMarginPercentage=gross_margin,
        breakEvenMonthlyRevenue=break_even_revenue,
        riskRating=risk
    )

def calculate_deterministic_financials(req: DeterministicFinancialRequest) -> DeterministicFinancialResponse:
    """
    SIH26091 Deterministic Financial Feasibility & Loan Engine.
    Zero LLM involvement: All metrics are computed strictly using standard deterministic
    mathematical and financial formulas (reducing balance amortization, contribution margin,
    DSCR, and payback period).

    If required parameters are absent, the engine explicitly returns 'insufficient data'
    with reasons rather than guessing or fabricating numbers.
    """
    category = req.business_category or req.category or "unspecified"
    missing_inputs: List[str] = []

    # -------------------------------------------------------------
    # 1. Project Cost Resolution
    # -------------------------------------------------------------
    project_cost: Optional[float] = None
    project_cost_reason: Optional[str] = None
    project_cost_formula: Optional[str] = None

    if req.project_cost is not None:
        project_cost = round(float(req.project_cost), 2)
        project_cost_formula = "user_input.project_cost"
    elif req.equipment_cost is not None and req.working_capital is not None:
        project_cost = round(float(req.equipment_cost) + float(req.working_capital), 2)
        project_cost_formula = "equipment_cost + working_capital"
    elif req.available_margin_capital is not None and req.available_margin_capital > 0:
        # Legacy SIH 10% Margin Capital Model
        project_cost = round(float(req.available_margin_capital) / 0.10, 2)
        project_cost_formula = "available_margin_capital / 0.10 (SIH 10% model)"
    else:
        project_cost_reason = "Neither project_cost nor (equipment_cost + working_capital) provided"
        missing_inputs.append("project_cost")

    # -------------------------------------------------------------
    # 2. Own Contribution Resolution
    # -------------------------------------------------------------
    own_contribution: Optional[float] = None
    own_contrib_reason: Optional[str] = None
    own_contrib_formula: Optional[str] = None

    if req.own_contribution is not None:
        own_contribution = round(float(req.own_contribution), 2)
        own_contrib_formula = "user_input.own_contribution"
    elif req.available_capital is not None:
        if project_cost is not None:
            own_contribution = round(min(float(req.available_capital), project_cost), 2)
            own_contrib_formula = "min(available_capital, project_cost)"
        else:
            own_contribution = round(float(req.available_capital), 2)
            own_contrib_formula = "user_input.available_capital"
    elif req.available_margin_capital is not None:
        own_contribution = round(float(req.available_margin_capital), 2)
        own_contrib_formula = "user_input.available_margin_capital"
    elif project_cost is not None and req.loan_amount is not None:
        own_contribution = max(0.0, round(project_cost - float(req.loan_amount), 2))
        own_contrib_formula = "max(0, project_cost - loan_amount)"
    elif project_cost is not None:
        # Default SIH prescribed 10% equity benchmark
        own_contribution = round(project_cost * 0.10, 2)
        own_contrib_formula = "0.10 * project_cost (prescribed 10% margin)"
    else:
        own_contrib_reason = "Cannot determine own contribution without available_capital, own_contribution, or project_cost"
        missing_inputs.append("own_contribution")

    # -------------------------------------------------------------
    # 3. Loan Requirement Resolution
    # -------------------------------------------------------------
    loan_requirement: Optional[float] = None
    loan_req_reason: Optional[str] = None
    loan_req_formula: Optional[str] = None

    if req.loan_amount is not None:
        loan_requirement = round(float(req.loan_amount), 2)
        loan_req_formula = "user_input.loan_amount"
    elif project_cost is not None and own_contribution is not None:
        loan_requirement = max(0.0, round(project_cost - own_contribution, 2))
        loan_req_formula = "max(0, project_cost - own_contribution)"
    else:
        loan_req_reason = "Cannot determine loan requirement without loan_amount or (project_cost and own_contribution)"
        missing_inputs.append("loan_requirement")

    # -------------------------------------------------------------
    # 4. Tenure Resolution (in Months)
    # -------------------------------------------------------------
    tenure_months: Optional[int] = None
    if req.tenure is not None and req.tenure > 0:
        if req.tenure_unit == "years":
            tenure_months = int(round(float(req.tenure) * 12))
        else:
            tenure_months = int(round(float(req.tenure)))

    # -------------------------------------------------------------
    # 5. Monthly EMI & Total Repayment (Reducing Balance Amortization)
    # -------------------------------------------------------------
    monthly_emi: Optional[float] = None
    emi_reason: Optional[str] = None
    emi_formula: Optional[str] = None
    total_repayment: Optional[float] = None
    total_repay_reason: Optional[str] = None
    total_repay_formula: Optional[str] = None
    total_interest: Optional[float] = None

    if loan_requirement is None:
        emi_reason = "Loan requirement is undetermined"
        total_repay_reason = "Loan requirement is undetermined"
    elif loan_requirement == 0:
        monthly_emi = 0.0
        emi_formula = "0.0 (No debt required; own equity covers project cost)"
        total_repayment = 0.0
        total_repay_formula = "0.0 (No debt)"
        total_interest = 0.0
    else:
        # Debt > 0: requires interest_rate and tenure_months
        if req.interest_rate is None and tenure_months is None:
            emi_reason = "Both interest_rate and tenure are required to calculate EMI"
            total_repay_reason = "Both interest_rate and tenure are required to calculate total repayment"
            missing_inputs.extend(["interest_rate", "tenure"])
        elif req.interest_rate is None:
            emi_reason = "Annual interest_rate is required to calculate EMI"
            total_repay_reason = "Annual interest_rate is required to calculate total repayment"
            missing_inputs.append("interest_rate")
        elif tenure_months is None or tenure_months <= 0:
            emi_reason = "Loan tenure (in months or years) is required to calculate EMI"
            total_repay_reason = "Loan tenure is required to calculate total repayment"
            missing_inputs.append("tenure")
        else:
            # Deterministic reducing balance amortization formula
            P = loan_requirement
            N = tenure_months
            R = float(req.interest_rate)

            if R == 0:
                monthly_emi = round(P / N, 2)
                emi_formula = "P / N (0% interest)"
                total_repayment = round(P, 2)
                total_repay_formula = "P (0% interest)"
                total_interest = 0.0
            else:
                r = (R / 12.0) / 100.0
                rate_factor = math.pow(1.0 + r, N)
                monthly_emi = round((P * r * rate_factor) / (rate_factor - 1.0), 2)
                emi_formula = "P * r * (1+r)^N / ((1+r)^N - 1)"
                total_repayment = round(monthly_emi * N, 2)
                total_repay_formula = "monthly_emi * tenure_months"
                total_interest = max(0.0, round(total_repayment - P, 2))

    # -------------------------------------------------------------
    # 6. Monthly & Annual Expenses
    # -------------------------------------------------------------
    fixed_exp = float(req.monthly_fixed_expenses) if req.monthly_fixed_expenses is not None else None
    var_exp = float(req.monthly_variable_expenses) if req.monthly_variable_expenses is not None else None

    monthly_expenses: Optional[float] = None
    monthly_exp_reason: Optional[str] = None
    monthly_exp_formula: Optional[str] = None

    annual_expenses: Optional[float] = None
    annual_exp_reason: Optional[str] = None
    annual_exp_formula: Optional[str] = None

    if fixed_exp is None and var_exp is None:
        monthly_exp_reason = "Neither monthly_fixed_expenses nor monthly_variable_expenses provided"
        annual_exp_reason = "Monthly operating expenses undetermined"
        missing_inputs.extend(["monthly_fixed_expenses", "monthly_variable_expenses"])
    elif fixed_exp is None:
        monthly_exp_reason = "monthly_fixed_expenses missing to determine total monthly expenses"
        annual_exp_reason = "monthly_fixed_expenses missing"
        missing_inputs.append("monthly_fixed_expenses")
    elif var_exp is None:
        monthly_exp_reason = "monthly_variable_expenses missing to determine total monthly expenses"
        annual_exp_reason = "monthly_variable_expenses missing"
        missing_inputs.append("monthly_variable_expenses")
    else:
        # Both fixed and variable provided
        operating_exp = round(fixed_exp + var_exp, 2)
        if monthly_emi is not None:
            monthly_expenses = round(operating_exp + monthly_emi, 2)
            monthly_exp_formula = "fixed_expenses + variable_expenses + monthly_emi"
        else:
            monthly_expenses = operating_exp
            monthly_exp_formula = "fixed_expenses + variable_expenses (EMI not factored/undetermined)"
        annual_expenses = round(monthly_expenses * 12.0, 2)
        annual_exp_formula = "monthly_expenses * 12"

    # -------------------------------------------------------------
    # 7. Annual Revenue
    # -------------------------------------------------------------
    annual_revenue: Optional[float] = None
    ann_rev_reason: Optional[str] = None
    ann_rev_formula: Optional[str] = None

    if req.expected_monthly_revenue is not None:
        annual_revenue = round(float(req.expected_monthly_revenue) * 12.0, 2)
        ann_rev_formula = "expected_monthly_revenue * 12"
    else:
        ann_rev_reason = "expected_monthly_revenue is required to calculate annual revenue"
        missing_inputs.append("expected_monthly_revenue")

    # -------------------------------------------------------------
    # 8. Estimated Monthly Profit
    # -------------------------------------------------------------
    monthly_profit: Optional[float] = None
    profit_reason: Optional[str] = None
    profit_formula: Optional[str] = None

    if req.expected_monthly_revenue is None:
        profit_reason = "expected_monthly_revenue is required to calculate monthly profit"
    elif fixed_exp is None or var_exp is None:
        profit_reason = "Both fixed and variable monthly expenses are required to calculate profit"
    else:
        rev = float(req.expected_monthly_revenue)
        operating_profit = rev - (fixed_exp + var_exp)
        if monthly_emi is not None:
            monthly_profit = round(operating_profit - monthly_emi, 2)
            profit_formula = "revenue - (fixed_expenses + variable_expenses + monthly_emi)"
        else:
            monthly_profit = round(operating_profit, 2)
            profit_formula = "revenue - (fixed_expenses + variable_expenses) [before uncalculated EMI]"

    # -------------------------------------------------------------
    # 9. Break-Even Point Analysis
    # -------------------------------------------------------------
    bep_point: Optional[float] = None
    bep_status = "insufficient_data"
    bep_reason: Optional[str] = None
    bep_formula: Optional[str] = None

    if fixed_exp is None:
        bep_reason = "monthly_fixed_expenses is required to compute break-even point"
    elif req.expected_monthly_revenue is None or var_exp is None:
        bep_reason = "Both expected_monthly_revenue and monthly_variable_expenses are required to compute contribution margin ratio"
    elif req.expected_monthly_revenue <= 0:
        bep_reason = "expected_monthly_revenue must be > 0 to compute contribution margin ratio"
    else:
        rev = float(req.expected_monthly_revenue)
        cm_ratio = (rev - var_exp) / rev
        if cm_ratio <= 0:
            bep_status = "not_applicable"
            bep_reason = f"Cannot break even: monthly variable expenses (₹{var_exp:,.2f}) equal or exceed revenue (₹{rev:,.2f})"
        else:
            fixed_burden = fixed_exp + (monthly_emi if monthly_emi is not None else 0.0)
            bep_point = round(fixed_burden / cm_ratio, 2)
            bep_status = "calculated"
            bep_formula = "(monthly_fixed_expenses + monthly_emi) / ((revenue - variable_expenses) / revenue)"

    # -------------------------------------------------------------
    # 10. Cash-Flow Indicators
    # -------------------------------------------------------------
    net_cf_val: Optional[float] = None
    net_cf_status = "insufficient_data"
    net_cf_reason: Optional[str] = None
    net_cf_formula: Optional[str] = None

    if req.expected_monthly_revenue is not None and monthly_expenses is not None:
        net_cf_val = round(float(req.expected_monthly_revenue) - monthly_expenses, 2)
        net_cf_status = "calculated"
        net_cf_formula = "expected_monthly_revenue - total_monthly_expenses"
    else:
        net_cf_reason = "Requires expected_monthly_revenue and total monthly expenses"

    ann_cf_val: Optional[float] = None
    ann_cf_status = "insufficient_data"
    ann_cf_reason: Optional[str] = None
    ann_cf_formula: Optional[str] = None

    if net_cf_val is not None:
        ann_cf_val = round(net_cf_val * 12.0, 2)
        ann_cf_status = "calculated"
        ann_cf_formula = "net_monthly_cash_flow * 12"
    else:
        ann_cf_reason = "Requires net_monthly_cash_flow"

    dscr_val: Optional[float] = None
    dscr_status = "insufficient_data"
    dscr_reason: Optional[str] = None
    dscr_formula: Optional[str] = None

    if monthly_emi is not None:
        if monthly_emi == 0:
            dscr_status = "not_applicable"
            dscr_reason = "No debt service required (loan EMI is zero)"
        elif req.expected_monthly_revenue is not None and fixed_exp is not None and var_exp is not None:
            op_profit = float(req.expected_monthly_revenue) - (fixed_exp + var_exp)
            dscr_val = round(op_profit / monthly_emi, 2)
            dscr_status = "calculated"
            dscr_formula = "operating_profit_before_emi / monthly_emi"
        else:
            dscr_reason = "Operating profit (revenue - fixed - variable) required to calculate DSCR"
    else:
        dscr_reason = "Monthly EMI is required to calculate Debt Service Coverage Ratio"

    payback_val: Optional[float] = None
    payback_status = "insufficient_data"
    payback_reason: Optional[str] = None
    payback_formula: Optional[str] = None

    if project_cost is not None and project_cost > 0:
        if ann_cf_val is not None:
            if ann_cf_val > 0:
                payback_val = round(project_cost / ann_cf_val, 2)
                payback_status = "calculated"
                payback_formula = "project_cost / annual_net_cash_flow"
            else:
                payback_status = "not_applicable"
                payback_reason = "Capital recovery not achievable: annual net cash flow is zero or negative"
        else:
            payback_reason = "Annual net cash flow required to compute capital payback period"
    else:
        payback_reason = "Positive project_cost required to compute capital payback period"

    # Deduplicate missing inputs
    unique_missing = list(dict.fromkeys(missing_inputs))
    has_insufficient = len(unique_missing) > 0 or any(
        m is None for m in [project_cost, own_contribution, loan_requirement, monthly_emi, monthly_expenses, monthly_profit, bep_point]
    )

    cf_summary = (
        f"Net Monthly Cash Flow: ₹{net_cf_val:,.2f}" if net_cf_val is not None else "Cash-flow metrics partial or awaiting inputs."
    )
    if dscr_val is not None:
        cf_summary += f" | DSCR: {dscr_val:.2f} ({'Healthy' if dscr_val >= 1.5 else 'Tight' if dscr_val >= 1.0 else 'High Risk / Deficit'})"

    cf_status = "calculated" if all(s == "calculated" for s in [net_cf_status, ann_cf_status, dscr_status, payback_status]) else "partial" if any(s == "calculated" for s in [net_cf_status, ann_cf_status, dscr_status, payback_status]) else "insufficient_data"

    return DeterministicFinancialResponse(
        business_category=category,
        calculation_method="PURELY_DETERMINISTIC_STANDARD_FORMULAS",
        engine_note="Mathematical calculations computed without LLM intervention. Explicit 'insufficient data' returned where inputs are missing.",
        project_cost=FinancialMetricResult(
            value=project_cost,
            status="calculated" if project_cost is not None else "insufficient_data",
            reason=project_cost_reason,
            formula=project_cost_formula
        ),
        own_contribution=FinancialMetricResult(
            value=own_contribution,
            status="calculated" if own_contribution is not None else "insufficient_data",
            reason=own_contrib_reason,
            formula=own_contrib_formula
        ),
        loan_requirement=FinancialMetricResult(
            value=loan_requirement,
            status="calculated" if loan_requirement is not None else "insufficient_data",
            reason=loan_req_reason,
            formula=loan_req_formula
        ),
        monthly_emi=FinancialMetricResult(
            value=monthly_emi,
            status="calculated" if monthly_emi is not None else "insufficient_data",
            reason=emi_reason,
            formula=emi_formula
        ),
        total_repayment=FinancialMetricResult(
            value=total_repayment,
            status="calculated" if total_repayment is not None else "insufficient_data",
            reason=total_repay_reason,
            formula=total_repay_formula
        ),
        monthly_expenses=FinancialMetricResult(
            value=monthly_expenses,
            status="calculated" if monthly_expenses is not None else "insufficient_data",
            reason=monthly_exp_reason,
            formula=monthly_exp_formula
        ),
        estimated_monthly_profit=FinancialMetricResult(
            value=monthly_profit,
            status="calculated" if monthly_profit is not None else "insufficient_data",
            reason=profit_reason,
            formula=profit_formula
        ),
        break_even_point=FinancialMetricResult(
            value=bep_point,
            status=bep_status, # type: ignore
            reason=bep_reason,
            formula=bep_formula
        ),
        annual_revenue=FinancialMetricResult(
            value=annual_revenue,
            status="calculated" if annual_revenue is not None else "insufficient_data",
            reason=ann_rev_reason,
            formula=ann_rev_formula
        ),
        annual_expenses=FinancialMetricResult(
            value=annual_expenses,
            status="calculated" if annual_expenses is not None else "insufficient_data",
            reason=annual_exp_reason,
            formula=annual_exp_formula
        ),
        cash_flow_indicators=CashFlowIndicatorsResult(
            net_monthly_cash_flow=FinancialMetricResult(
                value=net_cf_val,
                status=net_cf_status, # type: ignore
                reason=net_cf_reason,
                formula=net_cf_formula
            ),
            annual_net_cash_flow=FinancialMetricResult(
                value=ann_cf_val,
                status=ann_cf_status, # type: ignore
                reason=ann_cf_reason,
                formula=ann_cf_formula
            ),
            debt_service_coverage_ratio=FinancialMetricResult(
                value=dscr_val,
                status=dscr_status, # type: ignore
                reason=dscr_reason,
                formula=dscr_formula
            ),
            payback_period_years=FinancialMetricResult(
                value=payback_val,
                status=payback_status, # type: ignore
                reason=payback_reason,
                formula=payback_formula
            ),
            status=cf_status, # type: ignore
            summary=cf_summary
        ),
        calculated_project_cost=project_cost,
        calculated_own_contribution=own_contribution,
        calculated_loan_requirement=loan_requirement,
        calculated_monthly_emi=monthly_emi,
        calculated_total_repayment=total_repayment,
        calculated_total_interest=total_interest,
        calculated_monthly_expenses=monthly_expenses,
        calculated_monthly_profit=monthly_profit,
        calculated_break_even_revenue=bep_point,
        calculated_annual_revenue=annual_revenue,
        calculated_annual_expenses=annual_expenses,
        calculated_dscr=dscr_val,
        calculated_payback_years=payback_val,
        missing_inputs=unique_missing,
        has_insufficient_data=has_insufficient
    )
