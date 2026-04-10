from fastapi import Depends ,status, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext
from datetime import datetime, timedelta

pwd_contex = CryptContext(schemes=["bcrypt"], deprecated="auto")
# fungsi untuk acak dan periksa password 
def acak_password(password: str) -> str:
    return pwd_contex.hash(password)
def feryfikasi_pasword(plain_passwod:str , hashead_password:str)-> str:
    return pwd_contex.verify(plain_passwod, hashead_password)



# fungsi buatkan token toko
SECRET_KEY = "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Odio, consectetur praesentium. Dolor 7d9f2a1b5c8e4d3f2a1b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d expedita tempora quia magnam, perspiciatis cumque molestiae voluptatum voluptate cum quaerat dicta officia voluptatem distinctio excepturi veniam omnis?za"
ALGORITMA_PENGACAKAN = "HS256"
KADALUARSA = 60
def buatkan_hak_akses(data:dict):
    untuk_diacak = data.copy()
    kadaluarsa = datetime.utcnow()+ timedelta(minutes=KADALUARSA)
    untuk_diacak.update({"exp": kadaluarsa})
    jwt_acak = jwt.encode(untuk_diacak, SECRET_KEY, ALGORITMA_PENGACAKAN)
    return jwt_acak


     
deteksi_token =  OAuth2PasswordBearer(tokenUrl="users/login")

def get_current_user(token: str = Depends(deteksi_token)):
    try:
        # 1. Bongkar token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITMA_PENGACAKAN])
        username: str = payload.get("sub")
        
        # 2. Pastikan username TIDAK boleh kosong
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Kredensial tidak valid"
            )
        return username 
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="TOKEN TIDAK VALID ATAU SUDAH KADALUARSA",
            headers={"WWW-Authenticate": "Bearer"},
        )

