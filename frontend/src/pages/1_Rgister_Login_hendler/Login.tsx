
import React, { useState } from "react";
import api from "../../api/kodecontoh";
const Login: React.FC = () => {
    const [fromData, setfromData] = useState({
        username: '',
        password: ''
    });
    const urusLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Gunakan objek JSON biasa { }, bukan URLSearchParams
            const hasil = await api.post('/login', fromData
            );

            // Simpan token
            // Gunakan window.location agar App.tsx mendeteksi perubahan status login
            localStorage.setItem('token', hasil.data.acces_token);
            window.location.href = "/";


        } catch (error: any) {
            console.error("Detail Error:", error.response?.data);
            alert("Login gagal! Periksa username dan password.");
        }
    };
// baik disini kita akan mulai menguding untuk mencapai kesuyyksessanb kita 
    return (
        <div className="flex flex-col items-center p-10">
            <h1 className="text-2xl font-bold mb-5">Login Marketplace</h1>
            <form onSubmit={urusLogin} className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="Username"
                    className="border p-2 rounded"
                    onChange={(a) => setfromData({ ...fromData, username: a.target.value })}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="border p-2 rounded"
                    onChange={(a) => setfromData({ ...fromData, password: a.target.value })}
                />
                <button className="bg-blue-500 text-white p-2 rounded">
                    Login
                </button>
            </form>
        </div>
    );
};

export default Login;
// aaaaaa4444444
// aaaaaa
// aaaaaa
// aaaaaa
// aaaaaa
// ddddddd
// ddddddd
// ddddddd
// ddddddd
// ddddddd
// ddddddd