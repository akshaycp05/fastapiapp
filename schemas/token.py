from pydantic import BaseModel

class Token(BaseModel):
    token: str
    token_type: str