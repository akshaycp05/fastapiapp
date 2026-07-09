from fastapi import APIRouter,HTTPException,Depends,status
from schemas.job import JobCreate, JobUpdate,JobResponse
from models.job import Job
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from database import get_db
from sqlalchemy.orm import selectinload
from utils.oauth2 import role_required,get_current_user

router = APIRouter(prefix="/job", tags=["job"])

@router.post("/",status_code=status.HTTP_201_CREATED,response_model=JobResponse)
async def create_job(job: JobCreate,db:AsyncSession=Depends(get_db),current_user=Depends(role_required(["admin","hr"]))):
    try:
        db_job = Job(**job.dict())
        db.add(db_job)
        await db.commit()
        await db.refresh(db_job)
        return db_job
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error creating job: {str(e)}")

@router.get("/",status_code=status.HTTP_200_OK,response_model=list[JobResponse])
async def get_all_job(db:AsyncSession=Depends(get_db),current_user=Depends(get_current_user)):
    try:
        result = await db.execute(select(Job))
        jobs = result.scalars().all()
        return jobs
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error retrieving jobs: {str(e)}")

@router.get("/{job_id}",status_code=status.HTTP_200_OK,response_model=JobResponse)
async def get_job(job_id: int,db:AsyncSession=Depends(get_db),current_user=Depends(get_current_user)):
    try:
        result = await db.execute(select(Job).filter(Job.id == job_id))
        job = result.scalars().first()
        if not job:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
        return job
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error retrieving job: {str(e)}")

@router.put("/{job_id}",status_code=status.HTTP_201_CREATED,response_model=JobResponse)
async def update_job(job_id: int, job: JobUpdate,db:AsyncSession=Depends(get_db),current_user=Depends(role_required(["admin","hr"]))):
    try:
        result = await db.execute(select(Job).filter(Job.id == job_id))
        db_job = result.scalars().first()
        if not db_job:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
        for key, value in job.dict().items():
            setattr(db_job, key, value)
        await db.commit()
        await db.refresh(db_job)
        return db_job
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error updating job: {str(e)}")

@router.delete("/{job_id}",status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(job_id: int,db:AsyncSession=Depends(get_db),current_user=Depends(role_required(["admin","hr"]))):
    try:
        result = await db.execute(select(Job).filter(Job.id == job_id))
        db_job = result.scalars().first()
        if not db_job:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
        await db.delete(db_job)
        await db.commit()
        return {"message": "Job deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error deleting job: {str(e)}")

# @router.get("/")
# def read_job():
#     return {"job": "Job root"}

# @router.get("/{job_id}")
# def read_job(job_id: int):
#     return {"job_id": job_id}