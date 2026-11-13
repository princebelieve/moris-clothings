import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
export default function Cancel() {
  return <><Navbar /><main className="shop-shell empty-state"><p className="eyebrow">YOUR BAG IS SAVED</p><h1>Checkout cancelled</h1><p>You left checkout before completing your order. Your pieces are still in your bag.</p><Link className="shop-button" to="/cart">Return to your bag</Link><Link className="inline-link" to="/collection">Continue shopping</Link></main><Footer /></>;
}
