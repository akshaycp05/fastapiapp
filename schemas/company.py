from pydantic import BaseModel
from typing import Optional

class CompanyBase(BaseModel):
    name: str
    email: str
    phone: str
    

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(CompanyBase):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None