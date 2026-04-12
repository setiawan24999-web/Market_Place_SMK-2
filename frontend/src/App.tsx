import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/1_Rgister_Login_hendler/Login';
import Register from './pages/1_Rgister_Login_hendler/Register';
import UserDashboard from './pages/2_User_Dasboard/Dasboard';
import SellerDashboard from './pages/3_Seller_Dasboard/Seller_Dasboard';
import AdminDashboard from './pages/4_Admin_Dasboard/Admin_Dasboard'; 
import Navbar from './components/Navbar';

// IMPORT CHAT HANDLER (Diubah ke Dashboard)
import ChatDashboard from './pages/Cht_Heanler/Cht_Dasboard';
function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
      setRole(localStorage.getItem('role'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Router>
      {/* Navbar tetap muncul jika token ada */}
      {token && <Navbar setToken={setToken} />}
      
      <Routes>
        <Route 
          path="/" 
          element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
        />

        {/* --- PUBLIC ROUTES --- */}
        <Route 
          path="/register" 
          element={token ? <Navigate to="/dashboard" replace /> : <Register />} 
        />
        <Route 
          path="/login" 
          element={token ? <Navigate to="/dashboard" replace /> : <Login setToken={setToken} />} 
        />
        
        {/* --- PROTECTED ROUTES --- */}
        <Route 
          path="/dashboard" 
          element={token ? <UserDashboard /> : <Navigate to="/login" replace />} 
        />

        <Route 
          path="/seller-dashboard" 
          element={token ? <SellerDashboard /> : <Navigate to="/login" replace />} 
        />

        {/* --- CHAT SYSTEM ROUTE (Satu Rute untuk Semua) --- */}
        {/* Sekarang rute chat hanya satu (/chat). 
            List kontak dan isi pesan ada di dalam satu tampilan Dashboard.
        */}
        <Route 
          path="/chat" 
          element={token ? <ChatDashboard /> : <Navigate to="/login" replace />} 
        />

        {/* --- ROLE-BASED ROUTES --- */}
        <Route 
          path="/admin" 
          element={
            token && role?.toLowerCase() === 'admin' ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />

        {/* --- FALLBACK --- */}
        <Route 
          path="*" 
          element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;