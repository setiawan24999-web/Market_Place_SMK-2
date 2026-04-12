import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../../api/kodecontoh"; 

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- LOGIKA 1: Fetch Data (Mengikuti status_store dari Backend) ---
  const fetchStores = async () => {
    try {
      const response = await api.get("/stores/"); 
      setStores(response.data);
    } catch (err) {
      console.error("Gagal mengambil data toko:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // --- LOGIKA 2: Update Status (Menggunakan new_status sesuai Enum backend) ---
  const handleUpdateStatus = async (storeId: number, statusString: string) => {
    try {
      // Kita kirim string "active" atau "inactive" ke parameter new_status
      await api.patch(`/stores/${storeId}/status?new_status=${statusString}`);
      alert(`Toko Berhasil diubah menjadi ${statusString}!`);
      fetchStores(); 
    } catch (err) {
      console.error(err);
      alert("Gagal memperbarui status toko. Periksa koneksi atau role Admin Anda.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f4f7f6' }}>
      
      {/* --- TOP BAR --- */}
      <div style={topBarStyle}>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>🛡️ Admin Panel System</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/dashboard')} style={btnNavStyle('#3498db')}>🏠 Ke Marketplace</button>
          <button onClick={handleLogout} style={btnNavStyle('#e74c3c')}>🚪 Logout</button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* --- KOLOM KIRI (User) --- */}
        <div style={columnStyle}>
          <h3 style={headerStyle}>👥 User Management</h3>
          <div style={searchBoxStyle}>Fitur cari user segera datang...</div>
        </div>

        {/* --- KOLOM TENGAH (Data Toko Real) --- */}
        <div style={{ ...columnStyle, borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', backgroundColor: '#fff' }}>
          <h3 style={headerStyle}>🏪 Store Management</h3>
          <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '15px' }}>Kelola aktivasi toko seluruh platform</p>
          
          {loading ? <p>Memuat data toko...</p> : (
            stores.map((store: any) => (
              <div key={store.id} style={{ 
                ...cardStyle, 
                // Logika warna border berdasarkan Enum status_store
                borderLeft: store.status_store === 'active' ? '4px solid #27ae60' : '4px solid #f1c40f' 
              }}>
                <div style={{ fontWeight: 'bold' }}>{store.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>ID: {store.id} | Owner ID: {store.user_id}</div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 'bold', 
                  // Logika warna teks status
                  color: store.status_store === 'active' ? '#27ae60' : '#e67e22',
                  marginTop: '5px'
                }}>
                  Status: {store.status_store.toUpperCase()}
                </div>

                <div style={{ marginTop: '10px' }}>
                  {/* Kondisi Tombol berdasarkan Enum status_store */}
                  {store.status_store !== 'active' ? (
                    <button 
                      onClick={() => handleUpdateStatus(store.id, "active")}
                      style={btnActionStyle('#27ae60')}
                    >
                      Approve (Aktifkan)
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleUpdateStatus(store.id, "inactive")}
                      style={btnActionStyle('#e74c3c')}
                    >
                      Non-aktifkan
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* --- KOLOM KANAN (Stats) --- */}
        <div style={columnStyle}>
          <h3 style={headerStyle}>🔍 Data Inspector</h3>
          <div style={statsContainer}>
            <div style={statBox}>
              <small>Total Toko</small>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stores.length}</div>
            </div>
            <div style={statBox}>
              <small>Toko Aktif</small>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                {/* Filter berdasarkan string 'active' */}
                {stores.filter((s: any) => s.status_store === 'active').length}
              </div>
            </div>
          </div>

          <h4 style={{ marginTop: '20px', fontSize: '0.9rem' }}>Aktivitas Sistem:</h4>
          <div style={logContainer}>
            <div style={logItem}>🟢 Database PostgreSQL Connected</div>
            <div style={logItem}>🟢 FastAPI Server Online</div>
            <div style={logItem}>📩 Log update otomatis aktif</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- STYLES (Tidak berubah sedikit pun) ---
const topBarStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: '#2c3e50', color: 'white' };
const btnNavStyle = (color: string) => ({ backgroundColor: color, color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' as const, fontSize: '0.85rem' });
const columnStyle: React.CSSProperties = { flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', overflowY: 'auto' };
const headerStyle = { marginBottom: '20px', color: '#2c3e50', fontSize: '1.2rem' };
const cardStyle = { backgroundColor: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #eee' };
const searchBoxStyle = { padding: '10px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '5px', marginBottom: '20px', color: '#999', fontSize: '0.9rem' };
const btnActionStyle = (color: string) => ({ backgroundColor: color, color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', marginRight: '5px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' as const });
const statsContainer = { display: 'flex', gap: '10px', marginBottom: '20px' };
const statBox = { flex: 1, backgroundColor: '#2c3e50', color: 'white', padding: '15px', borderRadius: '10px', textAlign: 'center' as const };
const logContainer = { backgroundColor: '#1e272e', color: '#0be881', padding: '15px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.8rem', height: '200px', overflowY: 'auto' as const };
const logItem = { marginBottom: '8px' };

export default AdminDashboard;