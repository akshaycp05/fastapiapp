from sqlalchemy import Column,Integer,String,Enum
from database import Base,engine,SessionLocal
from sqlalchemy.orm import relationship

class Company(Base):
    __tablename__="companies"
    id = Column(Integer,primary_key=True,index=True)
    name = Column(String,nullable=False,index=True)
    email = Column(String,unique=True)
    phone = Column(String,unique=True)
    location = Column(String)
    jobs = relationship("Job",back_populates="company")