import React from 'react';
import { Link, } from 'react-router-dom';



const Navbar: React.FC = () => {


  const Logout = () => {
    localStorage.removeItem("token");
    alert("Berhasil logout");
    window.location.href = "/Register"

  };
  return (

    <div>
      <Link to="/" className='bg-amber-300'>user</Link>
      <Link to="/selerr" className='bg-blue-600' >Toko</Link>
      <Link to="/admin">Admin</Link>
      <Link to="/keranjang">Card Belanja</Link>
      <Link to="/chat">Chat Page</Link>
      <button className='bg-amber-950 text-amber-50 font-bold' onClick={Logout}>Logout</button>

    </div>

  );
};
export default Navbar;