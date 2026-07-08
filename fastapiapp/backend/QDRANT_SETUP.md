# Qdrant Cloud Setup Guide

## What is Qdrant?

Qdrant is a vector database. We use it to store job description embeddings and perform **semantic search** (finding jobs by meaning, not just keywords).

## How It Works in This Project

```
User Query → Embed with Google AI → Search Qdrant Cloud → Return similar jobs
```

1. Job descriptions are converted to vectors (embeddings) using Google's embedding model
2. Vectors are stored in Qdrant Cloud
3. When a user searches, their query is also converted to a vector
4. Qdrant finds the most similar vectors using cosine similarity

---

## Setup (5 minutes)

### Step 1: Create a Free Qdrant Cloud Account

1. Go to **https://cloud.qdrant.io/**
2. Sign up with Google, GitHub, or email
3. No credit card needed

### Step 2: Create a Free Cluster

1. Click **"Clusters"** in the left sidebar
2. Click **"+ Create"**
3. Select the **Free** tier
4. Pick any region (choose one close to your deployment server)
5. Click **"Create"**
6. Wait ~30 seconds for the cluster to start

### Step 3: Get Your Credentials

1. **Cluster URL**: Copy the URL shown on your cluster dashboard
   - It looks like: `https://abc123-xyz789.aws.cloud.qdrant.io`
2. **API Key**: Click **"API Keys"** → **"Create"** → Copy the key immediately
   - ⚠️ **Save this key somewhere safe — it won't be shown again!**

### Step 4: Update Your `.env` File

Open `backend/.env` and set these two values:

```
QDRANT_URL=https://your-cluster-url.cloud.qdrant.io
QDRANT_API_KEY=your-api-key-here
```

Replace with your actual values from Step 3.

### Step 5: Install Python Dependencies

```bash
pip install qdrant-client langchain-google-genai
```

That's it! ✅

---

## Usage Flow

1. Start FastAPI: `uvicorn app.main:app --reload`
2. Add some jobs via the `/job/` endpoint
3. Embed jobs: POST to `/rag/embed-jobs`
4. Now you can search, match, and ask questions about jobs!

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/rag/embed-jobs` | POST | Embed all jobs from DB into Qdrant Cloud |
| `/rag/search` | POST | Semantic search for jobs |
| `/rag/ask` | POST | RAG-based Q&A about jobs |
| `/rag/analyse-resume` | POST | Analyse resume text with AI |
| `/rag/job-match` | POST | Match user profile to jobs |

## Verify Connection

After setting up your `.env`, start your FastAPI app. If the app starts without errors, the Qdrant Cloud connection is working.

You can also check your cluster dashboard at **https://cloud.qdrant.io/** to see collections and data.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Connection timeout | Check that `QDRANT_URL` in `.env` starts with `https://` |
| Authentication error | Double-check `QDRANT_API_KEY` in `.env` — regenerate a new key if needed |
| Empty search results | Run `/rag/embed-jobs` first to load job data |
| Embedding errors | Check `GEMINIAPIKEY` in `.env` is valid |
| Cluster not responding | Log into https://cloud.qdrant.io/ and check cluster status |

## Free Tier Limits

- **1 GB RAM**, 0.5 vCPU, 4 GB disk
- This is plenty for a learning project with hundreds of jobs
- Cluster may auto-pause after extended inactivity — just restart it from the dashboard