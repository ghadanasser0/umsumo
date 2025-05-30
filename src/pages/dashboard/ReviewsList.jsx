import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import Header from '../../parts/Header';
import Footer from '../../parts/Footer';

export default function ReviewsList() {
  const [data, setData] = useState(null);
  const [update, setUpdate] = useState(null);
  const [products, setProducts] = useState(null);
  const stars = [1, 2, 3, 4, 5];

  useEffect(() => {
    loadData();
    supabase
      .from("products")
      .select("id, name")
      .then(res => {
        if (res.data) {
          setProducts(res.data);
        }
      });
  }, []);

  const loadData = () => {
    supabase
      .from("ratings")
      .select(`
        *,
        product:product_id (
          id,
          name,
          image
        )
      `)
      .order('id', { ascending: false })
      .then(resData => {
        if (resData.data) {
          setData(resData.data);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  const handleDelete = (itemId) => {
    if (window.confirm("Are you sure to delete this message?")) {
      supabase
        .from("ratings")
        .delete()
        .eq('id', itemId)
        .then(() => {
          setUpdate(Date.now());
          loadData();
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  const handleSort = (e) => {
    e.preventDefault();
    const ratingEqual = e.target.rating.value;
    const productId = e.target.product.value;
  
    supabase
      .from("ratings")
      .select(`
        *,
        product:product_id (
          id,
          name,
          image
        )
      `)
      .then(resData => {
        let filtered = resData.data || [];
  
        if (ratingEqual) {
          filtered = filtered.filter(item => item.rating == parseInt(ratingEqual));
        }
  
        if (productId !== "all") {
          filtered = filtered.filter(item => item.product_id === parseInt(productId));
        }
  
        setData(filtered);
      });
  };
  
  const printReport = () => {
    if (!data || data.length === 0) {
      alert("No reviews to print.");
      return;
    }

    const win = window.open('', '', 'width=800,height=600');
    win.document.write('<html><head><title>Reviews Report</title></head><body>');
    win.document.write('<h2>Filtered Product Reviews Report</h2>');
    win.document.write('<table border="1" cellpadding="10" cellspacing="0" style="width:100%;text-align:left;">');
    win.document.write('<tr><th>Product</th><th>Rating</th><th>Comment</th><th>Date</th></tr>');

    data.forEach(item => {
      win.document.write(`
        <tr>
          <td>${item.product?.name || 'N/A'}</td>
          <td>${item.rating}</td>
          <td>${item.comment}</td>
          <td>${new Date(item.created_at).toLocaleString("en-GB")}</td>
        </tr>
      `);
    });

    win.document.write('</table></body></html>');
    win.document.close();
    win.print();
  };

  return (
    <div>
        <Header />
      <div className="padding" style={{ width: '75%', margin: 'auto' }}>
        <h3>Products Reviews and Ratings:</h3>

        <form method="post" onSubmit={handleSort} style={{ margin: 15, display: 'flex', alignItems: 'center', gap: 12 }}>
          <b>Filter By: </b>

          <label htmlFor="rating">
            Rating from
            <select name="rating" id="rating" style={{ borderRadius: 15, padding: 6, marginLeft: 6 }}>
  <option value="">Any</option>
  {stars.map(star => (
    <option value={star} key={star}>{star}</option>
  ))}
</select>

          </label>

          <label htmlFor="product">
            Product
            <select name="product" id="product" style={{ borderRadius: 15, padding: 6, marginLeft: 6 }}>
              <option value="all">All</option>
              {products && products.map(item => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>

          <button type='submit' style={{ borderRadius: 15, padding: '6px 20px', background: '#694ceb', color: '#fff', border: 'none' }}>
            Filter
          </button>

          <button type='button' onClick={printReport} style={{ borderRadius: 15, padding: '6px 20px', background: '#694ceb', color: '#fff', border: 'none' }}>
            Print Report
          </button>
        </form>

        <hr />

        {data && data.length > 0 ? data.map(item => (
          <div
            key={"review-" + item.id}
            style={{
              background: '#fff',
              padding: 20,
              borderRadius: '25px',
              color: '#000',
              marginBottom: '20px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              width: '100%',
              maxWidth: '750px',
              margin: '10px auto'
            }}
          >
            {item.product?.image && (
              <img
                src={`https://xmpspjunwuxjvziergui.supabase.co/storage/v1/object/public/files/${item.product.image}`}
                alt={item.product.name}
                style={{ width: 150, borderRadius: 10, marginBottom: 10 }}
              />
            )}

            <h4>{item.product?.name}</h4>

            <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
              {stars.map((star) => (
                <div
                  key={"star-" + star}
                  style={{
                    fontSize: 18,
                    color: star <= item.rating ? 'orange' : 'gray'
                  }}
                >
                  &#x2605;
                </div>
              ))}
            </div>

            <p style={{ fontSize: 14 }}>{new Date(item.created_at).toLocaleString("en-GB")}</p>
            <p>{item.comment}</p>

            <button className='delete-btn' onClick={() => handleDelete(item.id)}>
              Delete
            </button>
          </div>
        )) : (
          <p style={{ textAlign: 'center', marginTop: 40 }}>No reviews found based on selected filter.</p>
        )}
      </div>
      <Footer />
    </div>
  );
}
