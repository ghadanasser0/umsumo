import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
//import 
import Home from "./pages/Home";
import "./index.css";
import Contact from "./pages/Contact";
import Products from "./pages/Products";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import Feedback from "./pages/Feedback";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import ProductsList from "./pages/dashboard/ProductsList";
import OrdersList from "./pages/dashboard/OrdersList";
import NewProduct from "./pages/dashboard/NewProduct";
import UserProfile from "./pages/UserProfile";
import Checkout from "./pages/Checkout";
import CustomersList from "./pages/dashboard/CustomersList";
import FeedbackMessages from "./pages/dashboard/FeedbackMessages";
import OrderDetails from "./pages/dashboard/OrderDetails";
import CustomerDetails from "./pages/dashboard/CustomerDetails";
import Thankyou from "./pages/Thankyou";
import OrderCanceled from "./pages/OrderCanceled";
import EditProduct from "./pages/dashboard/EditProduct";
import Recommendation from "./pages/Recommendation";
import EditDeliveryPlace from "./pages/dashboard/EditDeliveryPlace";
import DeliveryPlaces from "./pages/dashboard/DeliveryPlaces";
import NewDeliveryPlace from "./pages/dashboard/NewDeliveryPlace";
import ProductDetails from "./pages/ProductDetails";
import ReviewsList from "./pages/dashboard/ReviewsList";
import ResetPassword from "./pages/ResetPassword";
import EditDiscount from "./pages/dashboard/EditDiscount";


const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "contact",
    element: <Contact />,
  },
  {
    path: 'products',
    element: <Products />
  },
  {
    path: "products/:product_id",
    element: <ProductDetails />
  },
  {
    path: 'signup',
    element: <Signup />
  },
  {
    path: 'signin',
    element: <Signin />
  },
  {
    path: 'reset-password',
    element: <ResetPassword />
  },
  {
    path: 'feedback',
    element: <Feedback />
  },
  {
    path: 'checkout',
    element: <Checkout />
  },
  {
    path: 'profile',
    element: <UserProfile />
  },
  {
    path: 'thankyou/:order_id',
    element: <Thankyou />
  },
  {
    path: 'cancel/:order_id',
    element: <OrderCanceled />
  },
  
  
  
  //admin pages
  {
    path: 'dashboard',
    element: <AdminDashboard />
  },
  {
    path: 'products-list',
    element: <ProductsList />
  },
  {
    path: 'products-list/:product_id',
    element: <EditProduct />
  },
  {
    path: 'new-product',
    element: <NewProduct />
  },
  {
    path: 'delivery-list',
    element: <DeliveryPlaces />
  },
  {
    path: 'delivery-list/:place_id',
    element: <EditDeliveryPlace />
  },
  {
    path: 'new-delivery-place',
    element: <NewDeliveryPlace />
  },
  {
    path: 'orders',
    element: <OrdersList />
  },
  {
    path: 'orders/:order_id',
    element: <OrderDetails />
  },
  {
    path: 'customers',
    element: <CustomersList />
  },
  {
    path: 'customers/:user_id',
    element: <CustomerDetails />
  },
  {
    path: 'feedbak-messages',
    element: <FeedbackMessages />
  },
  {
    path: 'recommendation',
    element: <Recommendation />
  },
  {
    path: "reviews-list",
    element: <ReviewsList />
  },
  {
    path: 'edit-discount/:product_id',
    element: <EditDiscount />
  },
  
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
