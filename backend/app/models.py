from sqlmodel import SQLModel ,Field , Relationship
from typing import List , Optional
from datetime import datetime
from enum import Enum


class Role(str , Enum):
    USER = "user"
    SELLER = "seller"
    ADMIN ="admin"

class storeStatus(str, Enum):
    PENDING= "pending"
    ACTIVE= "active"
    INACTIVE= "inactive"

class User(SQLModel,table=True):
    id:Optional[int] =Field(default=None, primary_key=True)
    email:str =Field(unique=True, index=True, nullable=False)
    password: str =Field(nullable=False)
    role: Role =Field(default=Role.USER)
    is_active: bool =Field(default=True)
    # relation
    store: Optional["Store"] = Relationship(back_populates="owner")
    orders: List["Order"] = Relationship(back_populates="buyer")


class Store(SQLModel, table=True):
    id:Optional[int] =Field(default=None, primary_key=True)
    user_id: int =Field(default=None, foreign_key="user.id", unique=True)
    name:str =Field(nullable=False)
    description : Optional[str] = None
    area: str =Field(nullable=False)
    status_store: storeStatus =Field(default=storeStatus.PENDING)
        # date create at   
    creat_at:datetime =Field(default_factory=datetime.utcnow)
    expire_at: Optional[datetime] = None
        # relation
    owner: "User" = Relationship(back_populates="store")
    produk : List["Product"] =Relationship(back_populates="store")



class Product(SQLModel, table=True):
    id:Optional[int]= Field(default=None, primary_key=True)
    store_id: int =Field(foreign_key="store.id")
    name:str
    price:float
    stoc: str
    image_url: Optional[str] =None
        # relation
    store: "Store" = Relationship(back_populates="produk")

class Order(SQLModel, table=True):
      id:Optional[int] =Field(default=None, primary_key= True)
      User_id:Optional[int] =Field(foreign_key="user.id")
      Store_id:Optional[int] =Field(foreign_key="store.id")
      product_id: Optional[int] = Field(foreign_key="product.id")
      total_price: float
      status: str =Field(default="pending")
      create_at:datetime =Field(default_factory=datetime.utcnow)
        # relation
      buyer: "User" = Relationship(back_populates="orders")

class ChatMessage(SQLModel, table=True):
     id:Optional[int] =Field(default=None,primary_key=True)
     sender_id: int =Field(foreign_key="user.id")
     receiver_id:int = Field(foreign_key="user.id")
     message: str
     timestamp: datetime=Field(default_factory=datetime.utcnow)
        # relation
     sender: "User" = Relationship(sa_relationship_kwargs={"foreign_keys": "ChatMessage.sender_id"})
     receiver: "User" = Relationship(sa_relationship_kwargs={"foreign_keys": "ChatMessage.receiver_id"})