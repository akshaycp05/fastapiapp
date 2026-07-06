# Backend Guide - FastAPI Job Portal + AI Chatbot

A beginner-friendly, step-by-step guide on how this backend was built.

---

## Architecture Overview

```
backend/
├── app/
│   └── main.py              ← Entry point. Creates FastAPI app, registers all routers
├── database.py               ← Database connection (PostgreSQL + SQLAlchemy)
├── models/                   ← Database table definitions (SQLAlchemy models)
│   ├── company.py            ← Company table
│   ├── job.py                ← Job table
│   └── users.py              ← User table
├── schemas/                  ← Request/Response shapes (Pydantic models)
│   ├── company.py            ← CompanyCreate, CompanyUpdate, CompanyResponse
│   ├── job.py                ← JobCreate, JobUpdate, JobResponse
│   ├── users.py              ← UserCreate, UserResponse, Login_User
│   ├── token.py              ← Token (access_token + token_type)
│   └── chat.py               ← ChatRequest, ChatResponse
├── routers/                  ← API route handlers (grouped by feature)
│   ├── company.py            ← /company CRUD endpoints
│   ├── job.py                ← /job CRUD endpoints
│   ├── auth.py               ← /auth/register, /auth/login
│   └── chat.py               ← /chat/ask, /chat/ask_career
├── services/                 ← Business logic (AI/LLM calls)
│   ├── llm_service.py        ← Simple Gemini LLM call (no memory)
│   └── langchai_service.py   ← LangChain + Groq chatbot (with memory)
├── utils/                    ← Helper utilities
│   ├── security.py           ← Password hashing (bcrypt)
│   ├── token.py              ← JWT token create/verify
│   └── oauth2.py             ← Auth dependencies (get_current_user, role_required)
├── .env                      ← API keys and secrets
└── requirements.txt          ← Python dependencies
```

### How a request flows through the app:

```
Client Request
    → main.py (FastAPI app)
        → router (e.g., company.py)
            → schema validates request body
            → model interacts with database (or service calls LLM)
            → schema validates response
    → JSON Response back to client
```

---

## Phase 1: Basic CRUD APIs (No Authentication)

> Goal: Build Company and Job APIs that anyone can use (no login needed)

### Step 1: Setup Database Connection

**File: `database.py`**

- Connect to PostgreSQL using SQLAlchemy
- Create a `SessionLocal` for database sessions
- Create a `Base` class for all models to inherit from
- Create `get_db()` dependency to provide database session to routes

```python
# Key concepts:
engine = create_engine(DATABASE_URL)          # Connection to PostgreSQL
SessionLocal = sessionmaker(bind=engine)      # Factory for database sessions
Base = declarative_base()                      # Base class for models

def get_db():                                  # Dependency injection
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Step 2: Define Models (Database Tables)

**Files: `models/company.py`, `models/job.py`**

Models define the actual database table columns. Each model class = one table.

- Company has: id, name, email, phone, location
- Job has: id, title, salary, description, company_id (foreign key to Company)
- Company has a `relationship` to Job (one company → many jobs)

### Step 3: Define Schemas (Request/Response Validation)

**Files: `schemas/company.py`, `schemas/job.py`**

Schemas are Pydantic models that validate what data comes in (request) and goes out (response).

```
CompanyCreate  → what the client sends to create a company
CompanyUpdate  → what the client sends to update (all fields optional)
CompanyResponse → what the API returns (includes id + jobs list)
```

Same pattern for Job.

### Step 4: Create Routers (API Endpoints)

**Files: `routers/company.py`, `routers/job.py`**

Each router defines a set of endpoints for one resource:

| Method | Endpoint | What it does |
|--------|----------|-------------|
| POST | `/company/` | Create a new company |
| GET | `/company/` | Get all companies |
| GET | `/company/{id}` | Get one company |
| PUT | `/company/{id}` | Update a company |
| DELETE | `/company/{id}` | Delete a company |

Same pattern for `/job/` endpoints.

### Step 5: Register Routers in Main App

**File: `app/main.py`**

```python
app = FastAPI()
app.include_router(company.router)
app.include_router(job.router)
```

### Step 6: Run and Test

```bash
uvicorn app.main:app --reload
```

Open http://localhost:8000/docs to test all endpoints using Swagger UI.

---

## Phase 2: Authentication (JWT Login/Register)

> Goal: Add user registration, login, and protect Company/Job routes

### Step 1: Create User Model

**File: `models/users.py`**

- User table with: id, name, email, hashed_password, role

### Step 2: Create Auth Schemas

**File: `schemas/users.py`**

```
UserCreate    → name, email, password, role (used during registration)
UserResponse  → id, name, email, role (returned after registration, no password!)
```

**File: `schemas/token.py`**

```
Token → access_token, token_type (returned after login)
```

### Step 3: Password Hashing Utility

**File: `utils/security.py`**

Uses `bcrypt` to hash passwords before storing and verify during login.

```python
hash_password("mypassword")       → "$2b$12$..."  (hashed, stored in DB)
verify_password("mypassword", hash) → True/False   (checked during login)
```

### Step 4: JWT Token Utility

**File: `utils/token.py`**

- `create_access_token(data)` → creates a JWT with user id + role, expires in 2 hours
- `verify_access_token(token)` → decodes and validates the JWT

```python
# Token payload looks like: {"sub": "1", "role": "admin", "exp": 1234567890}
```

### Step 5: Auth Router (Register + Login)

**File: `routers/auth.py`**

| Method | Endpoint | What it does |
|--------|----------|-------------|
| POST | `/auth/register` | Create new user (hash password, save to DB) |
| POST | `/auth/login` | Verify email+password → return JWT token |

Login uses `OAuth2PasswordRequestForm` (form-encoded, field is called `username` but we send email).

### Step 6: Protect Routes with Dependencies

**File: `utils/oauth2.py`**

Two dependency functions:

```python
get_current_user    → extracts JWT from request → finds user in DB → returns user
role_required(roles) → checks if current user's role is in the allowed list
```

Usage in routers:

```python
# Anyone logged in can view
@router.get("/", ..., current_user=Depends(get_current_user))

# Only admin can create
@router.post("/", ..., current_user=Depends(role_required(["admin"])))

# Admin or HR can create jobs
@router.post("/", ..., current_user=Depends(role_required(["admin", "hr"])))
```

### Step 7: Add CORS Middleware

**File: `app/main.py`**

```python
app.add_middleware(CORSMiddleware, allow_origins=["*"], ...)
```

This allows the frontend (running on a different port) to call the backend.

---

## Phase 3: AI Chatbot APIs

> Goal: Add chat endpoints using LLMs (Gemini and Groq/LLaMA)

### Step 1: Simple LLM Service (No Memory)

**File: `services/llm_service.py`**

- Uses `langchain_google_genai` to call Gemini
- Each question is independent — no conversation history

```python
model = ChatGoogleGenerativeAI(model="gemini-2.5-flash")

def llm_response(question):
    response = model.invoke(question)
    return response.content
```

### Step 2: LangChain Career Chatbot (With Memory)

**File: `services/langchai_service.py`**

Uses LangChain's chaining pattern with session-based memory:

```
ChatPromptTemplate  →  defines the prompt structure
        |
    chain (|)       →  connects prompt → LLM
        |
RunnableWithMessageHistory  →  auto-manages conversation memory per session
        |
    ChatMessageHistory      →  stores messages in a dict (in-memory)
```

Key components:

```python
# 1. Prompt template with memory placeholder
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful career guidance assistant."),
    ("placeholder", "{chat_history}"),     # ← LangChain fills this automatically
    ("human", "{user_query}")
])

# 2. Chain: prompt → LLM
chain = prompt | llm

# 3. Memory store (dict of session_id → ChatMessageHistory)
store = {}

# 4. Wrap with memory management
chat_with_memory = RunnableWithMessageHistory(
    runnable=chain,
    get_session_history=get_history,        # ← looks up store[session_id]
    input_messages_key="user_query",
    history_messages_key="chat_history"
)
```

### Step 3: Chat Schemas

**File: `schemas/chat.py`**

```python
ChatRequest  → message (str) + session_id (str, default="default")
ChatResponse → response (str)
```

### Step 4: Chat Router

**File: `routers/chat.py`**

| Method | Endpoint | Service | Memory |
|--------|----------|---------|--------|
| POST | `/chat/ask` | Gemini (llm_service) | ❌ No memory |
| POST | `/chat/ask_career` | Groq/LLaMA (langchai_service) | ✅ Per-session memory |

### Environment Variables Needed

**File: `.env`**

```
GEMINIAPIKEY=your_gemini_key        # For /chat/ask
GROQ_API_KEY=your_groq_key          # For /chat/ask_career
SECRET_KEY=my_secret_key             # For JWT tokens
ALGORITHM=HS256                      # JWT algorithm
```

---

## How to Run

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Make sure PostgreSQL is running and database exists

# 3. Start the server
uvicorn app.main:app --reload

# 4. Open Swagger docs
# http://localhost:8000/docs
```

---

## API Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/register` | POST | None | Register a new user |
| `/auth/login` | POST | None | Login → get JWT token |
| `/company/` | GET | Login | Get all companies |
| `/company/` | POST | Admin | Create a company |
| `/company/{id}` | GET | Login | Get one company |
| `/company/{id}` | PUT | Admin | Update a company |
| `/company/{id}` | DELETE | Admin | Delete a company |
| `/job/` | GET | Login | Get all jobs |
| `/job/` | POST | Admin/HR | Create a job |
| `/job/{id}` | GET | Login | Get one job |
| `/job/{id}` | PUT | Admin/HR | Update a job |
| `/job/{id}` | DELETE | Admin/HR | Delete a job |
| `/chat/ask` | POST | None | Simple LLM chat (Gemini) |
| `/chat/ask_career` | POST | None | Career chatbot with memory (Groq) |