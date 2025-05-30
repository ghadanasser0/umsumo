import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../supabase';

export default function Header() {
  const location = useLocation();
  const [auth, setAuth] = useState(false);
  const [userType, setUserType] = useState(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = window.localStorage.getItem("darkmode");
    return savedMode ? savedMode === "true" : true;
  });

  const isDashboardPage = location.pathname.includes('/dashboard') || location.pathname.includes('/products-list') || location.pathname.includes('/orders')
    || location.pathname.includes("/new-product") || location.pathname.includes("/customers") || location.pathname.includes("/delivery-list")
    || location.pathname.includes("/feedbak-messages") || location.pathname.includes("/reviews-list") || location.pathname.includes("/edit-discount");

  useEffect(() => {
  // الوضع الداكن أو الفاتح
  if (isDarkMode) {
    document.body.classList.add("dark-theme");
    document.body.classList.remove("light-theme");
  } else {
    document.body.classList.add("light-theme");
    document.body.classList.remove("dark-theme");
  }

  // تحميل بيانات المستخدم
  supabase.auth.getSession().then((res) => {
    if (res.data?.session) {
      setAuth(true);
      const userId = res.data.session.user.id;
      supabase
        .from("users_profiles")
        .select("user_type")
        .eq("user_id", userId)
        .single()
        .then(({ data }) => {
          if (data) {
            setUserType(data.user_type);
          }
        });
    }
  });

  // تحميل Google Translate script مرة واحدة
  const existingScript = document.getElementById('google-translate-script');
  if (!existingScript) {
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script);

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,ar',
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
      }, 'google_translate_element');
    };
  }

  // مراقبة العنصر ونقله إلى container
  const interval = setInterval(() => {
    const frame = document.querySelector('.goog-te-gadget');
    const container = document.getElementById('translate-container');
    if (frame && container && !container.innerHTML.includes('goog-te-gadget')) {
      container.innerHTML = '';
      container.appendChild(frame);
      clearInterval(interval);
    }
  }, 500);

  return () => clearInterval(interval);
}, [isDarkMode]);



  const handleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    window.localStorage.setItem("darkmode", newMode.toString());
    document.body.classList.toggle("dark-theme", newMode);
    document.body.classList.toggle("light-theme", !newMode);
  };

  return (
    <div className="nav">
      <button className="mobile-btn">Menu</button>
      <div className="header" >
        <Link className="link" to="/">Home Page</Link>
        <Link className="link" to="/products">Browse our products</Link>
        <Link className="link" to="/checkout">Shopping Cart</Link>
        <Link className="link" to="/feedback">Share your feedback</Link>

        {/* ✅ زر الترجمة في المنتصف */}
        {/* زر الترجمة متوافق مع الجوال والديسكتوب */}
<div
  id="translate-container"
  style={{
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px 6px',
    height: '30px',
    backgroundColor: '#fff',
    borderRadius: '6px',
    boxShadow: '0 0 2px rgba(0,0,0,0.15)',
    transform: 'scale(0.95)',
    maxWidth: '140px',
    whiteSpace: 'nowrap',
    margin: '0 10px'
  }}
/>


        {/* ✅ زر الرجوع للوحة التحكم إذا كان آدمن */}
        {auth && userType === 'admin' && isDashboardPage && (
          <Link className="link" to="/dashboard" style={{ color: '#ff9f43' }}>
            Dashboard
          </Link>
        )}

        {!auth && <Link className="link-btn" to="/signin">Sign In</Link>}
        {auth && <Link className="link-btn" to="/profile">My Profile</Link>}

        <button className="theme-toggle-btn" onClick={handleDarkMode}>
  <img
    src="/darkmode.png"
    alt="Toggle Theme"
    style={{
      filter: isDarkMode ? "invert(100%)" : "none"
    }}
  />
</button>

      </div>
    </div>
  );
}