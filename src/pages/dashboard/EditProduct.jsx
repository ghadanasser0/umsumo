import React, { useEffect, useState } from 'react'
import Header from '../../parts/Header';
import Footer from '../../parts/Footer'
import { supabase } from '../../supabase';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditProduct() {
    const [data, setData] = useState(null);
    const [msg, setMsg] = useState(null);
    const [image, setImage] = useState(Date.now()+"jpg");
    const navigate = useNavigate();
    const { product_id } = useParams();

    useEffect(() => {
        if(product_id){
            supabase
                .from("products")
                .select("*")
                .eq('id', product_id)
                .then(resData => {
                    if (resData.data && resData.data.length != 0) {
                        setData(resData.data[0]);
                        setImage(resData.data[0].image);
                    }
                })
                .catch(error => {
                    console.log(error);
                })
        }
    }, [product_id]);

    function normalizeCategory(input) {
      return input
        .trim()
        .toLowerCase()
        .split(' ')
        .filter(word => word.length > 0)
        .map(word => word[0].toUpperCase() + word.slice(1))
        .join(' ');
    }

    const handleEditProduct = (e) => {
        e.preventDefault();            
        setMsg(null);

        const normalizedCategory = normalizeCategory(e.target.category.value);

        supabase
            .from("products")
            .update({
                name: e.target.name.value,
                use: e.target.use.value,
                price: e.target.price.value,
                description: e.target.desc.value,
                image: image,
                category: normalizedCategory
            })
            .eq("id", product_id)
            .then(() => {
                e.target.reset();
                navigate('/products-list');
            })
            .catch(error => {
                setMsg("Something went wrong...")
            });
    }

    const uploadImage = async (e) => {
        const [file] = e.target.files
        if (e.target.files && e.target.files.length != 0) {
            const fileName = e.target.files[0].name;
            setImage(fileName);
                
            supabase.storage
            .from('files')
            .upload(`${fileName}`, file)
            .then(() => {                
                setMsg('Product image uploaded successfully:');
            })
            .catch(error => {                
                setMsg('Error uploading product image:');
            });
        }
    }

    return (
        <div>
          <Header />
            <form method="post" className="form" encType="multipart/form-data" onSubmit={handleEditProduct}>
                <h2 className='center'>Edit Product</h2>
    
                <label htmlFor="image">
                    {data && (
                        <img 
                            src={"https://xmpspjunwuxjvziergui.supabase.co/storage/v1/object/public/files/" + data.image} 
                            style={{ 
                                width: '400px',   
                                height: '400px',  
                                borderRadius: '15px', 
                                display: 'block',  
                                margin: '20px auto' 
                            }} 
                        />
                    )}
                    <input 
                        type="file" 
                        id="image" 
                        accept="image/*" 
                        onChange={uploadImage} 
                        name="image" 
                        placeholder="Select Image" 
                        style={{ display: 'none' }} 
                    />
                </label>
    
                <label htmlFor="name">Name:</label>
                <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    defaultValue={data && data.name} 
                    placeholder="Enter product name" 
                    required 
                />
    
                <label htmlFor="price">Price:</label>
                <input 
                    type="text" 
                    id="price" 
                    name="price" 
                    defaultValue={data && data.price} 
                    placeholder="Enter product price" 
                    required 
                />

                <label htmlFor="category">Category:</label>
                <input 
                    type="text" 
                    id="category" 
                    name="category" 
                    defaultValue={data && data.category} 
                    placeholder="Enter product category" 
                />
    
                <label htmlFor="use">Use:</label>
                <input 
                    type="text" 
                    id="use" 
                    name="use" 
                    defaultValue={data && data.use} 
                    placeholder="Product use" 
                    required 
                />
    
                <label htmlFor="desc">Description:</label>
                <textarea 
                    name="desc" 
                    id="desc" 
                    defaultValue={data && data.description} 
                    placeholder="Enter your notes here" 
                    rows={12}
                ></textarea>
    
                {msg && <p>{msg}</p>}
                <div style={{ display: 'flex', justifyContent: 'center' }}> 
                <button type="submit" className="btn full">Update</button>
                </div>
            </form>
    
            <Footer />
        </div>
    )
}
