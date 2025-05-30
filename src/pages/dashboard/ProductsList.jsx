import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import Header from '../../parts/Header';
import Footer from '../../parts/Footer';
import { Link, useNavigate } from 'react-router-dom';

export default function ProductsList() {
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [update, setUpdate] = useState(null);
  const formater = Intl.NumberFormat('en-OM', { style: 'currency', currency: 'OMR' });
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .order('id', { ascending: false })
      .then(res => {
        if (res.data && res.data.length !== 0) {
          setData(res.data);
          setAllData(res.data);

          const cats = Array.from(
            new Set(
              res.data
                .map(item => item.category?.trim().toLowerCase())
                .filter(c => c && c !== '')
            )
          ).sort();

          setCategories(['All', ...cats.map(cat =>
            cat.charAt(0).toUpperCase() + cat.slice(1)
          )]);
        }
      })
      .catch(error => console.log(error));
  }, [update]);

  const handleDelete = (id) => {
    const r = window.confirm("Are you sure to delete this product?");
    if (r) {
      supabase
        .from("products")
        .delete()
        .eq('id', id)
        .then(() => setUpdate(Date.now()))
        .catch(error => console.log(error));
    }
  };

  const filterByCategory = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      setData(allData);
    } else {
      const filtered = allData.filter(item =>
        item.category?.trim().toLowerCase() === cat.toLowerCase()
      );
      setData(filtered);
    }
  };

  return (
    <div>
      <Header />
      <div className="padding" style={{ display: 'flex', width: '90%', margin: 'auto' }}>
        <div style={{ width: '20%', paddingRight: '20px' }}>
          <h3>Filter by Category</h3>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {categories.map(cat => (
              <li key={cat}>
                <button
                  onClick={() => filterByCategory(cat)}
                  style={{
                    background: selectedCategory === cat ? '#694ceb' : '#eee',
                    color: selectedCategory === cat ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '10px',
                    margin: '5px 0',
                    padding: '8px 15px',
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ width: '80%' }}>
          <h2>
            Products List:
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Link to="/new-product" className="btn">New Product</Link>
            </div>
          </h2>
          {data.map(item => (
            <div key={item.id} style={{
              background: '#fff',
              display: 'flex',
              padding: 10,
              borderRadius: 15,
              color: '#000',
              margin: 5
            }}>
              <div style={{ width: '300px' }}>
                <img
                  src={`https://xmpspjunwuxjvziergui.supabase.co/storage/v1/object/public/files/${item.image}`}
                  style={{ width: '300px', borderRadius: '15px' }}
                />
              </div>
              <div style={{ padding: 5 }}>
                <h3>{item.name}</h3>
                <p>Price: {formater.format(item.price)}</p>
                <p>
                  Discount Price: {item.discount_price && formater.format(item.discount_price)}{" "}
                  {(item.discount_start && item.discount_end) ?
                    new Date(item.discount_start).toLocaleDateString('en-GB') + " ~ " +
                    new Date(item.discount_end).toLocaleDateString('en-GB') :
                    "No discount available"}
                </p>
                <p>Use: {item.use}</p>
                <p>Description: {item.description}</p>
                <p>Category: {item.category || "N/A"}</p>
                <p>Status: {item.out_of_stock ? "Out of Stock" : "In Stock"}</p>
                <p>Date: {new Date(item.created_at).toLocaleString("en-GB")}</p>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <Link to={`/products-list/${item.id}`} className="delete-btn" style={{ marginRight: 10 }}>
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(item.id)} className="delete-btn">
                    Delete
                  </button>
                  <Link to={`/edit-discount/${item.id}`} className="delete-btn" style={{ marginLeft: 10 }}>
                    Edit Discount
                  </Link>
                      <button
  onClick={async () => {
    const { error } = await supabase
      .from("products")
      .update({ out_of_stock: !item.out_of_stock })
      .eq("id", item.id);
    if (!error) setUpdate(Date.now());
  }}
  className="delete-btn"
  style={{
    backgroundColor: item.out_of_stock ? '#6c757d' : '#ff0000', 
    marginLeft: '10px'
  }}
>
  {item.out_of_stock ? "Mark as Available" : "Mark as Out of Stock"}
</button>
        
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
