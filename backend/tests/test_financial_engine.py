# SIH26091 Deterministic Financial Engine Tests
import pytest
import math
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.finance import DeterministicFinancialRequest
from app.engines.financial_engine import calculate_deterministic_financials

client = TestClient(app)

def test_exact_reducing_balance_emi_formula():
    """
    Verifies that the reducing balance EMI formula exactly matches the standard
    financial amortization formula:
    P = 1,00,000, R = 8.5% p.a., N = 36 months
    r = 8.5 / 12 / 100 = 0.007083333333333333
    EMI = [P * r * (1+r)^N] / [(1+r)^N - 1] = 3156.75
    Total Repayment = 3156.75 * 36 = 113643.0
    Total Interest = 13643.0
    """
    req = DeterministicFinancialRequest(
        business_category="bakery",
        project_cost=100000.0,
        loan_amount=100000.0,
        own_contribution=0.0,
        interest_rate=8.5,
        tenure=36,
        tenure_unit="months"
    )
    res = calculate_deterministic_financials(req)

    assert res.monthly_emi.status == "calculated"
    assert res.monthly_emi.value == 3156.75
    assert res.calculated_monthly_emi == 3156.75
    assert res.total_repayment.status == "calculated"
    assert res.total_repayment.value == 113643.0
    assert res.calculated_total_repayment == 113643.0
    assert res.calculated_total_interest == 13643.0

def test_project_cost_own_contribution_and_loan_resolution():
    """
    Tests derivation of project cost from equipment + working capital,
    own contribution from available equity, and residual loan requirement.
    """
    req = DeterministicFinancialRequest(
        business_category="agro-repair",
        equipment_cost=150000.0,
        working_capital=50000.0,
        available_capital=30000.0,
        interest_rate=9.0,
        tenure=48
    )
    res = calculate_deterministic_financials(req)

    # 150k + 50k = 200k
    assert res.project_cost.status == "calculated"
    assert res.project_cost.value == 200000.0
    # Available capital = 30k
    assert res.own_contribution.status == "calculated"
    assert res.own_contribution.value == 30000.0
    # Loan = 200k - 30k = 170k
    assert res.loan_requirement.status == "calculated"
    assert res.loan_requirement.value == 170000.0

    # Verify EMI on 170,000 at 9.0% for 48 months
    r = (9.0 / 12) / 100
    expected_emi = round((170000.0 * r * math.pow(1 + r, 48)) / (math.pow(1 + r, 48) - 1), 2)
    assert res.calculated_monthly_emi == expected_emi

def test_zero_loan_when_equity_covers_full_project_cost():
    """
    When available capital >= project cost, loan requirement is 0,
    EMI is 0, and total repayment is 0.
    """
    req = DeterministicFinancialRequest(
        project_cost=100000.0,
        available_capital=120000.0,
        interest_rate=8.0,
        tenure=36
    )
    res = calculate_deterministic_financials(req)

    assert res.own_contribution.value == 100000.0
    assert res.loan_requirement.value == 0.0
    assert res.monthly_emi.value == 0.0
    assert res.total_repayment.value == 0.0
    assert res.cash_flow_indicators.debt_service_coverage_ratio.status == "not_applicable"

def test_monthly_and_annual_expenses_with_and_without_emi():
    """
    Tests operating expenses (fixed + variable) and total monthly expenses (operating + EMI).
    """
    req = DeterministicFinancialRequest(
        project_cost=200000.0,
        own_contribution=40000.0,
        interest_rate=8.5,
        tenure=36,
        monthly_fixed_expenses=6000.0,
        monthly_variable_expenses=14000.0,
        expected_monthly_revenue=40000.0
    )
    res = calculate_deterministic_financials(req)

    # Loan = 160,000
    assert res.loan_requirement.value == 160000.0
    # Operating exp = 6,000 + 14,000 = 20,000
    # EMI on 160,000 @ 8.5% / 36 mo = 5050.80
    r = (8.5 / 12) / 100
    emi = round((160000 * r * math.pow(1 + r, 36)) / (math.pow(1 + r, 36) - 1), 2)
    assert res.calculated_monthly_emi == emi

    expected_total_monthly_expenses = round(20000.0 + emi, 2)
    assert res.monthly_expenses.value == expected_total_monthly_expenses
    assert res.annual_expenses.value == round(expected_total_monthly_expenses * 12, 2)

def test_estimated_monthly_profit_and_annual_revenue():
    """
    Tests annual revenue (monthly * 12) and net monthly profit after EMI.
    """
    req = DeterministicFinancialRequest(
        loan_amount=0.0,
        monthly_fixed_expenses=5000.0,
        monthly_variable_expenses=10000.0,
        expected_monthly_revenue=25000.0
    )
    res = calculate_deterministic_financials(req)

    assert res.annual_revenue.value == 300000.0  # 25,000 * 12
    # Revenue (25,000) - Operating (15,000) - EMI (0) = 10,000
    assert res.estimated_monthly_profit.value == 10000.0
    assert res.calculated_monthly_profit == 10000.0

def test_break_even_point_formula():
    """
    Tests the standard economic formula:
    Contribution Margin Ratio (CMR) = (Revenue - Variable) / Revenue
    BEP = Total Fixed Costs / CMR
    """
    # Revenue: 40,000, Variable: 14,000 -> CM = 26,000, CMR = 26,000 / 40,000 = 0.65
    # Fixed: 6,000, EMI: 0 (loan = 0)
    # BEP = 6,000 / 0.65 = 9230.77
    req = DeterministicFinancialRequest(
        loan_amount=0.0,
        monthly_fixed_expenses=6000.0,
        monthly_variable_expenses=14000.0,
        expected_monthly_revenue=40000.0
    )
    res = calculate_deterministic_financials(req)

    assert res.break_even_point.status == "calculated"
    assert res.break_even_point.value == 9230.77
    assert res.calculated_break_even_revenue == 9230.77

def test_break_even_not_applicable_when_variable_expenses_exceed_revenue():
    """
    If variable expenses >= revenue, the business cannot break even (negative contribution margin).
    """
    req = DeterministicFinancialRequest(
        loan_amount=0.0,
        monthly_fixed_expenses=5000.0,
        monthly_variable_expenses=22000.0,
        expected_monthly_revenue=20000.0
    )
    res = calculate_deterministic_financials(req)

    assert res.break_even_point.status == "not_applicable"
    assert "Cannot break even" in (res.break_even_point.reason or "")

def test_cash_flow_indicators_dscr_and_payback():
    """
    Tests DSCR (Operating Profit / EMI) and Payback Period (Project Cost / Annual Net Cash Flow).
    """
    # Project cost: 200,000, Loan: 100,000 @ 8.5% for 36 months (EMI = 3156.75)
    # Revenue: 40,000, Fixed: 6,000, Variable: 14,000 -> Operating Profit = 20,000
    # Net monthly cash flow = 20,000 - 3156.75 = 16843.25
    # Annual net cash flow = 16843.25 * 12 = 202119.0
    # DSCR = 20,000 / 3156.75 = 6.34
    # Payback period = 200,000 / 202119.0 = 0.99 years
    req = DeterministicFinancialRequest(
        project_cost=200000.0,
        loan_amount=100000.0,
        own_contribution=100000.0,
        interest_rate=8.5,
        tenure=36,
        monthly_fixed_expenses=6000.0,
        monthly_variable_expenses=14000.0,
        expected_monthly_revenue=40000.0
    )
    res = calculate_deterministic_financials(req)

    cf = res.cash_flow_indicators
    assert cf.net_monthly_cash_flow.value == 16843.25
    assert cf.annual_net_cash_flow.value == 202119.0
    assert cf.debt_service_coverage_ratio.value == 6.34
    assert cf.payback_period_years.value == 0.99
    assert res.calculated_dscr == 6.34
    assert res.calculated_payback_years == 0.99

def test_insufficient_data_when_inputs_missing_no_invention():
    """
    CRITICAL CONSTRAINT TEST:
    If required financial information is missing, the engine MUST return
    'insufficient data' rather than inventing default or synthetic values.
    """
    # Only supply project_cost, everything else missing
    req = DeterministicFinancialRequest(project_cost=250000.0)
    res = calculate_deterministic_financials(req)

    assert res.project_cost.status == "calculated"
    assert res.project_cost.value == 250000.0

    # No interest_rate or tenure provided -> EMI and repayment must be insufficient_data, NOT invented!
    assert res.monthly_emi.status == "insufficient_data"
    assert res.monthly_emi.value is None
    assert "interest_rate" in (res.monthly_emi.reason or "")
    assert res.total_repayment.status == "insufficient_data"
    assert res.total_repayment.value is None

    # No revenue provided -> annual_revenue and profit must be insufficient_data!
    assert res.annual_revenue.status == "insufficient_data"
    assert res.annual_revenue.value is None
    assert res.estimated_monthly_profit.status == "insufficient_data"
    assert res.estimated_monthly_profit.value is None

    # No expenses provided -> monthly_expenses must be insufficient_data!
    assert res.monthly_expenses.status == "insufficient_data"
    assert res.monthly_expenses.value is None

    # Break-even must be insufficient_data
    assert res.break_even_point.status == "insufficient_data"
    assert res.break_even_point.value is None

    # Transparency flags must declare insufficient data
    assert res.has_insufficient_data is True
    assert "expected_monthly_revenue" in res.missing_inputs
    assert "monthly_fixed_expenses" in res.missing_inputs

def test_validation_rejects_negative_numeric_inputs():
    """
    Strict Pydantic numeric validation: negative project costs or negative expenses
    must be rejected with HTTP 422 Unprocessable Entity.
    """
    response_neg_cost = client.post("/api/finance/calculate", json={
        "project_cost": -50000.0
    })
    assert response_neg_cost.status_code == 422

    response_neg_exp = client.post("/api/finance/calculate", json={
        "monthly_fixed_expenses": -100.0
    })
    assert response_neg_exp.status_code == 422

    response_invalid_rate = client.post("/api/finance/calculate", json={
        "interest_rate": 150.0  # exceeds 100% max
    })
    assert response_invalid_rate.status_code == 422

def test_api_and_v1_endpoint_parity():
    """
    Verifies that POST /api/finance/calculate and POST /api/v1/finance/calculate
    both resolve and return identical valid deterministic outputs.
    """
    payload = {
        "business_category": "agro-repair",
        "project_cost": 200000.0,
        "own_contribution": 30000.0,
        "loan_amount": 170000.0,
        "interest_rate": 8.5,
        "tenure": 36,
        "tenure_unit": "months",
        "monthly_fixed_expenses": 5000.0,
        "monthly_variable_expenses": 12000.0,
        "expected_monthly_revenue": 35000.0
    }

    res_api = client.post("/api/finance/calculate", json=payload)
    assert res_api.status_code == 200
    data_api = res_api.json()

    res_v1 = client.post("/api/v1/finance/calculate", json=payload)
    assert res_v1.status_code == 200
    data_v1 = res_v1.json()

    assert data_api["calculated_monthly_emi"] == data_v1["calculated_monthly_emi"]
    assert data_api["calculated_break_even_revenue"] == data_v1["calculated_break_even_revenue"]
    assert data_api["calculated_monthly_profit"] == data_v1["calculated_monthly_profit"]
    assert data_api["calculation_method"] == "PURELY_DETERMINISTIC_STANDARD_FORMULAS"

def test_legacy_sih_scheme_backward_compatibility():
    """
    Verifies that legacy clients querying with available_margin_capital and ?legacy=true
    receive the 36-quarter SIH scheme amortization schedule.
    """
    res = client.post("/api/finance/calculate?legacy=true", json={
        "category": "agro-repair",
        "available_margin_capital": 10000.0
    })
    assert res.status_code == 200
    data = res.json()
    assert "selectedSchemeName" in data
    assert data["selectedSchemeName"] == "Micro Finance Scheme"
    assert "repaymentSchedule" in data
    assert len(data["repaymentSchedule"]) == 12  # 3 years * 4 quarters

