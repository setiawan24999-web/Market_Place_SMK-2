from fastapi import WebSocket
from typing import Dict
import json

class ConnectionManager:
    def __init__(self):
        # Menyimpan websocket berdasarkan user_id (string)
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        # Jika user sudah punya koneksi lama, tutup dulu agar tidak double
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].close()
            except:
                pass
        self.active_connections[user_id] = websocket
        print(f"User {user_id} terhubung. Total: {len(self.active_connections)}")

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            print(f"User {user_id} terputus.")

    async def send_personal_message(self, message: dict, receiver_id: str):
        """Mengirim pesan ke user spesifik jika sedang online"""
        if receiver_id in self.active_connections:
            websocket = self.active_connections[receiver_id]
            try:
                await websocket.send_json(message)
                return True
            except Exception as e:
                print(f"Gagal kirim ke {receiver_id}: {e}")
                self.disconnect(receiver_id)
                return False
        return False

manager = ConnectionManager()