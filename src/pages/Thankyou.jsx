import React, { useEffect } from 'react';
import Footer from '../parts/Footer';
import { Link, useParams } from 'react-router-dom';
import Header from '../parts/Header';
import { supabase } from '../supabase';

export default function Thankyou() {
    const { order_id } = useParams();

    useEffect(() => {
        if (order_id) {
            supabase
                .from("orders")
                .select("*")
                .eq('order_id', order_id)
                .then(async (response) => {
                    if (!response.data || response.data.length === 0) return;

                    const order = response.data[0];
                    const { id, name, payment_method, total } = order;

                    let paid = 0;
                    if (payment_method === 'card') {
                        paid = 1;
                    }

                   
                    await supabase
                        .from("orders")
                        .update({
                            status: 'in progress',
                            paid: paid,
                        })
                        .eq('order_id', order_id);

                
                    const itemsRes = await supabase
                        .from("orders_items")
                        .select("*")
                        .eq("order_id", id);

                    const items = itemsRes.data || [];

                    const itemDetails = items.map(item =>
                        `- ${item.name} (x${item.qty}) — ${item.price} OMR`
                    ).join("\n");

                    
                    const customerMessage = `Hello ${name},

Thank you for your order no: ${order_id}.
We are working on it, stay tuned!

🧾 Order Details:
${itemDetails}

💳 Payment Method: ${payment_method}
💰 Total: ${total} OMR
`;

                  
                    const { data } = await supabase.auth.getUser();

                  
                    await supabase.functions.invoke('send-emails', {
                        body: {
                            name: name,
                            email: data.user.email,
                            subject: `Omsumo - Order ${order_id} Received`,
                            message: customerMessage,
                        }
                    });

                 
                    const adminMessage = `🛎 New order received

👤 Customer: ${name}
🧾 Order Number: ${order_id}

📦 Items:
${itemDetails}

💰 Total: ${total} OMR
💳 Payment: ${payment_method}
`;

                  
                    await supabase.functions.invoke('send-emails', {
                        body: {
                            name: "Omsumo",
                            email: "900vvx@gmail.com",
                            subject: `Omsumo - New Order from ${name}`,
                            message: adminMessage,
                        }
                    });

                })
                .catch(error => {
                    console.log(error);
                });
        }
    }, [order_id]);

    return (
        <div>
            <Header />
            <div className="center padding">
                <img src="/logo.jpg" className="logo" />
                <h2 className="headline">Thank You</h2>
                <p>We are preparing your order no: {order_id}</p>
                <p>Stay tuned!</p>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Link to="/profile" className="btn">Check your previous orders..</Link>
                </div>
            </div>
            <Footer />
        </div>
    );
}
