from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from app.database import get_sesion 
from app.models import Product, Store, User
from app.schemas import ProductCreate, ProductOut 
from app.routes.auth import get_current_user 

router = APIRouter(prefix="/products", tags=["Products"])

# --- 1. GET ALL PRODUCTS (FOR HOMEPAGE) ---
@router.get("/", response_model=List[ProductOut])
def get_all_products(db: Session = Depends(get_sesion)):
    # Kita gunakan join ke Store agar bisa ambil user_id pemiliknya
    statement = select(Product, Store.user_id).join(Store, Product.store_id == Store.id)
    results = db.exec(statement).all()
    
    out_products = []
    for p, owner_id in results:
        out_products.append(ProductOut(
            id=p.id,
            name=p.name,
            price=p.price,
            stock=int(p.stoc),
            image_url=p.image_url,
            store_id=p.store_id,
            # KUNCI: Kirim ID pemilik asli ke Frontend
            owner_user_id=owner_id 
        ))
    return out_products

# --- 2. GET SINGLE PRODUCT DETAIL ---
@router.get("/{product_id}", response_model=ProductOut)
def get_product_detail(product_id: int, db: Session = Depends(get_sesion)):
    statement = select(Product, Store.user_id).join(Store).where(Product.id == product_id)
    result = db.exec(statement).first()
    
    if not result:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")
    
    p, owner_id = result
    return ProductOut(
        id=p.id,
        name=p.name,
        price=p.price,
        stock=int(p.stoc),
        image_url=p.image_url,
        store_id=p.store_id,
        owner_user_id=owner_id # Pastikan ini sampai ke React
    )

# --- 3. TAMBAH BARANG ---
@router.post("/", response_model=ProductOut)
def create_product(
    payload: ProductCreate, 
    db: Session = Depends(get_sesion), 
    current_user: User = Depends(get_current_user)
):
    statement = select(Store).where(Store.user_id == current_user.id)
    store = db.exec(statement).first()
    
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    new_product = Product(
        name=payload.name,
        price=payload.price,
        stoc=str(payload.stock),
        image_url=payload.image_url,
        store_id=store.id
    )
    
    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return ProductOut(
        id=new_product.id,
        name=new_product.name,
        price=new_product.price,
        stock=int(new_product.stoc),
        image_url=new_product.image_url,
        store_id=new_product.store_id,
        owner_user_id=current_user.id # Pemiliknya adalah si pembuat
    )