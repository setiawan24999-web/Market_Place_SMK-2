from pydantic import BaseModel, EmailStr
from typing import Optional

class Userbase(BaseModel):
    username: str
    email: EmailStr
    role: Optional[str]= "costumer"

class UserCreate(Userbase):
    password: str

class UserOut(Userbase):
    id: int

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    acces_token: str
    token_type: str

    class config:
        from_stributes = True

