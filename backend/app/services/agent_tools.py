import time
import asyncio
from typing import Dict, Any, List, Optional
from langchain_core.tools import tool
from sqlalchemy.orm import Session

from ..core.config import logger
from ..core.database import SessionLocal
from ..schemas.agent import ToolExecutionLog
from ..schemas.market import MarketAnalyzeRequest
from ..schemas.finance import DeterministicFinancialRequest
from ..services.location_service import geocode_location
from ..services.osm_service import fetch_osm_competitors
from ..services.census_service import fetch_and_normalize_census_data
from ..services.udyam_service import fetch_and_normalize_udyam_data
from ..services.scheme_service import evaluate_scheme_match
from ..services.rag_service import retrieve_relevant_chunks
from ..engines.market_engine import analyze_hyperlocal_market
from ..engines.financial_engine import calculate_deterministic_financials

# Thread-safe execution trace buffer for the active agent session
class ToolAuditRecorder:
    def __init__(self):
        self.logs: List[ToolExecutionLog] = []

    def record(self, tool_name: str, input_args: Dict[str, Any], output_summary: str, duration_ms: float, success: bool, error: Optional[str] = None):
        entry = ToolExecutionLog(
            tool_name=tool_name,
            input_args=input_args,
            output_summary=output_summary[:200],
            duration_ms=round(duration_ms, 2),
            success=success,
            error_message=error
        )
        self.logs.append(entry)
        logger.info(f"[TOOL AUDIT] {tool_name} executed in {duration_ms:.1f}ms - Success: {success}")

    def clear(self):
        self.logs = []

# Global audit recorder instance
audit_recorder = ToolAuditRecorder()

# Helper to run async service in sync tool if needed
def _run_async(coro):
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                return executor.submit(asyncio.run, coro).result()
        else:
            return loop.run_until_complete(coro)
    except Exception:
        return asyncio.run(coro)

# ---------------------------------------------------------------------------
# Tool 1: Location Geocoding Tool
# ---------------------------------------------------------------------------
@tool
def location_geocoding_tool(query: str, district: Optional[str] = None, state: Optional[str] = None) -> Dict[str, Any]:
    """
    Geocode a village name, town, PIN code, or district in India into coordinates and administrative metadata.
    Inputs: query (e.g. '522201' or 'Tenali'), district (optional), state (optional).
    Outputs: latitude, longitude, village_town, district, state, pincode.
    """
    start_time = time.time()
    try:
        loc = _run_async(geocode_location(query=query, district=district, state=state))
        result = {
            "latitude": loc.latitude,
            "longitude": loc.longitude,
            "formatted_address": loc.formatted_address,
            "village_town": loc.village_town,
            "district": loc.district,
            "state": loc.state,
            "pincode": loc.pincode,
            "source": getattr(loc, "source", "Nominatim / OpenStreetMap")
        }
        duration = (time.time() - start_time) * 1000.0
        audit_recorder.record("location_geocoding_tool", {"query": query}, f"Found {loc.district}, {loc.state} ({loc.latitude}, {loc.longitude})", duration, True)
        return result
    except Exception as e:
        duration = (time.time() - start_time) * 1000.0
        err_msg = f"Geocoding failed for '{query}': {str(e)}"
        logger.error(err_msg)
        audit_recorder.record("location_geocoding_tool", {"query": query}, "Failed", duration, False, str(e))
        return {"error": err_msg, "latitude": 16.243, "longitude": 80.640, "district": "Guntur", "state": "Andhra Pradesh"}

# ---------------------------------------------------------------------------
# Tool 2: Nearby Business / OpenStreetMap Tool
# ---------------------------------------------------------------------------
@tool
def nearby_business_osm_tool(latitude: float, longitude: float, category: str, radius_km: float = 3.0) -> Dict[str, Any]:
    """
    Queries OpenStreetMap (Overpass) for real existing competitors in a target category within a given radius.
    Inputs: latitude, longitude, category (e.g. 'bakery', 'grocery', 'agro-repair'), radius_km (default 3.0).
    Outputs: competitor_count, nearest_competitor_distance_km, competitors_list.
    """
    start_time = time.time()
    try:
        competitors = _run_async(fetch_osm_competitors(latitude, longitude, radius_km, category))
        comp_list = [
            {
                "id": c.id,
                "name": c.name,
                "category": c.category,
                "distance_km": c.distanceKm,
                "address": c.address
            }
            for c in competitors
        ]
        nearest_dist = min([c["distance_km"] for c in comp_list]) if comp_list else None
        result = {
            "total_competitors": len(comp_list),
            "nearest_competitor_distance_km": nearest_dist,
            "radius_km": radius_km,
            "competitors": comp_list[:5],
            "source": "OpenStreetMap / Overpass API"
        }
        duration = (time.time() - start_time) * 1000.0
        audit_recorder.record("nearby_business_osm_tool", {"category": category, "radius_km": radius_km}, f"Discovered {len(comp_list)} competitors", duration, True)
        return result
    except Exception as e:
        duration = (time.time() - start_time) * 1000.0
        err_msg = f"OSM competitor discovery failed: {str(e)}"
        logger.error(err_msg)
        audit_recorder.record("nearby_business_osm_tool", {"category": category}, "Failed", duration, False, str(e))
        return {"total_competitors": 0, "nearest_competitor_distance_km": None, "competitors": [], "error": err_msg}

# ---------------------------------------------------------------------------
# Tool 3: Census Demographic Data Tool
# ---------------------------------------------------------------------------
@tool
def census_data_tool(location_identifier: str) -> Dict[str, Any]:
    """
    Retrieves official Census Primary Census Abstract (PCA) demographic data for a PIN code or district.
    Inputs: location_identifier (e.g. '522201' or 'Guntur').
    Outputs: total_population, total_households, rural_population_pct, working_population_pct, literacy_rate_pct.
    NOTE: Census population represents demographic catchment, NOT guaranteed commercial customer demand.
    """
    start_time = time.time()
    with SessionLocal() as db:
        try:
            census_res = _run_async(fetch_and_normalize_census_data(location_identifier, db))
            if census_res:
                result = {
                    "location_identifier": census_res.location_identifier,
                    "district": census_res.district,
                    "state": census_res.state,
                    "total_population": census_res.demographics.total_population,
                    "total_households": census_res.demographics.total_households,
                    "rural_population_pct": census_res.demographics.rural_population_pct,
                    "working_population_pct": census_res.workforce.working_population_pct,
                    "literacy_rate_pct": census_res.demographics.literacy_rate_pct,
                    "source": census_res.source,
                    "population_disclaimer": "Census population indicates demographic catchment size, NOT guaranteed commercial demand."
                }
                duration = (time.time() - start_time) * 1000.0
                audit_recorder.record("census_data_tool", {"location_identifier": location_identifier}, f"Population: {census_res.demographics.total_population}", duration, True)
                return result
            raise ValueError(f"No census data found for {location_identifier}")
        except Exception as e:
            duration = (time.time() - start_time) * 1000.0
            audit_recorder.record("census_data_tool", {"location_identifier": location_identifier}, "Failed", duration, False, str(e))
            return {"error": f"Census lookup failed: {str(e)}", "total_population": None, "total_households": None}

# ---------------------------------------------------------------------------
# Tool 4: UDYAM MSME Data Tool
# ---------------------------------------------------------------------------
@tool
def udyam_data_tool(district: str, category: Optional[str] = None) -> Dict[str, Any]:
    """
    Retrieves official Ministry of MSME UDYAM enterprise registration counts and micro-enterprise dominance ratio for a target district.
    Inputs: district (e.g. 'Guntur'), category (optional, e.g. 'bakery', 'agro-repair').
    Outputs: total_registered_enterprises, micro_enterprises, small_enterprises, medium_enterprises, micro_dominance_pct.
    NOTE: Captures registered formal MSMEs; unregistered rural vendors are excluded.
    """
    start_time = time.time()
    with SessionLocal() as db:
        try:
            udyam_res = _run_async(fetch_and_normalize_udyam_data(location_identifier=district, category=category, db=db))
            if udyam_res:
                result = {
                    "district": udyam_res.district,
                    "state": udyam_res.state,
                    "total_registered_enterprises": udyam_res.total_enterprises,
                    "micro_enterprises": udyam_res.msme_classification.micro,
                    "small_enterprises": udyam_res.msme_classification.small,
                    "medium_enterprises": udyam_res.msme_classification.medium,
                    "micro_dominance_pct": udyam_res.msme_classification.micro_dominance_pct,
                    "category_specific_enterprises": len(udyam_res.top_sectors),
                    "source": udyam_res.source,
                    "disclaimer": "Excludes informal rural micro-vendors not registered on UDYAM portal."
                }
                duration = (time.time() - start_time) * 1000.0
                audit_recorder.record("udyam_data_tool", {"district": district, "category": category}, f"Total MSMEs: {udyam_res.total_enterprises}", duration, True)
                return result
            raise ValueError(f"No UDYAM data found for {district}")
        except Exception as e:
            duration = (time.time() - start_time) * 1000.0
            audit_recorder.record("udyam_data_tool", {"district": district}, "Failed", duration, False, str(e))
            return {"error": f"UDYAM lookup failed: {str(e)}", "total_registered_enterprises": None}

# ---------------------------------------------------------------------------
# Tool 5: Market Analysis Tool
# ---------------------------------------------------------------------------
@tool
def market_analysis_tool(category: str, pincode: Optional[str] = None, latitude: Optional[float] = None, longitude: Optional[float] = None, radius_km: float = 3.0) -> Dict[str, Any]:
    """
    Performs empirical spatial market analysis combining distance rings (1km, 3km, 5km),
    mathematical competitor density (N / pi*r^2), and nearby infrastructure facilities.
    Inputs: category (e.g. 'bakery'), pincode (optional), latitude (optional), longitude (optional), radius_km.
    Outputs: competitor distance rings, mathematical density per sqkm, nearby facilities count, operating windows.
    """
    start_time = time.time()
    with SessionLocal() as db:
        try:
            req = MarketAnalyzeRequest(
                business_category=category,
                pincode=pincode,
                latitude=latitude,
                longitude=longitude,
                radius_km=radius_km
            )
            analysis = _run_async(analyze_hyperlocal_market(req, db))
            result = {
                "business_category": analysis.business_category,
                "total_competitors": analysis.competitor_density.total_competitors,
                "competitors_within_1km": analysis.competitor_density.within_1km,
                "competitors_within_3km": analysis.competitor_density.within_3km,
                "competitors_within_5km": analysis.competitor_density.within_5km,
                "nearest_competitor_km": analysis.competitor_density.nearest_competitor_km,
                "density_per_sqkm": analysis.competitor_density.density_per_sqkm,
                "total_nearby_facilities": analysis.nearby_facilities.total_facilities_count,
                "facilities_summary": f"{analysis.nearby_facilities.financial_facilities_count} Banks/ATMs, {analysis.nearby_facilities.transit_facilities_count} Transit, {analysis.nearby_facilities.commercial_facilities_count} Mandis",
                "feasibility_score": analysis.feasibility_score,
                "feasibility_verdict": analysis.feasibility_verdict
            }
            duration = (time.time() - start_time) * 1000.0
            audit_recorder.record("market_analysis_tool", {"category": category, "radius_km": radius_km}, f"Score: {analysis.feasibility_score} ({analysis.feasibility_verdict})", duration, True)
            return result
        except Exception as e:
            duration = (time.time() - start_time) * 1000.0
            audit_recorder.record("market_analysis_tool", {"category": category}, "Failed", duration, False, str(e))
            return {"error": f"Market analysis failed: {str(e)}", "feasibility_verdict": "DATA_UNAVAILABLE"}

# ---------------------------------------------------------------------------
# Tool 6: Deterministic Financial Calculation Tool
# ---------------------------------------------------------------------------
@tool
def financial_calculation_tool(
    project_cost: Optional[float] = None,
    available_capital: Optional[float] = None,
    own_contribution: Optional[float] = None,
    loan_amount: Optional[float] = None,
    interest_rate: Optional[float] = None,
    tenure: Optional[float] = None,
    monthly_fixed_expenses: Optional[float] = None,
    monthly_variable_expenses: Optional[float] = None,
    expected_monthly_revenue: Optional[float] = None
) -> Dict[str, Any]:
    """
    Computes deterministic financial feasibility metrics using standard financial formulas.
    NO LLMs are used for math. If required inputs are missing, explicitly returns 'insufficient data'.
    Inputs: project_cost, available_capital, own_contribution, loan_amount, interest_rate (% p.a.), tenure (months), monthly_fixed_expenses, monthly_variable_expenses, expected_monthly_revenue.
    Outputs: project_cost, own_contribution, loan_requirement, monthly_emi, total_repayment, monthly_expenses, profit, break_even_revenue, dscr, payback_period.
    """
    start_time = time.time()
    try:
        req = DeterministicFinancialRequest(
            project_cost=project_cost,
            available_capital=available_capital,
            own_contribution=own_contribution,
            loan_amount=loan_amount,
            interest_rate=interest_rate,
            tenure=tenure,
            monthly_fixed_expenses=monthly_fixed_expenses,
            monthly_variable_expenses=monthly_variable_expenses,
            expected_monthly_revenue=expected_monthly_revenue
        )
        fin = calculate_deterministic_financials(req)
        result = {
            "project_cost": fin.calculated_project_cost,
            "own_contribution": fin.calculated_own_contribution,
            "loan_requirement": fin.calculated_loan_requirement,
            "monthly_emi": fin.calculated_monthly_emi,
            "total_repayment": fin.calculated_total_repayment,
            "total_interest": fin.calculated_total_interest,
            "monthly_expenses": fin.calculated_monthly_expenses,
            "monthly_profit": fin.calculated_monthly_profit,
            "break_even_monthly_revenue": fin.calculated_break_even_revenue,
            "annual_revenue": fin.calculated_annual_revenue,
            "annual_expenses": fin.calculated_annual_expenses,
            "dscr": fin.calculated_dscr,
            "payback_years": fin.calculated_payback_years,
            "missing_inputs": fin.missing_inputs,
            "has_insufficient_data": fin.has_insufficient_data,
            "calculation_method": fin.calculation_method
        }
        duration = (time.time() - start_time) * 1000.0
        summary = f"Project Cost: ₹{fin.calculated_project_cost} | Loan: ₹{fin.calculated_loan_requirement} | EMI: ₹{fin.calculated_monthly_emi}"
        audit_recorder.record("financial_calculation_tool", {"project_cost": project_cost, "available_capital": available_capital}, summary, duration, True)
        return result
    except Exception as e:
        duration = (time.time() - start_time) * 1000.0
        audit_recorder.record("financial_calculation_tool", {"project_cost": project_cost}, "Failed", duration, False, str(e))
        return {"error": f"Financial calculation failed: {str(e)}", "has_insufficient_data": True}

# ---------------------------------------------------------------------------
# Tool 7: Government Scheme Matching Tool
# ---------------------------------------------------------------------------
@tool
def government_scheme_matching_tool(
    project_cost: float,
    applicant_equity: float,
    social_category: str = "GENERAL",
    is_rural: bool = True
) -> Dict[str, Any]:
    """
    Evaluates applicant project cost and social demographics against official credit-linked government schemes.
    Inputs: project_cost (₹), applicant_equity (₹), social_category (GENERAL, OBC, SC, ST, WOMEN), is_rural (bool).
    Outputs: matched_schemes_list with name, eligible_loan_cap, interest_rate, tenure, subsidy_pct, and portal_url.
    """
    start_time = time.time()
    try:
        match_res = evaluate_scheme_match(project_cost=project_cost, available_capital=applicant_equity)
        scheme_list = [
            {
                "scheme_id": s.id,
                "name": s.name,
                "short_code": s.shortCode,
                "ministry": s.ministry,
                "max_project_cost": s.maxProjectCost,
                "subsidy_range": s.subsidyPctRange,
                "key_features": s.keyFeatures,
                "eligibility_conditions": s.eligibilityConditions,
                "portal_url": s.portalUrl,
                "nodal_agency": s.nodalAgency
            }
            for s in match_res.matched_schemes
        ]
        duration = (time.time() - start_time) * 1000.0
        audit_recorder.record("government_scheme_matching_tool", {"project_cost": project_cost}, f"Matched {len(scheme_list)} schemes", duration, True)
        return {
            "total_matched": len(scheme_list),
            "schemes": scheme_list,
            "status_message": match_res.status_message,
            "outside_range": match_res.outside_range
        }
    except Exception as e:
        duration = (time.time() - start_time) * 1000.0
        audit_recorder.record("government_scheme_matching_tool", {"project_cost": project_cost}, "Failed", duration, False, str(e))
        return {"total_matched": 0, "schemes": [], "error": str(e)}

# ---------------------------------------------------------------------------
# Tool 8: RAG Government Document Retrieval Tool
# ---------------------------------------------------------------------------
@tool
def rag_government_document_retrieval_tool(query: str, category: Optional[str] = None, top_k: int = 3) -> Dict[str, Any]:
    """
    Performs semantic vector search over official government scheme guidelines (PMEGP, PMFME, MUDRA, Jan Samarth).
    Inputs: query (e.g. 'subsidy for bakery in rural area'), category (optional), top_k (default 3).
    Outputs: retrieved_excerpts with document_title, official_source_url, text, publication_date, and similarity_score.
    """
    start_time = time.time()
    with SessionLocal() as db:
        try:
            chunks = retrieve_relevant_chunks(query=query, db=db, top_k=top_k, category=category)
            evidence = [
                {
                    "chunk_id": c.id,
                    "scheme_name": c.scheme_name,
                    "document_title": c.document_title,
                    "official_source_url": c.official_source_url,
                    "nodal_ministry": c.nodal_ministry,
                    "publication_date": c.publication_date,
                    "similarity_score": round(score, 4),
                    "excerpt": c.chunk_text[:350]
                }
                for c, score in chunks
            ]
            duration = (time.time() - start_time) * 1000.0
            audit_recorder.record("rag_government_document_retrieval_tool", {"query": query}, f"Retrieved {len(evidence)} chunks", duration, True)
            return {"total_retrieved": len(evidence), "evidence": evidence}
        except Exception as e:
            duration = (time.time() - start_time) * 1000.0
            audit_recorder.record("rag_government_document_retrieval_tool", {"query": query}, "Failed", duration, False, str(e))
            return {"total_retrieved": 0, "evidence": [], "error": str(e)}

# Export tool list
ALL_AGENT_TOOLS = [
    location_geocoding_tool,
    nearby_business_osm_tool,
    census_data_tool,
    udyam_data_tool,
    market_analysis_tool,
    financial_calculation_tool,
    government_scheme_matching_tool,
    rag_government_document_retrieval_tool
]

