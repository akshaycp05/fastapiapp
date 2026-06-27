from fastapi import FastAPI
from database import Base,engine
from routers import company,job

app = FastAPI()
print("engine is :",engine)

Base.metadata.create_all(bind=engine)

app.include_router(company.router)
app.include_router(job.router)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/about")
def read_about():
    return {"About": "This is about page"}

@app.get("/contact")
def read_contact():
    return {"Contact": "This is contact page"}