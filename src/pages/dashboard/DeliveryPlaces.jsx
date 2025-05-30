import React, { useEffect, useState } from 'react'
import { supabase } from '../../supabase';
import Header from '../../parts/Header';
import Footer from '../../parts/Footer';
import { Link, useNavigate } from 'react-router-dom';

export default function DeliveryPlaces() {
    const [data, setData] = useState(null);
    const navigate = useNavigate();
    const formater = Intl.NumberFormat('en-OM', { style: 'currency', currency: 'OMR' });

    useEffect(() => {
        supabase
            .from("delivery_places")
            .select("*")
            .order('id', { ascending: false })
            .then(resData => {
                if (resData.data && resData.data.length != 0) {
                    setData(resData.data);
                }
            })
            .catch(error => {
                console.log(error);
            })
    }, []);


    const handleDelete = (item) => {
        let r = window.confirm("Are you sure to delete this order?");

        if(r){
            supabase
                .from("delivery_places")
                .delete()
                .eq('id', item)
                .then(() => {
                    navigate('/delivery-list');
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }

    return (
        <div>
           <Header />
            <div className="padding" style={{ width: '75%', margin: 'auto' }}>
                    <h2>Delivery Places: 
                    <div style={{ display: 'flex', justifyContent: 'center' }}>     
                 <Link to="/new-delivery-place" className='btn'>New Place</Link></div></h2>
                    {data && data.map(item => <Link to={'/customers/'+item.user_id} key={"order-" + item.id} style={{ display: 'block', background: '#fff', padding: 10, borderRadius: 15, color: '#000', textDecoration: 'none', margin: 5 }}>
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between',  }}>
                            <h3>{item.place_name}</h3>
                            <p>Price: {formater.format(item.price)}</p>
                            <p>{new Date(item.created_at).toLocaleString("en-GB")}</p>
                        </div>
                      
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Link style={{ padding: 3, paddingLeft: 15, paddingRight: 15, textDecoration: 'none', color: '#fff', backgroundColor: '#ff0000', borderRadius: 15, margin: 10 }} to={"/delivery-list/"+item.id}>Edit</Link>
                            <button className='delete-btn padding' onClick={() => handleDelete(item.id)}>Delete</button>
                        </div>
                    </Link>)}
                </div>
            <Footer />
        </div>
    )
}
