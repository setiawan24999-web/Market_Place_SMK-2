import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import api from "../../api/kodecontoh"; 

interface Message {
  id: any; // Ubah ke any supaya bisa menampung ID sementara (string)
  senderId: number;
  receiverId: number;
  text: string;
  time: string;
  is_edited?: boolean; 
  isTemp?: boolean; // Tambahan untuk menandai pesan yang sedang proses kirim
}

interface Contact {
  id: string;
  name: string;
  avatar?: string;
}

const ChatDashboard: React.FC = () => {
  const location = useLocation();
  
  // -- States --
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [editingMsg, setEditingMsg] = useState<Message | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // -- Identitas User --
  const myId = useMemo(() => {
    const id = localStorage.getItem("user_id");
    return id ? id.replace(/\D/g, "") : "0"; 
  }, []);

  // -- 0. Fungsi Baru: Ambil Daftar Riwayat Kontak --
  useEffect(() => {
    const fetchContacts = async () => {
      if (myId === "0") return;
      try {
        const res = await api.get(`/chat/contacts/${myId}`);
        setContacts(prev => {
          const combined = [...res.data];
          prev.forEach(p => {
            if (!combined.find(c => c.id === p.id)) combined.push(p);
          });
          return combined;
        });
      } catch (err) {
        console.error("Gagal mengambil riwayat kontak:", err);
      }
    };
    fetchContacts();
  }, [myId]);

  // -- Auto Scroll --
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // -- 1. Inisialisasi Kontak (Dari Navigasi) --
  useEffect(() => {
    if (location.state?.contactId) {
      const newC: Contact = {
        id: String(location.state.contactId),
        name: location.state.contactName || "User",
      };
      setContacts(prev => prev.find(c => c.id === newC.id) ? prev : [newC, ...prev]);
      setSelectedContact(newC);
    }
  }, [location.state]);

  // -- 2. Load History (Tanpa Timpa Pesan Lain) --
  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedContact || myId === "0") return;
      try {
        const res = await api.get(`/chat/history/${myId}/${selectedContact.id}`);
        setMessages(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Gagal ambil riwayat:", err);
        setMessages([]);
      }
    };
    fetchHistory();
  }, [selectedContact, myId]);

  // -- 3. WebSocket Connection (Real-time Engine) --
  useEffect(() => {
    if (myId === "0") return;

    const connectWS = () => {
      const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${myId}`);

      ws.onopen = () => setIsConnected(true);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        setMessages((prev) => {
          // LOGIKA ANTI-DUPLIKAT & SINKRONISASI
          const isFromMe = Number(data.senderId) === Number(myId);
          
          if (isFromMe) {
            // Cari apakah ada pesan 'isTemp' yang teksnya sama dengan yang baru datang dari server
            const tempIdx = prev.findLastIndex(m => m.isTemp && m.text === data.text);
            if (tempIdx !== -1) {
              // Jika ketemu, kita UPDATE pesan sementara itu dengan data asli (ID asli) dari server
              const newMsgs = [...prev];
              newMsgs[tempIdx] = { ...data, isTemp: false };
              return newMsgs;
            }
          }

          // Jika pesan dari orang lain, cek dulu ID-nya sudah ada belum di list
          if (prev.some(m => m.id === data.id)) return prev;

          const newMsg: Message = {
            id: data.id,
            senderId: Number(data.senderId),
            receiverId: Number(data.receiverId),
            text: data.text,
            time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            is_edited: data.is_edited
          };
          return [...prev, newMsg];
        });
      };

      ws.onclose = () => {
        setIsConnected(false);
        setTimeout(connectWS, 3000); 
      };
      socketRef.current = ws;
    };

    connectWS();
    return () => socketRef.current?.close();
  }, [myId]);

  // -- 4. CRUD Actions --
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const msgText = input.trim();
    if (!msgText || !selectedContact) return;

    if (editingMsg) {
      try {
        await api.put(`/chat/${editingMsg.id}`, { new_text: msgText }); 
        setMessages(prev => prev.map(m => 
          m.id === editingMsg.id ? { ...m, text: msgText, is_edited: true } : m
        ));
        setEditingMsg(null);
        setInput("");
      } catch (err: any) {
        console.error("Edit gagal:", err.response?.data);
        alert("Gagal edit");
      }
      return;
    }

    // --- LOGIKA INSTAN (OPTIMISTIC UPDATE) ---
    // Gunakan kombinasi Random agar ID benar-benar unik dan tidak tabrakan (Menghindari Error Key Duplicate)
    const tempId = `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`; 
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const tempMsg: Message = {
      id: tempId,
      senderId: parseInt(myId),
      receiverId: parseInt(selectedContact.id),
      text: msgText,
      time: timeNow,
      isTemp: true 
    };

    // Tampilkan di layar saat itu juga
    setMessages(prev => [...prev, tempMsg]);
    setInput(""); 

    const payload = {
      senderId: parseInt(myId),
      receiverId: parseInt(selectedContact.id),
      text: msgText
    };

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
    } else {
      // Rollback jika koneksi mati
      setMessages(prev => prev.filter(m => m.id !== tempId));
      alert("Gagal mengirim! Koneksi terputus.");
    }
  };

  const handleDelete = async (msgId: number) => {
    if (!msgId || isNaN(msgId)) return;
    if (window.confirm("Hapus pesan ini selamanya?")) {
      try {
        await api.delete(`/chat/${msgId}`);
        setMessages(prev => prev.filter(m => m.id !== msgId));
      } catch (err) {
        console.error("Hapus gagal:", err);
      }
    }
  };

  return (
    <div style={s.container}>
      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.sideHeader}>
          <h2 style={{margin: 0}}>Chats</h2>
          <span style={{color: isConnected ? "#00b894" : "#ff7675", fontSize: '12px'}}>
            {isConnected ? "● Connected" : "○ Disconnected"}
          </span>
        </div>
        <div style={{overflowY: 'auto', flex: 1}}>
          {contacts.length > 0 ? (
            contacts.map(c => (
              <div key={c.id} onClick={() => setSelectedContact(c)} 
                   style={{...s.contactItem, backgroundColor: selectedContact?.id === c.id ? "#f0f2f5" : "white"}}>
                <div style={s.avatar}>👤</div>
                <div style={{fontWeight: 600}}>{c.name}</div>
              </div>
            ))
          ) : (
            <div style={{padding: '20px', textAlign: 'center', color: '#999'}}>Tidak ada percakapan</div>
          )}
        </div>
      </div>

      {/* Main Chat */}
      <div style={s.chatPanel}>
        {selectedContact ? (
          <>
            <div style={s.chatHeader}>
              <strong>{selectedContact.name}</strong>
            </div>

            <div style={s.messageBox}>
              {messages.map((m) => {
                const isMe = Number(m.senderId) === Number(myId);
                return (
                  <div key={m.id} style={{...s.row, justifyContent: isMe ? "flex-end" : "flex-start"}}>
                    <div style={{...s.bubble, 
                                backgroundColor: isMe ? "#00b894" : "#fff", 
                                color: isMe ? "#fff" : "#2d3436",
                                opacity: m.isTemp ? 0.6 : 1 
                                }}>
                      <div style={{wordBreak: 'break-word'}}>
                        {m.text}
                        {m.is_edited && <span style={{fontSize: '9px', fontStyle: 'italic', marginLeft: '5px', opacity: 0.7}}>(edited)</span>}
                      </div>
                      <div style={s.time}>
                        {m.time}
                        {isMe && !m.isTemp && ( 
                          <span style={{marginLeft: '10px', cursor: 'pointer'}}>
                            <span onClick={() => { setEditingMsg(m); setInput(m.text); }} style={{marginRight: '5px'}}>✏️</span>
                            <span onClick={() => handleDelete(m.id)}>🗑️</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSend} style={s.inputArea}>
              {editingMsg && <div style={s.editNotif}>Editing message... <span onClick={() => {setEditingMsg(null); setInput("");}} style={{cursor:'pointer', color:'red'}}>Cancel</span></div>}
              <div style={{display: 'flex', gap: '10px'}}>
                <input 
                  style={s.input} 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  placeholder="Ketik pesan di sini..." 
                />
                <button type="submit" style={s.sendBtn}>
                  {editingMsg ? "Save" : "Send"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div style={s.empty}>Pilih kontak untuk mulai chat</div>
        )}
      </div>
    </div>
  );
};

const s = {
  container: { display: "flex", width: "100vw", height: "100vh", background: "#f8f9fa" },
  sidebar: { width: "320px", background: "#fff", borderRight: "1px solid #ddd", display: "flex", flexDirection: "column" as "column" },
  sideHeader: { padding: "20px", borderBottom: "1px solid #eee" },
  contactItem: { display: "flex", alignItems: "center", padding: "15px 20px", gap: "12px", cursor: "pointer", transition: "0.2s" },
  avatar: { width: "40px", height: "40px", borderRadius: "50%", background: "#dfe6e9", display: "flex", alignItems: "center", justifyContent: "center" },
  chatPanel: { flex: 1, display: "flex", flexDirection: "column" as "column" },
  chatHeader: { padding: "15px 25px", background: "#fff", borderBottom: "1px solid #eee", fontSize: "18px" },
  messageBox: { flex: 1, padding: "20px", overflowY: "auto" as "auto", display: "flex", flexDirection: "column" as "column", gap: "10px", background: "#f1f3f5" },
  row: { display: "flex", width: "100%" },
  bubble: { padding: "10px 16px", borderRadius: "14px", maxWidth: "70%", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" },
  time: { fontSize: "10px", marginTop: "5px", opacity: 0.8, textAlign: "right" as "right" },
  inputArea: { padding: "20px", background: "#fff", borderTop: "1px solid #eee" },
  input: { flex: 1, padding: "12px 20px", borderRadius: "25px", border: "1px solid #ddd", outline: "none", fontSize: "14px", color: "#000" },
  sendBtn: { padding: "10px 25px", borderRadius: "25px", border: "none", background: "#00b894", color: "#fff", fontWeight: 600, cursor: "pointer" },
  editNotif: { fontSize: "12px", color: "#00b894", marginBottom: "8px", fontWeight: 500 },
  empty: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#b2bec3", fontSize: "18px" }
};

export default ChatDashboard;