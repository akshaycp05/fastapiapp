from fastapi import APIRouter

router = APIRouter(prefix="/job", tags=["job"])

@router.get("/")
def read_job():
    return {"job": "job root"}

@router.get("/{job_id}")
def read_job_by_id(job_id: int):
    return {"job_id": job_id}