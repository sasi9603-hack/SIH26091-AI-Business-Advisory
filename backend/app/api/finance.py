from fastapi import APIRouter, Query
from typing import Union
from ..schemas.finance import (
    DeterministicFinancialRequest,
    DeterministicFinancialResponse,
    FinancialCalculationRequest,
    FinancialBreakdownResponse
)
from ..engines.financial_engine import calculate_deterministic_financials, calculate_financials

router = APIRouter(prefix="/finance", tags=["Financial Structuring & Feasibility"])

@router.post("/calculate", response_model=Union[DeterministicFinancialResponse, FinancialBreakdownResponse])
async def calculate_finance_endpoint(
    req: DeterministicFinancialRequest,
    legacy: bool = Query(False, description="Return legacy SIH scheme amortization schedule format")
):
    """
    SIH26091 Deterministic Financial Calculation Endpoint.
    Calculates project cost, own contribution, loan requirement, reducing balance EMI,
    total repayment, monthly expenses, estimated monthly profit, break-even point,
    annual revenue/expenses, and cash-flow indicators (DSCR, payback period).

    Zero LLM involvement: All metrics are computed strictly using standard deterministic
    mathematical and financial formulas.
    If required inputs are absent, returns 'insufficient data' with reasons without inventing values.
    """
    if legacy and req.available_margin_capital:
        return calculate_financials(
            category=req.category or req.business_category or "agro-repair",
            available_margin=req.available_margin_capital,
            social_category=req.social_category or "GENERAL",
            is_rural=req.is_rural if req.is_rural is not None else True
        )
    return calculate_deterministic_financials(req)

@router.post("/sih-scheme", response_model=FinancialBreakdownResponse)
async def calculate_sih_scheme_endpoint(req: FinancialCalculationRequest):
    """
    Legacy endpoint for SIH26091 prescribed 10% Margin / 90% Loan scheme breakdown.
    """
    return calculate_financials(
        category=req.category,
        available_margin=req.available_margin_capital,
        social_category=req.social_category or "GENERAL",
        is_rural=req.is_rural if req.is_rural is not None else True
    )
