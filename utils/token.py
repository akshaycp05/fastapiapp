from jose import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
from models import users
from schemas.token import Token
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

def create_access_token(data: dict, expires_delta: timedelta = timedelta(hours=2)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, key=SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_access_token(token: str, db: Session=Depends(get_db)):
    to_decode = jwt.decode(token, key=SECRET_KEY, algorithms=[ALGORITHM])
    current_user = db.query(models.users).filter(models.users.id == to_decode.get("user_id")).first()
    if not current_user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return current_user
