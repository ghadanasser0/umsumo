import React, { useState } from 'react';
import Header from '../../parts/Header';
import Footer from '../../parts/Footer';
import { supabase } from '../../supabase';
import { useNavigate } from 'react-router-dom';

export default function NewDeliveryPlace() {
    const [msg, setMsg] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSave = async (e) => {
        e.preventDefault();
        setMsg(null);
        setLoading(true);

       
        const name = e.target.name.value.trim();
        const price = e.target.price.value.trim();

       
        const formattedName = name.replace(/\s+/g, ' ').toUpperCase();

        console.log("Formatted Name:", formattedName);
        console.log("Price:", price);

      
        if (name === "" || price === "") {
            setMsg('Enter all the required fields.');
            setLoading(false);
            return;
        }

        try {
         
            const { data: existingPlaces, error: fetchError } = await supabase
                .from("delivery_places")
                .select("*")
                .ilike("place_name", formattedName);

            console.log("Existing Places:", existingPlaces);

            if (fetchError) {
                console.error("Fetch Error:", fetchError);
                setMsg("Error checking existing places.");
                setLoading(false);
                return;
            }

           
            if (existingPlaces.length > 0) {
                setMsg(`The delivery place "${name}" already exists.`);
                setLoading(false);
                return;
            }

           
            const { error: insertError } = await supabase
                .from("delivery_places")
                .insert({
                    place_name: formattedName,
                    price: price,
                });

            if (insertError) {
                console.error("Insert Error:", insertError);
                setMsg("Something went wrong while saving...");
                setLoading(false);
                return;
            }

         
            e.target.reset();
            navigate('/delivery-list');

        } catch (error) {
            console.error("Unexpected error:", error);
            setMsg("Unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Header/>
            

            <form method="post" className="form" encType="multipart/form-data" onSubmit={handleSave}>
                <h2 className='center'>New Delivery Place</h2>

                <label htmlFor="name">Name:</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter Area name"
                />

                <label htmlFor="price">Price:</label>
                <input
                    type="text"
                    id="price"
                    name="price"
                    placeholder="Enter Delivery price"
                />

                {msg && (
  <p style={{
    color: msg.toLowerCase().includes('success') ? 'green' : 'red',
    textAlign: 'center'
  }}>
    {msg}
  </p>
)}

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button type="submit" className="btn full" disabled={loading}>
                    {loading ? 'Saving...' : 'Create'}
                    
                </button></div>
            </form>

            <Footer />
        </div>
    );
}
