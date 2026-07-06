import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from fastembed import TextEmbedding
from sqlalchemy.orm import Session
from models.job import Job

load_dotenv()

COLLECTION_NAME = "job_descriptions"
VECTOR_SIZE = 384  # BAAI/bge-small-en-v1.5 outputs 384-dim vectors

qdrant = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY"),
)

# Free embedding model — no API key needed, lightweight (no PyTorch)
embeddings_model = TextEmbedding("BAAI/bge-small-en-v1.5")


def ensure_collection():
    collections = [c.name for c in qdrant.get_collections().collections]
    if COLLECTION_NAME in collections:
        # Delete old collection if vector size changed (e.g. switched embedding model)
        info = qdrant.get_collection(COLLECTION_NAME)
        existing_size = info.config.params.vectors.size
        if existing_size != VECTOR_SIZE:
            qdrant.delete_collection(COLLECTION_NAME)
            collections.remove(COLLECTION_NAME)
    if COLLECTION_NAME not in collections:
        qdrant.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE)
        )


def embed_text(text: str) -> list[float]:
    return next(embeddings_model.embed([text])).tolist()


def embed_all_jobs(db: Session) -> int:
    ensure_collection()
    jobs = db.query(Job).all()
    if not jobs:
        return 0

    points = []
    for job in jobs:
        text = f"{job.title} {job.description or ''}"
        vector = embed_text(text)
        points.append(
            PointStruct(
                id=job.id,
                vector=vector,
                payload={"title": job.title, "description": job.description or "", "salary": job.salary, "job_id": job.id}
            )
        )

    qdrant.upsert(collection_name=COLLECTION_NAME, points=points)
    return len(points)

def search_jobs(query: str, top_k: int = 5) -> list[dict]:
    ensure_collection()
    query_vector = embed_text(query)
    results = qdrant.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        limit=top_k
    )
    return [
        {
            "job_id": hit.payload.get("job_id"),
            "title": hit.payload.get("title"),
            "description": hit.payload.get("description"),
            "salary": hit.payload.get("salary"),
            "score": round(hit.score, 4)
        }
        for hit in results.points
    ]


def match_jobs_for_profile(skills: str, experience: str, top_k: int = 5) -> list[dict]:
    ensure_collection()
    profile_text = f"Skills: {skills}. Experience: {experience}"
    profile_vector = embed_text(profile_text)
    results = qdrant.query_points(
        collection_name=COLLECTION_NAME,
        query=profile_vector,
        limit=top_k
    )
    return [
        {
            "job_id": hit.payload.get("job_id"),
            "title": hit.payload.get("title"),
            "description": hit.payload.get("description"),
            "salary": hit.payload.get("salary"),
            "match_score": round(hit.score * 100, 2)
        }
        for hit in results.points
    ]


#                  PostgreSQL
#                       │
#           db.query(Job).all()
#                       │
#                       ▼
#      "Python Developer FastAPI SQL"
#                       │
#                       ▼
#       FastEmbed (BAAI/bge-small-en-v1.5)
#                       │
#                       ▼
#      [384-dimensional embedding vector]
#                       │
#                       ▼
#       PointStruct(id, vector, payload)
#                       │
#                       ▼
#          Qdrant Collection (job_descriptions)
#                       │
#         ┌─────────────┴─────────────┐
#         │                           │
#         ▼                           ▼
#  search_jobs()           match_jobs_for_profile()
#         │                           │
#    User query                 Skills + Experience
#         │                           │
#         ▼                           ▼
#  Convert to vector           Convert to vector
#         │                           │
#         └─────────────┬─────────────┘
#                       ▼
#       Cosine Similarity Search in Qdrant
#                       │
#                       ▼
#         Top-k Most Relevant Jobs Returned