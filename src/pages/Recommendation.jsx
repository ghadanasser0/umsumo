import React, { useEffect, useState } from 'react';
import Header from '../parts/Header';
import Footer from '../parts/Footer';
import { supabase } from '../supabase'; // to get details from the database 
import Product from '../parts/Product'; // for displaying products 
   // here i will stete vairables 
export default function Recommendation() {
    const [msg, setMsg] = useState(null);  // Messages to user (error/warning)
    const [data, setData] = useState(null);  // Recommended products from Gemini AI
    const [products_list, setProductsList] = useState(null);  // fetch product from database
    const [cart, setCart] = useState([]);  // shopping cart
     // function add to cart 
    const addToCart = (item, qty) => {
        let tmpCart = cart.slice();  // Copy current cart
        let check = cart.filter(cart_item => cart_item.id === item.id);  // check if the item exists
    
        if(tmpCart.length === 0 || check.length === 0){
          item.qty = qty;  // add new item with qty
          tmpCart.push(item);
        } else {
          let itemIndex = cart.findIndex(cart_item => cart_item.id === item.id);
          tmpCart[itemIndex].qty = qty;  // update item
        } 
        
        setCart(tmpCart);   // update cart state
        window.alert(item.name+" ("+qty+") Added to the shopping cart.")  ;
        window.localStorage.setItem("cart", JSON.stringify(tmpCart)); //// Save to local storage
    }
       
    useEffect(() => {     //Retrieves all products from the products table in Supabase and store it in product list.
        supabase
            .from('products')
            .select("*")
            .then(response => {
                if (response.data) {
                    setProductsList(response.data);
                }
            })
            .catch(err => {
                console.log(err);
            });

    }, []);

    const handleRecommendation = (e) => {
        e.preventDefault(); // Prevent the default form submission (when the user submit the form)
        setMsg("");

        // Create an empty object to store the form data
        const formValues = {};

        // Get form elements
        const formElements = e.target.elements;

        // Questions and answers
        const questions = [
            {
                question: "Are you looking for a daily body moisturizer that provides sun protection?",
                name: "body_moisturizer"
            },
            {
                question: "Do you suffer from dryness or cracked feet and need a nourishing and healing product?",
                name: "feet_dryness"
            },
            {
                question: "Do you want a product that helps repair damaged hair and stimulates its growth?",
                name: "hair_damage"
            },
            {
                question: "Are you looking for a soap that helps lighten the skin, tighten it, and delay signs of aging?",
                name: "skin_lightening"
            },
            {
                question: "Is your hair damaged or dry, and do you need a product to restore and nourish it?",
                name: "hair_restoration"
            },
            {
                question: "Do you have dark areas on your body that you want to lighten and even out?",
                name: "skin_toning"
            },
            {
                question: "Do you want a product that deeply cleanses your skin and gives it a healthy appearance?",
                name: "skin_cleanse"
            },
            {
                question: "Are you looking for a product that effectively moisturizes, brightens, and nourishes your skin?",
                name: "skin_moisture_brighten"
            },
            {
                question: "Do you suffer from skin pigmentation, melasma, or freckles and need a product to treat them?",
                name: "pigmentation"
            },
            {
                question: "Do you have scars or dark spots that you want to reduce naturally?",
                name: "dark_spots"
            }
        ];

        // Iterate through each question and store its answer
        questions.forEach(({ question, name }) => {
            // Find the radio buttons related to the current question
            const selectedOption = Array.from(formElements)
                .find((element) => element.name === name && element.checked);

            if (selectedOption) {
                // Store the question and answer
                formValues[name] = {
                    question: question,
                    answer: selectedOption.value
                };
            }
        });
                 // validation if no products were loaded or no answers were provided, it shows an error message.
        if (products_list && products_list.length == 0) {
            setMsg("Something went wrong");

            return false;
        }

        if (formValues && Object.entries(formValues).length == 0) {
            setMsg("Please answer at least one question.");

            return false;
        }

      //Prepare the AI Message for Gemini ( we send it to Gemini to till him to analyze the answers and match products.
        const message = {
            "role":"user",
            "parts": [{
              "text": `I have this questions and answers: ${JSON.stringify(formValues)} for these products: ${JSON.stringify(products_list)} give me the matched products from the provided product list in JSON format. only give the JSON don't add anything else if there is no match provide an empety array, never mention json in your response.`}
            ]
        }

        fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDA-3WYb5lmDPiGRKX0TTMKAX_3FVyFfUY', { // send request to gemini
            method: 'POST',  //Sends a POST request to Gemini API.
            headers: {
                'Content-Type': "application/json",
            },
            body: JSON.stringify({     // Sends the user's answers + product list in the body.
                "contents": message
            })
        })
            .then((response) => response.json())  // convert the answer to Json
            .then(res => {
                let content = null;
                try {                            // recommendation here + remove json and ** if text warpping with +parse the text into real JSON
                    content = JSON.parse(res.candidates[0].content.parts[0].text.replace('```json', "").replace("```", ""));
                } catch (error) {
                    
                }

                console.log(content);  //Prints the response content, which is supposed to be the suggested products, into the browser console so you can preview it.
                
                setData(content);   //updates the state of a component in React based on this content, often resulting in recommendations being displayed on the page.
            })
            .catch(error => {
                console.log(error); // Captures any error that occurs during the request or processing, and prints it to the console
            });

    }

    return (
        <div>
            <Header />
            <form method="post" className="form" onSubmit={handleRecommendation}>
                <img src="/logo.jpg" className="logo padding" alt="" />
                <h3 className='center padding' style={{ color: '#C304F8', fontWeight: 'bold' }}>  We Help You Choose the Right Product for You!</h3>
                <p className='center padding'>Welcome to Um Sumo Natural Skincare Store! 🌿 Through this feature, we provide you with personalized recommendations and help you choose the perfect product for your skincare and haircare needs. All you have to do is answer a few questions, and we will suggest the most suitable products based on your personal preferences. You can then browse the details to learn more about each product and make the best choice for you. ✨</p>
                <p style={{ color: '#F7A11E', fontWeight: 'bold' }}>Answer at least one question:</p>
    
                {/* Question Container */}
                <div className="question-container">
                    <p className="question">1. Are you looking for a daily body moisturizer cream that provides sun protection?</p>
                    <label htmlFor='body_moisturizer_yes' style={{ display: 'flex' }}>
                        <input type="radio" name="body_moisturizer" value="Yes" id="body_moisturizer_yes" /> <span>Yes</span>
                    </label>
                    <label htmlFor='body_moisturizer_no' style={{ display: 'flex' }}>
                        <input type="radio" name="body_moisturizer" value="No" id="body_moisturizer_no" /> <span>No</span>
                    </label>
                </div>
    
                <div className="question-container">
                    <p className="question">2. Do you suffer from dryness or cracked feet and need a nourishing and healing product?</p>
                    <label htmlFor='feet_dryness_yes' style={{ display: 'flex' }}>
                        <input type="radio" name="feet_dryness" value="Yes, I need a product that treats cracks." id="feet_dryness_yes" /> <span>Yes, I need a product that treats cracks.</span>
                    </label>
                    <label htmlFor='feet_dryness_no' style={{ display: 'flex' }}>
                        <input type="radio" name="feet_dryness" value="No, my feet don’t need intensive treatment." id="feet_dryness_no" /> <span>No, my feet don’t need intensive treatment.</span>
                    </label>
                </div>
    
                <div className="question-container">
                    <p className="question">3. Do you want a product that helps repair damaged hair and stimulates its growth?</p>
                    <label htmlFor='hair_damage_yes' style={{ display: 'flex' }}>
                        <input type="radio" name="hair_damage" value="Yes, I need a natural product that treats split ends." id="hair_damage_yes" /> <span>Yes, I need a natural product that treats split ends.</span>
                    </label>
                    <label htmlFor='hair_damage_no' style={{ display: 'flex' }}>
                        <input type="radio" name="hair_damage" value="No, my hair is healthy and does not need treatment." id="hair_damage_no" /> <span>No, my hair is healthy and does not need treatment.</span>
                    </label>
                </div>
    
                <div className="question-container">
                    <p className="question">4. Are you looking for a soap that helps lighten the skin, tighten it, and delay signs of aging?</p>
                    <label htmlFor='skin_lightening_yes' style={{ display: 'flex' }}>
                        <input type="radio" name="skin_lightening" value="Yes, I want a natural product that helps with that." id="skin_lightening_yes" /> <span>Yes, I want a natural product that helps with that.</span>
                    </label>
                    <label htmlFor='skin_lightening_no' style={{ display: 'flex' }}>
                        <input type="radio" name="skin_lightening" value="No, I’m not interested in skin brightening." id="skin_lightening_no" /> <span>No, I’m not interested in skin brightening.</span>
                    </label>
                </div>
    
                <div className="question-container">
                    <p className="question">5. Is your hair damaged or dry, and do you need a product to restore and nourish it?</p>
                    <label htmlFor='hair_restoration_yes' style={{ display: 'flex' }}>
                        <input type="radio" name="hair_restoration" value="Yes, I need a product that moisturizes and strengthens my hair." id="hair_restoration_yes" /> <span>Yes, I need a product that moisturizes and strengthens my hair.</span>
                    </label>
                    <label htmlFor='hair_restoration_no' style={{ display: 'flex' }}>
                        <input type="radio" name="hair_restoration" value="No, my hair does not need protein treatment." id="hair_restoration_no" /> <span>No, my hair does not need protein treatment.</span>
                    </label>
                </div>
    
                <div className="question-container">
                    <p className="question">6. Do you have dark areas on your body that you want to lighten and even out?</p>
                    <label htmlFor='skin_toning_yes' style={{ display: 'flex' }}>
                        <input type="radio" name="skin_toning" value="Yes, I need a product that helps remove pigmentation." id="skin_toning_yes" /> <span>Yes, I need a product that helps remove pigmentation.</span>
                    </label>
                    <label htmlFor='skin_toning_no' style={{ display: 'flex' }}>
                        <input type="radio" name="skin_toning" value="No, I don’t have issues with skin tone." id="skin_toning_no" /> <span>No, I don’t have issues with skin tone.</span>
                    </label>
                </div>
    
                <div className="question-container">
                    <p className="question">7. Do you want a product that deeply cleanses your skin and gives it a healthy appearance?</p>
                    <label htmlFor='skin_cleanse_yes' style={{ display: 'flex' }}>
                        <input type="radio" name="skin_cleanse" value="Yes, I need a product that treats skin damage and cleanses it." id="skin_cleanse_yes" /> <span>Yes, I need a product that treats skin damage and cleanses it.</span>
                    </label>
                    <label htmlFor='skin_cleanse_no' style={{ display: 'flex' }}>
                        <input type="radio" name="skin_cleanse" value="No, I don’t need a treatment-based exfoliator right now." id="skin_cleanse_no" /> <span>No, I don’t need a treatment-based exfoliator right now.</span>
                    </label>
                </div>
    
                <div className="question-container">
                    <p className="question">8. Are you looking for a product that effectively moisturizes, brightens, and nourishes your skin?</p>
                    <label htmlFor='skin_moisture_brighten_yes' style={{ display: 'flex' }}>
                        <input type="radio" name="skin_moisture_brighten" value="Yes, I need a product that combines these benefits." id="skin_moisture_brighten_yes" /> <span>Yes, I need a product that combines these benefits.</span>
                    </label>
                    <label htmlFor='skin_moisture_brighten_no' style={{ display: 'flex' }}>
                        <input type="radio" name="skin_moisture_brighten" value="No, I’m looking for something else." id="skin_moisture_brighten_no" /> <span>No, I’m looking for something else.</span>
                    </label>
                </div>
    
                <div className="question-container">
                    <p className="question">9. Do you suffer from skin pigmentation, melasma, or freckles and need a product to treat them?</p>
                    <label htmlFor='pigmentation_yes' style={{ display: 'flex' }}>
                        <input type="radio" name="pigmentation" value="Yes, I need a product that treats pigmentation and brightens the skin." id="pigmentation_yes" /> <span>Yes, I need a product that treats pigmentation and brightens the skin.</span>
                    </label>
                    <label htmlFor='pigmentation_no' style={{ display: 'flex' }}>
                        <input type="radio" name="pigmentation" value="No, I don’t have pigmentation issues." id="pigmentation_no" /> <span>No, I don’t have pigmentation issues.</span>
                    </label>
                </div>
    
                <div className="question-container">
                    <p className="question">10. Do you have scars or dark spots that you want to reduce naturally?</p>
                    <label htmlFor='dark_spots_yes' style={{ display: 'flex' }}>
                        <input type="radio" name="dark_spots" value="Yes, I’m looking for a product that helps lighten scars." id="dark_spots_yes" /> <span>Yes, I’m looking for a product that helps lighten scars.</span>
                    </label>
                    <label htmlFor='dark_spots_no' style={{ display: 'flex' }}>
                        <input type="radio" name="dark_spots" value="No, my skin does not have scars or dark spots." id="dark_spots_no" /> <span>No, my skin does not have scars or dark spots.</span>
                    </label>
                </div>
    
                {msg && (
  <p style={{
    color: msg.toLowerCase().includes('thank you') ? 'green' : 'red',
    textAlign: 'center'
  }}>
    {msg}
  </p>
)}

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button type="submit" className="btn full">Send</button>
                </div>
            </form>
    
           {data && <h1 className='padding center' style={{ color: 'green' }}>Here are your recommendations:</h1>}

    
            <div className="list">
                {data && data.map(item => <Product key={"product"+item.id} item={item} addToCart={addToCart} />)}
            </div>
            <Footer />
        </div>
    )
}
    