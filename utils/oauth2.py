from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from database import get_db
from sqlalchemy import text
from sqlalchemy.orm import Session
from utils.token import verify_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    current_user = verify_access_token(token, db)
    if current_user is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    return current_user

def role_required(required_role: str):
    def role_decorator(current_user: dict = Depends(get_current_user)):
        if current_user.role != required_role:
            raise HTTPException(status_code=403, detail="Forbidden")
        return current_user
    return role_decorator
