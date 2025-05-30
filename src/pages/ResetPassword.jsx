import React, { useState } from 'react'
import Header from '../parts/Header'
import Footer from '../parts/Footer'
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
    const [msg, setMsg] = useState(null);
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMsg(null);

        if(e.target.password.value === "" || e.target.repeat_password.value === ""){
            setMsg('Enter password and repeat it.');
            return false;
        }

        if(e.target.password.value !== e.target.repeat_password.value){
            setMsg('Passwords does not match.');
            return false;
        }

        const { error } = await supabase.auth.updateUser({
            password: e.target.password.value,
        });

       if (error) {
    setMsg('Something went wrong, try again.');

        } else {
            navigate('/signin');
        }
    }

    return (
        <div>
            <Header />

            {/* نموذج تسجيل الدخول */}
            <form method="post" className="form" onSubmit={handleResetPassword}>
                <h2 className='center'>Reset your password</h2>

                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" placeholder="Enter your password"  />

                <label htmlFor="repeat_password">Repeat Password:</label>
                <input type="password" id="repeat_password" name="repeat_password" placeholder="Repeat your password"  />

                {msg && <p>{msg}</p>}

                <button type="submit" className="btn full">Reset Passsword</button>
            </form>


            <Footer />
        </div>
    )
}
