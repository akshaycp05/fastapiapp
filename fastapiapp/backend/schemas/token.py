from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginResponse(Token):
    name: str
    role: str