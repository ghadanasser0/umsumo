import React, { useEffect, useState } from 'react'
import { supabase } from '../../supabase';
import Header from '../../parts/Header';
import Footer from '../../parts/Footer';
import { Link, useParams } from 'react-router-dom';

export default function CustomerDetails() {
    const [data, setData] = useState(null);
    const { user_id } = useParams()
    const formater = Intl.NumberFormat('en-OM', { style: 'currency', currency: 'OMR' });

    useEffect(() => {
        supabase
            .from("orders")
            .select(`
                id,
                order_id,
                user_id,
                name,
                mobile,
                created_at,
                shipping_fees,
                payment_method,
                paid,
                status,
                total
            `)
            .eq('user_id', user_id)
            .then(resData => {
                if (resData.data && resData.data.length != 0) {
                    setData(resData.data);
                }
            })
            .catch(error => {
                console.log(error);
            })
    }, []);


    return (
        <div>
            <Header />
            <div className="padding" style={{ width: '75%', margin: 'auto' }}>
                    <h3>Customer orders List:</h3>
                    {data && data.map(item => <Link to={'/orders/'+item.id} key={"order-" + item.id} style={{ background: '#fff', display: 'flex', padding: 10, borderRadius: 15, color: '#000', textDecoration: 'none', flexDirection: 'row', justifyContent: 'space-between', margin: 5 }}>
                        <h3>Order Id: {item.order_id}</h3>
                        <p>Data: {new Date(item.created_at).toLocaleString("en-GB")}</p>
                        <p><b>Total: {formater.format(item.total)}</b></p>
                    </Link>)}

                </div>
            <Footer />
        </div>
    )
}
