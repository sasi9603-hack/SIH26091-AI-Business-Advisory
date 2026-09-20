import re
import time
from typing import Dict, Any, List, Optional

from ..core.config import settings, logger
from ..schemas.agent import (
    AgentConsultRequest,
    AgentAdvisoryResponse,
    ToolExecutionLog
)
from .agent_tools import (
    ALL_AGENT_TOOLS,
    audit_recorder,
    location_geocoding_tool,
    nearby_business_osm_tool,
    census_data_tool,
    udyam_data_tool,
    market_analysis_tool,
    financial_calculation_tool,
    government_scheme_matching_tool,
    rag_government_document_retrieval_tool
)

def parse_natural_language_query(query: str) -> Dict[str, Any]:
    """
    Extracts structured intent parameters from entrepreneur natural language text.
    Handles amounts in lakhs (e.g. ₹3 lakh, 3 lakhs, 3 lac), rupees (e.g. ₹300000),
    business categories, and locations.
    """
    extracted = {
        "available_capital": None,
        "business_category": None,
        "location_hint": None,
        "pincode": None
    }

    q_lower = query.lower()

    # 1. Capital extraction
    # Pattern: 3 lakh, 3.5 lakh, ₹3 lakh, 3 lacs, etc.
    lakh_match = re.search(r'(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lac|lacs|lakhs)', q_lower)
    if lakh_match:
        try:
            extracted["available_capital"] = float(lakh_match.group(1)) * 100000.0
        except ValueError:
            pass

    if extracted["available_capital"] is None:
        # Pattern: exact numbers like ₹3,00,000 or ₹300000
        num_match = re.search(r'(?:₹|rs\.?|inr)\s*(\d[\d,.]*)', q_lower)
        if num_match:
            try:
                clean_num = num_match.group(1).replace(',', '')
                extracted["available_capital"] = float(clean_num)
            except ValueError:
                pass

    # 2. Category extraction
    category_keywords = {
        "bakery": ["bakery", "bread", "baking", "cake", "pastry"],
        "grocery": ["grocery", "kirana", "provision", "supermarket", "general store"],
        "tailoring": ["tailoring", "tailor", "stitching", "garment", "apparel"],
        "dairy": ["dairy", "milk", "cattle"],
        "agro-repair": ["agro-repair", "tractor", "agricultural repair", "farm equipment repair", "repair"],
        "food-processing": ["food-processing", "flour mill", "spice", "grain mill", "food processing"],
        "solar-repair": ["solar", "solar-repair", "electrical repair"],
        "cafe": ["cafe", "coffee", "tea stall", "tea"],
        "restaurant": ["restaurant", "hotel", "dhaba", "canteen", "eatery"],
        "pharmacy": ["pharmacy", "chemist", "medical store", "medicine"]
    }

    for cat, kws in category_keywords.items():
        if any(kw in q_lower for kw in kws):
            extracted["business_category"] = cat
            break

    # 3. PIN code extraction (6-digit Indian PIN)
    pin_match = re.search(r'\b([1-9][0-9]{5})\b', query)
    if pin_match:
        extracted["pincode"] = pin_match.group(1)
        extracted["location_hint"] = pin_match.group(1)

    # 4. Village/Town/District extraction hints
    loc_match = re.search(r'(?:in|at|near)\s+([A-Za-z0-9\s]+?)(?:village|town|district|mandal|\.|\,|$)', query, re.IGNORECASE)
    if loc_match and not extracted["pincode"]:
        candidate = loc_match.group(1).strip()
        if candidate.lower() not in ["my", "the", "a", "an", "rural"]:
            extracted["location_hint"] = candidate

    return extracted


async def execute_agent_consultation(request: AgentConsultRequest) -> AgentAdvisoryResponse:
    """
    Executes the SIH26091 LangChain Multi-Tool Advisory Pipeline:
    1. Parse natural language intent & combine with explicit request fields
    2. Reset and record execution logs across all 8 tools
    3. Tool 1: Geocoding (location coordinates & admin metadata)
    4. Tool 2: Competitors (real OSM Overpass business discovery)
    5. Tool 3: Census Demographic Catchment (PCA verified population & households)
    6. Tool 4: UDYAM MSME Registrations (Official Ministry data & micro-dominance)
    7. Tool 5: Empirical Market Analysis (Distance rings, spatial density, facilities)
    8. Tool 6: Deterministic Financial Engine (NO LLM math; reproducible formulas)
    9. Tool 7: Government Scheme Matching (PMEGP, Term Loan, Jan Samarth)
    10. Tool 8: RAG Document Retrieval (pgvector semantic search over guidelines)
    11. Synthesize grounded advisory via Gemini (or deterministic fallback)
    12. Assemble segregated response (Facts, Calculations, Estimates, AI Suggestions)
    """
    start_session = time.time()
    audit_recorder.clear()

    # 1. Parse natural language request
    parsed = parse_natural_language_query(request.query)

    capital = request.available_capital or parsed["available_capital"] or 300000.0
    category = request.business_category or parsed["business_category"] or "bakery"
    pincode = request.pincode or parsed["pincode"]
    location_query = request.village_town or request.district or pincode or parsed["location_hint"] or "522201"
    district = request.district
    state = request.state
    radius_km = request.radius_km or 3.0
    social_cat = request.social_category or "GENERAL"
    is_rural = request.is_rural if request.is_rural is not None else True

    # -------------------------------------------------------------------------
    # Step 1: Location Tool
    # -------------------------------------------------------------------------
    geo_res = location_geocoding_tool.invoke({
        "query": location_query,
        "district": district,
        "state": state
    })
    lat = geo_res.get("latitude", 16.243)
    lng = geo_res.get("longitude", 80.640)
    resolved_dist = geo_res.get("district") or district or "Guntur"
    resolved_state = geo_res.get("state") or state or "Andhra Pradesh"
    resolved_pin = geo_res.get("pincode") or pincode or "522201"
    formatted_addr = geo_res.get("formatted_address") or f"{resolved_dist}, {resolved_state}"

    # -------------------------------------------------------------------------
    # Step 2: Nearby Business / OpenStreetMap Tool
    # -------------------------------------------------------------------------
    osm_res = nearby_business_osm_tool.invoke({
        "latitude": lat,
        "longitude": lng,
        "category": category,
        "radius_km": radius_km
    })
    comp_count = osm_res.get("total_competitors", 0)
    nearest_dist = osm_res.get("nearest_competitor_distance_km")
    competitors_list = osm_res.get("competitors", [])

    # -------------------------------------------------------------------------
    # Step 3: Census Demographic Data Tool
    # -------------------------------------------------------------------------
    census_res = census_data_tool.invoke({
        "location_identifier": resolved_pin or resolved_dist
    })
    total_pop = census_res.get("total_population")
    total_hh = census_res.get("total_households")
    literacy_pct = census_res.get("literacy_rate_pct")

    # -------------------------------------------------------------------------
    # Step 4: UDYAM MSME Registry Tool
    # -------------------------------------------------------------------------
    udyam_res = udyam_data_tool.invoke({
        "district": resolved_dist,
        "category": category
    })
    udyam_total = udyam_res.get("total_registered_enterprises")
    micro_dom = udyam_res.get("micro_dominance_pct")

    # -------------------------------------------------------------------------
    # Step 5: Market Analysis Tool
    # -------------------------------------------------------------------------
    market_res = market_analysis_tool.invoke({
        "category": category,
        "pincode": resolved_pin,
        "latitude": lat,
        "longitude": lng,
        "radius_km": radius_km
    })
    density = market_res.get("density_per_sqkm")
    feasibility_score = market_res.get("feasibility_score", 75)
    feasibility_verdict = market_res.get("feasibility_verdict", "FEASIBLE")
    facilities_summary = market_res.get("facilities_summary", "Local commercial & transit hubs")

    # -------------------------------------------------------------------------
    # Step 6: Deterministic Financial Calculation Tool (NO LLM MATH)
    # -------------------------------------------------------------------------
    # Standard enterprise scaling: For rural bakery with ₹3 lakh margin, project cost benchmark ~ ₹4.5L - ₹6.0L
    # Beneficiary margin ~ 20-50%
    estimated_project_cost = capital * 1.5 if capital > 0 else 450000.0
    
    fin_res = financial_calculation_tool.invoke({
        "project_cost": estimated_project_cost,
        "available_capital": capital,
        "interest_rate": 8.0,
        "tenure": 60,
        "monthly_fixed_expenses": 12500.0,
        "monthly_variable_expenses": 18500.0,
        "expected_monthly_revenue": 55000.0
    })

    # -------------------------------------------------------------------------
    # Step 7: Government Scheme Matching Tool
    # -------------------------------------------------------------------------
    scheme_res = government_scheme_matching_tool.invoke({
        "project_cost": fin_res.get("project_cost", estimated_project_cost),
        "applicant_equity": capital,
        "social_category": social_cat,
        "is_rural": is_rural
    })
    matched_schemes = scheme_res.get("schemes", [])

    # -------------------------------------------------------------------------
    # Step 8: RAG Government Document Retrieval Tool
    # -------------------------------------------------------------------------
    rag_query = f"subsidy and credit support for {category} under PMEGP PMFME or Jan Samarth"
    rag_res = rag_government_document_retrieval_tool.invoke({
        "query": rag_query,
        "category": category,
        "top_k": 3
    })
    rag_evidence = rag_res.get("evidence", [])

    # -------------------------------------------------------------------------
    # Step 9: Assemble Grounded Facts, Calculations, Estimates
    # -------------------------------------------------------------------------
    facts = {
        "location": {
            "query": location_query,
            "resolved_address": formatted_addr,
            "district": resolved_dist,
            "state": resolved_state,
            "pincode": resolved_pin,
            "coordinates": {"latitude": lat, "longitude": lng},
            "source": geo_res.get("source", "Nominatim / OpenStreetMap")
        },
        "spatial_competitors": {
            "mapped_competitors_count": comp_count,
            "nearest_competitor_distance_km": nearest_dist,
            "sample_competitors": competitors_list[:3],
            "source": osm_res.get("source", "OpenStreetMap / Overpass API")
        },
        "census_demographics": {
            "total_population": total_pop,
            "total_households": total_hh,
            "literacy_rate_pct": literacy_pct,
            "source": census_res.get("source", "Census of India Primary Census Abstract"),
            "population_disclaimer": "Demographic catchment indicator; does not represent guaranteed retail demand."
        },
        "udyam_msme_registry": {
            "district": resolved_dist,
            "total_registered_msmes": udyam_total,
            "micro_dominance_pct": micro_dom,
            "source": udyam_res.get("source", "Ministry of MSME / UDYAM Portal"),
            "disclaimer": "Excludes informal unorganized village vendors."
        }
    }

    calculations = {
        "project_cost": fin_res.get("project_cost"),
        "own_contribution": fin_res.get("own_contribution"),
        "loan_requirement": fin_res.get("loan_requirement"),
        "monthly_emi": fin_res.get("monthly_emi"),
        "total_repayment": fin_res.get("total_repayment"),
        "total_interest": fin_res.get("total_interest"),
        "monthly_expenses": fin_res.get("monthly_expenses"),
        "monthly_profit": fin_res.get("monthly_profit"),
        "break_even_monthly_revenue": fin_res.get("break_even_monthly_revenue"),
        "annual_revenue": fin_res.get("annual_revenue"),
        "annual_expenses": fin_res.get("annual_expenses"),
        "dscr": fin_res.get("dscr"),
        "payback_years": fin_res.get("payback_years"),
        "calculation_method": "DETERMINISTIC_MATHEMATICAL_FORMULAS (NO LLM MATH)"
    }

    estimates = {
        "feasibility_score": feasibility_score,
        "feasibility_verdict": feasibility_verdict,
        "competitors_within_1km": market_res.get("competitors_within_1km", 0),
        "competitors_within_3km": market_res.get("competitors_within_3km", comp_count),
        "spatial_density_per_sqkm": density,
        "infrastructure_summary": facilities_summary,
        "confidence_note": "Empirically calculated using distance rings and OpenStreetMap spatial features."
    }

    # -------------------------------------------------------------------------
    # Step 10: Gemini LLM Synthesis with Anti-Hallucination Guardrails
    # -------------------------------------------------------------------------
    rec_scheme_name = matched_schemes[0]["name"] if matched_schemes else "Term Loan Scheme"
    project_cost_val = calculations.get("project_cost") or estimated_project_cost
    loan_val = calculations.get("loan_requirement") or (project_cost_val - capital)
    emi_val = calculations.get("monthly_emi") or 0.0
    breakeven_val = calculations.get("break_even_monthly_revenue") or 0.0

    executive_summary = (
        f"For your proposed {category.capitalize()} enterprise in {formatted_addr}, your available capital of "
        f"₹{capital:,.0f} supports an estimated project cost of ₹{project_cost_val:,.0f} with an eligible loan "
        f"requirement of ₹{loan_val:,.0f} under the {rec_scheme_name}. OpenStreetMap discovery mapped {comp_count} "
        f"competitor(s) within {radius_km} km, yielding a '{feasibility_verdict}' market feasibility rating "
        f"with an estimated break-even revenue threshold of ₹{breakeven_val:,.0f}/month."
    )

    ai_suggestions = [
        f"Leverage your ₹{capital:,.0f} equity as beneficiary margin under {rec_scheme_name} to secure concessional institutional credit.",
        f"Establish your retail counter near key transit or commercial hubs ({facilities_summary}) to maximize initial customer footfall.",
        f"Maintain operating expenses under control during ramp-up to comfortably achieve the monthly break-even target of ₹{breakeven_val:,.0f}.",
        f"Differentiate your {category} offerings through regional taste preferences, fresh daily inventory, and direct Gram Panchayat delivery networks.",
        "Maintain official purchase invoices for machinery and commercial equipment for direct DIC capital subsidy claim disbursement."
    ]

    # If Gemini API is configured, enrich the advisory synthesis
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip() not in ["", "your_gemini_api_key_here"]:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(settings.GEMINI_MODEL)
            gemini_prompt = f"""
You are the SIH26091 Senior Rural Micro-Enterprise Advisor.
Synthesize a concise executive summary and strategic advisory suggestions for this rural entrepreneur.

STRICT GROUNDING DIRECTIVE:
DO NOT INVENT, RECALCULATE, OR ALTER ANY NUMERICAL VALUES.
Every figure must match the verified tool data exactly.

Verified Tool Data:
- Location: {formatted_addr}
- Enterprise Category: {category}
- Entrepreneur Capital: ₹{capital:,.0f}
- Project Cost: ₹{project_cost_val:,.0f}
- Loan Requirement: ₹{loan_val:,.0f}
- Monthly EMI: ₹{emi_val:,.0f}
- Break-Even Revenue: ₹{breakeven_val:,.0f}/month
- Mapped Competitors in {radius_km}km: {comp_count}
- Market Verdict: {feasibility_verdict} (Score: {feasibility_score}/100)
- Recommended Scheme: {rec_scheme_name}
- Relevant Facilities: {facilities_summary}

Provide:
1. Executive Summary (2-3 crisp sentences)
2. Strategic Suggestions (4 actionable bullet points for a rural entrepreneur)
"""
            gemini_resp = model.generate_content(gemini_prompt)
            if gemini_resp and gemini_resp.text:
                text_out = gemini_resp.text.strip()
                # Split summary and suggestions if identifiable
                lines = [l.strip() for l in text_out.split('\n') if l.strip()]
                summary_lines = [l for l in lines if not l.startswith('-') and not l.startswith('*') and not re.match(r'^\d+\.', l)]
                bullet_lines = [re.sub(r'^[*\-\d\.]+\s*', '', l) for l in lines if l.startswith('-') or l.startswith('*') or re.match(r'^\d+\.', l)]
                
                if summary_lines:
                    executive_summary = " ".join(summary_lines[:2])
                if len(bullet_lines) >= 3:
                    ai_suggestions = bullet_lines[:5]
        except Exception as gemini_err:
            logger.warning(f"Gemini LLM enrichment encountered an error, fallback to grounded deterministic template: {gemini_err}")

    # -------------------------------------------------------------------------
    # Step 11: Verification Notes & Auditing
    # -------------------------------------------------------------------------
    verification_notes = [
        f"Official scheme enrollment requires submission through the Jan Samarth portal (https://www.jansamarth.in) or local District Industries Centre (DIC).",
        f"Census population ({total_pop if total_pop else 'district census'}) indicates demographic scale only; on-ground micro-vendor footfall must be verified locally.",
        f"UDYAM registry counts ({udyam_total if udyam_total else 'district data'}) reflect registered units; unregistered rural informal competitors should be mapped via local survey.",
        f"Financial terms reflect indicative benchmark rates (8.0% p.a.); final terms depend on sanctioning bank credit appraisal."
    ]

    trace_logs = [log for log in audit_recorder.logs]

    logger.info(f"Agent consultation pipeline completed in {(time.time() - start_session)*1000.0:.1f}ms with {len(trace_logs)} tool calls.")

    return AgentAdvisoryResponse(
        user_query=request.query,
        executive_summary=executive_summary,
        facts=facts,
        calculations=calculations,
        estimates=estimates,
        ai_suggestions=ai_suggestions,
        matched_schemes=matched_schemes,
        rag_evidence=rag_evidence,
        verification_notes=verification_notes,
        tool_execution_trace=trace_logs,
        agent_architecture="LANGCHAIN_GEMINI_MULTI_TOOL_AGENT"
    )

