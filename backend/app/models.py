from sqlmodel import SQLModel , Field
from typing import Optional
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True,index=True,nullable=False)
    email: str = Field(unique=True, index=True, nullable=False)
    password_sudah_acak: str = Field(index=True, nullable=False)
    role: str = Field(default="customer",nullable=False)
    create_at: datetime = Field( default_factory=datetime.utcnow)