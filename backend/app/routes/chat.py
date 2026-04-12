from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Body
from sqlmodel import Session, select
from app.database import engine, get_sesion
from app.models import ChatMessage
from app.cht_manager import manager
import json
from datetime import datetime
from app.routes.auth import get_current_user
from app.models import User,Store
from pydantic import BaseModel # Tambahkan ini untuk skema edit

router = APIRouter()

# --- 1. Skema untuk Edit (Mencegah Error 422) ---
class MessageUpdate(BaseModel):
    new_text: str

@router.websocket("/ws/chat/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    clean_user_id = "".join(filter(str.isdigit, user_id))
    
    if not clean_user_id:
        await websocket.close(code=1003)
        return

    await manager.connect(clean_user_id, websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            receiver_id = message_data.get("receiverId")
            text = message_data.get("text")

            if receiver_id and text:
                try:
                    with Session(engine) as session:
                        new_msg = ChatMessage(
                            sender_id=int(clean_user_id),
                            receiver_id=int(receiver_id),
                            message=text,
                            timestamp=datetime.utcnow()
                        )
                        session.add(new_msg)
                        session.commit()
                        session.refresh(new_msg) # Mendapatkan ID dari Database
                        
                        formatted_time = new_msg.timestamp.strftime("%H:%M")

                        # --- FIX: Sertakan 'id' di payload agar React bisa CRUD ---
                        payload = {
                            "id": new_msg.id, 
                            "senderId": int(clean_user_id),
                            "receiverId": int(receiver_id),
                            "text": text,
                            "time": formatted_time
                        }

                    await manager.send_personal_message(payload, str(receiver_id))
                    await manager.send_personal_message(payload, clean_user_id)
                
                except Exception as db_err:
                    print(f"❌ Database Error: {db_err}")
                    error_payload = {"text": "Gagal menyimpan pesan", "senderId": 0}
                    await websocket.send_text(json.dumps(error_payload))

    except WebSocketDisconnect:
        manager.disconnect(clean_user_id)
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        manager.disconnect(clean_user_id)

@router.get("/chat/history/{me}/{with_user}")
async def get_history(me: int, with_user: int, session: Session = Depends(get_sesion)):
    statement = select(ChatMessage).where(
        ((ChatMessage.sender_id == me) & (ChatMessage.receiver_id == with_user)) |
        ((ChatMessage.sender_id == with_user) & (ChatMessage.receiver_id == me))
    ).order_by(ChatMessage.timestamp.asc())
    
    results = session.exec(statement).all()
    
    return [
        {
            "id": c.id, # Sertakan ID di riwayat
            "senderId": c.sender_id, 
            "receiverId": c.receiver_id,
            "text": c.message, 
            "time": c.timestamp.strftime("%H:%M")
        } for c in results
    ]

@router.delete("/chat/{message_id}")
def delete_message(
    message_id: int, 
    db: Session = Depends(get_sesion), 
    current_user: User = Depends(get_current_user)
):
    # 1. Cari pesan berdasarkan ID dan pastikan penghapus adalah pengirimnya
    statement = select(ChatMessage).where(
        (ChatMessage.id == message_id) & 
        (ChatMessage.sender_id == current_user.id)
    )
    msg = db.exec(statement).first()
    
    if not msg:
        raise HTTPException(status_code=404, detail="Pesan tidak ditemukan atau Anda tidak berhak menghapusnya")

    try:
        # 2. Hapus dari Database
        db.delete(msg)
        db.commit()
        
        # 3. Return ID pesan agar Frontend bisa melakukan filter state
        return {
            "status": "success",
            "message": "Pesan berhasil ditarik",
            "deleted_id": message_id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))



@router.put("/chat/{message_id}")
def edit_message(
    message_id: int, 
    update_data: MessageUpdate, # Gunakan Pydantic Model untuk menangkap JSON Body
    db: Session = Depends(get_sesion), 
    current_user: User = Depends(get_current_user)
):
    statement = select(ChatMessage).where(
        ChatMessage.id == message_id, 
        ChatMessage.sender_id == current_user.id
    )
    msg = db.exec(statement).first()
    
    if not msg:
        raise HTTPException(status_code=404, detail="Gagal mengedit pesan")

    msg.message = update_data.new_text # Ambil data dari JSON body
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {"id": msg.id, "text": msg.message, "status": "success"}





@router.get("/chat/contacts/{user_id}")
def get_chat_contacts(user_id: int, db: Session = Depends(get_sesion)):
    try:
        # 1. Ambil semua pesan terkait untuk mencari ID lawan bicara
        statement = select(ChatMessage).where(
            (ChatMessage.sender_id == user_id) | (ChatMessage.receiver_id == user_id)
        ).order_by(ChatMessage.timestamp.desc())
        
        results = db.exec(statement).all()
        
        contact_ids = []
        seen = set()
        for res in results:
            other_id = res.receiver_id if res.sender_id == user_id else res.sender_id
            if other_id not in seen:
                contact_ids.append(other_id)
                seen.add(other_id)

        if not contact_ids:
            return []

        # 2. Ambil data Toko berdasarkan User ID (Lawan Bicara)
        # Kita asumsikan setiap User memiliki satu Store
       
        
        store_statement = select(Store).where(Store.user_id.in_(contact_ids))
        stores = db.exec(store_statement).all()
        
        # Buat map: {user_id: nama_toko}
        store_map = {s.user_id: s.name for s in stores}
        
        # 3. Ambil data User (untuk cadangan jika user tersebut tidak punya toko)
        user_statement = select(User).where(User.id.in_(contact_ids))
        users = db.exec(user_statement).all()
        user_map = {u.id: u.email for u in users}

        contacts_data = []
        for cid in contact_ids:
            # Prioritaskan Nama Toko, jika tidak ada pakai Email
            display_name = store_map.get(cid) or user_map.get(cid, "Unknown User")
            
            contacts_data.append({
                "id": str(cid),
                "name": display_name,
                "avatar": None 
            })
                
        return contacts_data

    except Exception as e:
        print(f"CRITICAL ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Gagal mengambil nama toko")