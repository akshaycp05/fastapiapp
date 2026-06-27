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

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int):
    if job_id < 0 or job_id >= len(jobs):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return jobs[job_id]

@router.put("/{job_id}", response_model=JobResponse)
def update_job(job_id: int, job: JobUpdate):
    if job_id < 0 or job_id >= len(jobs):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    update_data = job.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields provided for update")
    jobs[job_id].update(update_data)
    return jobs[job_id]

@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(job_id: int):
    if job_id < 0 or job_id >= len(jobs):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    jobs.pop(job_id)
    return None