import React, { useState } from "react";
import api from "../../api/kodecontoh";
import { useNavigate, Link } from "react-router-dom";

interface LoginProps {
  setToken: (token: string | null) => void;
}

const Login: React.FC<LoginProps> = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Tambahan: Loading state
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Menggunakan URLSearchParams karena OAuth2PasswordRequestForm di FastAPI 
      // membaca data dari body form-data
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const response = await api.post('/users/login', params);
      
      // 1. Ambil SEMUA data dari backend (access_token, role, DAN user_id)
      const { access_token, role, user_id } = response.data; 

      if (access_token) {
        // 2. Simpan semuanya ke LocalStorage agar bisa diakses komponen lain
        localStorage.setItem('token', access_token);
        localStorage.setItem('role', role);
        
        // PENTING: Simpan user_id sebagai string agar ChatDashboard bisa membacanya
        localStorage.setItem('user_id', String(user_id)); 
        
        // 3. Update state global di App.tsx
        setToken(access_token); 

        // 4. Navigasi berdasarkan Role
        if (role === 'admin') {
          navigate('/admin');
        } else {
          // Jika user biasa, arahkan ke dashboard/chat
          navigate('/dashboard'); 
        }
      }

    } catch (err: any) {
      console.error("Login Error:", err);
      alert(err.response?.data?.detail || "Email atau password salah!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={containerStyle}>
      <form onSubmit={handleLogin} style={formStyle}>
        <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Login</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            style={inputStyle}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            style={inputStyle}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            ...buttonStyle, 
            backgroundColor: loading ? '#95a5a6' : '#2c3e50',
            cursor: loading ? 'not-allowed' : 'pointer' 
          }}
        >
          {loading ? "Mohon Tunggu..." : "Login"}
        </button>

        <p style={{ marginTop: '20px', fontSize: '0.9rem' }}>
          Belum punya akun? <Link to="/register" style={linkStyle}>Daftar di sini</Link>
        </p>
      </form>
    </div>
  );
};

// --- Styles ---
const containerStyle: React.CSSProperties = { 
  maxWidth: '400px', 
  margin: '100px auto', 
  textAlign: 'center',
  padding: '0 20px'
};

const formStyle: React.CSSProperties = { 
  border: '1px solid #ddd', 
  padding: '30px', 
  borderRadius: '10px',
  backgroundColor: '#fff',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

const inputStyle: React.CSSProperties = { 
  width: '100%', 
  padding: '12px', 
  marginBottom: '10px',
  borderRadius: '5px',
  border: '1px solid #ccc',
  boxSizing: 'border-box'
};

const buttonStyle: React.CSSProperties = { 
  width: '100%', 
  padding: '12px', 
  color: 'white', 
  border: 'none', 
  borderRadius: '5px', 
  fontSize: '16px',
  fontWeight: 'bold',
  transition: '0.3s'
};

const linkStyle: React.CSSProperties = { 
  color: '#3498db', 
  textDecoration: 'none', 
  fontWeight: 'bold' 
};

export default Login;