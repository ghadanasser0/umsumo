import React, { useEffect, useState } from 'react'
import { supabase } from '../../supabase';
import Header from '../../parts/Header';
import Footer from '../../parts/Footer';
import { Link, useNavigate } from 'react-router-dom';

export default function CustomersList() {
    const [data, setData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        supabase
            .from("users_profiles")
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
                .from("users_profiles")
                .delete()
                .eq('id', item)
                .then(() => {
                    navigate('/customers');
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
                    <h2>Customers List:</h2>
                    {data && data.map(item => <Link to={'/customers/'+item.user_id} key={"order-" + item.id} style={{ background: '#fff', display: 'flex', padding: 10, borderRadius: 15, color: '#000', textDecoration: 'none', flexDirection: 'row', justifyContent: 'space-between', margin: 5 }}>
                        <h3>{item.name}</h3>
                        <p>Register Data: {new Date(item.created_at).toLocaleString("en-GB")}</p>
                    </Link>)}

                </div>
            <Footer />
        </div>
    )
}
