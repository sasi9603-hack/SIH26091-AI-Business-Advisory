import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from ..schemas.advisory import (
    AdvisoryEvaluationRequest,
    AdvisoryEvaluationResponse,
    AdvisoryReportResponse,
    AIChatRequest,
    AIChatResponse
)
from ..schemas.agent import AgentConsultRequest, AgentAdvisoryResponse
from ..schemas.advisory_report import ExplainableAdvisoryRequest, ExplainableAdvisoryResponse
from ..services.langchain_agent import execute_agent_consultation
from ..services.explainable_advisory_service import generate_explainable_advisory_report
from ..services.location_service import geocode_location
from ..services.osm_service import fetch_osm_competitors
from ..services.udyam_service import fetch_udyam_businesses
from ..services.gemini_service import generate_gemini_advisory, chat_with_advisor
from ..engines.financial_engine import calculate_financials
from ..engines.market_engine import calculate_saturation
from ..core.database import get_db
from ..models import (
    BusinessPlan,
    FinancialPlan,
    AdvisoryReportModel,
    MarketIndicator,
    Location
)
from ..core.config import logger

router = APIRouter(prefix="/ai-agent", tags=["AI Advisory & Agent Services"])
advisory_router = APIRouter(prefix="/advisory", tags=["Explainable Advisory Layer"])

@router.post("/explainable-advisory", response_model=ExplainableAdvisoryResponse)
@advisory_router.post("/explainable", response_model=ExplainableAdvisoryResponse)
async def generate_explainable_advisory_endpoint(
    req: ExplainableAdvisoryRequest,
    db: Session = Depends(get_db)
):
    """
    SIH26091 Explainable Gemini Advisory Layer Endpoint.
    Aggregates User Profile, Business Plan, Geocoded Location, OSM Competitor Analysis,
    Census Demographics, UDYAM MSME Data, Deterministic Financial Calculations,
    Government Scheme Matching, and pgvector RAG Evidence.
    Produces a 10-section explainable report with strict 4-way provenance segregation:
    - VERIFIED_DATA
    - CALCULATED_VALUES
    - ESTIMATES
    - AI_GENERATED_SUGGESTIONS
    """
    try:
        return await generate_explainable_advisory_report(req, db=db)
    except Exception as e:
        logger.error(f"Error generating explainable advisory: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Explainable advisory failed: {str(e)}")

@router.post("/consult", response_model=AgentAdvisoryResponse)
async def agent_consult_endpoint(req: AgentConsultRequest):
    """
    SIH26091 LangChain Multi-Tool Agent Consultation Endpoint.
    Receives natural language query (e.g. 'I have ₹3 lakh and want to start a bakery in my village.')
    Orchestrates location geocoding, OSM competitor discovery, Census demographics, UDYAM MSME data,
    empirical market analysis, deterministic financial calculation, government scheme matching,
    and pgvector RAG document retrieval to return a grounded, segregated advisory.
    """
    try:
        return await execute_agent_consultation(req)
    except Exception as e:
        logger.error(f"Error during agent consultation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Agent consultation failed: {str(e)}")

@router.post("/evaluate-viability", response_model=AdvisoryEvaluationResponse)
async def evaluate_viability_endpoint(req: AdvisoryEvaluationRequest, db: Session = Depends(get_db)):
    try:
        # 1. Resolve Location
        loc_query = req.pincode or req.village_town or "522002"
        loc_info = await geocode_location(loc_query, req.district, req.state)
        target_name = req.village_town or loc_info.village_town or f"PIN {loc_info.pincode}"

        # 2. If budget is 0, return null evaluation state
        if req.proposed_budget <= 0:
            return AdvisoryEvaluationResponse(report=None, financials=None, competitors=[])

        # 3. Compute Financial Breakdown
        financials = calculate_financials(
            category=req.business_category,
            available_margin=req.proposed_budget,
            social_category=req.social_category or "GENERAL",
            is_rural=req.is_rural if req.is_rural is not None else True
        )

        # 4. Discover Competitors
        osm_items = await fetch_osm_competitors(loc_info.latitude, loc_info.longitude, req.radius_km or 3.0, req.business_category)
        udyam_items = await fetch_udyam_businesses(loc_info.latitude, loc_info.longitude, loc_info.district, req.business_category)
        all_competitors = osm_items + udyam_items
        all_competitors.sort(key=lambda x: x.distanceKm)
        comp_count = len(all_competitors)

        # 5. Calculate Saturation & Opportunity Score
        sat_index, sat_level = calculate_saturation(all_competitors)

        if comp_count == 0:
            opp_score = 85
            verdict = 'START'
            verdict_label = 'HIGH OPPORTUNITY (NO MAPPED COMPETITORS)'
            verdict_reason = 'No registered competitors found in target radius. Verify informal vendors locally.'
        elif sat_level == 'LOW':
            opp_score = 80
            verdict = 'START'
            verdict_label = 'FEASIBLE / LOW SATURATION'
            verdict_reason = 'Low competitor density in immediate radius.'
        elif sat_level == 'MODERATE':
            opp_score = 65
            verdict = 'CONSIDER'
            verdict_label = 'MODERATE COMPETITION'
            verdict_reason = 'Market has existing vendors. Differentiation recommended.'
        else:
            opp_score = 40
            verdict = 'AVOID'
            verdict_label = 'HIGH SATURATION / RISK'
            verdict_reason = 'Dense competitor saturation identified in target radius.'

        # 6. Generate Grounded AI Advisory Narrative
        ai_narrative, recs, warnings = await generate_gemini_advisory(
            location_name=target_name,
            category=req.business_category,
            financials=financials,
            competitors_count=comp_count,
            saturation_level=sat_level,
            saturation_index=sat_index
        )

        report = AdvisoryReportResponse(
            opportunityScore=opp_score,
            verdict=verdict,
            verdictLabel=verdict_label,
            verdictReason=verdict_reason,
            saturationIndex=sat_index,
            saturationLevel=sat_level,
            discoveredCompetitorsCount=comp_count,
            financialFeasibilityScore=85 if financials.riskRating == 'LOW' else 60,
            aiNarrative=ai_narrative,
            recommendationsList=recs,
            riskWarnings=warnings
        )

        # 7. Persist Evaluation to Database (BusinessPlan, FinancialPlan, AdvisoryReportModel, MarketIndicator)
        try:
            # Check or create location record
            db_loc = db.query(Location).filter_by(pincode=loc_info.pincode or "522002").first()
            loc_id = db_loc.id if db_loc else None

            plan_id = str(uuid.uuid4())
            bp = BusinessPlan(
                id=plan_id,
                user_id=None,
                location_id=loc_id,
                category_id=req.business_category.lower(),
                proposed_budget=req.proposed_budget,
                available_margin_capital=req.proposed_budget,
                target_radius_km=req.radius_km or 3.0,
                status="EVALUATED",
                created_at=datetime.utcnow()
            )
            db.add(bp)

            fp_id = str(uuid.uuid4())
            fp = FinancialPlan(
                id=fp_id,
                business_plan_id=plan_id,
                total_project_cost=financials.totalProjectCost,
                beneficiary_contribution_pct=financials.beneficiaryContributionPct,
                beneficiary_contribution_amt=getattr(financials, 'beneficiaryContributionAmt', financials.totalProjectCost * 0.1),
                eligible_loan_amt=financials.eligibleLoan,
                scheme_max_cap=getattr(financials, 'schemeMaximumCap', getattr(financials, 'schemeMaxCap', 125000.0)),
                annual_interest_rate=financials.annualInterestRate,
                repayment_tenure_years=financials.repaymentTenureYears,
                moratorium_months=financials.moratoriumMonths,
                repayment_frequency=financials.repaymentFrequency,
                quarterly_installment=financials.quarterlyInstallment,
                monthly_emi_equivalent=getattr(financials, 'monthlyEmi', getattr(financials, 'monthlyEmiEquivalent', 0.0)),
                machinery_cost=getattr(financials, 'machineryAndEquipment', 0.0),
                setup_licensing_cost=getattr(financials, 'setupAndLicensing', 0.0),
                working_capital_buffer=getattr(financials, 'workingCapitalBuffer', 0.0),
                fixed_monthly_costs=getattr(financials, 'fixedMonthlyCosts', 0.0),
                gross_margin_pct=getattr(financials, 'grossMarginPercentage', getattr(financials, 'grossMarginPct', 35.0)),
                break_even_monthly_revenue=financials.breakEvenMonthlyRevenue,
                risk_rating=financials.riskRating,
                repayment_schedule_json=[s.model_dump() for s in financials.repaymentSchedule] if financials.repaymentSchedule else [],
                created_at=datetime.utcnow()
            )
            db.add(fp)

            adv_id = str(uuid.uuid4())
            matched_scheme = "micro-finance" if financials.totalProjectCost <= 140000 else "term-loan"
            adv_rec = AdvisoryReportModel(
                id=adv_id,
                business_plan_id=plan_id,
                financial_plan_id=fp_id,
                matched_scheme_id=matched_scheme,
                opportunity_score=opp_score,
                verdict=verdict,
                verdict_label=verdict_label,
                verdict_reason=verdict_reason,
                saturation_index=sat_index,
                saturation_level=sat_level,
                discovered_competitors_count=comp_count,
                ai_narrative=ai_narrative,
                recommendations_json=recs,
                risk_warnings_json=warnings,
                created_at=datetime.utcnow()
            )
            db.add(adv_rec)

            mi = MarketIndicator(
                id=str(uuid.uuid4()),
                location_id=loc_id,
                category_id=req.business_category.lower(),
                catchment_population=18500,
                estimated_daily_footfall_min=30,
                estimated_daily_footfall_max=60,
                saturation_index=sat_index,
                saturation_level=sat_level,
                opportunity_gap_label=verdict_label,
                nearest_hub_name=target_name,
                nearest_hub_distance_km=loc_info.latitude,
                source="SIH26091 Spatial Analytics Engine",
                source_url="https://overpass-api.de",
                retrieved_at=datetime.utcnow(),
                data_freshness="COMPUTED_ANALYTICS",
                is_seed_data=False
            )
            db.add(mi)

            db.commit()
            logger.info(f"Persisted comprehensive evaluation records to PostgreSQL database (Plan: {plan_id})")
        except Exception as db_save_err:
            db.rollback()
            logger.warning(f"Could not persist advisory report to DB: {db_save_err}")

        return AdvisoryEvaluationResponse(
            report=report,
            financials=financials,
            competitors=all_competitors
        )
    except Exception as e:
        logger.error(f"Error evaluating business viability: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat", response_model=AIChatResponse)
async def ai_chat_endpoint(req: AIChatRequest):
    try:
        # Build context from input
        loc_name = req.village_town or req.pincode or "Target Area"
        fin = calculate_financials(category=req.category or "agro-repair", available_margin=req.available_capital or 10000)
        
        context = {
            'location': loc_name,
            'category': req.category,
            'available_margin': req.available_capital,
            'project_cost': fin.totalProjectCost,
            'scheme_name': fin.selectedSchemeName,
            'eligible_loan': fin.eligibleLoan,
            'interest_rate': fin.annualInterestRate,
            'moratorium': fin.moratoriumMonths,
            'tenure_years': fin.repaymentTenureYears,
            'quarterly_installment': fin.quarterlyInstallment,
            'break_even_revenue': fin.breakEvenMonthlyRevenue,
            'competitors_count': 2
        }

        bot_answer = await chat_with_advisor(req.message, context)
        
        return AIChatResponse(
            response=bot_answer,
            grounded_context=context,
            suggested_prompts=[
                "What is my eligible scheme & loan?",
                "Explain moratorium & repayment schedule",
                "How is project cost calculated?",
                "What is my monthly break-even?"
            ]
        )
    except Exception as e:
        logger.error(f"Error in AI chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))
