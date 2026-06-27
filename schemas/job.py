
from pydantic import BaseModel
from typing import Optional

class JobBase(BaseModel):
    title: str
    salary: int
    description: Optional[str] = None
    company_id: int

class JobCreate(JobBase):
    pass

class JobUpdate(JobBase):
    title: str= None
    salary: int = None
    description: Optional[str] = None
    company_id: Optional[int] = None

class JobResponse(JobBase):
    id: int
    company_id: int

    class Config:
        from_attributes = True