from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class RAGQueryRequest(BaseModel):
    query: str = Field(..., min_length=3, description="Entrepreneur query regarding government financial schemes")
    business_category: Optional[str] = Field(None, description="Proposed enterprise category (e.g. bakery, agro-repair, grocery)")
    top_k: int = Field(default=4, ge=1, le=10, description="Maximum number of authoritative chunks to retrieve")

class RAGEvidenceItem(BaseModel):
    chunk_id: str
    scheme_name: str
    document_title: str
    text: str
    official_source_url: str
    nodal_ministry: Optional[str] = None
    publication_date: Optional[str] = None
    similarity_score: float

class RAGOfficialSource(BaseModel):
    title: str
    url: str
    nodal_ministry: str
    publication_date: Optional[str] = None

class RAGQueryResponse(BaseModel):
    query: str
    answer: str
    relevant_scheme: str
    evidence: List[RAGEvidenceItem]
    official_source: RAGOfficialSource
    verification_note: str
    has_sufficient_context: bool = True
    retrieval_method: str = "LANGCHAIN_GEMINI_EMBEDDINGS_PGVECTOR"

