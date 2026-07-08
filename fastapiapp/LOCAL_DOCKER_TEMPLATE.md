# 🐳 Fully-Local Docker & Docker Compose Template

This document provides a template and instructions for running the **TalentSpark** full-stack application completely locally, without relying on external cloud databases (like Supabase or Qdrant Cloud).

---

## 📋 1. Local `.env` Template
Create an `.env` file in the root directory (where your `docker-compose.yml` sits) with the following content:

```env
# 💾 1. Local Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=student_db
# Connecting to the local 'db' container
DATABASE_URL=postgresql+asyncpg://postgres:password@db:5432/student_db

# 🔐 2. JWT security configuration
SECRET_KEY=my_secret_key
ALGORITHM=HS256

# 🤖 3. AI Service Configuration
# Using a local Qdrant container (on the shared network)
QDRANT_URL=http://qdrant:6333
QDRANT_API_KEY="" # Local Qdrant runs without auth by default

# Groq API Key (required for LLM processing, unless using a local LLM)
GROQ_API_KEY=gsk_your_actual_key_here

# 🌐 4. Frontend Configuration
VITE_API_URL=http://localhost:8000
```

---

## 🛠️ 2. Local `docker-compose.yml` Template
Save this configuration as `docker-compose.yml` in the project root directory:

```yaml
version: '3.8'

services:
  # 💾 PostgreSQL Service
  db:
    image: postgres:15-alpine
    container_name: fastapiapp-db
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5433:5432"  # Maps host port 5433 to container port 5432
    volumes:
      - postgres_data:/var/lib/postgresql/data  # Persistent DB volume
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d student_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  # 🤖 Local Qdrant Vector Database
  qdrant:
    image: qdrant/qdrant:latest
    container_name: fastapiapp-qdrant
    ports:
      - "6333:6333"  # REST API Port
      - "6334:6334"  # gRPC Port
    volumes:
      - qdrant_data:/qdrant/storage  # Persistent Vector Storage
    restart: always

  # ⚙️ FastAPI Backend Service
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: fastapiapp-backend
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - SECRET_KEY=${SECRET_KEY}
      - ALGORITHM=${ALGORITHM}
      - GROQ_API_KEY=${GROQ_API_KEY}
      - QDRANT_URL=${QDRANT_URL}
      - QDRANT_API_KEY=${QDRANT_API_KEY}
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
      qdrant:
        condition: service_started
    extra_hosts:
      - "host.docker.internal:host-gateway"  # Allows backend to reach local Ollama on host

  # ⚛️ React Frontend Service (Nginx)
  frontend:
    build:
      context: ./frontend/talentspark
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=${VITE_API_URL}
    container_name: talentspark-frontend
    ports:
      - "3000:80"  # Maps host port 3000 to container port 80
    depends_on:
      - backend

# 💾 Named Volumes to preserve database state
volumes:
  postgres_data:
  qdrant_data:
```

---

## 🚀 3. How to Run & Verify
1. **Start the containers:**
   ```bash
   docker-compose up --build
   ```
2. **Access your services:**
   * **React App:** `http://localhost:3000`
   * **FastAPI Docs:** `http://localhost:8000/docs`
   * **Qdrant Dashboard (Web UI):** `http://localhost:6333/dashboard`

3. **Verify Database:**
   Ensure connection to the local database container maps properly and tables are created.