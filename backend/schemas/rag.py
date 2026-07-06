from pydantic import BaseModel
from typing import Optional


class ResumeRequest(BaseModel):
    resume_text: str


class ResumeResponse(BaseModel):
    analysis: str


class JobSearchRequest(BaseModel):
    query: str


class JobMatchRequest(BaseModel):
    skills: str
    experience: str


class JobMatchResult(BaseModel):
    job_id: Optional[int] = None
    title: str
    description: str
    salary: Optional[int] = None
    match_score: float


class JobMatchResponse(BaseModel):
    matches: list[JobMatchResult]


class RagSearchRequest(BaseModel):
    question: str


class RagSearchResponse(BaseModel):
    answer: str


class EmbedResponse(BaseModel):
    message: str
    count: int


class SemanticSearchResult(BaseModel):
    job_id: Optional[int] = None
    title: str
    description: str
    salary: Optional[int] = None
    score: float


class SemanticSearchResponse(BaseModel):
    results: list[SemanticSearchResult]

#                     USER
#                       │
#       ┌───────────────┼────────────────┐
#       │               │                │
#       ▼               ▼                ▼
#  Resume API     Search API        Match API
#       │               │                │
# ResumeRequest   JobSearchRequest  JobMatchRequest
#       │               │                │
#       ▼               ▼                ▼
#  Resume AI       Qdrant Search     Profile Matching
#       │               │                │
#       ▼               ▼                ▼
# ResumeResponse SemanticSearchResponse JobMatchResponse
#                       │
#                       ▼
#                  Frontend