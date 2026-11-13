import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { addToCart } from "../hooks/useCart";
import { money } from "../utils/money";
export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(""); setAdded(false); setSize(""); setQuantity(1);
    fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`, { signal: controller.signal }).then(async res => {
      if (!res.ok) throw new Error(res.status === 404 ? "This product is no longer available." : "Unable to load this product. Please try again.");
      setProduct(await res.json());
    }).catch(err => { if (err.name !== "AbortError") setError(err.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id]);
  return <><Navbar /><main className="shop-shell"><Link className="back-link" to="/collection">&larr; Back to the collection</Link>
    {loading ? <p role="status">Loading your next favourite...</p> : error ? <p role="alert" className="shop-error">{error}</p> : product && <div className="product-detail">
      <img src={product.image || "/logo.png"} alt={product.name} className="product-detail-image" />
      <div className="product-detail-content"><span className="eyebrow">{product.category || "THE MORIS COLLECTION"}</span><h1>{product.name}</h1><h2>{money(product.price)}</h2><p className="product-description">{product.description || "A considered addition to your wardrobe, with the distinctive style of Moris Clothing."}</p>
        {product.sizes?.length > 0 && <fieldset className="size-options"><legend>Select your size</legend>{product.sizes.map(value => <button type="button" key={value} aria-pressed={size === value} onClick={() => { setSize(value); setAdded(false); }}>{value}</button>)}</fieldset>}
        <label className="quantity-label">Quantity <input type="number" min="1" max="20" value={quantity} onChange={e => { const n = Number(e.target.value); if (Number.isInteger(n) && n >= 1 && n <= 20) setQuantity(n); }} /></label>
        <button className="shop-button" disabled={product.available === false || (product.sizes?.length > 0 && !size)} onClick={() => { addToCart(product, quantity, size); setAdded(true); }}>{product.available === false ? "Sold out" : "Add to bag"}</button>
        {product.sizes?.length > 0 && !size && <p>Select a size to add this piece to your bag.</p>}
        {added && <p role="status">Added to your bag. <Link className="inline-link" to="/cart">View bag &amp; checkout &rarr;</Link></p>}
        <div className="product-help"><h3>Make it yours</h3><p>Need help with fit or a bespoke piece? <Link className="inline-link" to="/contact">Talk to Moris</Link>.</p><p>Pay securely with Stripe. Delivery details and your final total are confirmed at checkout.</p></div>
      </div>
    </div>}
  </main><Footer /></>;
}
