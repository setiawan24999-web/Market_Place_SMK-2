import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/kodecontoh";

// untuk handle registernya
const Register: React.FC = () => {
    const [formData, setformData] = useState({ username: '', email: '', password: '' });
    const navigate = useNavigate();

    const pindah = () => {
        navigate("/login");
    }

    const urusRegister = async (a: React.FormEvent) => {
        a.preventDefault();
        try {
            await api.post('/register', formData);
            alert('akun berhasil di buat! sekarang silahkan login untuk mengunjungi toko');

            navigate('/Login');
        } catch (error) {
            alert('anda gagal daftar, silahkan coba lagi dan periksa data anda ');

        }
    };

    //  untuk handle tampilannya 
    return (
        <div>
            <form onSubmit={urusRegister}>
                <div>
                    <input type="text" placeholder="username" onChange={(e) => setformData({ ...formData, username: e.target.value })}
                    />
                    <input type="text" placeholder="username" onChange={(e) => setformData({ ...formData, email: e.target.value })}
                    />
                    <input type="password" placeholder="username" onChange={(e) => setformData({ ...formData, password: e.target.value })}
                    />
                </div>
                <button className="text-blue-500 ">on submmit</button>

            </form>


            <button onClick={pindah} className='bg-emerald-600 text-amber-50 font-bold'>langsung Login</button>
        </div>

    );

};
export default Register;