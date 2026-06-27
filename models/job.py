from sqlalchemy import Column, Integer, String, Enum, ForeignKey, relationship
from models.company import Company
from database import Base, engine, SessionLocal

Base = declarative_base()

class Job(Base):
    __tablename__ = 'jobs'

    id = Column(Integer, nullable=False, index=True)
    title = Column(String,nullable=False)
    description = Column(String)
    salary = Column(Integer)
    company_id = Column(Integer, ForeignKey('companies.id'))
    company = relationship("Company", back_populates="jobs")