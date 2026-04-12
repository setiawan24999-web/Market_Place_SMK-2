import React, { useState, useEffect } from 'react';
import api from '../../api/kodecontoh';
import { useNavigate } from 'react-router-dom';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State UI
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // State Form
  const [storeForm, setStoreForm] = useState({ name: '', description: '', area: '' });
  const [productForm, setProductForm] = useState({ name: '', price: 0, stock: 0, image_url: '' });

  useEffect(() => {
    fetchStoreAndProducts();
  }, []);

  const fetchStoreAndProducts = async () => {
    try {
      setLoading(true);
      const storeRes = await api.get('/stores/my-store');
      setStore(storeRes.data);
      
      if (storeRes.data.status_store === 'active') {
        const prodRes = await api.get('/products/my-products');
        setProducts(prodRes.data);
      }
    } catch (err) {
      console.log("Belum memiliki toko atau error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/stores/', storeForm);
      setStore(res.data);
      alert("Pendaftaran berhasil! Tunggu konfirmasi admin.");
    } catch (err) { alert("Gagal mendaftar"); }
  };

  // Fungsi untuk buka modal edit
  const handleEditClick = (p: any) => {
    setEditingId(p.id);
    setProductForm({ name: p.name, price: p.price, stock: p.stock, image_url: p.image_url || '' });
    setShowModal(true);
  };

  // Fungsi simpan (bisa Create atau Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, productForm);
        alert("Produk diperbarui!");
      } else {
        await api.post('/products/', productForm);
        alert("Produk ditambahkan!");
      }
      closeModal();
      fetchStoreAndProducts();
    } catch (err) { alert("Gagal menyimpan produk"); }
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm("Hapus produk ini secara permanen?")) {
      try {
        await api.delete(`/products/${id}`);
        fetchStoreAndProducts();
      } catch (err) { alert("Gagal menghapus"); }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setProductForm({ name: '', price: 0, stock: 0, image_url: '' });
  };

  if (loading) return (
    <div style={centerScreen}>
      <div className="animate-spin" style={spinner}></div>
      <p style={{ marginTop: '15px', color: '#636e72', fontWeight: 500 }}>Memuat Dashboard...</p>
    </div>
  );

  // 1. TAMPILAN REGISTRASI TOKO
  if (!store) return (
    <div style={authContainer}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.8rem', color: '#2d3436', marginBottom: '10px' }}>Siap Berjualan? 🚀</h2>
        <p style={{ color: '#636e72' }}>Lengkapi data toko untuk menjangkau pembeli.</p>
      </div>
      <form onSubmit={handleCreateStore}>
        <div style={inputGroup}><label style={labelStyle}>Nama Toko</label>
          <input style={modernInput} placeholder="Budi Jaya Cell" onChange={e => setStoreForm({...storeForm, name: e.target.value})} required />
        </div>
        <div style={inputGroup}><label style={labelStyle}>Wilayah</label>
          <input style={modernInput} placeholder="Contoh: Surabaya, Jawa Timur" onChange={e => setStoreForm({...storeForm, area: e.target.value})} required />
        </div>
        <div style={inputGroup}><label style={labelStyle}>Deskripsi Singkat</label>
          <textarea style={{...modernInput, height: '100px', resize: 'none'}} placeholder="Jelaskan apa yang Anda jual..." onChange={e => setStoreForm({...storeForm, description: e.target.value})} />
        </div>
        <button type="submit" style={btnPrimaryFull}>Buka Toko Sekarang</button>
        <button type="button" onClick={() => navigate('/dashboard')} style={btnText}>Kembali ke Beranda</button>
      </form>
    </div>
  );

  // 2. TAMPILAN PENINJAUAN (PENDING/INACTIVE)
  if (store.status_store !== 'active') return (
    <div style={centerScreen}>
      <div style={statusIconBox(store.status_store === 'pending' ? '#fff9db' : '#fff5f5')}>
        <span style={{ fontSize: '40px' }}>{store.status_store === 'pending' ? '⏳' : '🚫'}</span>
      </div>
      <h2 style={{ color: '#2d3436', marginBottom: '10px' }}>{store.status_store === 'pending' ? 'Hampir Siap!' : 'Akses Ditangguhkan'}</h2>
      <p style={{ color: '#636e72', maxWidth: '300px', lineHeight: '1.6' }}>
        {store.status_store === 'pending' 
          ? `Toko "${store.name}" sedang divalidasi oleh admin. Mohon tunggu sejenak.` 
          : 'Toko Anda dinonaktifkan sementara. Silakan hubungi pusat bantuan.'}
      </p>
      <button onClick={() => navigate('/dashboard')} style={btnSecondary}>← Kembali ke Beranda</button>
    </div>
  );

  // 3. TAMPILAN DASHBOARD AKTIF
  return (
    <div style={mainLayout}>
      <header style={header}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#2d3436' }}>{store.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
            <span style={activeBadge}>● Aktif</span>
            <span style={{ fontSize: '0.85rem', color: '#b2bec3' }}>ID: {store.id} • {store.area}</span>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} style={btnPrimary}>+ Produk Baru</button>
      </header>

      <div style={statsGrid}>
        <div style={statCard}><small style={statLabel}>Total Produk</small><h2 style={statValue}>{products.length}</h2></div>
        <div style={statCard}><small style={statLabel}>Stok Menipis</small><h2 style={{ ...statValue, color: '#e17055' }}>0</h2></div>
        <div style={statCard}><small style={statLabel}>Status Verifikasi</small><h2 style={{ ...statValue, color: '#00b894', fontSize: '1.2rem' }}>TERVERIFIKASI</h2></div>
      </div>

      <div style={listSection}>
        <h3 style={{ marginBottom: '20px', color: '#2d3436' }}>Katalog Produk</h3>
        {products.length === 0 ? (
          <div style={emptyState}>
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>📦</div>
            <p>Belum ada produk yang dijual.</p>
            <button onClick={() => setShowModal(true)} style={btnTextOnly}>Mulai Upload Produk →</button>
          </div>
        ) : (
          <div style={productTable}>
            {products.map((p) => (
              <div key={p.id} style={productRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={productIcon}>🛍️</div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#2d3436' }}>{p.name}</div>
                    <div style={{ fontSize: '0.9rem', color: '#636e72' }}>Rp {p.price.toLocaleString()}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <small style={{ color: '#b2bec3', display: 'block' }}>Stok</small>
                    <span style={{ fontWeight: 600 }}>{p.stock}</span>
                  </div>
                  <div style={actionButtons}>
                    <button onClick={() => handleEditClick(p)} style={btnIcon}>✏️</button>
                    <button onClick={() => handleDeleteProduct(p.id)} style={{ ...btnIcon, color: '#ff7675' }}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL (Tambah/Edit) */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
              <h3 style={{ margin: 0 }}>{editingId ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <form onSubmit={handleSaveProduct}>
              <div style={inputGroup}><label style={labelStyle}>Nama Barang</label>
                <input style={modernInput} value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={inputGroup}><label style={labelStyle}>Harga (Rp)</label>
                  <input type="number" style={modernInput} value={productForm.price} onChange={e => setProductForm({...productForm, price: Number(e.target.value)})} required />
                </div>
                <div style={inputGroup}><label style={labelStyle}>Stok</label>
                  <input type="number" style={modernInput} value={productForm.stock} onChange={e => setProductForm({...productForm, stock: Number(e.target.value)})} required />
                </div>
              </div>
              <div style={inputGroup}><label style={labelStyle}>URL Gambar</label>
                <input style={modernInput} value={productForm.image_url} placeholder="https://..." onChange={e => setProductForm({...productForm, image_url: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" style={btnPrimaryFull}>{editingId ? 'Simpan Perubahan' : 'Terbitkan Produk'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MODERN STYLES ---
const mainLayout: React.CSSProperties = { padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', fontFamily: '"Inter", sans-serif' };
const header: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' };
const authContainer: React.CSSProperties = { maxWidth: '450px', margin: '60px auto', padding: '40px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', borderRadius: '24px', backgroundColor: '#fff', border: '1px solid #f1f2f6' };
const centerScreen: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', textAlign: 'center' };
const inputGroup = { marginBottom: '20px' };
const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#636e72', marginBottom: '8px' };
const modernInput = { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #eee', fontSize: '1rem', transition: 'all 0.2s', boxSizing: 'border-box' as 'border-box' };
const btnPrimary = { backgroundColor: '#0984e3', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '14px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 8px 15px rgba(9, 132, 227, 0.2)' };
const btnPrimaryFull = { ...btnPrimary, width: '100%', padding: '16px', marginTop: '10px' };
const btnSecondary = { backgroundColor: '#f1f2f6', color: '#2d3436', border: 'none', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', marginTop: '20px', fontWeight: 500 };
const btnText = { background: 'none', border: 'none', color: '#b2bec3', width: '100%', marginTop: '15px', cursor: 'pointer', fontSize: '0.9rem' };
const btnTextOnly = { background: 'none', border: 'none', color: '#0984e3', fontWeight: 600, cursor: 'pointer' };
const activeBadge = { backgroundColor: '#eafff1', color: '#00b894', padding: '4px 12px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' as 'uppercase', letterSpacing: '0.5px' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '50px' };
const statCard = { padding: '24px', backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #f1f2f6', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' };
const statLabel = { color: '#b2bec3', fontWeight: 500, display: 'block', marginBottom: '10px' };
const statValue = { margin: 0, fontSize: '1.8rem', color: '#2d3436' };
const listSection = { backgroundColor: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #f1f2f6' };
const productTable = { display: 'flex', flexDirection: 'column' as 'column', gap: '15px' };
const productRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: '#fcfcfc', borderRadius: '16px', border: '1px solid #f1f2f6' };
const productIcon = { width: '45px', height: '45px', backgroundColor: '#eef2f7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' };
const actionButtons = { display: 'flex', gap: '8px' };
const btnIcon = { background: 'white', border: '1px solid #eee', padding: '8px', borderRadius: '10px', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' };
const modalOverlay: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(45, 52, 54, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContent: React.CSSProperties = { backgroundColor: '#fff', padding: '40px', borderRadius: '28px', width: '90%', maxWidth: '450px', boxShadow: '0 30px 60px rgba(0,0,0,0.2)' };
const emptyState = { textAlign: 'center' as 'center', padding: '60px', color: '#b2bec3' };
const spinner = { width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #0984e3', borderRadius: '50%' };
const statusIconBox = (bg: string) => ({ width: '100px', height: '100px', backgroundColor: bg, borderRadius: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px' });

export default SellerDashboard;