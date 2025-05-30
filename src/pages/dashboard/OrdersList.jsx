import React, { useEffect, useState } from 'react'
import { supabase } from '../../supabase';
import Header from '../../parts/Header';
import Footer from '../../parts/Footer';
import { Link } from 'react-router-dom';

export default function OrdersList() {
    const [data, setData] = useState(null);
    const [shadowData, setShadowData] = useState(null);
    const [products, setProducts] = useState(null);
    const [msg, setMsg] = useState(null);
    const formater = Intl.NumberFormat('en-OM', { style: 'currency', currency: 'OMR' });

    useEffect(() => {
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
                total
            `)
            .order('id', { ascending: false })
            .then(resData => {
                if (resData.data && resData.data.length != 0) {
                    setData(resData.data);
                    setShadowData(resData.data);
                }
                loadProducts()
            })
            .catch(error => {
                console.log(error);
                loadProducts()
            })
    }, []);

    function loadProducts() {
        supabase
            .from("products")
            .select("*")
            .order('id', { ascending: false })
            .then(resData => {
                if (resData.data && resData.data.length != 0) {
                    setProducts(resData.data);
                }
            })
            .catch(error => {
                console.log(error);
            });
    }

    function handleReport(e) {
        e.preventDefault();
        setMsg(null);

        const from = e.target.from.value;
        const to = e.target.to.value;
        const product = e.target.product.value;
        let tmpArr = [];

        if (!from && !to && product === 'all') {
            setMsg("Please select a filter: date range or product.");
            return;
        }

        if (product === 'all') {
            tmpArr = shadowData.filter(item =>
                new Date(item.created_at) >= new Date(from + " 00:00:00") &&
                new Date(item.created_at) <= new Date(to + " 23:59:59")
            );
            setData(tmpArr);
            if (tmpArr.length === 0) setMsg("No orders found for selected date range.");
        } else {
            supabase
                .from("orders_items")
                .select(`
                    *,
                    order:order_id (
                        id,
                        order_id,
                        created_at,
                        name,
                        mobile,
                        payment_method,
                        paid,
                        status,
                        total
                    )
                `)
                .eq('name', product)
                .order('id', { ascending: false })
                .then(resData => {
                    if (resData.data && resData.data.length !== 0) {
                        resData.data.map(item => {
                            tmpArr.push(item.order);
                        });
                        setData(tmpArr);
                    } else {
                        setData([]);
                        setMsg("No orders found for the selected product.");
                    }
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }

    function generateReport() {
        if (!data || data.length === 0) {
            alert("No orders to print.");
            return;
        }

        let reportWindow = window.open('', '', 'width=800,height=600');
        reportWindow.document.write('<html><head><title>Orders Report</title></head><body>');
        reportWindow.document.write('<h2>Filtered Orders Report</h2>');
        reportWindow.document.write('<table border="1" cellpadding="10" cellspacing="0" style="width:100%; text-align:left;">');
        reportWindow.document.write('<tr><th>#</th><th>Order ID</th><th>Date</th><th>Name</th><th>Mobile</th><th>Payment Method</th><th>Paid</th><th>Status</th><th>Total</th></tr>');

        data.forEach((item, index) => {
            reportWindow.document.write(`
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.order_id}</td>
                    <td>${new Date(item.created_at).toLocaleString()}</td>
                    <td>${item.name}</td>
                    <td>${item.mobile}</td>
                    <td>${item.payment_method}</td>
                    <td>${item.paid ? "Yes" : "No"}</td>
                    <td>${item.status}</td>
                    <td>${formater.format(item.total)}</td>
                </tr>
            `);
        });

        reportWindow.document.write('</table>');
        reportWindow.document.write('</body></html>');
        reportWindow.document.close();
        reportWindow.print();
    }

    return (
        <div>
            <Header />
            <div className="padding" style={{ width: '75%', margin: 'auto' }}>
                <h3>Orders List:</h3>

                <form method="post" onSubmit={handleReport} style={{ margin: 15, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
  <b style={{ marginLeft: 12 }}>Filter By Date: </b>

  <label htmlFor="from" style={{ marginLeft: 12 }}>
    From <input type='date' id="from" name='from' style={{ borderRadius: 15, padding: 4, paddingLeft: 15, paddingRight: 15 }} />
  </label>

  <label htmlFor="to" style={{ marginLeft: 12 }}>
    To <input type='date' id="to" name='to' style={{ borderRadius: 15, padding: 4, paddingLeft: 15, paddingRight: 15 }} />
  </label>

  <label htmlFor="product" style={{ marginLeft: 12 }}>
    Or Filter By Product
    <select name="product" id="product" style={{ borderRadius: 15, padding: 4, paddingLeft: 15, paddingRight: 15, marginLeft: 8 }}>
      <option value="all">Select Product</option>
      {products && products.map(item => (
        <option key={item.id} value={item.name}>{item.name}</option>
      ))}
    </select>
  </label>

  <div style={{ display: 'inline-flex', gap: '10px', marginLeft: '12px' }}>
    <button
      type='submit'
      style={{
        borderRadius: 15,
        padding: '5px 25px',
        border: 'none',
        outline: 'none',
        background: '#694ceb',
        color: '#ffffff'
      }}
    >
      View
    </button>

    <button
      type='button'
      onClick={generateReport}
      style={{
        borderRadius: 15,
        padding: '5px 25px',
        border: 'none',
        outline: 'none',
        background: '#694ceb',
        color: '#ffffff'
      }}
    >
      Print Report
    </button>
  </div>
</form>


                {msg && <p style={{ color: "black" , textAlign: 'center' }}>{msg}</p>}

                <hr />

                {data && data.map(item =>
                    <Link to={'/orders/' + item.id} key={"order-" + item.id} style={{
                        background: '#fff', display: 'flex', padding: 10,
                        borderRadius: 15, color: '#000', textDecoration: 'none',
                        flexDirection: 'row', justifyContent: 'space-between', margin: 5
                    }}>
                        <h3>Order Id: {item.order_id}</h3>
                        <p>Date: {new Date(item.created_at).toLocaleString("en-GB")}</p>
                        <p>Name: {item.name}</p>
                        <p><b>Total: {formater.format(item.total)}</b></p>
                    </Link>
                )}
            </div>
            <Footer />
        </div>
    );
}
