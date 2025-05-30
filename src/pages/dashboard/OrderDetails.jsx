import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import Header from '../../parts/Header';
import Footer from '../../parts/Footer';
import { useNavigate, useParams } from 'react-router-dom';

export default function OrderDetails() {
    const [data, setData] = useState(null);
    const { order_id } = useParams();
    const formater = Intl.NumberFormat('en-OM', { style: 'currency', currency: 'OMR' });
    const navigate = useNavigate();

    useEffect(() => {
        if (order_id) {
            supabase
                .from("orders")
                .select(`
                    id,
                    order_id,
                    name,
                    mobile,
                    created_at,
                    shipping_fees,
                    payment_method,
                    paid,
                    status,
                    total,
                    additional_details,
                    orders_items(name, qty, price)
                `)
                .eq('id', order_id)
                .then(resData => {
                    if (resData.data && resData.data.length !== 0) {
                        setData(resData.data[0]);
                    }
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }, [order_id]);

    const handleDelete = (item) => {
        let r = window.confirm("Are you sure to delete this order?");

        if (r) {
            supabase
                .from("orders")
                .delete()
                .eq('id', item)
                .then(() => {
                    navigate('/orders');
                })
                .catch(error => {
                    console.log(error);
                });
        }
    };

    // تحقق من أن البيانات تم تحميلها بالكامل
    if (!data) {
        return <div>Loading...</div>; // عرض مؤشر تحميل
    }

    return (
        <div>
             <Header />
            <div className="padding print" style={{ width: '75%', margin: 'auto' }}>
                <h3>Order Details:</h3>
                <div style={{ background: '#fff', display: 'block', padding: 10, borderRadius: 15, color: '#000' }}>
                    <h3>Order Id: {data.order_id}</h3>
                    <p>Date: {new Date(data.created_at).toLocaleString("en-GB")}</p>
                    <p>Name: {data.name}</p>
                    <p>Mobile: {data.mobile}</p>
                    <p>Payment Method: {data.payment_method}</p>
                    {data.payment_method === 'card' && <p>Payment Status: {data.paid ? 'paid' : 'unpaid'}</p>}
                    <p>Status: {data.status}</p>

                    {/* عرض حقل additional_details */}
                    {data.additional_details && <p>Additional Details: {data.additional_details}</p>}

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button className='btn' style={{ padding: 3, margin: 13 }} onClick={window.print}>Print</button>
                        <button className='btn' style={{ padding: 3, margin: 13 }} onClick={() => window.open("https://wa.me/968" + data.mobile, "system")}>Whatsapp</button>
                        <button className='delete-btn' style={{ paddingLeft: 25, paddingRight: 25 }} onClick={() => handleDelete(data.id)}>Delete</button>
                    </div>
                    <hr />
                    <div className="cart-data" style={{ display: 'flex' }}>
                        <p style={{ width: '45%' }}>Name</p>
                        <p style={{ width: '15%' }}>QTY</p>
                        <p style={{ width: '25%' }}>Price</p>
                    </div>
                    {data.orders_items && data.orders_items.map(cart_data => (
                        <div key={"cart-" + cart_data.name} className="cart-data" style={{ display: 'flex' }}>
                            <p style={{ width: '45%' }}>{cart_data.name}</p>
                            <p style={{ width: '15%' }}>{cart_data.qty}</p>
                            <p style={{ width: '25%' }}>{formater.format(cart_data.price)}</p>
                        </div>
                    ))}
                    <p>Shipping Fees: {formater.format(data.shipping_fees)}</p>
                    <p><b>Total: {formater.format(data.total)}</b></p>
                </div>
            </div>
            <Footer />
        </div>
    );
}
