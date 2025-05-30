import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../parts/Header';
import Footer from '../parts/Footer';
import { supabase } from '../supabase';

export default function ProductDetails() {
  const [products_info, setProductInfo] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [user, setUser] = useState(null);
  const [qty, setQty] = useState(1);
  const [cart, setCart] = useState([]);
  const { product_id } = useParams();
  const formater = Intl.NumberFormat('en-OM', { style: 'currency', currency: 'OMR' });
  const [rating, setRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const stars = [1, 2, 3, 4, 5];
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    const tmpCart = window.localStorage.getItem("cart");
    if (tmpCart && tmpCart !== "") {
      try {
        let tmp_parsed_cart = JSON.parse(tmpCart);
        setCart(tmp_parsed_cart);
      } catch (error) {
        console.log(error);
      }
    }
  }, []);

  useEffect(() => {
    supabase
      .from('products')
      .select("*")
      .eq('id', product_id)
      .then(response => {
        if (response.data && response.data[0]) {
          setProductInfo(response.data[0]);
        }
      })
      .catch(err => {
        console.log(err);
      });
    loadRatings();

    supabase.auth.getUser()
      .then(res => {
        if (res.data) {
          setUser(res.data.user.id);
        }
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  function loadRatings() {
    supabase
      .from('ratings')
      .select("*")
      .eq('product_id', product_id)
      .order('id', { ascending: false })
      .then(response => {
        if (response.data) {
          let tmp_rating_total = 0;
          response.data.map(item => {
            tmp_rating_total += item.rating;
          });
          let tmp_rating = (tmp_rating_total / response.data.length);
          setRating(tmp_rating);
          setReviews(response.data);
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  const addToCart = (item, qty) => {
    let tmpCart = cart.slice();
    let check = cart.filter(cart_item => cart_item.id === item.id);

    const now = new Date();
    const hasDiscount = item.discount_price && 
                        new Date(item.discount_start) <= now && 
                        new Date(item.discount_end) >= now;

    const priceToUse = hasDiscount ? parseFloat(item.discount_price) : parseFloat(item.price);

    if (tmpCart.length === 0 || check.length === 0) {
      tmpCart.push({
        ...item,
        qty: qty,
        price: priceToUse
      });
    } else {
      let itemIndex = cart.findIndex(cart_item => cart_item.id === item.id);
      tmpCart[itemIndex].qty = qty;
      tmpCart[itemIndex].price = priceToUse;
    }

    setCart(tmpCart);
    window.alert(item.name + " (" + qty + ") Added to the shopping cart.");
    window.localStorage.setItem("cart", JSON.stringify(tmpCart));
  };

  function sendRating(e) {
    e.preventDefault();
    setMsg(null);

    if (e.target.comment.value === "" || userRating === 0) {
      setMsg('please provide your rating and review first.');
      return false;
    }

    supabase
      .from("ratings")
      .insert({
        product_id: product_id,
        rating: userRating,
        comment: e.target.comment.value,
        user_id: user,
      })
      .then(() => {
        e.target.reset();
        setMsg("Thank you, we've received your review.");
      })
      .catch(error => {
        console.log(error);
        setMsg("Something went wrong, try again...");
      });
  }

  if (!products_info) return <div>Loading...</div>;

  const now = new Date();
  const hasDiscount = products_info.discount_price && 
                      new Date(products_info.discount_start) <= now && 
                      new Date(products_info.discount_end) >= now;

  return (
    <div>
      <Header />

      <div style={{ background: '#fff', display: 'flex', padding: 10, borderRadius: 15, color: '#000', flexDirection: 'row', margin: '5px auto', width: '61%' }}>
        <div style={{ width: '300px' }}>
          <img
            src={"https://xmpspjunwuxjvziergui.supabase.co/storage/v1/object/public/files/" + products_info.image}
            style={{ width: '300px', borderRadius: '15px' }}
          />

          <div style={{ textAlign: 'center' }}>
            {hasDiscount ? (
              <>
                <p style={{ color: 'gray', textDecoration: 'line-through', margin: 0 }}>{formater.format(products_info.price)}</p>
                <p style={{ color: 'red', fontWeight: 'bold', margin: 0 }}>{formater.format(products_info.discount_price)}</p>
                <p style={{ color: 'green', fontWeight: 'bold', fontSize: '14px' }}>Sale!</p>
              </>
            ) : (
              <p>{formater.format(products_info.price)}</p>
            )}
          </div>

          <button className="btn" style={{ display: 'block' }} onClick={() => addToCart(products_info, qty)}>Add to Cart</button>
        </div>

        <div style={{ paddingLeft: 15 }}>
          <h3>{products_info.name}</h3>
          <div style={{ display: 'flex', gap: '5px' }}>
            {stars.map(star => (
              <div key={"star-" + star} style={{ fontSize: 18, color: star <= rating ? 'orange' : 'gray' }}>&#x2605;</div>
            ))}
          </div>
          <p className="subsection-headline">{products_info.use}</p>
          <p>{products_info.description}</p>
          <div className="list-item-qty">
            <button onClick={() => setQty(old => old + 1)} style={{ borderRadius: 0, borderBottomLeftRadius: '8px', borderTopLeftRadius: '8px' }}>+</button>
            <input type="number" min={1} value={qty} disabled />
            <button onClick={() => setQty(old => old > 1 ? old - 1 : 1)} style={{ borderRadius: 0, borderBottomRightRadius: '8px', borderTopRightRadius: '8px' }}>-</button>
          </div>
        </div>
      </div>

      <form method="post" className="form" onSubmit={sendRating}>
        <h2>Users Reviews</h2>
        <textarea name="comment" id="comment" placeholder="Enter your review" rows={12}></textarea>

        <div style={{ display: 'flex', gap: '5px' }}>
          {stars.map(star => (
            <div
              onClick={() => setUserRating(star)}
              style={{ fontSize: 26, color: star <= userRating ? 'orange' : 'gray', cursor: 'pointer' }}
              className="star"
              key={star}
            >
              &#x2605;
            </div>
          ))}
        </div>

           {msg && (
  <p style={{
    color: msg.toLowerCase().includes('thank you') ? 'green' : 'red',
    textAlign: 'center'
  }}>
    {msg}
  </p>
)}


        <button type="submit" className="btn full">Send</button>

        {reviews && reviews.map(item => (
          <div key={"review-" + item.id} style={{ background: '#fff', padding: 10, borderRadius: 15, color: '#000', margin: 5, width: '95%' }}>
            <div style={{ display: 'flex', gap: '5px' }}>
              {stars.map(star => (
                <div key={"star-" + star} style={{ fontSize: 18, color: star <= item.rating ? 'orange' : 'gray' }}>&#x2605;</div>
              ))}
            </div>
            <p style={{ fontSize: 14 }}>{new Date(item.created_at).toLocaleString("en-GB")}</p>
            <p>{item.comment}</p>
          </div>
        ))}
      </form>

      <Footer />
    </div>
  );
}