from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt   ,JWTError
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, status, HTTPException

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# ini untuk  membuat password acak dana veryfikasi siap pakai 
def acak_password(password: str) -> str:
    return pwd_context.hash(password)
def feryfikasi_pasword(plain_password: str, hashed_password:str) -> str:
    return pwd_context.verify(plain_password, hashed_password)

SECRET_KEY = "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Odio, consectetur praesentium. Dolor 7d9f2a1b5c8e4d3f2a1b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d expedita tempora quia magnam, perspiciatis cumque molestiae voluptatum voluptate cum quaerat dicta officia voluptatem distinctio excepturi veniam omnis?za"
ALGORITMANYA = "HS256"
KADALUARSA_TOKENNYA = 60

def buatkan_hak_akses_token(data: dict):
    to_encode = data.copy()
    kadaluarsa = datetime.utcnow() + timedelta (minutes=KADALUARSA_TOKENNYA)
    to_encode.update({"exp":kadaluarsa})
    encode_jwt = jwt.encode(to_encode, SECRET_KEY, ALGORITMANYA)
    return encode_jwt


oauth2_scheme =  OAuth2PasswordBearer(tokenUrl="users/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="TOKEN TIDDAK VALID ATAU SUDAH KADALUARSA",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        pyload = jwt.decode(token, SECRET_KEY, ALGORITMANYA)
        username: str =pyload.get("sub")
        if username is None:
            return username                  

    except JWTError:
         raise credentials_exception
 