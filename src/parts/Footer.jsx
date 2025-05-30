import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <div className="footer">
        <h3><Link to="/contact">Contact us</Link></h3>
        <h3><Link to="/dashboard">Staff Dashboard</Link></h3>
        <p>You can follow our latest offer on our socail media accounts</p>
        <a title="Instagram" href="https://www.instagram.com/skin_care_khulood" target="_blank"><img src="/instagram.png" alt="" /></a>
        <a title="Whatsapp" href="https://wa.me/96871933779" target="_blank"><img src="/whatsapp.png" alt="" /></a>
        <p>&copy; 2025, all rights reserved.</p>
    </div>
  )
}
