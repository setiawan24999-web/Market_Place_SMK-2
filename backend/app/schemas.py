from pydantic import BaseModel , EmailStr
from typing import Optional, List
from datetime import datetime
from .models import Role

# user schemas
class UserCrete(BaseModel):
    email: EmailStr
    password: str
    role: Optional[Role] = Role.USER
   
class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: Role
    is_active: bool


# store schemas
class StoreCreat(BaseModel):
    name:str
    description: str
    area: str


class StoreOut(BaseModel):
    id: int
    user_id:int
    name: str
    description: str
    area: str
    status_store: str
    creat_at: datetime

# product schemas
class ProductCreate(BaseModel):
    name:str
    price: float
    stock: int
    image_url: Optional[str] = None
# Di file app/schemas.py
class ProductOut(BaseModel):
    id: int
    name: str
    price: float
    stock: int
    image_url: Optional[str]
    store_id: int
    owner_user_id: int  # <-- TAMBAHKAN BARIS INI
# chat achemas
class ChatCreate(BaseModel):
    receiver_id: int
    message: str


class ChatOut(BaseModel):
    id:int
    sender_id: int
    receiver_id: int
    message: str
    timestamp: datetime
    #  untuk tau siapa yang mengirm pesan nya 
    sender: Optional[UserOut]


    class config:
        from_atributes = True