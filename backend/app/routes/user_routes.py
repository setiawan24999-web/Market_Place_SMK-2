
from fastapi import APIRouter , Depends, status, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from..database import get_sesion
from ..models import User
from ..schemas import UserCrete, UserOut
from datetime import datetime, timedelta
from app.routes.auth import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_HOUR, pwd_context
from jose import jwt


# seting router sebagai APIRouter
router = APIRouter(prefix="/users",tags=["users"])


# router untuk register
@router.post("/", response_model=UserOut)
def register_user(user_in: UserCrete, db:Session=Depends(get_sesion)):

    statement = select(User).where(User.email == user_in.email)
    existing = db.exec(statement).first()
    
    if  existing:
        raise HTTPException(status_code=400, detail="sudah pengguna menggunakan email ini! silahkan buat email yang lain ")
   
   
# menambahkan ke data base 
    hashead_pasword = pwd_context.hash(user_in.password)
    new_user = User(
     email = user_in.email,
     password=hashead_pasword,
     role = user_in.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user



@router.post("/login")
def user_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_sesion)):
    print(f"Mencoba login dengan username: {form_data.username}") 

    statement = select(User).where(User.email == form_data.username)
    user = db.exec(statement).first()

    # 1. Validasi User & Password
    if not user or not pwd_context.verify(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # 2. Buat Data Token (Payload) - Inilah "KTP Digital" yang tidak bisa dipalsukan
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_HOUR)
    data_token = {
        "sub": user.email,
        "user_id": user.id,
        "role": user.role,  # Role masuk ke dalam token agar aman
        "exp": expire
    }

    # 3. Bungkus jadi Token JWT
    encoded_jwt = jwt.encode(data_token, SECRET_KEY, algorithm=ALGORITHM)

    # 4. Kirim Balik ke User
    # Kita sertakan user_id dan role di luar token supaya Frontend 
    # bisa menampilkan menu yang sesuai (tapi tetap divalidasi backend nantinya)
    return {
        "access_token": encoded_jwt,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role
    }