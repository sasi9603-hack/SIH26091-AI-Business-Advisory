# SIH26091 Official Scheme Documents RAG Tests
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal, Base, engine
from app.services.rag_service import chunk_official_documents, seed_rag_knowledge_base

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_rag_test_db():
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_rag_knowledge_base(db)
    yield

def test_rag_chunking_and_metadata_preservation():
    """
    Verifies that official government documents are chunked using LangChain
    and retain title, official portal URL, nodal ministry, and publication date.
    """
    chunks = chunk_official_documents()
    assert len(chunks) >= 10, "Should generate at least 10 chunks across official schemes"

    for chunk in chunks:
        assert "document_title" in chunk and chunk["document_title"]
        assert "official_source_url" in chunk and chunk["official_source_url"].startswith("http")
        assert "nodal_ministry" in chunk and chunk["nodal_ministry"]
        assert "publication_date" in chunk and chunk["publication_date"]
        assert "chunk_text" in chunk and len(chunk["chunk_text"]) > 20
        assert "scheme_name" in chunk and chunk["scheme_name"]

def test_rag_query_bakery_support():
    """
    Verifies the user's specific example question:
    'What government financial support may be available for a rural entrepreneur starting a bakery?'
    Response must contain:
    1. Answer
    2. Relevant scheme
    3. Evidence from retrieved documents
    4. Official source
    5. Verification note where required.
    """
    response = client.post("/api/rag/query", json={
        "query": "What government financial support may be available for a rural entrepreneur starting a bakery?",
        "business_category": "bakery",
        "top_k": 4
    })
    assert response.status_code == 200
    data = response.json()

    # 1. Answer
    assert "answer" in data and len(data["answer"]) > 50
    assert "PMEGP" in data["answer"] or "PMFME" in data["answer"] or "bakery" in data["answer"].lower()

    # 2. Relevant scheme
    assert "relevant_scheme" in data and ("PMEGP" in data["relevant_scheme"] or "PMFME" in data["relevant_scheme"] or "Micro Finance" in data["relevant_scheme"])

    # 3. Evidence from retrieved documents
    assert "evidence" in data and len(data["evidence"]) > 0
    first_evidence = data["evidence"][0]
    assert "chunk_id" in first_evidence
    assert "document_title" in first_evidence
    assert "text" in first_evidence
    assert "official_source_url" in first_evidence and first_evidence["official_source_url"].startswith("https://")
    assert first_evidence["similarity_score"] > 0

    # 4. Official source
    assert "official_source" in data
    assert "title" in data["official_source"]
    assert "url" in data["official_source"] and data["official_source"]["url"].startswith("https://")
    assert "nodal_ministry" in data["official_source"]

    # 5. Verification note where required
    assert "verification_note" in data and len(data["verification_note"]) > 20
    assert "bank" in data["verification_note"].lower() or "appraisal" in data["verification_note"].lower()

    assert data["has_sufficient_context"] is True

def test_rag_evidence_citations_and_urls():
    """
    Verifies that all retrieved evidence items contain valid official URLs and publication dates.
    """
    response = client.post("/api/rag/query", json={
        "query": "How much subsidy is given under PMEGP in rural areas?",
        "top_k": 3
    })
    assert response.status_code == 200
    data = response.json()

    assert len(data["evidence"]) >= 1
    for item in data["evidence"]:
        assert item["official_source_url"].startswith("https://")
        assert item["document_title"]
        assert item["publication_date"]
        assert item["similarity_score"] > 0

def test_rag_unanswerable_query_refusal_without_fabrication():
    """
    CRITICAL ZERO-HALLUCINATION TEST:
    If a query has no relation to indexed official government schemes, the system
    must NOT fabricate imaginary schemes or subsidies. It must return has_sufficient_context: false.
    """
    response = client.post("/api/rag/query", json={
        "query": "How to design a quantum computing semiconductor chip for deep space rocket exploration?",
        "top_k": 3
    })
    assert response.status_code == 200
    data = response.json()

    assert data["has_sufficient_context"] is False
    assert "do not contain information" in data["answer"] or "outside" in data["answer"].lower()
    assert "Quantum" not in data["relevant_scheme"]  # Must not invent a quantum scheme

def test_rag_query_mudra_shishu_and_kishor():
    """
    Tests MUDRA scheme retrieval for micro loans under Rs 5 Lakh.
    """
    response = client.post("/api/rag/query", json={
        "query": "What are the loan limits and collateral rules for MUDRA Kishor and Shishu loans?",
        "top_k": 4
    })
    assert response.status_code == 200
    data = response.json()

    assert "MUDRA" in data["relevant_scheme"] or "MUDRA" in data["answer"] or "PMMY" in data["answer"]
    assert any("50,000" in e["text"] or "5,00,000" in e["text"] or "collateral" in e["text"].lower() for e in data["evidence"])
    assert data["has_sufficient_context"] is True

def test_rag_endpoint_api_and_v1_parity():
    """
    Verifies that POST /api/rag/query and POST /api/v1/rag/query both resolve identically.
    """
    payload = {
        "query": "What is the moratorium period and interest rate for the Term Loan Scheme?",
        "top_k": 3
    }

    res_api = client.post("/api/rag/query", json=payload)
    assert res_api.status_code == 200

    res_v1 = client.post("/api/v1/rag/query", json=payload)
    assert res_v1.status_code == 200

    assert res_api.json()["relevant_scheme"] == res_v1.json()["relevant_scheme"]
    assert len(res_api.json()["evidence"]) == len(res_v1.json()["evidence"])

