import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../parts/Header'
import Footer from '../parts/Footer'
import { supabase } from '../supabase'
import Product from '../parts/Product'

export default function Home() {
  const [data, setData] = useState(null);
  const [onSale, setOnSale] = useState(null);

  useEffect(() => {
    supabase
      .auth.
      getUser()
      .then(res => {
        if (res.data) {
          supabase
            .from('products')
            .select("*")
            .then(products => {
              let productsList = [];
              let usersProducts = [];
              if (products.data) {
                productsList = products.data;
                let tmpOnSale = [];
                productsList.map(item => {
                  if(item.discount_price && item.discount_start && item.discount_end &&
                    new Date(item.discount_start) <= new Date() && new Date(item.discount_end) >= new Date()){
                      tmpOnSale.push(item)
                    }
                });

                setOnSale(tmpOnSale);
                supabase
                  .from('orders')
                  .select("*")
                  .eq('user_id', res.data.user.id)
                  .then(orderDetails => {
                    if (orderDetails.data) {
                      usersProducts = orderDetails.data;
                      const message = {
                        "role": "user",
                        "parts": [{
                          "text": `I have this products: ${JSON.stringify(productsList)} and one of the user ordered these products: ${JSON.stringify(usersProducts)} give me recommended products for this user from the provided products list in JSON format. only give the JSON don't add anything else if there is no match provide an empety array, never mention json in your response.`
                        }
                        ]
                      }

                      fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDA-3WYb5lmDPiGRKX0TTMKAX_3FVyFfUY', {
                        method: 'POST',
                        headers: {
                          'Content-Type': "application/json",
                        },
                        body: JSON.stringify({
                          "contents": message
                        })
                      })
                        .then((response) => response.json())
                        .then(res => {
                          let content = null;
                          try {
                            content = JSON.parse(res.candidates[0].content.parts[0].text.replace('```json', "").replace("```", ""));
                          } catch (error) {
                            //
                          }

                          console.log(content);
                          setData(content);
                        })
                        .catch(error => {
                          console.log(error);
                        });
                    }
                  })
              }
            })
            .catch(err => {
              console.log(err);
            });
        }
      })
      .catch(err => {
        console.log(err);
      });
  }, []);


  return (
    <div>
      <Header />
      <div style={{ marginTop: "10%" }}>
        <img src="/logo.jpg" className="logo" />
        <h2 className="headline">Um Sumo, Options for beautiful and healthy skin</h2>
        <div className='center'>
          <Link to="/recommendation" className="btn" style={{ display: 'inline-block', margin: 4 }}>Get Recommendation</Link>
          <Link to="/products" className="btn" style={{ display: 'inline-block', margin: 4 }}>Our Products</Link>

        </div>
      </div>

      {onSale && onSale.length > 0 && <div style={{ marginTop: "5%" }}>
        <h2 className="section-headline center">Best Deals:</h2>
        <div className="list">
          {onSale.map(item => <Product key={"product" + item.id} item={item} />)}
        </div>
      </div>}

      {data && <div style={{ marginTop: "5%" }}>
        <h2 className="section-headline center">Personal Recomendations</h2>
        <div className="list">
          {data.map(item => <Product key={"product" + item.id} item={item} />)}
        </div>
      </div>}

      <div style={{ marginTop: "5%" }}>
        <h2 className="section-headline center">All products you need</h2>
        <p className="center padding">Natural products made specaily for you</p>
      </div>

      <div style={{ marginTop: "5%" }}>
        <div className="box-list">
          <div className="box center">
            <h3 className="subsection-headline">Facial Skin Care Products</h3>
            <p>Feel confident with facial care products designed to give your skin the freshness, hydration, and natural glow it deserves!.</p>
          </div>
          <div className="box center">
            <h3 className="subsection-headline">Body Skin Care Products</h3>
            <p>Enjoy the ultimate body care experience with our products that give you luxurious softness and hydration. Feel refreshed and luxurious at every moment.</p>
          </div>
          <div className="box center">
            <h3 className="subsection-headline">Hair Skin Care Products</h3>
            <p>Pamper your hair with our products designed to give it the strength, shine, and natural beauty it deserves.</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "5%", marginBottom: '5%' }}>
        <h2 className="section-headline center">About Us</h2>
        <p className="center padding">Know our team and vision</p>
        <div className="box-list">
          <div className="box center box-purple">
            <img src="/leaficon.png" className="icon" alt="" />
            <h3 className="">Natural Quality</h3>
            <p>We work to provide high quality natural products to ensure a unique and distinctive experience for our customers.</p>
          </div>
          <div className="box center box-purple">
            <img src="/hearticon.png" className="icon" alt="" />
            <h3 className="">Customers Care</h3>
            <p>We are here every step of the way, ensuring complete customer satisfaction.</p>
          </div>
          <div className="box center box-purple">
            <img src="/sustainabilityicon.png" className="icon" alt="" />
            <h3 className="">Sustainability</h3>
            <p>Our products are environmentally friendly and contribute to the preservation of natural resources for future generations.</p>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  )
}
