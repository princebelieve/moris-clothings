import CartDrawer from "./components/CartDrawer";
import StoreAnnouncement from "./components/StoreAnnouncement";
import PageMetadata from "./components/PageMetadata";
//client/src/App.jsx
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Collection from "./pages/Collection";
import ProductDetails from "./pages/ProductDetails";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import AdminSettings from "./pages/AdminSettings";
import AdminOrders from "./pages/AdminOrders";
import About from "./pages/About";
import Contact from "./pages/Contact";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminProducts from "./pages/AdminProducts";

import RequireAdmin from "./components/RequireAdmin.jsx";

export default function App() {
  return (
    <><PageMetadata /><StoreAnnouncement /><CartDrawer /><Routes>
      <Route path="/" element={<Home />} />
      <Route path="/collection" element={<Collection />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/admin/settings" element={<RequireAdmin><AdminSettings /></RequireAdmin>} />
      <Route path="/admin/orders" element={<RequireAdmin><AdminOrders /></RequireAdmin>} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/success" element={<Success />} />
      <Route path="/cancel" element={<Cancel />} />

      {/* AUTH */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ADMIN */}
      <Route
        path="/admin/products"
        element={
          <RequireAdmin>
            <AdminProducts />
          </RequireAdmin>
        }
      />
    </Routes></>
  );
}
