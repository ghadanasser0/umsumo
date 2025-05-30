import React, { useState } from 'react'
import Header from '../parts/Header'
import Footer from '../parts/Footer'
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

export default function Signin() {
    const [msg, setMsg] = useState(null);
    const [resetMsg, setResetMsg] = useState(null);  // رسالة إعادة تعيين كلمة المرور
    const navigate = useNavigate();

    const signinUser = async (e) => {
        e.preventDefault();
        setMsg(null);

        if(e.target.email.value === "" || e.target.password.value === ""){
            setMsg('Enter your email and password.');
            return false;
        }

        const { error } = await supabase.auth.signInWithPassword({
            email: e.target.email.value,
            password: e.target.password.value,
        });

        if (error) {
            setMsg('Wrong email or password.');
        } else {
            navigate('/');
        }
    }

    // دالة إعادة تعيين كلمة المرور
    const resetPassword = async (e) => {
        e.preventDefault();
        setResetMsg(null);

        const email = e.target.email.value;
        if (email === "") {
            setResetMsg('Please enter your email.');
            return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'http://localhost:5173/reset-password' });

        if (error) {
            setResetMsg('Error: ' + error.message);
        } else {
            setResetMsg('Check your email for the reset link!');
            document.getElementById('resetPasswordForm').style.display = 'none';  // إخفاء النموذج بعد النجاح
        }
    }

    return (
        <div>
            <Header />

            {/* نموذج تسجيل الدخول */}
            <form method="post" className="form" onSubmit={signinUser}>
                <h2 className='center'>Signin to your account</h2>

                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" placeholder="Enter your email" />

                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" placeholder="Enter your password" />
                
                {msg && (
                    <p style={{ color: msg.startsWith('Wrong') || msg.startsWith('Enter') ? 'red' : 'green', textAlign: 'center' }}>
                        {msg}
                    </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button type="submit" className="btn full">Signin</button>
                </div>

                {/* رابط "نسيت كلمة المرور؟" الذي يظهر النموذج */}
                <p className='center'>
                    <a className="section-headline" href="#" onClick={() => document.getElementById('resetPasswordForm').style.display = 'block'}>
                        Forgot password?
                    </a>
                </p>

                <p className='padding center'>
                    Don't have an account? <a className="section-headline" href="/signup">Signup Now</a>
                </p>
            </form>

            {/* نموذج إعادة تعيين كلمة المرور */}
            <form id="resetPasswordForm" className="form" style={{ display: 'none' }} onSubmit={resetPassword}>
                <h2 className='center'>Reset your password</h2>

                <label htmlFor="resetEmail">Email:</label>
                <input type="email" id="resetEmail" name="email" placeholder="Enter your email" />
                
                {resetMsg && (
                    <p style={{ color: resetMsg.startsWith('Error') || resetMsg.startsWith('Please') ? 'red' : 'green', textAlign: 'center' }}>
                        {resetMsg}
                    </p>
                )}

                <button type="submit" className="btn full">Send reset email</button>

                <p className='center'>
                    <a className="section-headline" href="#" onClick={() => document.getElementById('resetPasswordForm').style.display = 'none'}>
                        Back to signin
                    </a>
                </p>
            </form>

            <Footer />
        </div>
    )
}
