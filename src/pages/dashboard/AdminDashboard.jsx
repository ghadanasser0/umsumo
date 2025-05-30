import React, { useEffect, useState } from 'react'
import Header from '../../parts/Header'
import Footer from '../../parts/Footer'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'


export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth
      .getSession()
      .then((res) => {
        if (res.data.session && res.data.session.user) {
          supabase
            .from("users_profiles")
            .select("*")
            .eq('user_id', res.data.session.user.id)
            .then(response => {
              if (response.data && response.data.length != 0) {
                if(response.data[0].user_type === 'admin'){
                    setUser(response.data[0]);
                    setLoading(false)
                } else {
                    navigate('/signin');
                }
              }
            })
            .catch(error => {
              console.log(error);
            })
        } else {
          navigate('/signin');
        }
      });

    }, [])

    return (
        <div>
            <Header />
            {loading && <div style={{ marginTop: "5%", marginBottom: '5%' }}>
                <h2 className="section-headline center">Adminstrator Dashboard</h2>
                <p style={{ margin: 25, padding: 25, textAlign: 'center'}}>Authinticating user, please wait....</p>
            </div>}

            {!loading && <div style={{ marginTop: "5%", marginBottom: '5%' }}>
                <h2 className="section-headline center">Adminstrator Dashboard</h2>
                <p className="padding center">Welcome back, {user.name}</p>
                <div className="box-list padding" style={{ width: '75%', margin: 'auto' }}>
                    <Link to="/orders" className="box center box-purple">
                        <img src="/carticon.png" className="icon" alt="" />
                        <h3 className="">Orders</h3>
                        <p>Manage orders.</p>
                    </Link>
                    <Link to="/products-list" className="box center box-purple">
                        <img src="/productsicon.png" className="icon" alt="" />
                        <h3 className="">Products</h3>
                        <p>Manage products.</p>
                    </Link>
                    <Link to="/customers" className="box center box-purple">
                        <img src="/customersicon.png" className="icon" alt="" />
                        <h3 className="">Customers</h3>
                        <p>Manage customers.</p>
                    </Link>
                    <Link to="/delivery-list" className="box center box-purple">
                        <img src="/deliveryicon.png" className="icon" alt="" />
                        <h3 className="">Delivery Places</h3>
                        <p>Manage Delivery Areas .</p>
                    </Link>
                    <Link to="/feedbak-messages" className="box center box-purple">
                        <img src="/feedbackicon.png" className="icon" alt="" />
                        <h3 className="">Feedback</h3>
                        <p>Manage feedback messages.</p>
                    </Link>
                    <Link to="/reviews-list" className="box center box-purple">
                        <img src="/feedbackicon.png" className="icon" alt="" />
                        <h3 className="">Products Reviews and evaluation</h3>
                        <p>Manage reviews list.</p>
                    </Link>

                </div>
            </div>}
            <Footer />
        </div>
    )
}
