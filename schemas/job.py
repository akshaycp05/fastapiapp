from typing import Optional
from pydantic import BaseModel

class JobBase(BaseModel):
    title: str
    salary: int
    description: Optional[str] = None
    company_id: int

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    title: Optional[str] = None
    salary: Optional[int] = None
    description: Optional[str] = None
    company_id: Optional[int] = None