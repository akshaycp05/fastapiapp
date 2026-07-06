from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas.rag import (
    ResumeRequest, ResumeResponse,
    JobMatchRequest, JobMatchResponse, JobMatchResult,
    RagSearchRequest, RagSearchResponse,
    EmbedResponse,
    JobSearchRequest, SemanticSearchResponse, SemanticSearchResult
)
from services.resume_service import analyse_resume
from services.qdrant_service import embed_all_jobs, search_jobs, match_jobs_for_profile
from services.rag_service import rag_job_search

router = APIRouter(prefix="/rag", tags=["RAG"])


@router.post("/embed-jobs", response_model=EmbedResponse)
def embed_jobs(db: Session = Depends(get_db)):
    count = embed_all_jobs(db)
    return EmbedResponse(message=f"Embedded {count} jobs into Qdrant", count=count)


@router.post("/search", response_model=SemanticSearchResponse)
def semantic_search(request: JobSearchRequest):
    results = search_jobs(request.query, top_k=5)
    return SemanticSearchResponse(
        results=[SemanticSearchResult(**r) for r in results]
    )


@router.post("/ask", response_model=RagSearchResponse)
def rag_ask(request: RagSearchRequest):
    answer = rag_job_search(request.question)
    return RagSearchResponse(answer=answer)


@router.post("/analyse-resume", response_model=ResumeResponse)
def resume_analyse(request: ResumeRequest):
    analysis = analyse_resume(request.resume_text)
    return ResumeResponse(analysis=analysis)


@router.post("/job-match", response_model=JobMatchResponse)
def job_match(request: JobMatchRequest):
    results = match_jobs_for_profile(request.skills, request.experience, top_k=5)
    return JobMatchResponse(
        matches=[JobMatchResult(**r) for r in results]
    )


#                     Client
#                       │
#           HTTP POST Request (JSON)
#                       │
#                       ▼
#               FastAPI Router
#                       │
#       ┌───────────────┼──────────────────┐
#       │               │                  │
#       ▼               ▼                  ▼
#  Resume API      Search API        RAG API
#       │               │                  │
#       ▼               ▼                  ▼
#  Resume Service  Qdrant Service    RAG Service
#       │               │                  │
#       ▼               ▼                  ▼
#     Groq          Vector Search     Groq + Qdrant
#                       │
#                       ▼
#               Pydantic Response
#                       │
#                       ▼
#                JSON Response
#                       │
#                       ▼
#                    Frontend

# | Endpoint                       | Purpose                                                                                                                  | Service Called             |
# | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
# | **POST `/rag/embed-jobs`**     | Reads all jobs from PostgreSQL, generates embeddings, and stores them in Qdrant.                                         | `embed_all_jobs()`         |
# | **POST `/rag/search`**         | Performs semantic search using a natural-language query and returns the top matching jobs.                               | `search_jobs()`            |
# | **POST `/rag/ask`**            | Executes the full RAG pipeline: retrieve relevant jobs from Qdrant and generate a natural-language answer using the LLM. | `rag_job_search()`         |
# | **POST `/rag/analyse-resume`** | Sends resume text to the LLM and returns a structured resume analysis.                                                   | `analyse_resume()`         |
# | **POST `/rag/job-match`**      | Matches a candidate's skills and experience against stored job embeddings and returns the best matching jobs.            | `match_jobs_for_profile()` |