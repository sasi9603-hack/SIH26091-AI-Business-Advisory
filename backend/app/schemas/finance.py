from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class RepaymentScheduleItem(BaseModel):
    quarterNumber: int
    quarterLabel: str
    isMoratorium: bool
    startingBalance: float
    installment: float
    principalComponent: float
    interestComponent: float
    closingBalance: float

class FinancialCalculationRequest(BaseModel):
    category: str = Field(default="agro-repair")
    available_margin_capital: float = Field(..., gt=0, description="10% Beneficiary Contribution Margin Capital")
    social_category: Optional[str] = "GENERAL"
    is_rural: Optional[bool] = True

class FinancialMetricResult(BaseModel):
    value: Optional[float] = None
    status: Literal["calculated", "insufficient_data", "not_applicable"]
    reason: Optional[str] = None
    formula: Optional[str] = None

class CashFlowIndicatorsResult(BaseModel):
    net_monthly_cash_flow: FinancialMetricResult
    annual_net_cash_flow: FinancialMetricResult
    debt_service_coverage_ratio: FinancialMetricResult
    payback_period_years: FinancialMetricResult
    status: Literal["calculated", "partial", "insufficient_data"]
    summary: str

class DeterministicFinancialRequest(BaseModel):
    business_category: Optional[str] = Field(None, description="Proposed enterprise category (e.g. agro-repair, grocery, bakery)")
    project_cost: Optional[float] = Field(None, ge=0, description="Total project capital requirement")
    available_capital: Optional[float] = Field(None, ge=0, description="Available entrepreneur equity")
    own_contribution: Optional[float] = Field(None, ge=0, description="Explicit entrepreneur own contribution")
    loan_amount: Optional[float] = Field(None, ge=0, description="Explicit loan amount required")
    interest_rate: Optional[float] = Field(None, ge=0, le=100, description="Annual interest rate in % (e.g. 8.5 for 8.5%)")
    tenure: Optional[float] = Field(None, gt=0, le=600, description="Repayment tenure (default unit: months)")
    tenure_unit: Optional[Literal["months", "years"]] = "months"
    equipment_cost: Optional[float] = Field(None, ge=0, description="Machinery, tools, and equipment CapEx")
    working_capital: Optional[float] = Field(None, ge=0, description="Initial working capital reserve buffer")
    monthly_fixed_expenses: Optional[float] = Field(None, ge=0, description="Monthly fixed overheads (rent, base salaries, utilities)")
    monthly_variable_expenses: Optional[float] = Field(None, ge=0, description="Monthly variable costs (raw materials, freight, packaging)")
    expected_monthly_revenue: Optional[float] = Field(None, ge=0, description="Estimated monthly gross sales revenue")

    # Backward compatibility fields
    category: Optional[str] = None
    available_margin_capital: Optional[float] = Field(None, ge=0)
    social_category: Optional[str] = "GENERAL"
    is_rural: Optional[bool] = True

class DeterministicFinancialResponse(BaseModel):
    business_category: Optional[str] = None
    calculation_method: str = "PURELY_DETERMINISTIC_STANDARD_FORMULAS"
    engine_note: str = "Mathematical calculations computed without LLM intervention. Explicit 'insufficient data' returned where inputs are missing."

    # Metric blocks
    project_cost: FinancialMetricResult
    own_contribution: FinancialMetricResult
    loan_requirement: FinancialMetricResult
    monthly_emi: FinancialMetricResult
    total_repayment: FinancialMetricResult
    monthly_expenses: FinancialMetricResult
    estimated_monthly_profit: FinancialMetricResult
    break_even_point: FinancialMetricResult
    annual_revenue: FinancialMetricResult
    annual_expenses: FinancialMetricResult
    cash_flow_indicators: CashFlowIndicatorsResult

    # Convenient flat numeric shortcuts
    calculated_project_cost: Optional[float] = None
    calculated_own_contribution: Optional[float] = None
    calculated_loan_requirement: Optional[float] = None
    calculated_monthly_emi: Optional[float] = None
    calculated_total_repayment: Optional[float] = None
    calculated_total_interest: Optional[float] = None
    calculated_monthly_expenses: Optional[float] = None
    calculated_monthly_profit: Optional[float] = None
    calculated_break_even_revenue: Optional[float] = None
    calculated_annual_revenue: Optional[float] = None
    calculated_annual_expenses: Optional[float] = None
    calculated_dscr: Optional[float] = None
    calculated_payback_years: Optional[float] = None

    # Transparency flags
    missing_inputs: List[str] = []
    has_insufficient_data: bool = False

class FinancialBreakdownResponse(BaseModel):
    selectedSchemeName: str
    schemeId: Optional[str] = None
    isOutsideRange: bool = False
    rangeWarning: Optional[str] = None
    availableMarginCapital: float
    totalProjectCost: float
    rawCalculatedLoan: float
    schemeMaximumCap: float
    eligibleLoan: float
    annualInterestRate: float
    repaymentTenureYears: int
    moratoriumMonths: int
    repaymentFrequency: str
    quarterlyInstallment: float
    repaymentSchedule: List[RepaymentScheduleItem]
    machineryAndEquipment: float
    setupAndLicensing: float
    workingCapitalBuffer: float
    beneficiaryContributionPct: float
    beneficiaryContributionAmt: float
    subsidyPercentage: float
    subsidyAmount: float
    loanPrincipal: float
    tenureMonths: int
    monthlyEmi: float
    fixedMonthlyCosts: float
    grossMarginPercentage: float
    breakEvenMonthlyRevenue: float
    riskRating: Literal['LOW', 'MODERATE', 'HIGH']
