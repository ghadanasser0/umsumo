import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';

export default function Product({ item }) {
  const [rating, setRating] = useState(0);
  const stars = [1, 2, 3, 4, 5];

  useEffect(() => {
    supabase
      .from('ratings')
      .select("*")
      .eq('product_id', item.id)
      .then(response => {
        if (response.data) {
          let tmp_rating_total = 0;
          response.data.forEach(r => {
            tmp_rating_total += r.rating;
          });
          const tmp_rating = tmp_rating_total / response.data.length;
          setRating(tmp_rating);
        }
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  const isDiscountActive = item.discount_price && item.discount_start && item.discount_end &&
    new Date(item.discount_start) <= new Date() && new Date(item.discount_end) >= new Date();

  return (
    <Link
      to={item.out_of_stock ? "#" : "/products/" + item.id}
      className="list-item"
      style={{
        textDecoration: 'none',
        color: 'inherit',
        pointerEvents: item.out_of_stock ? 'none' : 'auto',
        opacity: item.out_of_stock ? 0.6 : 1
      }}
    >
      <div style={{ position: 'relative' }}>
        <img
          src={"https://xmpspjunwuxjvziergui.supabase.co/storage/v1/object/public/files/" + item.image}
          alt={item.name}
          style={{ width: '100%', borderRadius: '10px' }}
        />

        {/* شارة الخصم */}
        {isDiscountActive && (
          <div style={{
            position: 'absolute',
            top: 10,
            left: 10,
            backgroundColor: 'red',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            Sale
          </div>
        )}

        {/* شارة نفاد المنتج */}
        {item.out_of_stock && (
          <div style={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: '#000',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '12px',
            fontWeight: 'bold',
            opacity: 0.8,
          }}>
            Out of Stock
          </div>
        )}
      </div>

      <div className="item-content" style={{ marginTop: 10 }}>
        <h3 style={{ color: 'black' }}>{item.name}</h3>

        <div style={{ display: 'flex', gap: '5px' }}>
          {stars.map((star) => (
            <div
              key={"star-" + star}
              style={{
                fontSize: 18,
                color: star <= rating ? 'orange' : 'gray',
                border: 'none',
                background: 'transparent'
              }}
            >
              &#x2605;
            </div>
          ))}
        </div>

        {/* السعر مع الخصم */}
        <div style={{ marginTop: 10 }}>
          {isDiscountActive ? (
            <>
              <p style={{ color: 'gray', textDecoration: 'line-through', margin: 0 }}>
                OMR {item.price}
              </p>
              <p style={{ color: 'red', fontWeight: 'bold', margin: 0 }}>
                OMR {item.discount_price}
              </p>
            </>
          ) : (
            <p style={{ color: 'black', margin: 0 }}>
              OMR {item.price}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
