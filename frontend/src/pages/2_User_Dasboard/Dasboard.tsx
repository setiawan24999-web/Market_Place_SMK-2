import React, { useState, useEffect } from "react";
import api from "../../api/kodecontoh";
import { useNavigate } from "react-router-dom";

// Definisi Interface agar TypeScript tidak bingung
interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  area?: string;
  store_id: number;
  owner_user_id: number; // ID ini hasil JOIN dari backend
  store_name?: string;
}

const UserDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const userRole = localStorage.getItem("role")?.toLowerCase();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Memanggil endpoint yang sudah kita perbaiki dengan owner_user_id
        const response = await api.get("/products/");
        setProducts(response.data);
      } catch (err) {
        console.error("Gagal memuat produk:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div style={containerStyle}>
      {/* HEADER SECTION */}
      <header style={headerStyle}>
        <div>
          <h1 style={{ margin: 0, color: "#2d3436" }}>Marketplace</h1>
          <p style={{ margin: "5px 0 0 0", color: "#636e72" }}>Temukan barang menarik di sekitar Anda.</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => navigate("/chat")} style={btnChatHeader}>💬 Pesan Saya</button>
          {userRole === "admin" && (
            <button onClick={() => navigate("/admin")} style={btnAdmin}>🛡️ Panel Admin</button>
          )}
          <button onClick={() => navigate("/seller-dashboard")} style={btnSeller}>🏪 Mulai Berjualan</button>
        </div>
      </header>

      {/* PRODUCT SECTION */}
      {loading ? (
        <div style={loadingContainer}><p>Sedang memuat barang...</p></div>
      ) : (
        <div style={productGrid}>
          {products.length > 0 ? (
            products.map((item) => (
              <div key={item.id} style={productCard}>
                {/* Bagian Gambar */}
                <div style={imagePlaceholder}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} style={imageStyle} />
                  ) : (
                    <span style={{ fontSize: "3rem" }}>📦</span>
                  )}
                </div>

                {/* Konten Produk */}
                <div style={{ padding: "20px" }}>
                  <h3 style={productTitle}>{item.name}</h3>
                  <p style={productPrice}>Rp {item.price?.toLocaleString('id-ID')}</p>
                  <p style={locationStyle}>📍 {item.area || "Lokasi tidak tersedia"}</p>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button 
                      type="button" 
                      onClick={() => navigate(`/product/${item.id}`)} 
                      style={btnDetail}
                    >
                      Lihat Detail
                    </button>
                    
                    {/* TOMBOL CHAT: FIX TOTAL */}
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault();
                        // WAJIB: Gunakan owner_user_id agar chat masuk ke pemilik, bukan ke toko
                        if (item.owner_user_id) {
                          navigate("/chat", { 
                            state: { 
                              contactId: String(item.owner_user_id), 
                              contactName: item.store_name || `Penjual ${item.name}`
                            } 
                          });
                        } else {
                          // Jika owner_user_id belum muncul, berarti Backend/Schema belum di-update
                          alert("Error: Data owner_user_id tidak ditemukan. Pastikan backend sudah di-update!");
                        }
                      }} 
                      style={btnChat}
                    >
                      💬 Chat Penjual
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={emptyState}><h3>Belum ada barang tersedia saat ini.</h3></div>
          )}
        </div>
      )}
    </div>
  );
};

// --- STYLES ---

const containerStyle: React.CSSProperties = { padding: "20px", maxWidth: "1200px", margin: "0 auto", fontFamily: "'Inter', sans-serif" };
const headerStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", borderBottom: "1px solid #f1f2f6", paddingBottom: "25px" };
const btnAdmin = { backgroundColor: "#2d3436", color: "white", padding: "12px 24px", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: 600 };
const btnSeller = { backgroundColor: "#00b894", color: "white", padding: "12px 24px", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: 600 };
const btnChatHeader = { backgroundColor: "#f1f2f6", color: "#2d3436", padding: "12px 24px", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: 600 };
const productGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "30px" };
const productCard: React.CSSProperties = { border: "1px solid #f1f2f6", borderRadius: "20px", overflow: "hidden", background: "white", boxShadow: "0 10px 20px rgba(0,0,0,0.02)" };
const imagePlaceholder: React.CSSProperties = { height: "220px", background: "#f9f9f9", display: "flex", alignItems: "center", justifyContent: "center" };
const imageStyle: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" as "cover" };
const productTitle = { margin: "0 0 8px 0", fontSize: "1.15rem", color: "#2d3436", fontWeight: 700 };
const productPrice = { color: "#0984e3", fontWeight: 800, fontSize: "1.4rem", margin: "12px 0" };
const locationStyle = { color: "#b2bec3", fontSize: "0.85rem", marginBottom: "20px" };
const btnDetail = { width: "100%", padding: "12px", backgroundColor: "#0984e3", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: 600 };
const btnChat = { width: "100%", padding: "12px", backgroundColor: "#fff", color: "#00b894", border: "2px solid #00b894", borderRadius: "12px", cursor: "pointer", fontWeight: 700 };
const loadingContainer = { textAlign: "center" as "center", padding: "100px" };
const emptyState = { textAlign: "center" as "center", gridColumn: "1 / -1", padding: "100px" };

export default UserDashboard;