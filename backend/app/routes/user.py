
from fastapi import APIRouter , Depends, HTTPException, status
from sqlmodel import Session, select
from app.database import get_sesion
from app.models import User
from app.schemas import UserOut, UserCreate, Token,UserLogin
from app.routes.auth import acak_password ,feryfikasi_pasword, buatkan_hak_akses_token
from app.routes.auth import get_current_user


#    membuat router untuk register
router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/register", response_model=UserOut)
def register_user(user_data:UserCreate, db:Session=Depends(get_sesion)):
    statusnya = select(User).where((User.username == user_data.username) | (User.email == user_data.email))
    hasilnya = db.exec(statusnya).first()

    if hasilnya:
        raise HTTPException(status_code=status,detail="sudah ada yang duluan")
    
    accak = acak_password(user_data.password)
    user_baru = User (
        username=user_data.username,
        email=user_data.email,
        password_sudah_acak=accak,
        role=user_data.role
    )
    db.add(user_baru)
    db.commit()
    db.refresh(user_baru)
    return user_baru

@router.post("/login",response_model=Token)
def login(user_data: UserLogin, db:Session=Depends(get_sesion)):
    user = db.exec(select(User).where(User.username == user_data.username)).first()
    if not user:
        raise HTTPException(status_code=400,detail="username salah")
    if not feryfikasi_pasword(user_data.password,user.password_sudah_acak):
        raise HTTPException(status_code=400,detail="password salah")
    acces_token = buatkan_hak_akses_token(data={"sub":user.username})
    return {"acces_token":acces_token, "token_type":"bearer"}

@router.get("/me", response_model=UserOut)
def get_my_profile(current_username:str = Depends(get_current_user), db:Session=Depends(get_sesion)):
    user2 = db.exec((User).where(User.username == current_username)).first()
    if not user2:
        raise HTTPException(status_code=450,detail="tidak sesuai")
    return user2


# --- 2. GET Semua User (Melihat daftar orang di Marketplace) ---
@router.get("/all", response_model=list[UserOut])
def get_all_users(db: Session = Depends(get_sesion)):
    users2 = db.exec(select(User)).all()
    return users2


@router.get("/{user_id}", response_model=UserOut)
def get_user_by_id(user_id: int, db: Session = Depends(get_sesion)):
    # Mencari user di database yang ID-nya cocok
    user3 = db.get(User, user_id)
    
    # Jika ID tidak ditemukan, beri tahu browser (Error 404)
    if not user3:
        raise HTTPException(status_code=404, detail=f"User dengan ID {user_id} tidak ditemukan")
    
    return user3




# from fastapi import APIRouter ,Depends, HTTPException, status
# from sqlmodel import Session, select
# from app.database import get_sesion
# from app.models import User
# from app.schemas import UserOut, UserCreate, Token,UserLogin
# from app.routes.auth import acak_password ,feryfikasi_pasword, buatkan_hak_akses_token
# from app.routes.auth import get_current_user


#             # ROUTER FOR REGISTER
#             # ROUTER FOR REGISTER
#             # ROUTER FOR REGISTER

# router = APIRouter(prefix="/users", tags=["Users"])

# @router.post("/register", response_model=UserOut)
# def register_user(user_data: UserCreate, db: Session = Depends(get_sesion)):
#     statusnya = select(User).where(
#         (User.username == user_data.username) | (User.email == user_data.email) 
#     )
#     hasilnya = db.exec(statusnya).first()

#     if hasilnya:
#         raise HTTPException(  status_code=status.HTTP_400_BAD_REQUEST, 
#             detail="Username atau Email sudah terdaftar!")
    
#     accak = acak_password(user_data.password)
#     user_baru = User  (
#         username=user_data.username,
#         email=user_data.email,
#         password_sudah_acak=accak,
#         role=user_data.role
#     )
#     db.add(user_baru)
#     db.commit()
#     db.refresh(user_baru)
#     return user_baru


#             # ROUTER FOR LOGIN
#             # ROUTER FOR LOGIN
#             # ROUTER FOR LOGIN

# @router.post("/login", response_model=Token)
# def login(user_data:UserLogin , db: Session=Depends(get_sesion) ):
#     user = db.exec(select(User).where(User.username == user_data.username)).first()
#     if not user:
#         raise HTTPException(status_code=400, detail="usernama salah!")
#     if not feryfikasi_pasword(user_data.passworr, user.password_sudah_acak):
#         raise HTTPException(status_code=400, detail="password salah")
    
#     acces_token = buatkan_hak_akses_token(data={"sub": user.username})
#     return {"acces_token": acces_token, "token_type": "bearer"}



#             #  ROUTER FOR GET DATE 
#             #  ROUTER FOR GET DATE 
#             #  ROUTER FOR GET DATE 

# @router.get("/me", response_model=UserOut)
# def get_my_profile(current_username: str = Depends(get_current_user), db: Session = Depends(get_sesion)):
#     user2 = db.exec(select(User).where(User.username == current_username)).first()
#     return user2

# # --- 2. GET Semua User (Melihat daftar orang di Marketplace) ---
# @router.get("/all", response_model=list[UserOut])
# def get_all_users(db: Session = Depends(get_sesion)):
#     users2 = db.exec(select(User)).all()
#     return users2


# @router.get("/{user_id}", response_model=UserOut)
# def get_user_by_id(user_id: int, db: Session = Depends(get_sesion)):
#     # Mencari user di database yang ID-nya cocok
#     user3 = db.get(User, user_id)
    
#     # Jika ID tidak ditemukan, beri tahu browser (Error 404)
#     if not user3:
#         raise HTTPException(status_code=404, detail=f"User dengan ID {user_id} tidak ditemukan")
    
#     return user3