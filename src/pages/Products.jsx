import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../parts/Header';
import { supabase } from '../supabase';
import Product from '../parts/Product';
import Footer from '../parts/Footer';

export default function Products() {
  const [products_list, setProductsList] = useState(null);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [showDiscountOnly, setShowDiscountOnly] = useState(false);

  useEffect(() => {
    supabase
      .from('products')
      .select("*")
      .then(response => {
        if (response.data) {
          setProductsList(response.data);

          const uniqueCategories = [
            ...new Set(
              response.data
                .map(item => item.category?.trim().toLowerCase()) 
                .filter(Boolean)
            )
          ];
          
          
          setCategories(uniqueCategories);
        }
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  const filterDiscounted = () => {
    const now = new Date();
    const discounted = products_list.filter(item =>
      item.discount_price &&
      item.discount_start &&
      item.discount_end &&
      new Date(item.discount_start) <= now &&
      new Date(item.discount_end) >= now
    );
    setProductsList(discounted);
    setShowDiscountOnly(true);
  };

  const showAll = () => {
    supabase
      .from('products')
      .select("*")
      .then(response => {
        if (response.data) {
          setProductsList(response.data);
          setShowDiscountOnly(false);
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  const filteredProducts = selectedCategory === "all"
  ? products_list
  : products_list?.filter(p => p.category?.trim().toLowerCase() === selectedCategory);
 
  

  return (
    <div>
      <Header />
      <h2 className="headline">Browse our products</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <Link to="/recommendation" className="btn">
          Get Recommendation
        </Link>

        <select
          onChange={(e) => setSelectedCategory(e.target.value)}
          value={selectedCategory}
          className="btn"
          style={{ padding: '10px 20px', borderRadius: '15px', border: 'none', cursor: 'pointer' }}
        >
          <option value="all">All Categories</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat}>{cat}</option>
          ))}
        </select>

        {!showDiscountOnly ? (
          <button className="btn" onClick={filterDiscounted}>View Discounted</button>
        ) : (
          <button className="btn" onClick={showAll}>View All</button>
        )}
      </div>

      <div className="list">
        {filteredProducts && filteredProducts.length > 0 ? (
          filteredProducts.map(item => (
            <Product key={"product" + item.id} item={item} />
          ))
        ) : (
          <p className="center">No products found.</p>
        )}
      </div>

      <Footer />
    </div>
  );
}
