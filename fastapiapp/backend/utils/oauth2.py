from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from utils.token import verify_access_token
from models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    user_info = verify_access_token(token)

    # Convert JWT subject to integer
    user_id = int(user_info["sub"])

    result = await db.execute(
        select(User).filter(User.id == user_id)
    )
    current_user = result.scalar_one_or_none()

    if current_user is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return current_user


def role_required(roles: list):
    normalized_roles = [r.lower() for r in roles]

    def role_decorator(current_user=Depends(get_current_user)):
        user_role = getattr(current_user, "role", "").lower()

        if user_role not in normalized_roles:
            raise HTTPException(status_code=403, detail="Access denied")

        return current_user

    return role_decorator