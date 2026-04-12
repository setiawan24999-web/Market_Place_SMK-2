

# staus toko saat ini
from typing import Optional
from fastapi import Depends , HTTPException, status,APIRouter
from sqlmodel import Session, select
from app.schemas import StoreOut, StoreCreat
from app.database import get_sesion
from app.routes.auth import get_current_user
from app.models import User, Store, storeStatus
router = APIRouter(prefix="/stores", tags=["Stores"])

@router.post("/", response_model=StoreOut)
def create_store(store_in : StoreCreat, db:Session=Depends(get_sesion), current_user: User= Depends(get_current_user)):

     statement = select(Store).where(Store.user_id == current_user.id)
     exixting_store = db.exec(statement).first()

     if exixting_store:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="anda sudah punya toko")
    
     new_store = Store(
     name=store_in.name,
     description=store_in.description,
     area=store_in.area,
     user_id=current_user.id     
)
     db.add(new_store)
     db.commit()
     db.refresh(new_store)

     return new_store


# app/routes/store.py

# app/routes/store.py

@router.patch("/{store_id}/status", response_model=StoreOut)
def update_store_status(
    store_id: int, 
    new_status: storeStatus, # Gunakan Enum storeStatus sebagai tipe data
    db: Session = Depends(get_sesion), 
    current_user: User = Depends(get_current_user)
):
    # Proteksi Admin
    if current_user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Hanya Admin yang diizinkan")

    store = db.get(Store, store_id)
    if not store:
        raise HTTPException(status_code=404, detail="Toko tidak ditemukan")

    # Update menggunakan nilai dari Enum
    store.status_store = new_status
    
    db.add(store)
    db.commit()
    db.refresh(store)
    return store

# Tambahkan ini di app/routes/store.py

@router.get("/", response_model=list[StoreOut])
def get_all_stores(db: Session = Depends(get_sesion), current_user: User = Depends(get_current_user)):
    # 1. Cek dulu apakah yang minta data ini adalah Admin
    if current_user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Hanya Admin yang bisa melihat semua toko")

    # 2. Ambil semua data toko dari database
    statement = select(Store)
    stores = db.exec(statement).all()
    
    return stores


# app/routes/store.py

@router.get("/my-store", response_model=Optional[StoreOut])
def get_my_store(
    db: Session = Depends(get_sesion), 
    current_user: User = Depends(get_current_user)
):
    # Mencari toko berdasarkan user_id yang sedang login
    statement = select(Store).where(Store.user_id == current_user.id)
    store = db.exec(statement).first()
    
    if not store:
        raise HTTPException(status_code=404, detail="Kamu belum punya toko")
    
    return store 