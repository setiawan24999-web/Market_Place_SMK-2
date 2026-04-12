import React, { useState } from 'react';
import api from '../../api/kodecontoh';
import { useNavigate, Link } from 'react-router-dom'; // Tambahkan Link di sini

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users/', { email, password, role });
      alert("Registrasi Berhasil! Silakan Login.");
      navigate('/login');
    } catch (err: any) {
      alert(err.response?.data?.detail || "Gagal Register");
    }
  };

  return (
    <div className="register-container" style={{ maxWidth: '400px', margin: '100px auto', textAlign: 'center' }}>
      <form onSubmit={handleRegister} style={{ border: '1px solid #ddd', padding: '30px', borderRadius: '10px' }}>
        <h2>Register</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="Email" 
            required 
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Password" 
            required 
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          
          <label style={{ display: 'block', marginBottom: '5px', textAlign: 'left', fontSize: '0.9rem' }}>Daftar Sebagai:</label>
          <select 
            value={role} 
            onChange={e => setRole(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          >
            <option value="user">User (Pembeli)</option>
            <option value="seller">Seller (Penjual)</option>
          </select>
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          Daftar Sekarang
        </button>

        {/* NAVIGASI KE LOGIN */}
        <p style={{ marginTop: '20px', fontSize: '0.9rem' }}>
          Sudah punya akun? <Link to="/login" style={{ color: '#3498db', textDecoration: 'none', fontWeight: 'bold' }}>Login di sini</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;