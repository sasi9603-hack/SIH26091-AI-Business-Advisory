from typing import List, Tuple, Dict, Any, Optional
from ..core.config import settings, logger
from ..schemas.finance import FinancialBreakdownResponse

def generate_grounded_synthesis(
    location_name: str,
    category: str,
    financials: FinancialBreakdownResponse,
    competitors_count: int,
    saturation_level: str,
    saturation_index: float
) -> Tuple[str, List[str], List[str]]:
    """
    Deterministic synthesis following the SIH26091 Grounded AI Advisory Specification.
    Strictly prevents hallucinations by binding recommendations to computed numerical values.
    """
    if financials.isOutsideRange:
        narrative = (
            f"Location: {location_name}. Mapped businesses in target radius: {competitors_count}. "
            f"For an Available Margin Capital of ?{financials.availableMarginCapital:,.0f}, the calculated project cost "
            f"is ?{financials.totalProjectCost:,.0f}, which exceeds the ?50.00 Lakh upper ceiling specified for the "
            f"Term Loan Scheme under the SIH26091 framework."
        )
        recommendations = [
            "Adjust available margin capital to ?5,00,000 or below to qualify within the SIH26091 Term Loan Scheme threshold.",
            "Consider a phased enterprise launch: start with core machinery under the Micro Finance Scheme first.",
            "Consult the local District Industries Centre (DIC) for multi-tier financing options."
        ]
        warnings = [
            "Calculated project cost exceeds the ?50 Lakh maximum ceiling for SIH26091 financial schemes.",
            "High initial capital exposure requires multi-stakeholder loan syndication."
        ]
        return narrative, recommendations, warnings

    narrative = (
        f"Location: {location_name}. Identified mapped businesses in radius: {competitors_count} ({saturation_level} Saturation, {saturation_index} Index). "
        f"Based on Available Margin Capital of ?{financials.availableMarginCapital:,.0f} (10% contribution), "
        f"Estimated Project Cost is ?{financials.totalProjectCost:,.0f}. Recommended Scheme: {financials.selectedSchemeName} "
        f"({financials.annualInterestRate}% p.a., {financials.repaymentTenureYears} Years tenure, {financials.moratoriumMonths}-Month Moratorium). "
        f"Eligible Loan: ?{financials.eligibleLoan:,.0f} (maximum cap: ?{financials.schemeMaximumCap:,.0f}). "
        f"Estimated Repayment: ?{financials.quarterlyInstallment:,.0f} / quarter."
    )

    recommendations = [
        f"Apply under {financials.selectedSchemeName} with {financials.annualInterestRate}% p.a. interest and {financials.moratoriumMonths}-month moratorium.",
        f"Ensure 10% margin contribution (?{financials.beneficiaryContributionAmt:,.0f}) is maintained in your enterprise bank account.",
        f"Maintain working capital liquidity of at least ?{financials.workingCapitalBuffer:,.0f} during initial setup and moratorium period.",
        f"Procure machinery from certified regional equipment dealers to fulfill DIC verification requirements."
    ]

    warnings = [
        f"Quarterly debt servicing of ~?{financials.quarterlyInstallment:,.0f} commences following the {financials.moratoriumMonths}-month moratorium.",
        f"Ensure business operations break-even above ?{financials.breakEvenMonthlyRevenue:,.0f} in monthly sales revenue at {financials.grossMarginPercentage}% gross margin."
    ]

    return narrative, recommendations, warnings

async def generate_gemini_advisory(
    location_name: str,
    category: str,
    financials: FinancialBreakdownResponse,
    competitors_count: int,
    saturation_level: str,
    saturation_index: float
) -> Tuple[str, List[str], List[str]]:
    # 1. First generate baseline grounded deterministic facts
    narrative, recs, warnings = generate_grounded_synthesis(
        location_name, category, financials, competitors_count, saturation_level, saturation_index
    )

    # 2. If Gemini API key is configured, enrich the plain-language executive explanation with Gemini
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip() != "your_gemini_api_key_here":
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(settings.GEMINI_MODEL)

            prompt = f"""
You are an expert Indian Rural Micro-Enterprise Advisor working under the Smart India Hackathon 2026 (SIH26091).
Synthesize a concise 3-sentence executive business assessment for a rural entrepreneur in {location_name} proposing a {category} business.

STRICT GROUNDING FACTS (DO NOT INVENT ANY NUMBERS):
- Available Margin Capital: ?{financials.availableMarginCapital:,.0f}
- Estimated Project Cost: ?{financials.totalProjectCost:,.0f}
- Recommended Scheme: {financials.selectedSchemeName}
- Eligible Loan: ?{financials.eligibleLoan:,.0f} (Cap: ?{financials.schemeMaximumCap:,.0f})
- Interest Rate: {financials.annualInterestRate}% p.a.
- Repayment Tenure: {financials.repaymentTenureYears} Years
- Moratorium: {financials.moratoriumMonths} Months
- Quarterly Debt Servicing: ?{financials.quarterlyInstallment:,.0f}
- Mapped Competitors in radius: {competitors_count} ({saturation_level} Saturation, {saturation_index} Index)
- Break-Even Monthly Revenue: ?{financials.breakEvenMonthlyRevenue:,.0f}

Tone: Encouraging, professional, realistic, anti-hallucination.
"""
            response = model.generate_content(prompt)
            if response and response.text:
                narrative = response.text.strip()
        except Exception as e:
            logger.warning(f"Gemini API call failed: {e}. Using deterministic synthesis.")

    return narrative, recs, warnings

async def chat_with_advisor(
    message: str,
    context: Dict[str, Any]
) -> str:
    """Conversational advisory handler with anti-hallucination guardrails."""
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip() != "your_gemini_api_key_here":
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(settings.GEMINI_MODEL)
            
            prompt = f"""
You are the SIH26091 Grounded AI Business Advisor for Indian rural entrepreneurs.
Answer the user's question concisely, grounding your response strictly in the following data:

Context:
- Location: {context.get('location', 'Rural Target Area')}
- Category: {context.get('category', 'Micro Enterprise')}
- Available Margin Capital: ?{context.get('available_margin', 0):,.0f}
- Estimated Project Cost: ?{context.get('project_cost', 0):,.0f}
- Selected Scheme: {context.get('scheme_name', 'SIH26091 Scheme')}
- Eligible Loan: ?{context.get('eligible_loan', 0):,.0f}
- Interest: {context.get('interest_rate', 0)}% p.a.
- Moratorium: {context.get('moratorium', 0)} months
- Quarterly Installment: ?{context.get('quarterly_installment', 0):,.0f}
- Break-even Revenue: ?{context.get('break_even_revenue', 0):,.0f}
- Competitors Mapped: {context.get('competitors_count', 0)}

User Question: {message}
"""
            resp = model.generate_content(prompt)
            if resp and resp.text:
                return resp.text.strip()
        except Exception as e:
            logger.warning(f"Gemini chat failed: {e}. Fallback to grounded rule system.")

    # Deterministic rule-based response
    lower = message.lower()
    scheme_name = context.get('scheme_name', 'SIH26091 Scheme')
    margin = context.get('available_margin', 0)
    cost = context.get('project_cost', 0)
    loan = context.get('eligible_loan', 0)
    rate = context.get('interest_rate', 0)
    tenure = context.get('tenure_years', 0)
    moratorium = context.get('moratorium', 0)
    installment = context.get('quarterly_installment', 0)
    breakeven = context.get('break_even_revenue', 0)
    comp_count = context.get('competitors_count', 0)

    if 'scheme' in lower or 'loan' in lower or 'cap' in lower or 'interest' in lower:
        return (
            f"Under the SIH26091 framework, your Available Margin Capital of ?{margin:,.0f} (10% contribution) establishes an "
            f"Estimated Project Cost of ?{cost:,.0f}. You qualify for the {scheme_name} with an eligible loan of ?{loan:,.0f} "
            f"at {rate}% p.a. over {tenure} years."
        )
    elif 'moratorium' in lower or 'repay' in lower or 'installment' in lower or 'quarter' in lower:
        return (
            f"Under {scheme_name}, you receive an initial {moratorium}-month moratorium where no principal repayment is required. "
            f"Following the moratorium, your quarterly repayment is ?{installment:,.0f} per quarter."
        )
    elif 'competitor' in lower or 'competition' in lower or 'shops' in lower:
        return (
            f"Our spatial discovery engine identified {comp_count} existing competitor(s) in your immediate radius. "
            f"Market viability remains favorable with sound product quality and reliable local service."
        )
    elif 'break-even' in lower or 'revenue' in lower or 'profit' in lower:
        return (
            f"To comfortably cover overheads and quarterly debt servicing, your enterprise must achieve at least "
            f"?{breakeven:,.0f} in monthly sales revenue."
        )
    else:
        return (
            f"Based on your profile, your eligible financing option is the {scheme_name} with an approved loan of ?{loan:,.0f} "
            f"at {rate}% p.a. and an initial {moratorium}-month moratorium."
        )
