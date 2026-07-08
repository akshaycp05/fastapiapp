# RAG System — Complete Beginner Guide 🚀

## What is RAG? (Explain Like I'm 5)

Imagine you're a librarian. A kid walks in and asks: *"Do you have books about space rockets?"*

You don't read every book. Instead, you:
1. **Remember** where space books are shelved (that's the **vector database**)
2. **Understand** the kid's question means "astronomy/rockets" (that's **embedding**)
3. **Find** the closest matching books (that's **semantic search**)
4. **Explain** the answer in simple words (that's the **LLM generating a response**)

**RAG = Retrieval-Augmented Generation**
- **Retrieval** → Find relevant data from your database
- **Augmented** → Feed that data into an AI model
- **Generation** → AI writes a helpful answer using that data

---

## The Big Picture — What Happens When a User Searches

```
┌─────────────────────────────────────────────────────────────┐
│                    STEP 1: STORE JOBS                       │
│                                                             │
│  PostgreSQL DB ──→ Read Jobs ──→ Convert to Vectors ──→     │
│                     (text)        (fastembed)          │     │
│                                                       ▼     │
│                                              Qdrant Cloud   │
│                                              (vector DB)    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  STEP 2: USER SEARCHES                      │
│                                                             │
│  User Question ──→ Convert to Vector ──→ Search Qdrant ──→  │
│  "python jobs"     (fastembed)           (cosine score)     │
│                                                        │    │
│                                                        ▼    │
│                                              Top 5 Matches  │
│                                                        │    │
│                                                        ▼    │
│                                        Groq LLM writes a    │
│                                        human-friendly answer │
└─────────────────────────────────────────────────────────────┘
```

---

## Real-World Analogy: Spotify Recommendations 🎵

| Spotify | Our RAG System |
|---------|---------------|
| Songs are stored as audio features (tempo, energy, mood) | Jobs are stored as vectors (meaning of title + description) |
| You play a song → Spotify finds similar songs | You type a query → We find similar jobs |
| Spotify uses audio features to compare | We use **cosine similarity** to compare vectors |
| Spotify shows "Songs Like This" | We show "Jobs Like This" |

---

## What is a Vector? (The Core Concept)

A **vector** is just a list of numbers that represents the **meaning** of text.

```
"Python Developer"  → [0.12, 0.85, 0.03, 0.67, ... 384 numbers total]
"Backend Engineer"   → [0.11, 0.82, 0.05, 0.69, ... 384 numbers total]  ← SIMILAR!
"Pizza Recipe"       → [0.91, 0.02, 0.78, 0.11, ... 384 numbers total]  ← VERY DIFFERENT!
```

Notice: "Python Developer" and "Backend Engineer" have **similar numbers** because they mean similar things. "Pizza Recipe" has **very different numbers**.

---

## What is Cosine Similarity? 🎯

Cosine similarity measures **how similar two vectors are** on a scale of 0 to 1.

### Real-World Example: Pointing Fingers

Imagine two people pointing in directions:
- **Both point North** → Cosine = 1.0 (identical direction = identical meaning)
- **One points North, other points East** → Cosine = 0.0 (completely different)
- **Both point roughly North-East** → Cosine = 0.85 (similar!)

### In Our Code

```python
# In qdrant_service.py, line 35:
vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE)
#                                              ^^^^^^^^^^^^^^^^^^^^^^^^
#                                              THIS tells Qdrant:
#                                              "Use cosine similarity to compare vectors"
```

**We don't calculate cosine ourselves** — Qdrant does it automatically when we search. We just tell it "use COSINE" when creating the collection.

### Where is Cosine Used?

| What | Where | Who Does It |
|------|-------|-------------|
| Collection created with `Distance.COSINE` | `qdrant_service.py` line 35 | Our code tells Qdrant |
| Actual cosine math happens | Inside Qdrant Cloud | Qdrant does it automatically |
| Score returned in results | `hit.score` (line 78, 99) | Qdrant returns 0.0 to 1.0 |

---

## What About Chunking? ✂️

In many RAG tutorials, you will hear about **"Chunking"** (splitting text into smaller pieces). 

### How are we doing chunking here?
**We aren't!** Here is why:

In our app, we embed the entire job listing like this:
```python
text = f"{job.title} {job.description}"
vector = embed_text(text)
```

**Why don't we chunk it?**
Embedding models have a **Token Limit** (usually 512 tokens, which is about 400 words). 
- If you try to embed a 10-page resume, the model will cut off the end and you lose data. In that case, you **must** chunk the text.
- Our job descriptions are typically short (under 400 words). Because they fit within the model's limit, we can just embed the whole thing as one single "chunk". This keeps our beginner code much simpler!

### If you wanted to add chunking later:
If you start storing massive 10-page job descriptions, you would use LangChain's `RecursiveCharacterTextSplitter` to cut the text into pieces, embed each piece separately, and store them all in Qdrant with the same `job_id`.

---

## Every Library — What It Does

### 1. `fastembed` — Converts Text → Vectors

```python
# qdrant_service.py
from fastembed import TextEmbedding

embeddings_model = TextEmbedding("BAAI/bge-small-en-v1.5")
```

| Question | Answer |
|----------|--------|
| What does it do? | Converts text into a list of 384 numbers (a vector) |
| Why this library? | Free, no API key, lightweight, no PyTorch needed |
| What model? | `BAAI/bge-small-en-v1.5` — a small but good embedding model |
| Why 384? | This model outputs 384-dimensional vectors |
| Cost? | **Free forever** — runs on your machine |

### 2. `qdrant-client` — Stores and Searches Vectors

```python
# qdrant_service.py
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
```

| Question | Answer |
|----------|--------|
| What does it do? | Connects to Qdrant Cloud to store and search vectors |
| Why Qdrant? | Free cloud tier, easy API, built for vector search |
| Where is data stored? | On Qdrant Cloud (not your machine) |
| Cost? | **Free tier** — 1GB RAM, 4GB disk |

### 3. `langchain-groq` — AI That Writes Answers

```python
# rag_service.py
from langchain_groq import ChatGroq
```

| Question | Answer |
|----------|--------|
| What does it do? | Sends prompts to Groq's LLM API, gets AI-written answers |
| Why Groq? | Free tier, very fast, runs Llama 3.3 70B model |
| Used where? | RAG answers (`/rag/ask`) and resume analysis (`/rag/analyse-resume`) |

### 4. `langchain-core` — Prompt Templates and Chains

```python
# rag_service.py
from langchain_core.prompts import ChatPromptTemplate
```

| Question | Answer |
|----------|--------|
| What does it do? | Creates reusable prompt templates, chains them with LLMs |
| The pipe operator? | `rag_prompt \| llm` means "send this prompt to this LLM" |

### 5. `sqlalchemy` — Reads Jobs from PostgreSQL

```python
# qdrant_service.py
from sqlalchemy.orm import Session
from models.job import Job
```

| Question | Answer |
|----------|--------|
| What does it do? | Reads job data from your PostgreSQL database |
| Used where? | `embed_all_jobs()` reads all jobs to convert them into vectors |

---

## Every Import — Line by Line

### File: `services/qdrant_service.py`

```python
import os                              # Read environment variables
from dotenv import load_dotenv         # Load .env file into os.environ
from qdrant_client import QdrantClient # Connect to Qdrant Cloud
from qdrant_client.models import (
    Distance,       # Enum: COSINE, EUCLID, DOT — how to compare vectors
    VectorParams,   # Config: vector size + distance type for a collection
    PointStruct     # A single data point: id + vector + payload (metadata)
)
from fastembed import TextEmbedding    # Convert text → 384-dim vector
from sqlalchemy.orm import Session     # Database session to query PostgreSQL
from models.job import Job             # Our Job table model
```

### File: `services/rag_service.py`

```python
import os                                        # Environment variables
from dotenv import load_dotenv                   # Load .env
from langchain_groq import ChatGroq              # Groq LLM client
from langchain_core.prompts import ChatPromptTemplate  # Prompt builder
from services.qdrant_service import search_jobs  # Our vector search function
```

### File: `routers/rag.py`

```python
from fastapi import APIRouter, Depends    # Create API routes
from sqlalchemy.orm import Session        # DB session type
from database import get_db               # DB session dependency
from schemas.rag import (...)             # Request/Response shapes (Pydantic)
from services.resume_service import analyse_resume        # Resume AI
from services.qdrant_service import embed_all_jobs, ...   # Vector operations
from services.rag_service import rag_job_search           # RAG Q&A
```

---

## Every Function — What It Does

### `qdrant_service.py` Functions

| Function | What It Does | When It's Called |
|----------|-------------|-----------------|
| `ensure_collection()` | Creates the vector collection on Qdrant Cloud if it doesn't exist. Detects if vector size changed and recreates it. | Before every embed/search |
| `embed_text(text)` | Takes a string, returns a list of 384 numbers | Every time we convert text to a vector |
| `embed_all_jobs(db)` | Reads ALL jobs from PostgreSQL, converts each to a vector, stores in Qdrant | `POST /rag/embed-jobs` |
| `search_jobs(query)` | Converts query to vector, finds top 5 similar job vectors in Qdrant | `POST /rag/search` or `POST /rag/ask` |
| `match_jobs_for_profile(skills, experience)` | Same as search but builds query from skills + experience | `POST /rag/job-match` |

### `rag_service.py` Functions

| Function | What It Does | When It's Called |
|----------|-------------|-----------------|
| `rag_job_search(question)` | Searches Qdrant for relevant jobs, feeds them as context to Groq LLM, returns AI-written answer | `POST /rag/ask` |

---

## The Complete Flow — Step by Step

### Flow 1: Storing Jobs (Embedding)

```
User clicks "Embed Jobs" → POST /rag/embed-jobs
        │
        ▼
    routers/rag.py: embed_jobs()
        │
        ▼
    qdrant_service.py: embed_all_jobs(db)
        │
        ├─→ ensure_collection()
        │   Creates "job_descriptions" collection on Qdrant Cloud
        │   with 384 dimensions + cosine similarity
        │
        ├─→ db.query(Job).all()
        │   Reads all jobs from PostgreSQL
        │
        ├─→ For each job:
        │     text = "Python Developer Build REST APIs..."
        │     vector = embed_text(text)
        │     fastembed converts text → [0.12, 0.85, ...]
        │     point = PointStruct(id=1, vector=vector, payload={title, desc, salary})
        │
        └─→ qdrant.upsert(points)
            Sends all vectors to Qdrant Cloud for storage
```

### Flow 2: Searching Jobs (Semantic Search)

```
User types "python backend jobs" → POST /rag/search
        │
        ▼
    routers/rag.py: semantic_search()
        │
        ▼
    qdrant_service.py: search_jobs("python backend jobs")
        │
        ├─→ embed_text("python backend jobs")
        │   Convert query to vector [0.11, 0.82, ...]
        │
        └─→ qdrant.query_points(query=vector)
                    │
                    │  Qdrant compares this vector against ALL stored
                    │  job vectors using COSINE SIMILARITY and returns
                    │  top 5 closest matches
                    ▼
              results.points = [
                {title: "Python Developer", score: 0.92},  ← 92% similar!
                {title: "Backend Engineer", score: 0.87},  ← 87% similar!
                {title: "Data Analyst", score: 0.45},      ← 45% similar
              ]
```

### Flow 3: RAG Q&A (The Full RAG Pipeline)

```
User asks "What Python jobs pay over 80k?" → POST /rag/ask
        │
        ▼
    rag_service.py: rag_job_search("What Python jobs pay over 80k?")
        │
        ├─→ STEP 1 — RETRIEVAL
        │   search_jobs("What Python jobs pay over 80k?")
        │   Returns top 5 matching jobs from Qdrant
        │
        ├─→ STEP 2 — AUGMENTATION
        │   context = "- Python Developer: Build APIs (Salary: 90000)
        │              - Backend Engineer: Python+Django (Salary: 85000)"
        │
        │   Prompt sent to LLM:
        │   ┌──────────────────────────────────────────────────┐
        │   │ SYSTEM: You are a job search assistant.          │
        │   │ Use the following job listings to answer:        │
        │   │ Retrieved Jobs:                                  │
        │   │ - Python Developer: Build APIs (Salary: 90000)   │
        │   │ - Backend Engineer: Python+Django (Salary: 85000)│
        │   │                                                  │
        │   │ HUMAN: What Python jobs pay over 80k?            │
        │   └──────────────────────────────────────────────────┘
        │
        └─→ STEP 3 — GENERATION
            Groq LLM (Llama 3.3) reads context + question and writes:
            "I found 2 Python jobs paying over 80k:
             1. Python Developer — $90,000
             2. Backend Engineer — $85,000"
```

---

## File Architecture Map

```
backend/
├── .env                          ← QDRANT_URL, QDRANT_API_KEY, GROQ_API_KEY
├── services/
│   ├── qdrant_service.py         ← Vectors: embed, store, search (fastembed + qdrant-client)
│   ├── rag_service.py            ← RAG: search + LLM answer (langchain-groq)
│   └── resume_service.py         ← Resume analysis (langchain-groq)
├── routers/
│   └── rag.py                    ← API endpoints: /embed-jobs, /search, /ask, /job-match
├── schemas/
│   └── rag.py                    ← Request/Response models (Pydantic)
└── models/
    └── job.py                    ← Job table (SQLAlchemy → PostgreSQL)
```

---

## How to Build This Yourself — Learning Path

### Step 1: Understand Vectors (30 minutes)
- Google "word embeddings explained simply"
- Key idea: words with similar meaning → similar numbers

### Step 2: Try fastembed Alone (15 minutes)
```python
from fastembed import TextEmbedding
model = TextEmbedding("BAAI/bge-small-en-v1.5")
vector = list(model.embed(["Hello world"]))
print(len(vector[0]))  # 384 — that's your vector!
```

### Step 3: Set Up Qdrant Cloud (10 minutes)
- Go to https://cloud.qdrant.io → free account → create cluster → get URL + API key

### Step 4: Store and Search Vectors (30 minutes)
```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

client = QdrantClient(url="YOUR_URL", api_key="YOUR_KEY")

# Create collection
client.create_collection("test", vectors_config=VectorParams(size=384, distance=Distance.COSINE))

# Store a vector
client.upsert("test", points=[PointStruct(id=1, vector=your_vector, payload={"text": "hello"})])

# Search
results = client.query_points("test", query=your_query_vector, limit=3)
```

### Step 5: Add an LLM (20 minutes)
- Get a free Groq API key from https://console.groq.com
- Use langchain-groq to send search results + question → get an answer

### Step 6: Wire Into FastAPI (30 minutes)
- Create routes, schemas, and connect everything

---

## Quick Reference: Library → Function → Purpose

| Library | Import | Function/Class | Purpose |
|---------|--------|---------------|---------|
| `fastembed` | `TextEmbedding` | `.embed(["text"])` | Convert text → vector (384 numbers) |
| `qdrant-client` | `QdrantClient` | `.create_collection()` | Create storage space for vectors |
| `qdrant-client` | `QdrantClient` | `.upsert()` | Store vectors in the collection |
| `qdrant-client` | `QdrantClient` | `.query_points()` | Search for similar vectors (cosine internally) |
| `qdrant-client` | `Distance.COSINE` | Used in `VectorParams` | Tells Qdrant to use cosine similarity |
| `qdrant-client` | `VectorParams` | `VectorParams(size, distance)` | Configures vector size + comparison method |
| `qdrant-client` | `PointStruct` | `PointStruct(id, vector, payload)` | One data point = ID + vector + metadata |
| `langchain-groq` | `ChatGroq` | `.invoke()` via chain | Send prompt to Llama 3.3, get AI response |
| `langchain-core` | `ChatPromptTemplate` | `.from_messages()` | Build reusable prompt with variables |
| `sqlalchemy` | `Session` | `db.query(Job).all()` | Read all jobs from PostgreSQL |

---

## Keyword vs Semantic Search — Why RAG Wins

```
User searches: "I want to code websites"

KEYWORD SEARCH (SQL LIKE):
  SELECT * FROM jobs WHERE description LIKE '%code websites%'
  Result: NOTHING (no job has exact text "code websites")

SEMANTIC SEARCH (Our RAG):
  Converts "code websites" to a vector
  Finds vectors close to it:
     ✅ "Frontend Developer" (score: 0.89)
     ✅ "Full Stack Engineer" (score: 0.85)
     ✅ "Web Developer" (score: 0.82)
  It UNDERSTANDS meaning, not just words!
```

That's the power of RAG. 🎉