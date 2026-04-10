import React, { useEffect, useState } from "react";
import api from "../../api/kodecontoh";

const User: React.FC = () => {
  const [profile, setprofile] = useState({ username: '' });

  const [error, setError] = useState('');
const token = localStorage.getItem('token');
if (!token) {
        setError("Token tidak ditemukan, silakan login.");
        return;
      }

  useEffect(() => {
    const ambil_profile = async () => {
      try{
        const response = await api.get("/me",{
        headers: {
          Authorization: `Bearer ${token}`,
        },
        });
        console.log("data berhasil di ambil");
        setprofile(response.data);
      }catch (err:any){
        console.error("gagal mebngambil data ", err);

      }
    }
    ambil_profile();
  },[]);
 

return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Profil Pengguna</h1>
      {error ? (
        <p className="text-red-500 mt-2">{error}</p>
      ) : (
        <div className="mt-4 p-4 border rounded shadow-sm bg-white">
          <p><strong>Username:</strong> {profile.username || "Memuat..."}</p>
        </div>
      )}
    </div>
  );
};


export default User;




