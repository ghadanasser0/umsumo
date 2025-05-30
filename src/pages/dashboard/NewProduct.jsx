import React, { useState } from 'react';
import Header from '../../parts/Header';
import Footer from '../../parts/Footer';
import { supabase } from '../../supabase';
import { useNavigate } from 'react-router-dom';

export default function NewProduct() {
    const [msg, setMsg] = useState(null);
    const [image, setImage] = useState(Date.now() + "jpg");
    const navigate = useNavigate();

    const handleSave = (e) => {
        e.preventDefault();
        setMsg(null);

        const name = e.target.name.value.trim();
        const price = e.target.price.value.trim();
        const categoryInput = e.target.category.value.trim();
        const use = e.target.use.value.trim();
        const desc = e.target.desc.value.trim();

        // تنسيق الصنف لتوحيد الحروف
        const formattedCategory = categoryInput.charAt(0).toUpperCase() + categoryInput.slice(1).toLowerCase();

        // التحقق من الحقول
        if (!name || !price || !formattedCategory || !use || !desc || !image) {
            setMsg("Please fill in all the required fields.");
            return;
        }

        supabase
            .from("products")
            .insert({
                name,
                use,
                price,
                description: desc,
                image,
                category: formattedCategory,
            })
            .then(() => {
                e.target.reset();
                navigate('/products-list');
            })
            .catch(error => {
                console.log(error);
                setMsg("Something went wrong...");
            });
    };

    const uploadImage = async (e) => {
        const [file] = e.target.files;
        if (file) {
            const fileName = file.name;
            setImage(fileName);

            supabase.storage
                .from('files')
                .upload(`${fileName}`, file)
                .then(() => {
                    setMsg('Product image uploaded successfully');
                })
                .catch(error => {
                    console.log(error);
                    setMsg('Error uploading product image');
                });
        }
    };

    return (
        <div>
            <Header />
            <form method="post" className="form" encType="multipart/form-data" onSubmit={handleSave}>
                <h2 className='center'>New Product</h2>

                <label htmlFor="name">Name:</label>
                <input type="text" id="name" name="name" placeholder="Enter product name" />

                <label htmlFor="price">Price:</label>
                <input type="text" id="price" name="price" placeholder="Enter product price" />

                <label htmlFor="category">Category:</label>
                <input type="text" id="category" name="category" placeholder="Enter product category" />

                <label htmlFor="use">Use:</label>
                <input type="text" id="use" name="use" placeholder="Product use" />

                <label htmlFor="desc">Description:</label>
                <textarea name="desc" id="desc" placeholder="Enter your notes here" rows={12}></textarea>

                <label htmlFor="image">Image:</label>
                <input type="file" id="image" accept="image/*" onChange={uploadImage} name="image" />

                {msg && (
  <p style={{
    color: msg.toLowerCase().includes('success') ? 'green' : 'red',
    textAlign: 'center'
  }}>
    {msg}
  </p>
)}


                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button type="submit" className="btn full">Create</button>
                </div>
            </form>
            <Footer />
        </div>
    );
}
