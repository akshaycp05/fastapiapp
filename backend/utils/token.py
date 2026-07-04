from jose import jwt
from datetime import datetime,timedelta
from schemas.token import Token
from dotenv import load_dotenv
import os
from models import user
from fastapi import Depends,HTTPException
from sqlalchemy.orm import Session
from database import get_db
load_dotenv()
SECRET_KEY=os.getenv("SECRET_KEY")
ALGORITHM=os.getenv("ALGORITHM")

def create_access_token(data:dict,expires_delta:timedelta=timedelta(hours=2)):
    to_encode=data.copy()
    expire=datetime.now()+expires_delta
    to_encode.update({"exp":expire})
    encoded_jwt=jwt.encode(to_encode,key=SECRET_KEY,algorithm=ALGORITHM)
    return encoded_jwt
def verify_access_token(token:str):
    try:
        to_decode=jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
        return to_decode
    except Exception as e:
        raise HTTPException(status_code=401,detail="Invalid credentials")
    