# 🐛 Full-Stack Debugging & Troubleshooting Guide

This guide outlines common errors in the **FastAPI + React** stack, how to identify them, and how to effectively use print statements and browser tools to debug them.

---

## 🛠️ 1. The Core Debugging Workflow
Whenever something doesn't work, follow the path of the request:

```
[ React Frontend UI ] ────► [ Browser DevTools Network ] ────► [ FastAPI Backend Logs ]
   Check Console for            Inspect Request Headers,           Watch Terminal Output,
  Javascript exceptions.        Body, and Status Codes.            Tracebacks & Print statements.
```

---

## 🔐 2. How to Debug `401 Unauthorized` Errors
A `401 Unauthorized` status code means the server refused to authenticate the request. In this project, this usually means the **JWT token** is missing, expired, or invalid.

### Step-by-Step Checklist to Identify `401`:
1. **Check Browser LocalStorage:**
   * Open Chrome/Firefox DevTools (`F12`).
   * Go to **Application** (Chrome) or **Storage** (Firefox) → **Local Storage** → Select your site.
   * Verify if a token key (like `token` or `access_token`) exists and contains a value.
2. **Inspect the Outgoing Request Headers:**
   * Go to the **Network** tab in DevTools.
   * Trigger the action that fails.
   * Click on the failing request.
   * Look at the **Headers** (specifically **Request Headers**).
   * Check for the header: `Authorization: Bearer <your-token-string>`.
     * *If missing:* Your React code is not attaching the token.
     * *If present:* The backend is rejecting the token (wrong `SECRET_KEY`, wrong `ALGORITHM`, or token expired).

---

## 🖨️ 3. How to Use Print Statements / Logging

### 🐍 A. In Python (FastAPI Backend)
You can use standard `print()` statements to inspect variables on the backend.

```python
@router.post("/company")
async def create_company(company_data: CompanyCreate, db: AsyncSession = Depends(get_db)):
    # 1. Print statement to inspect the incoming payload
    print("--- INCOMING COMPANY PAYLOAD ---")
    print(f"Data received: {company_data}")
    print(f"Data dictionary: {company_data.model_dump()}")
    
    # 2. Print variables inside processing logic
    new_company = Company(**company_data.model_dump())
    print(f"Instantiated SQLAlchemy model: {new_company}")
    
    db.add(new_company)
    await db.commit()
    return new_company
```

#### How to see `print()` output:
* **If running locally (`uvicorn`):** Look directly at the terminal window where uvicorn is running.
* **If running in Docker Compose:** Run the logs command to follow the backend container's output:
  ```bash
  docker-compose logs -f backend
  ```

---

### ⚛️ B. In Javascript / TypeScript (React Frontend)
Use `console.log()` to check variables and responses directly in the browser's developer console.

```javascript
const fetchJobs = async () => {
  try {
    const token = localStorage.getItem("token");
    console.log("Retrieved token from storage:", token); // Check if token exists

    const response = await axios.get("http://localhost:8000/job", {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("API Response Data:", response.data); // Inspect response payload
    setJobs(response.data);
  } catch (error) {
    console.error("Failed to fetch jobs:", error); // Inspect error objects
  }
};
```

#### How to see `console.log()` output:
1. Open your browser.
2. Right-click anywhere and select **Inspect** (or press `F12`).
3. Click on the **Console** tab.

---

## ⚠️ 4. Identifying Other Common Error Codes

| Status Code | Meaning | What is usually wrong? | How to fix |
| :--- | :--- | :--- | :--- |
| **`422 Unprocessable Entity`** | Data validation failed | The frontend sent a payload that doesn't match the Pydantic schema on the backend (e.g., missing required fields, wrong data type). | Look at the **Network Tab → Response** payload. FastAPI returns details about exactly which field failed validation. |
| **`403 Forbidden`** | Permission denied | The user is authenticated but does not have the required role (e.g., a Candidate attempting to call an Admin API). | Verify the user role decoded from the JWT token matches the backend route dependency. |
| **`500 Internal Server Error`** | Server-side crash | An unhandled exception occurred in the Python code (e.g., database connection down, `NoneType` attribute access). | Check the **backend terminal/Docker logs** for a traceback (the red block of error messages showing line numbers of the crash). |
| **`Network Error` / `ERR_CONNECTION_REFUSED`** | Server unreachable | The React app cannot reach the FastAPI server. | 1. Check if the backend is running.<br>2. Check if the port matches (`8000` vs `8080`).<br>3. Check if CORS is configured correctly in `main.py`. |

---

## 🔤 5. Debugging Spelling, Case, and File Errors

These are the most common syntax issues encountered during full-stack integration:

### A. Python Import Errors (`ModuleNotFoundError` or `ImportError`)
When Python complains it cannot find a file or package, it is usually because:
1. **Wrong Directory Structure:** You imported from `app.models` instead of `models`, or vice versa.
2. **Missing `__init__.py`:** In older Python versions, folders without `__init__.py` are not recognized as packages.
3. **Execution Context:** You ran the script from a subfolder instead of the project root.
   * *Rule of thumb:* Always run commands like `uvicorn app.main:app` or `pytest` from the `/backend` folder directory.
4. **Missing Python Path:** If Alembic throws this error, check if the project directory is pushed to system path in `alembic/env.py`:
   ```python
   import sys
   import os
   sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), '..')))
   ```

### B. Spelling Mismatches (Frontend vs. Backend)
If your API endpoints send data but return errors or empty records, check for spelling discrepancies:
* **JSON Payload vs. Pydantic Model:** 
  * Frontend sends: `axios.post('/job', { companyid: 1 })`
  * Backend expects: `class JobCreate(BaseModel): company_id: int`
  * *Result:* The backend gets `None` or throws a `422` error because `companyid` does not match `company_id` (note the underscore).
* **Endpoint URL Typos:**
  * Backend: `@router.post("/companies")`
  * Frontend: `axios.post("/company")`
  * *Result:* `404 Not Found` (endpoint does not exist).
* *How to debug:* Print the keys in Python (`print(company_data.model_dump().keys())`) and check the **Network tab** payload to verify keys match character-for-character.

### C. File Path & Case Sensitivity Errors (`FileNotFoundError`)
* **Case Sensitivity (Docker/Linux vs. Windows):**
  * Windows filesystem is case-insensitive: `import models.Job` and `import models.job` will both work.
  * Linux and Docker filesystems are **case-sensitive**: `import models.Job` will fail if the file is named `job.py`.
  * *Fix:* Always keep all file names lowercase and verify imports match exact casing.
* **Relative Path Gotchas:**
  * If your code reads a local file using `open("config.json")`, it resolves relative to the directory where you ran the python command, *not* where the python script resides.
  * *Fix:* Build paths dynamically using the current file's absolute path:
    ```python
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(BASE_DIR, "config.json")
    ```

---

## 🚀 6. Common Beginner Pitfalls: NameError, Libraries, and Alembic

These are specific error messages and situations that frequently trip up developers:

### A. NameError: `name 'x' is not defined`
This means Python encountered a variable, class, or function name it doesn't recognize.
* **Why it happens:**
  1. **Forgotten Imports:** You used a model like `User` or utility like `Depends` but forgot to import it at the top of the file.
  2. **Scope issues:** You defined a variable inside a function but tried to access it outside that function.
  3. **Spelling Typos:** You defined `current_user` but later typed `currrent_user` (three 'r's).
* *Fix:* Look at the line number in the traceback, scroll to the top of the file to confirm the import exists, and check character-for-character spelling.

### B. ModuleNotFoundError: `No module named 'x'`
This means Python cannot find the library or dependency you are importing.
* **Why it happens:**
  1. **Inactive Virtual Environment:** You installed dependencies, but your virtual environment (`env` or `venv`) is not activated, so Python is looking in the global system packages.
     * *Fix:* Activate your environment:
       * **Linux/macOS:** `source env/bin/activate`
       * **Windows (Git Bash/WSL):** `source env/Scripts/activate`
       * **Windows (Command Prompt):** `env\Scripts\activate.bat`
  2. **Dependency Not Installed:** You imported a library (like `passlib` or `jose`) but didn't run `pip install passlib`.
     * *Fix:* Install the library AND append it to your `requirements.txt` file so it builds in Docker:
       ```bash
       pip install passlib
       pip freeze > requirements.txt
       ```

### C. Alembic Migration Errors
Alembic keeps track of database changes. Here is how to fix the three most common migration problems:

#### 1. "Can't locate revision identified by 'x'"
* **Why it happens:** Your database's migration table (`alembic_version`) lists a revision hash that doesn't exist in your `alembic/versions/` folder (usually happens after deleting/merging migration files manually).
* *Fix:* Connect to your database and force update the version to match your latest local migration script, or reset it:
  ```bash
  # Delete the tracking version (forces Alembic to start fresh)
  psql -U postgres -d postgres -c "DROP TABLE alembic_version;"
  
  # Then stamp the database with the current version
  alembic stamp head
  ```

#### 2. Alembic Autogenerate is not detecting new models/tables
* **Why it happens:** Alembic doesn't automatically scan your codebase. It only knows about models imported in `alembic/env.py`.
* *Fix:* Open `backend/alembic/env.py` and ensure your models are imported *before* `target_metadata = Base.metadata`:
  ```python
  from database import Base
  from models.company import Company
  from models.job import Job
  from models.users import User
  target_metadata = Base.metadata
  ```

#### 3. "Table 'x' already exists"
* **Why it happens:** You created a table manually (or ran a script) and then tried to run `alembic upgrade head`, which tries to create the same table again.
* *Fix:* 
  * If the database is empty or has test data you don't mind losing, drop the database and let Alembic recreate it:
    `alembic stamp head` can also tell Alembic that the current state is already migrated without running the sql script.
  * Alternatively, run `alembic stamp head` to mark the current database schema as up-to-date.