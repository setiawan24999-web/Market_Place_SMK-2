


import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import User from "./pages/2_User_Dasboard/Dasboard";
import Register from "./pages/1_Rgister_Login_hendler/Register";
import Login from "./pages/1_Rgister_Login_hendler/Login";
import Seler from "./pages/3_Seller_Dasboard/Seller_Dasboard";

function App() {
  // Cek apakah token ada di localStorage
  const token = localStorage.getItem("token");
  const punya_token = !!token;

  return (
    <Router>
      {/* Navbar hanya tampil jika sudah Login */}
      {punya_token  && <Navbar />}

      <Routes>
        {/* 1. HALAMAN AWAL (/) */}
        {/* Jika belum login, paksa ke Register sesuai keinginanmu */}
        <Route
          path="/"
          element={punya_token  ? <User /> : <Navigate to="/Register" />}
        />

        {/* 2. REGISTER */}
        {/* Jika sudah login tapi iseng buka Register, lempar ke Home */}
        <Route
          path="/Register"
          element={!punya_token  ? <Register /> : <Navigate to="/" />}
        />

        {/* 3. LOGIN */}
        {/* Jika sudah login, tidak boleh balik ke Login lagi */}
        <Route
          path="/Login"
          element={!punya_token  ? <Login /> : <Navigate to="/" />}
        />

        {/* 4. HALAMAN TERPROTEKSI (SELLER) */}
        <Route
          path="/selerr"
          element={punya_token  ? <Seler /> : <Navigate to="/Login" />}
        />

        {/* 5. WILDCARD (Satu-satunya cara menangani alamat salah) */}
        {/* Taruh di PALING BAWAH agar tidak memblokir rute lain */}
        <Route path="*" element={<Navigate to="/Register" />} />
      </Routes>
    </Router>
  );
}

export default App;


// jkdjdjdjdjd
// jkdjdjdjdjd
// jkdjdjdjdjd
// jkdjdjdjdjd
// jkdjdjdjdjd
// jkdjdjdjdjd
// jkdjdjdjdjd
// jkdjdjdjdjd
// jkdjdjdjdjd
// jkdjdjdjdjd
// jkdjdjdjdjd
// jkdjdjdjdjd
// jkdjdjdjdjd
// jkdjdjdjdjd
// jkdjdjdjdjd
// jkdjdjdjdjd
// jkdjdjdjdjd
// jkdjdjdjdjd
// jkdjdjdjdjd
// jkdjdjdjdjd
// jkdjdjdjdjd
// jkdjdjdjdjd