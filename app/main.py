from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from database import Base, engine
import models.job
import models.company
from routers import company, job
from models import company as company_model, job as job_model

app = FastAPI()
print("engine is :", engine)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "message": "Unprocessable Content - invalid request body",
            "errors": exc.errors(),
        },
    )

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