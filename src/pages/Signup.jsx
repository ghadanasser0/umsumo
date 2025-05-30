import React, { useState } from 'react';
import Header from '../parts/Header';
import Footer from '../parts/Footer';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  const registerUser = async (e) => {
    e.preventDefault();
    setMsg(null);

    const { full_name, mobile, email, password, repeat_password, area } = e.target;

    if (!full_name.value || !area.value) {
      setMsg('Enter all the required fields.');
      return;
    }

    if (!mobile.value || mobile.value.length < 7) {
      setMsg('Enter a valid mobile number.');
      return;
    }

    if (!email.value || !email.value.includes('@') || !email.value.includes('.')) {
      setMsg('Enter a valid email address.');
      return;
    }

    if (password.value.length < 6) {
      setMsg('Password should be at least 6 characters.');
      return;
    }

    if (password.value !== repeat_password.value) {
      setMsg('Password does not match.');
      return;
    }

    try {
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      });

      if (signupError) {
        setMsg(signupError.message);
        return;
      }

      const user = signupData?.user;
      if (!user) {
        setMsg("Signup failed.");
        return;
      }

      await supabase.from("users_profiles").insert({
        name: full_name.value,
        mobile: mobile.value,
        email: email.value,
        area: area.value,
        user_type: 'user',
        user_id: user.id,
      });

      const message = `Hello ${full_name.value},\n\nThank you for signing up to Omsamu!\nWe're excited to have you on board.`;

      await supabase.functions.invoke('send-emails', {
        body: {
          name: full_name.value,
          message,
          subject: "Welcome to Omsamu",
          email: email.value,
        },
      });

      await supabase.functions.invoke('send-emails', {
        body: {
          name: "Om samu",
          message: "A new user just created a new account, username: "+full_name.value,
          subject: "New user registration - Omsamu",
          email: "900vvx@gmail.com",
        },
      });

      setMsg("Account created successfully! Redirecting...");
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error(error);
      setMsg("An error occurred during signup.");
    }
  };

  return (
    <div>
      <Header />
      <form method="post" className="form" onSubmit={registerUser}>
        <h2 className="center">Create New Account</h2>

        <label htmlFor="full_name">Full Name:</label>
        <input type="text" id="full_name" name="full_name" placeholder="Enter your full name" />

        <label htmlFor="mobile">Mobile Number:</label>
        <input type="tel" id="mobile" name="mobile" placeholder="Enter your mobile number" pattern="[0-9]{8}" />

        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" placeholder="Enter your email" />

        <label htmlFor="password">Password:</label>
        <input type="password" id="password" name="password" placeholder="Enter your password" />

        <label htmlFor="repeat_password">Repeat Password:</label>
        <input type="password" id="repeat_password" name="repeat_password" placeholder="Repeat your password" />

        <label htmlFor="area">Area:</label>
        <input type="text" id="area" name="area" placeholder="Enter your area" />

        {msg && (
          <p
            style={{
              color: msg.toLowerCase().includes("success") ? 'green' : 'red',
              textAlign: 'center',
              marginTop: '10px'
            }}
          >
            {msg}
          </p>
        )}
             <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button type="submit" className="btn full">Create Account</button></div>
      </form>
      <Footer />
    </div>
  );
}
