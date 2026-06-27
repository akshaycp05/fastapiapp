from SQLalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
from database import Base, engine, SessionLocal

Base = declarative_base()

class Company(Base):
    __tablename__ = 'companies'

    id = Column(Integer, nullable=False, index=True)
    name = Column(String, unique=True, index=True)
    email = Column(String, unique=True)
    phone = Column(String, unique=True)
    jobs = relationship("Job", back_populates="company")
