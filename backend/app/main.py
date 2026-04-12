from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_dataBase_tables
from app.routes import user_routes, store, product, chat

app = FastAPI()

# KONFIGURASI CORS (Penting agar React bisa akses API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Izinkan semua untuk tahap development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_dataBase_tables()

# Register Router Biasa
app.include_router(user_routes.router)
app.include_router(store.router)
app.include_router(product.router)

# Register Router Chat (Termasuk WebSocket di dalamnya)
# Pastikan di dalam chat.router sudah ada decorator @router.websocket
app.include_router(chat.router)

@app.get("/")
def home():
    return {"message": "Backend Marketplace Ready!"}