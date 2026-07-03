from fastapi import APIRouter,HTTPException,Depends,status
from schemas.company import CompanyCreate, CompanyUpdate, CompanyResponse
from models.company import Company
from sqlalchemy.orm import Session
from database import get_db,SessionLocal
from utils.oauth2 import role_required,get_current_user
router = APIRouter(prefix="/company",tags=["company"])

@router.post("/",status_code=status.HTTP_201_CREATED,response_model=CompanyResponse)
def create_company(company: CompanyCreate,db:Session=Depends(get_db),current_user=Depends(role_required(["admin"]))):
    db_company=Company(**company.dict())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company


@router.get("/",status_code=status.HTTP_200_OK,response_model=list[CompanyResponse])
def get_all_company(db:Session=Depends(get_db),current_user=Depends(get_current_user)):
    companies = db.query(Company).all()
    return companies

@router.get("/{company_id}",status_code=status.HTTP_200_OK,response_model=CompanyResponse)
def get_company(company_id: int,db:Session=Depends(get_db),current_user=Depends(get_current_user)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    return company

@router.put("/{company_id}",status_code=status.HTTP_201_CREATED)
def update_company(company_id: int, company: CompanyUpdate,db:Session=Depends(get_db),current_user=Depends(role_required(["admin"]))):
    db_company = db.query(Company).filter(Company.id == company_id).first()
    if not db_company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    for key, value in company.dict().items():
        setattr(db_company, key, value)
    db.commit()
    db.refresh(db_company)
    return db_company

@router.delete("/{company_id}",status_code=status.HTTP_204_NO_CONTENT)
def delete_company(company_id: int,db:Session=Depends(get_db),current_user=Depends(role_required(["admin"]))):
    db_company = db.query(Company).filter(Company.id == company_id).first()
    if not db_company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    db.delete(db_company)
    db.commit()
    return {"message": "Company deleted successfully"}

# @router.get("/")
# def read_company():
#     return {"company": "Company root"}

# @router.get("/{company_id}")
# def read_company(company_id: int):
#     return {"company_id": company_id}