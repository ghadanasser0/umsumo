import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import Header from '../../parts/Header';
import Footer from '../../parts/Footer';
import { useParams, useNavigate } from 'react-router-dom';

export default function EditDiscount() {
  const { product_id } = useParams();
  const [product, setProduct] = useState(null);
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (product_id) {
      supabase
        .from('products')
        .select('*')
        .eq('id', product_id)
        .single()
        .then(({ data, error }) => {
          if (error) console.log(error);
          else setProduct(data);
        });
    }
  }, [product_id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg(null);

    const discount_price = e.target.discount_price.value;
    const discount_start = e.target.discount_start.value;
    const discount_end = e.target.discount_end.value;

    if (!discount_price || !discount_start || !discount_end) {
      setMsg('Please fill all discount fields.');
      return;
    }

    const { error } = await supabase
      .from('products')
      .update({
        discount_price: discount_price,
        discount_start: discount_start,
        discount_end: discount_end,
      })
      .eq('id', product_id);

    if (error) {
      console.log(error);
      setMsg('Something went wrong while saving.');
    } else {
      navigate('/products-list');
    }
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div>
     <Header />
      <form className="form" onSubmit={handleSave}>
        <h2 className="center">Add/Update Discount for: {product.name}</h2>

        <label htmlFor="discount_price">Discount Price:</label>
        <input
          type="text"
          id="discount_price"
          name="discount_price"
          defaultValue={product.discount_price || ''}
          placeholder="Enter discount price"
          required
        />

        <label htmlFor="discount_start">Discount Start Date:</label>
        <input
          type="datetime-local"
          id="discount_start"
          name="discount_start"
          defaultValue={product.discount_start ? new Date(product.discount_start).toISOString().slice(0, -1) : ''}
          required
        />

        <label htmlFor="discount_end">Discount End Date:</label>
        <input
          type="datetime-local"
          id="discount_end"
          name="discount_end"
          defaultValue={product.discount_end ? new Date(product.discount_end).toISOString().slice(0, -1) : ''}
          required
        />

        {msg && <p>{msg}</p>}
        <div style={{ display: 'flex', justifyContent: 'center' }}> 
        <button type="submit" className="btn full">Save Discount</button>
        </div>
      </form>
      <Footer />
    </div>
  );
}
