import React from 'react';
import Header from '../parts/Header';
import Footer from '../parts/Footer';

export default function Contact() {
  return (
    <div>
      <Header />

      <h2 style={{ textAlign: 'center', fontSize: '2rem' }}>Contact Us</h2>
      <div style={{ 
        width: '75%', 
        margin: 'auto', 
        padding: '20px', 
        border: "3px solid #808080" ,
       borderRadius: '15px',
       marginBottom: '40px'
      }}>
        <p><span style={{ color: "#ff9f43", fontWeight: 'bold' }}>Phone:</span> +968 71933779</p>
        <p><span style={{ color:"#ff9f43", fontWeight: 'bold' }}>E-mail:</span> info@umsumo.om</p>
        <h3 style={{ color: '#ff9f43' }}>We are available at:</h3>
        <p>-AL Suwaiq - Hikayat Anaqa Boutique</p>
        <p>-Barka - Soul Boutique</p>
        <p>-Izki - Bouvardina Boutique</p>
        <p>-Nizwa - En Boutique</p>
        <p>-Saham - Viola Boutique</p>
        <p>-Al Meabeala - Caress Boutique</p>
        <p>-Al Kuiwer - Designer Boutique</p>
        <p>-Samayil - Bella wa Nergis Boutique</p>
        <p>-Snaw - Yara Boutique</p>
        <p>-Rustaq - Basmala Boutique</p>
      </div>

      <Footer />
    </div>
  )
}
