from fastapi import APIRouter, HTTPException, status
from schemas.job import JobCreate, JobUpdate, JobResponse

router = APIRouter(prefix="/job", tags=["job"])

jobs: list[dict] = []
next_job_id = 1

@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(job: JobCreate):
    global next_job_id
    job_data = job.model_dump()
    job_data["id"] = next_job_id
    next_job_id += 1
    jobs.append(job_data)
    return job_data

@router.get("/", response_model=list[JobResponse])
def get_all_job():
    return jobs

def find_job(job_id: int) -> dict | None:
    return next((job for job in jobs if job["id"] == job_id), None)

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int):
    job = find_job(job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return job

@router.put("/{job_id}", response_model=JobResponse)
def update_job(job_id: int, job: JobUpdate):
    stored_job = find_job(job_id)
    if not stored_job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    update_data = job.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields provided for update")
    stored_job.update(update_data)
    return stored_job

@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(job_id: int):
    job = find_job(job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    jobs.remove(job)
    return None