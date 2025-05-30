import React, { useEffect, useState } from 'react'
import Header from '../parts/Header'
import Footer from '../parts/Footer'
import { supabase } from '../supabase';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState(null);
  const formater = Intl.NumberFormat('en-OM', { style: 'currency', currency: 'OMR' });

  useEffect(() => {
    supabase.auth
    .getSession()
    .then((res) => {
      if(res.data){
        if(res.data.session){
          supabase
            .from("users_profiles")
            .select("*")
            .eq('user_id', res.data.session.user.id)
            .limit(5)
            .then(response => {
              if (response.data && response.data.length != 0) {
                setUser(response.data[0]);
                supabase
                  .from("orders")
                  .select(`
                    id,
                    order_id,
                    created_at,
                    shipping_fees,
                    total,
                    orders_items(name, qty, price)
                  `)
                  .eq('user_id', res.data.session.user.id)
                  .then(resData => {                    
                    if (resData.data && resData.data.length != 0) {
                      setData(resData.data);
                    }
                  })
                  .catch(error => {
                    console.log(error);
                  })
              }
            })
            .catch(error => {
              console.log(error);
            })
        }
      }
    })
    .catch(err => {
      console.log(err);
    })
  }, []);

  const updateProfile = (e) => {
    e.preventDefault();
    setMsg(null);

    supabase
      .from("users_profiles")
      .update({
        name: e.target.full_name.value,
        mobile: e.target.mobile.value,
        area: e.target.area.value,
      })
      .eq('user_id', user.user_id)
      .then(() => {
        setMsg("Profile updated successfully..")
      })
      .catch(error => {
        console.log(error);
      })
  }

  const handleSignout = () => {
    let r = window.confirm("Are you sure to sign out of your account?");

    if(r){
      supabase.auth.signOut()
      .then(() => {
        window.location = '/signin';
      })
      .catch(err => {
  
      })
    }
  }

  return (
    <div>
      <Header />
      <div className="container">
        <div style={{ width: '60%', padding: '15px' }}>
          <h3>My Orders:</h3>
          {data && data.map(item => <div key={"order-"+item.id} style={{ background: '#fff', display: 'block', padding: 10, borderRadius: 15, color: '#000', marginBottom: 5  }}>
              <h3>Order Id: {item.order_id}</h3>
              <p>Data: {new Date(item.created_at).toLocaleString("en-GB")}</p>
              <hr />
              <div className="cart-item">
                <p style={{ width: '45%' }}>Name</p>
                <p style={{ width: '15%' }}>QTY</p>
                <p style={{ width: '25%' }}>Price</p>
              </div>
              {item.orders_items && item.orders_items.map(cart_item => <div key={"cart-"+cart_item.name} className="cart-item">
                <p style={{ width: '45%' }}>{cart_item.name}</p>
                <p style={{ width: '15%' }}>{cart_item.qty}</p>
                <p style={{ width: '25%' }}>{formater.format(cart_item.price)}</p>
              </div>)}
              <p>Shipping Fees: {formater.format(item.shipping_fees)}</p>
              <p><b>Total: {formater.format(item.total)}</b></p>
          </div>)}

        </div>
        <div style={{ width: '40%', padding: '15px' }}>
          <form method="post" className="form" style={{ width: '90%' }} onSubmit={updateProfile}>
            <h2 >Update profile</h2>
            <label htmlFor="full_name">Full Name:</label>
            <input type="text" id="full_name" defaultValue={user && user.name} className="full" name="full_name" placeholder="Enter your full name" required />

            <label htmlFor="mobile">Mobile Number:</label>
            <input type="tel" id="mobile" name="mobile" defaultValue={user && user.mobile} placeholder="Enter your mobile number" pattern="[0-9]{8}" required className="full" />

            <label htmlFor="area">Area:</label>
            <input type="text" id="area" className="full" defaultValue={user && user.area} name="area" placeholder="Enter your area" required />

            {msg && (
  <p style={{
    color: msg.toLowerCase().includes('success') ? 'green' : 'red',
    textAlign: 'center'
  }}>
    {msg}
  </p>
)}

            <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button type="submit" className="btn full">Update Profile</button>
            </div>
          </form>
        </div>

      </div>


      <div className="center padding">
        <button style={{ display: 'block', width: 100, alignSelf: 'center', margin: 'auto', marginBottom: 55, marginTop: 55 }} className="delete-btn full" onClick={handleSignout}>Sign Out</button>
      </div>

      <Footer />
    </div>
  )
}
