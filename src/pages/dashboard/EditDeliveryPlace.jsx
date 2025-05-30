import React, { useEffect, useState } from 'react'
import Header from '../../parts/Header';
import Footer from '../../parts/Footer'
import { supabase } from '../../supabase';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditDeliveryPlace() {
    const [data, setData] = useState(null);
    const [msg, setMsg] = useState(null);
    const navigate = useNavigate();
    const { place_id } = useParams();

    useEffect(() => {
        if(place_id){
            supabase
                .from("delivery_places")
                .select("*")
                .eq('id', place_id)
                .then(resData => {
                    if (resData.data && resData.data.length != 0) {
                        setData(resData.data[0]);
                    }
                })
                .catch(error => {
                    console.log(error);
                })
        }
    }, [place_id]);

    const handleSave = (e) => {
        e.preventDefault();
        setMsg(null);

        if(e.target.name.value == "" || e.target.price.value == ""){
            setMsg('Enter all the required feilds.');
            return false;
        }

        supabase
            .from("delivery_places")
            .update({
                place_name: e.target.name.value,
                price: e.target.price.value,
            })
            .eq('id', place_id)
            .then(res => {
                e.target.reset();
                navigate('/delivery-list');
            })
            .catch(error => {
                setMsg("Something went wrong...")
            })
    }

    return (
        <div>
            <Header />
            <form method="post" className="form" encType="multipart/form-data" onSubmit={handleSave}>
                <h2 className='center'>Edit Delivery Place</h2>
                <label htmlFor="name">Name:</label>
                <input type="text" id="name" name="name" placeholder="Enter Area name" defaultValue={data && data.place_name} />

                <label htmlFor="price">Price:</label>
                <input type="text" id="price" name="price" placeholder="Enter Delivery price" defaultValue={data && data.price} />

              {msg && (
  <p style={{
    color: msg.toLowerCase().includes('success') ? 'green' : 'red',
    textAlign: 'center'
  }}>
    {msg}
  </p>
)}

                <div style={{ display: 'flex', justifyContent: 'center' }}> 
                <button type="submit" className="btn full">Save</button>
                </div>
            </form>

            <Footer />
        </div>
    )
}
