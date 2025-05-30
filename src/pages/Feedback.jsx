import React, { useState } from 'react';
import Header from '../parts/Header';
import Footer from '../parts/Footer';
import { supabase } from '../supabase';

export default function Feedback() {
    const [msg, setMsg] = useState(null);

    const saveFeedback = (e) => {
        e.preventDefault();
        setMsg(null);

        const name = e.target.name.value;
        const email = e.target.email.value;
        const mobile = e.target.mobile.value;
        const notes = e.target.notes.value;

        // التحقق من الحقول المطلوبة
        if (name === "" || email === "" || mobile === "" || notes === "") {
            setMsg('Please fill in all fields.');
            return;
        }

        // التحقق من صحة رقم الهاتف (رقمي وطوله بين 8 إلى 15 رقم)
        const phoneRegex = /^[0-9]{8,15}$/;
        if (!phoneRegex.test(mobile)) {
            setMsg('Enter a valid phone number (digits only, 8–15 digits).');
            return;
        }

        // تكوين الرسالة المرسلة للبريد
        let message = `Name: ${name}\nEmail: ${email}\nPhone: ${mobile}\n\n${notes}`;

        // إرسال البيانات إلى Supabase
        supabase
            .from("feedback")
            .insert({
                name: name,
                email: email,
                mobile: mobile,
                note: notes,
            })
            .then(async () => {
                e.target.reset();

                const { data, error } = await supabase.functions.invoke('send-emails', {
                    body: {
                        name: name,
                        message: message,
                        subject: "Omsumo website Feedback",
                        email: '900vvx@gmail.com',
                    },
                });

                setMsg("Thank you, we've received your feedback.");
            })
            .catch(error => {
                console.log(error);
                setMsg("Something went wrong while sending your feedback...");
            });
    };

    return (
        <div>
            <Header />

            <form method="post" className="form" onSubmit={saveFeedback}>
                <img src="/logo.jpg" className="logo padding" alt="" />
                <p className='center padding'>
                    In our brand we value your opinions and feedback as they are a source of inspiration and development. Please feel free to share your experience and feedback with us to improve our products and services.
                </p>

                <label htmlFor="name">Your Name:</label>
                <input type="text" id="name" name="name" placeholder="Enter your full name" />

                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" placeholder="Enter your email" />

                <label htmlFor="mobile">Phone Number:</label>
                <input type="tel" id="mobile" name="mobile" placeholder="Enter your phone number" />

                <label htmlFor="notes">Notes:</label>
                <textarea name="notes" id="notes" placeholder="Enter your notes here" rows={12}></textarea>

                    {msg && (
  <p style={{
    color: msg.toLowerCase().includes('thank you') ? 'green' : 'red',
    textAlign: 'center'
  }}>
    {msg}
  </p>
)}

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button type="submit" className="btn full">Send</button>
                </div>
            </form>

            <Footer />
        </div>
    );
}
