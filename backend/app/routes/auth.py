from fastapi import status, HTTPException, Depends
from sqlmodel import Session
from fastapi.security import OAuth2PasswordBearer
from app.models import User
from jose import JWTError, jwt
from app.database import get_sesion
from passlib.context import CryptContext
# Radar untuk mencari token di Header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlmodel import Session, select
from ..database import get_sesion # Pastikan typo 'sesion' sesuai file kamu
from ..models import User

# Ini adalah 'radar' yang mencari tulisan "Authorization: Bearer <token>" di header


# configurasi pengacakan password
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# router dan logika registernya

SECRET_KEY = "Lorem ipsum dolor, sit amet consectetur adipisicing elit. 56 22i2$##@@ust3o illo provident facere, quo culpa ipsa asperiores porro quam nobis qu8656545ibusdam et, commodi exercitationem, laudantium necessit$$$tit;;;;bus recu64667sandae! Similique ma78m sunt nam id!3"
ALGORITHM = "HS256"
ACCESS_TOKEN_HOUR = 60




# Pastikan tokenUrl mengarah ke path login yang tepat
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_sesion)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # 1. Decode token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        
        if email is None:
            raise credentials_exception
            
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Token sudah tidak berlaku atau salah"
        )

    # 2. Cari user di database berdasarkan email dari token
    statement = select(User).where(User.email == email)
    user = db.exec(statement).first()

    # 3. Validasi apakah user benar-benar ada
    if user is None:
        raise credentials_exception
        
    # 4. Kembalikan objek user (bukan string)
    return user