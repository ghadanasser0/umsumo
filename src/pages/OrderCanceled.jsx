import React, { useEffect } from 'react'
import Footer from '../parts/Footer'
import { Link, useParams } from 'react-router-dom'
import Header from '../parts/Header'
import { supabase } from '../supabase';

export default function OrderCanceled() {
    const { order_id } = useParams();

    useEffect(() => {
        if(order_id){
            supabase
            .from("orders")
            .update({
                status: 'canceled'
            })
            .eq('order_id', order_id)
            .then(response => {
               
            })
            .catch(error => {
                console.log(error);
            })
        }
    }, [order_id]);

    return (
        <div>
            <Header />
            <div className="center padding">
                <img src="/logo.jpg" className="logo" />
                <h2 className="headline">Order canceled</h2>
                <p>Your order no: {order_id} has been canceled.</p>
                <p>order again:</p>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Link to="/products" className="btn">Product List</Link>
            </div></div>

            <Footer />
        </div>
    )
}
