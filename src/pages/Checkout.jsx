import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../parts/Header';
import Footer from '../parts/Footer';
import { supabase } from '../supabase';

export default function Checkout() {
  const [msg, setMsg] = useState(null);
  const [cart, setCart] = useState(null);
  const [total, setTotal] = useState(0);
  const [subTotal, setSubTotal] = useState(0);
  const [user, setUser] = useState(null);
  const [deliveryPlaces, setDeliveryPlaces] = useState(null);
  const [deliveryFees, setDeliveryFees] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const formater = Intl.NumberFormat('en-OM', { style: 'currency', currency: 'OMR' });

  useEffect(() => {
    supabase.auth.getSession().then((res) => {
      if (res.data.session && res.data.session.user) {
        supabase
          .from("users_profiles")
          .select("*")
          .eq('user_id', res.data.session.user.id)
          .then(response => {
            if (response.data && response.data.length !== 0) {
              setUser(response.data[0]);
            }
            loadDeliveryPlaces();
          })
          .catch(error => {
            loadDeliveryPlaces();
          });
      } else {
        navigate('/signin');
      }
    });

    try {
      let tmpCart = JSON.parse(window.localStorage.getItem("cart")) || [];
      setCart(tmpCart);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (cart) {
      calculateTotals(cart, deliveryFees);
    }
  }, [cart, deliveryFees]);

  const loadDeliveryPlaces = () => {
    supabase
      .from("delivery_places")
      .select("*")
      .then(response => {
        if (response.data && response.data.length !== 0) {
          setDeliveryPlaces(response.data);
          setDeliveryFees(response.data[0].price);
        }
      })
      .catch(error => {
        setMsg('Failed to load delivery places. Please try again.');
      });
  }

  const calculateTotals = (cartItems, deliveryFee) => {
    const now = new Date();
    let tmpSubTotal = 0;

    cartItems.forEach(item => {
      const isDiscountActive = item.discount_price &&
        item.discount_start &&
        item.discount_end &&
        new Date(item.discount_start) <= now &&
        new Date(item.discount_end) >= now;

      const priceToUse = isDiscountActive ? parseFloat(item.discount_price) : parseFloat(item.price);
      tmpSubTotal += item.qty * priceToUse;
    });

    setSubTotal(tmpSubTotal);
    setTotal(tmpSubTotal + Number(deliveryFee));
  }

  const handleRemoveItem = (item_id) => {
    let tmpCart = cart.filter(item => item.id !== item_id);
    setCart(tmpCart);
    window.localStorage.setItem("cart", JSON.stringify(tmpCart));
  }

  const handleQty = (item_id, op) => {
    let tmpCart = cart.slice();
    let tmpArr = tmpCart.map(item => {
      if (item_id === item.id) {
        if (op === 'add') {
          item.qty += 1;
        } else {
          if (item.qty > 1) item.qty -= 1;
        }
      }
      return item;
    });
    setCart(tmpArr);
    window.localStorage.setItem("cart", JSON.stringify(tmpArr));
  }

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fullName = e.target.full_name.value;
    const mobile = e.target.mobile.value;
    const paymentMethod = e.target.payment_method.value;
    const area = e.target.area.value;
    const additionalDetails = e.target.additional_details.value;
    const orderId = Date.now().toString();

    if (!fullName || !mobile) {
      setMsg('Please fill in all the required fields.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("orders")
        .insert({
          name: fullName,
          mobile: mobile,
          payment_method: paymentMethod,
          shipping_fees: deliveryFees,
          total: total,
          order_id: orderId,
          user_id: user.user_id,
          area: area,
          additional_details: additionalDetails,
        })
        .select("*");

      if (error) {
        setMsg('There was an error processing your order. Please try again.');
        setLoading(false);
        return;
      }

      const now = new Date();
      let tmpArr = cart.map(product => {
        const isDiscountActive = product.discount_price &&
          product.discount_start &&
          product.discount_end &&
          new Date(product.discount_start) <= now &&
          new Date(product.discount_end) >= now;

        const priceToUse = isDiscountActive ? parseFloat(product.discount_price) : parseFloat(product.price);

        return {
          name: product.name,
          price: priceToUse,
          qty: product.qty,
          order_id: data[0].id,
        };
      });

      await supabase.from("orders_items").insert(tmpArr);

      if (paymentMethod === 'cash') {
        navigate(`/thankyou/${orderId}`);
      } else {
        let url = window.location.origin;

        let product_list = tmpArr.map(product => ({
          "name": product.name,
          "quantity": parseInt(product.qty),
          "unit_amount": parseFloat(product.price).toFixed(3) * 1000,
        }));

        product_list.push({
          "name": "Delivery Fees",
          "quantity": 1,
          "unit_amount": Number(deliveryFees) * 1000,
        });

        const response = await fetch('https://uatcheckout.thawani.om/api/v1/checkout/session', {
          method: 'post',
          headers: {
            "Content-Type": "application/json",
            'thawani-api-key': "rRQ26GcsZzoEhbrP2HZvLYDbn9C9et",
          },
          body: JSON.stringify({
            client_reference_id: orderId,
            mode: "payment",
            products: product_list,
            success_url: `${url}/thankyou/${orderId}`,
            cancel_url: `${url}/cancel/${orderId}`,
            metadata: {
              "Customer name": fullName,
              "order id": orderId,
            },
          }),
        });

        const sessionData = await response.json();

        if (sessionData.success) {
          window.location.href = `https://uatcheckout.thawani.om/pay/${sessionData.data.session_id}?key=HGvTMLDssJghr9tlN9gr4DVYt0qyBy`;
        } else {
          navigate(`/cancel/${orderId}`);
        }
      }
    } catch (err) {
      console.error(err);
      setMsg('An error occurred while processing your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />

      {cart && cart.length !== 0 && (
        <div className="container">
          <div style={{ width: '60%', padding: '15px' }}>
            <h3>Shopping Cart:</h3>
            <hr />
            {cart.map(item => {
              const now = new Date();
              const isDiscountActive = item.discount_price &&
                item.discount_start &&
                item.discount_end &&
                new Date(item.discount_start) <= now &&
                new Date(item.discount_end) >= now;
              const priceToUse = isDiscountActive ? item.discount_price : item.price;

              return (
                <div key={`item-${item.id}`} className="cart-item">
                  <p style={{ width: '45%' }}>{item.name}</p>

                  <div style={{ width: '15%', textAlign: 'center' }}>
                  {isDiscountActive ? (
    <div>
      
      
      <span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>
        {formater.format(item.discount_price * item.qty)}
      </span>
    </div>
  ) : (
    <span style={{ color: '#000', fontWeight: 'bold' }}>
      {formater.format(item.price * item.qty)}
    </span>
  )}
</div>


                  <div style={{ display: 'flex', width: '25%', textAlign: 'center', padding: 3, alignItems: 'center', justifyContent: 'center' }}>
                    <button onClick={() => handleQty(item.id, 'add')} style={{ borderRadius: 0, borderBottomLeftRadius: '8px', borderTopLeftRadius: '8px', outline: 'none', border: 'none', background: '#7c5dff' }}>+</button>
                    <input type="number" min={1} value={item.qty} disabled style={{ textAlign: 'center', width: '30%' }} />
                    <button onClick={() => handleQty(item.id, 'min')} style={{ borderRadius: 0, borderBottomRightRadius: '8px', borderTopRightRadius: '8px', outline: 'none', border: 'none', background: '#7c5dff' }}>-</button>
                  </div>

                  <button className="delete-btn" onClick={() => handleRemoveItem(item.id)}>x Remove</button>
                </div>
              )
            })}
          </div>

          <div style={{ width: '40%', padding: '25px' }}>
            <h2>Checkout</h2>
            <form method="post" onSubmit={handleCheckout}>
              <label htmlFor="full_name" className="label">Full Name:</label>
              <input type="text" id="full_name" className="input full" name="full_name" required defaultValue={user && user.name} />

              <label htmlFor="mobile" className="label">Mobile Number:</label>
              <input type="tel" id="mobile" className="input full" name="mobile" pattern="[0-9]{8}" required defaultValue={user && user.mobile} />

              <label className="label">Delivery Area:</label>
              <select className="input full padding" name="area" onChange={(val) => setDeliveryFees(val.target.value)}>
                {deliveryPlaces && deliveryPlaces.map(item => (
                  <option key={item.place_name} value={item.price}>
                    {item.place_name}
                  </option>
                ))}
              </select>

              <label className="label">Payment Method:</label>
              <label htmlFor="card" style={{ display: 'flex', marginTop: 15 }}>
                <input type="radio" id="card" value="card" name="payment_method" required defaultChecked /> <span>Debit Card</span>
              </label>
              <label htmlFor="cash" style={{ display: 'flex' }}>
                <input type="radio" id="cash" value="cash" name="payment_method" required /> <span>Cash</span>
              </label>

              <label htmlFor="additional_details" className="label">Additional Details:</label>
              <textarea id="additional_details" className="input full" name="additional_details" placeholder="Enter any additional details (optional)"></textarea>

              <p>Delivery Fees: {formater.format(deliveryFees)}</p>
              <p>SubTotal: {formater.format(subTotal)}</p>
              <h2 className='section-headline'><b>Total: {formater.format(total)}</b></h2>

              {msg && <p style={{ color: 'red' }}>{msg}</p>}

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button type="submit" className="btn full" disabled={loading}>
                  {loading ? 'Processing...' : 'Finish Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {(!cart || cart.length === 0) && (
        <div style={{ display: 'block', padding: 15, margin: 15, textAlign: 'center' }}>
          <h3>Shopping Cart:</h3>
          <p>Empty shopping cart...</p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Link to="/products" className="btn">Our Products</Link>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
