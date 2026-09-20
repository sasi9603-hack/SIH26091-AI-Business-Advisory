# SIH26091 LangChain Multi-Tool Agent Test Suite
import pytest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import Base, engine, SessionLocal
from app.services.rag_service import seed_rag_knowledge_base
from app.schemas.agent import AgentConsultRequest
from app.services.agent_tools import (
    ALL_AGENT_TOOLS,
    location_geocoding_tool,
    nearby_business_osm_tool,
    census_data_tool,
    udyam_data_tool,
    market_analysis_tool,
    financial_calculation_tool,
    government_scheme_matching_tool,
    rag_government_document_retrieval_tool
)
from app.services.langchain_agent import (
    parse_natural_language_query,
    execute_agent_consultation
)
from app.schemas.competitors import CompetitorItem

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_agent_test_db():
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_rag_knowledge_base(db)
    yield

# ---------------------------------------------------------------------------
# Test 1: Tool Registry and Verification
# ---------------------------------------------------------------------------
def test_all_eight_tools_registered():
    """
    Verifies that all 8 required tools are registered and exported for the LangChain agent.
    1. location_geocoding_tool
    2. nearby_business_osm_tool
    3. census_data_tool
    4. udyam_data_tool
    5. market_analysis_tool
    6. financial_calculation_tool
    7. government_scheme_matching_tool
    8. rag_government_document_retrieval_tool
    """
    assert len(ALL_AGENT_TOOLS) == 8, f"Expected 8 agent tools, found {len(ALL_AGENT_TOOLS)}"
    tool_names = [t.name for t in ALL_AGENT_TOOLS]
    expected_names = [
        "location_geocoding_tool",
        "nearby_business_osm_tool",
        "census_data_tool",
        "udyam_data_tool",
        "market_analysis_tool",
        "financial_calculation_tool",
        "government_scheme_matching_tool",
        "rag_government_document_retrieval_tool"
    ]
    for exp in expected_names:
        assert exp in tool_names, f"Tool '{exp}' missing from registered tools"

# ---------------------------------------------------------------------------
# Test 2: Natural Language Intent Extraction
# ---------------------------------------------------------------------------
def test_parse_natural_language_query():
    """
    Tests extraction of capital (lakhs/INR), category, and location from free-text entrepreneur requests.
    """
    # Test user's specific prompt
    p1 = parse_natural_language_query("I have ₹3 lakh and want to start a bakery in my village.")
    assert p1["available_capital"] == 300000.0
    assert p1["business_category"] == "bakery"

    # Test alternative capital formats and categories
    p2 = parse_natural_language_query("I have 1.5 lakhs and plan to open a grocery shop near Tenali")
    assert p2["available_capital"] == 150000.0
    assert p2["business_category"] == "grocery"

    # Test PIN code extraction
    p3 = parse_natural_language_query("Need advice for agro-repair unit in 522201 with ₹50,000 margin")
    assert p3["available_capital"] == 50000.0
    assert p3["business_category"] == "agro-repair"
    assert p3["pincode"] == "522201"

# ---------------------------------------------------------------------------
# Test 3: Financial Calculation Tool Determinism (NO LLM MATH)
# ---------------------------------------------------------------------------
def test_financial_calculation_tool_deterministic():
    """
    Verifies that financial_calculation_tool produces deterministic, reproducible
    calculations without any LLM hallucination or math rounding drift.
    """
    res = financial_calculation_tool.invoke({
        "project_cost": 450000.0,
        "available_capital": 300000.0,
        "interest_rate": 8.0,
        "tenure": 60,
        "monthly_fixed_expenses": 12500.0,
        "monthly_variable_expenses": 18500.0,
        "expected_monthly_revenue": 55000.0
    })

    assert res["project_cost"] == 450000.0
    assert res["own_contribution"] == 300000.0
    assert res["loan_requirement"] == 150000.0
    assert res["monthly_emi"] == 3041.46
    assert res["total_repayment"] == 182487.6
    assert "DETERMINISTIC" in res["calculation_method"]

    # Test insufficient data handling
    empty_res = financial_calculation_tool.invoke({})
    assert empty_res["has_insufficient_data"] is True
    assert "project_cost" in empty_res["missing_inputs"]

# ---------------------------------------------------------------------------
# Test 4: Scheme Matching Tool
# ---------------------------------------------------------------------------
def test_government_scheme_matching_tool():
    """
    Verifies that the scheme matching tool returns verified credit schemes
    for micro-enterprises under the SIH26091 framework.
    """
    # ₹4.5 lakh project cost -> Term Loan Scheme (up to ₹50L)
    res = government_scheme_matching_tool.invoke({
        "project_cost": 450000.0,
        "applicant_equity": 300000.0,
        "social_category": "GENERAL",
        "is_rural": True
    })
    assert res["total_matched"] >= 1
    assert res["schemes"][0]["name"] == "Term Loan Scheme"
    assert res["schemes"][0]["portal_url"] == "https://www.jansamarth.in"

# ---------------------------------------------------------------------------
# Test 5: RAG Document Retrieval Tool
# ---------------------------------------------------------------------------
def test_rag_government_document_retrieval_tool():
    """
    Verifies pgvector semantic retrieval of official government scheme guidelines.
    """
    res = rag_government_document_retrieval_tool.invoke({
        "query": "subsidy and loan support for bakery in rural area",
        "category": "bakery",
        "top_k": 2
    })
    assert res["total_retrieved"] >= 1
    chunk = res["evidence"][0]
    assert "document_title" in chunk
    assert "official_source_url" in chunk
    assert chunk["official_source_url"].startswith("http")
    assert "excerpt" in chunk

# ---------------------------------------------------------------------------
# Test 6: Full Agent Consultation Pipeline (User's Bakery Request)
# ---------------------------------------------------------------------------
def test_agent_consultation_pipeline_grounded_execution():
    """
    Executes the complete LangChain agent pipeline for the user's scenario:
    'I have ₹3 lakh and want to start a bakery in my village.'
    Verifies:
    1. All 8 tools are called and logged in the execution trace.
    2. Strict provenance segregation (facts, calculations, estimates, ai_suggestions).
    3. Mathematical calculations come from deterministic engine, NOT LLM.
    4. Scheme matching and RAG retrieval provide official links and citations.
    """
    import asyncio

    # Mock OSM network calls for fast, deterministic unit test execution
    mock_comps = [
        CompetitorItem(
            id="test-comp-1",
            name="Sri Lakshmi Bakery & Sweets",
            category="bakery",
            source="OPENSTREETMAP",
            confidenceScore=0.9,
            verificationStatus="VERIFIED",
            distanceKm=0.8,
            lat=16.245,
            lng=80.642,
            address="Main Road, Tenali"
        )
    ]

    mock_facs = {
        "total_facilities_count": 4,
        "financial_facilities_count": 2,
        "commercial_facilities_count": 1,
        "transit_facilities_count": 1,
        "civic_facilities_count": 0,
        "facilities_list": [],
        "source": "OpenStreetMap Benchmark",
        "data_freshness": "BENCHMARK_TEST"
    }

    with patch("app.services.osm_service.fetch_osm_competitors", AsyncMock(return_value=mock_comps)):
        with patch("app.services.osm_service.fetch_nearby_facilities", AsyncMock(return_value=mock_facs)):
            req = AgentConsultRequest(
                query="I have ₹3 lakh and want to start a bakery in my village."
            )
            response = asyncio.run(execute_agent_consultation(req))

            # 1. Verify Architecture & Summary
            assert response.agent_architecture == "LANGCHAIN_GEMINI_MULTI_TOOL_AGENT"
            assert len(response.executive_summary) > 20

            # 2. Verify 8 Tools Execution Trace
            executed_tools = [log.tool_name for log in response.tool_execution_trace]
            assert len(response.tool_execution_trace) == 8
            assert "location_geocoding_tool" in executed_tools
            assert "nearby_business_osm_tool" in executed_tools
            assert "census_data_tool" in executed_tools
            assert "udyam_data_tool" in executed_tools
            assert "market_analysis_tool" in executed_tools
            assert "financial_calculation_tool" in executed_tools
            assert "government_scheme_matching_tool" in executed_tools
            assert "rag_government_document_retrieval_tool" in executed_tools

            # 3. Verify Facts Provenance
            assert "location" in response.facts
            assert response.facts["location"]["district"] in ["Guntur", "Krishna", "Andhra Pradesh"]
            assert "census_demographics" in response.facts
            assert "population_disclaimer" in response.facts["census_demographics"]
            assert "udyam_msme_registry" in response.facts

            # 4. Verify Calculations (Grounded, NOT LLM Math)
            assert response.calculations["own_contribution"] == 300000.0
            assert response.calculations["loan_requirement"] == 150000.0
            assert response.calculations["monthly_emi"] == 3041.46
            assert response.calculations["calculation_method"].startswith("DETERMINISTIC")

            # 5. Verify Estimates
            assert "feasibility_verdict" in response.estimates
            assert "feasibility_score" in response.estimates

            # 6. Verify AI Suggestions & Verification Notes
            assert len(response.ai_suggestions) >= 3
            assert len(response.verification_notes) >= 3

            # 7. Verify Matched Schemes & RAG Evidence
            assert len(response.matched_schemes) >= 1
            assert response.matched_schemes[0]["portal_url"].startswith("http")
            assert len(response.rag_evidence) >= 1
            assert response.rag_evidence[0]["official_source_url"].startswith("http")

# ---------------------------------------------------------------------------
# Test 7: API Endpoints Parity (/api/ai-agent/consult & /api/v1/ai-agent/consult)
# ---------------------------------------------------------------------------
def test_agent_consult_api_endpoint():
    """
    Verifies HTTP POST /api/ai-agent/consult and /api/v1/ai-agent/consult.
    """
    payload = {
        "query": "I have ₹3 lakh and want to start a bakery in my village."
    }

    mock_comps = [
        CompetitorItem(
            id="test-comp-1",
            name="Sri Lakshmi Bakery & Sweets",
            category="bakery",
            source="OPENSTREETMAP",
            confidenceScore=0.9,
            verificationStatus="VERIFIED",
            distanceKm=0.8,
            lat=16.245,
            lng=80.642,
            address="Main Road, Tenali"
        )
    ]

    mock_facs = {
        "total_facilities_count": 4,
        "financial_facilities_count": 2,
        "commercial_facilities_count": 1,
        "transit_facilities_count": 1,
        "civic_facilities_count": 0,
        "facilities_list": [],
        "source": "OpenStreetMap Benchmark",
        "data_freshness": "BENCHMARK_TEST"
    }

    with patch("app.services.osm_service.fetch_osm_competitors", AsyncMock(return_value=mock_comps)):
        with patch("app.services.osm_service.fetch_nearby_facilities", AsyncMock(return_value=mock_facs)):
            # Test /api/ai-agent/consult
            resp1 = client.post("/api/ai-agent/consult", json=payload)
            assert resp1.status_code == 200, f"Error: {resp1.text}"
            data1 = resp1.json()
            assert data1["agent_architecture"] == "LANGCHAIN_GEMINI_MULTI_TOOL_AGENT"
            assert len(data1["tool_execution_trace"]) == 8
            assert data1["calculations"]["monthly_emi"] == 3041.46

            # Test /api/v1/ai-agent/consult
            resp2 = client.post("/api/v1/ai-agent/consult", json=payload)
            assert resp2.status_code == 200, f"Error: {resp2.text}"
            data2 = resp2.json()
            assert data2["agent_architecture"] == "LANGCHAIN_GEMINI_MULTI_TOOL_AGENT"
            assert len(data2["tool_execution_trace"]) == 8

# ---------------------------------------------------------------------------
# Test 8: Input Validation Handling
# ---------------------------------------------------------------------------
def test_agent_consult_validation_error():
    """
    Verifies that requests with invalid queries (e.g. empty or shorter than 3 chars)
    receive an explicit 422 Unprocessable Entity error.
    """
    resp = client.post("/api/ai-agent/consult", json={"query": "ab"})
    assert resp.status_code == 422

