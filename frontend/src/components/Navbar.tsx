import { useNavigate, Link } from 'react-router-dom';

interface NavbarProps {
  setToken: (token: string | null) => void;
}

const Navbar = ({ setToken }: NavbarProps) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  // Ambil ID user (opsional jika ingin ditampilkan di profile)
  const myId = localStorage.getItem('user_id');

  const handleLogout = () => {
    localStorage.clear(); 
    setToken(null);
    navigate('/login');
  };

  return (
    <nav style={navStyle}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
        <Link to="/" style={logoStyle}>PasarDigital</Link>
      </div>
      
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/" style={linkStyle}>Beranda</Link>
        
        {token && (
          <>
            {/* PERBAIKAN DI SINI: Navigasi ke /chat, bukan /chat/list */}
            <div 
              onClick={() => navigate('/chat')} 
              style={messageIconWrapper}
              title="Pesan Saya"
            >
              <span style={{ fontSize: '1.4rem' }}>💬</span>
              {/* Badge Notifikasi */}
              <span style={badgeStyle}>3</span>
            </div>

            <button onClick={handleLogout} style={btnLogout}>
              Logout
            </button>
          </>
        )}
        
        {!token && (
          <Link to="/login" style={linkStyle}>Login</Link>
        )}
      </div>
    </nav>
  );
};

// --- STYLES (Tetap Sama) ---
const navStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem 2rem',
  background: '#2c3e50',
  color: 'white',
  marginBottom: '20px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
};

const logoStyle = { color: 'white', textDecoration: 'none', letterSpacing: '1px' };
const linkStyle = { color: 'white', textDecoration: 'none', fontSize: '0.95rem' };

const messageIconWrapper: React.CSSProperties = {
  position: 'relative',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  padding: '5px',
  borderRadius: '50%',
  transition: '0.3s',
  backgroundColor: 'rgba(255,255,255,0.1)'
};

const badgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-5px',
  right: '-5px',
  background: '#2ecc71',
  color: 'white',
  fontSize: '0.7rem',
  padding: '2px 6px',
  borderRadius: '10px',
  fontWeight: 'bold',
  border: '2px solid #2c3e50'
};

const btnLogout = {
  background: '#e74c3c',
  color: 'white',
  border: 'none',
  padding: '8px 15px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 600 as 600
};

export default Navbar;