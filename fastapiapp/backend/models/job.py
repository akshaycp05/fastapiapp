from sqlalchemy import Column,Integer,String,Enum,ForeignKey
from sqlalchemy.orm import relationship
from models.company import Company
from database import Base,engine,SessionLocal


class Job(Base):
    __tablename__="jobs"
    id = Column(Integer,primary_key=True,index=True)
    title = Column(String,nullable=False)
    description = Column(String)
    salary = Column(Integer)
    company_id = Column(Integer,ForeignKey("companies.id"))
    company = relationship("Company",back_populates="jobs")