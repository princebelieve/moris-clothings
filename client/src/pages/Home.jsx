import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Scissors, ShieldCheck, ShoppingBag } from "lucide-react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ProductGrid from "../components/ProductGrid";
import Footer from "../components/Footer";
export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.VITE_API_URL}/api/products`, { signal: controller.signal }).then(r => { if (!r.ok) throw new Error("The collection is temporarily unavailable. Please try again shortly."); return r.json(); }).then(p => setProducts(Array.isArray(p) ? p : [])).catch(e => { if (e.name !== "AbortError") setError(e.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  return <><Navbar /><main><Hero /><section className="shopping-promises" aria-label="Shopping with Moris"><div><ShoppingBag /><span><strong>Shop your way</strong><small>Ready to wear &amp; occasion pieces</small></span></div><div><Scissors /><span><strong>Made personal</strong><small>Bespoke tailoring, considered fit</small></span></div><div><ShieldCheck /><span><strong>Secure checkout</strong><small>Guest shopping, protected payments</small></span></div></section>
    <section className="shop-shell home-collection"><div className="shop-heading"><div><span className="eyebrow">THE LATEST FROM MORIS</span><h2>Find your next signature.</h2></div><Link className="inline-link" to="/collection">Shop all pieces <ArrowRight size={16} /></Link></div>{loading ? <p role="status">Loading the collection...</p> : error ? <p role="alert" className="shop-error">{error}</p> : products.length ? <ProductGrid products={products.slice(0, 8)} /> : <div className="empty-state"><h3>A new collection is taking shape.</h3><p>For a piece made especially for you, speak to our tailoring team.</p><Link className="shop-button outline" to="/contact">Enquire about a bespoke piece</Link></div>}</section>
    <section className="bespoke-feature"><div className="bespoke-photo"><img src="/about.jpg" alt="Moris Clothing tailoring and design" loading="lazy" /></div><div><span className="eyebrow">THE MORIS SIGNATURE</span><h2>Made to fit.<br />Made to be you.</h2><p>From a standout occasion to your everyday wardrobe, create a piece that feels like your own. Tell us your vision. We will take care of the details.</p><Link className="shop-button" to="/contact">Explore bespoke tailoring <ArrowRight size={16} /></Link><Link className="inline-link" to="/about">Discover our story</Link></div></section><section className="home-closing"><span className="eyebrow">STYLE STARTS HERE</span><h2>A wardrobe with a point of view.</h2><Link className="shop-button" to="/collection">Explore the collection</Link></section></main><Footer /></>;
}
