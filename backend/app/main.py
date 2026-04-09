
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # 1. Import Middleware-nya
from app.database import creat_db_tables
from app.routes import user

app = FastAPI()
origins = [
    "http://localhost:5173",    # Alamat default Vite
    "http://127.0.0.1:5173",    # Alamat alternatif Vite
    "http://localhost:3000",    # Alamat default React App lama
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,             # Izinkan alamat di atas
    allow_credentials=True,            # Izinkan pengiriman Cookie/Token
    allow_methods=["*"],               # Izinkan semua metode (GET, POST, PUT, DELETE)
    allow_headers=["*"],               # Izinkan semua header (termasuk Authorization)
)

@app.on_event("startup")
def on_startup():
    creat_db_tables()

# Mengenalkan pintu /users ke aplikasi utama
app.include_router(user.router)

@app.get("/")
def home():
    return {"message": "Backend Marketplace Ready!"}