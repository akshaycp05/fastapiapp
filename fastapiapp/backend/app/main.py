from fastapi import FastAPI
from routers import company,job,auth,chat,rag
from database import Base
from models import job as job_model,company as company_model,users as user_model
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    from database import engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(auth.router)
app.include_router(company.router)
app.include_router(job.router)
app.include_router(chat.router)
app.include_router(rag.router)
@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/about")
def read_about():
    return {"about": "This is about page"}

@app.get("/contact")
def read_contact():
    return {"contact": "This is contact page"}
#  Albattrosdip
# steps---> 
#  1.postgres drivers
# 2.servers
# 3. registration -> enterprise db->first two options
# student_db>database>schemas>tables>right click>query tool