import CartDrawer from "./components/CartDrawer";
import StoreAnnouncement from "./components/StoreAnnouncement";
import PageMetadata from "./components/PageMetadata";
//client/src/App.jsx
import { Routes, Route, useLocation } from "react-router-dom";

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
import Wishlist from "./pages/Wishlist";
import Compare from "./pages/Compare";
import Blog from "./pages/Blog";
import Faq from "./pages/Faq";
import PolicyPage from "./pages/PolicyPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBlog from "./pages/AdminBlog";
import AdminSiteSettings from "./pages/AdminSiteSettings";
import { StoreProvider, useStore } from "./context/StoreContext";
import WhatsAppButton from "./components/WhatsAppButton";
import RecentSalesNotice from "./components/RecentSalesNotice";
import { InstallAppProvider } from "./components/InstallApp";

import RequireAdmin from "./components/RequireAdmin.jsx";

function AppRoutes() {
  const { siteSettings, storeSettings } = useStore();
  const { pathname } = useLocation();
  const adminPage = pathname.startsWith("/admin");
  const paymentPage = ["/success", "/cancel"].includes(pathname);
  const paused = !adminPage && !paymentPage && (siteSettings.maintenance || (siteSettings.blockCheckout && pathname === "/checkout") || (siteSettings.blockSignIn && ["/login", "/account"].includes(pathname)) || (siteSettings.blockSignUp && ["/register", "/sign-up"].includes(pathname)) || (storeSettings.checkoutPaused && pathname === "/checkout"));
  return (
    <><PageMetadata />{paused ? <main className="maintenance-page"><section className="maintenance-card">{siteSettings.banner && <img className="maintenance-banner" src={siteSettings.banner} alt="" />}<span className="eyebrow">MORIS CLOTHING</span><h1>{siteSettings.title || "We’ll be back soon"}</h1><p>{siteSettings.message || "We’re making a few improvements. Please check back shortly."}</p>{siteSettings.launchDate && <strong>{siteSettings.launchDate}</strong>}</section></main> : <><StoreAnnouncement /><CartDrawer /><Routes>
      <Route path="/" element={<Home />} />
      <Route path="/collection" element={<Collection />} />
      <Route path="/category/:category" element={<Collection />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/compare" element={<Compare />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:id" element={<Blog />} />
      <Route path="/faq" element={<Faq />} />
      <Route path="/terms" element={<PolicyPage kind="terms" />} />
      <Route path="/privacy" element={<PolicyPage kind="privacy" />} />
      <Route path="/shipping" element={<PolicyPage kind="shipping" />} />
      <Route path="/returns-refunds" element={<PolicyPage kind="returns" />} />
      <Route path="/disclaimer" element={<PolicyPage kind="disclaimer" />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
      <Route path="/admin/blog" element={<RequireAdmin><AdminBlog /></RequireAdmin>} />
      <Route path="/admin/site" element={<RequireAdmin><AdminSiteSettings /></RequireAdmin>} />
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
      <Route path="/account" element={<Login />} />
      <Route path="/sign-in" element={<Login />} />
      <Route path="/sign-up" element={<Register />} />
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
      <Route path="*" element={<Home />} />
    </Routes><WhatsAppButton /><RecentSalesNotice /></>}</>
  );
}

export default function App() { return <InstallAppProvider><StoreProvider><AppRoutes /></StoreProvider></InstallAppProvider>; }
