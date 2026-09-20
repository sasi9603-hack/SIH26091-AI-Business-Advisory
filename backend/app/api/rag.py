from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..schemas.rag import RAGQueryRequest, RAGQueryResponse
from ..services.rag_service import query_rag_scheme_advisory

router = APIRouter(prefix="/rag", tags=["Government Scheme RAG Advisory"])

@router.post("/query", response_model=RAGQueryResponse)
async def query_scheme_rag_endpoint(
    req: RAGQueryRequest,
    db: Session = Depends(get_db)
):
    """
    SIH26091 RAG Query Endpoint:
    Answers user questions regarding government credit-linked financial schemes
    using official government documents (PMEGP, PMFME, MUDRA, Jan Samarth).

    Pipeline:
    Official documents -> LangChain chunking -> Gemini embeddings -> pgvector -> Cosine retrieval -> Gemini grounded synthesis.

    Returns:
    1. Answer
    2. Relevant scheme
    3. Evidence from retrieved documents (with chunks and similarity scores)
    4. Official source (title, portal URL, ministry, publication date)
    5. Verification note where required.
    """
    return query_rag_scheme_advisory(req, db)

