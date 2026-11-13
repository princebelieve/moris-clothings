import { Link } from "react-router-dom";
import { useState } from "react";
import { addToCart } from "../hooks/useCart";
import { money } from "../utils/money";
import { useStore } from "../context/StoreContext";
import { Heart, Scale } from "lucide-react";
export default function ProductCard({ product }) {
  const { wishlist, compare, toggleWish, toggleCompare } = useStore();
  const [added, setAdded] = useState(false);
  const soldOut = product.available === false;
  const id = String(product._id || product.id);
  const saved = wishlist.some(item => String(item._id || item.id) === id);
  const comparing = compare.some(item => String(item._id || item.id) === id);
  const originalPrice = Number(product.originalPrice) || 0;
  const discounted = originalPrice > Number(product.price);
  const discount = discounted ? Math.round((1 - Number(product.price) / originalPrice) * 100) : 0;
  return <article className="card product-card">
    <div className="product-image-wrap">{discounted && <span className="discount-badge">-{discount}%</span>}<Link className="product-image-link" to={`/product/${id}`}><img loading="lazy" src={product.image || "/logo.png"} alt={product.name} /><span className="product-tag">{soldOut ? "Sold out" : product.category || "Moris collection"}</span></Link></div>
    <div className="product-card-copy"><div className="product-title-row"><Link to={`/product/${id}`}><h3>{product.name}</h3></Link><button type="button" className={`product-save-inline ${saved ? "active" : ""}`} aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`} aria-pressed={saved} onClick={() => toggleWish(product)}><Heart size={18} fill={saved ? "currentColor" : "none"} /></button></div><p>{discounted && <del>{money(originalPrice)}</del>} {money(product.price)}</p></div>
    <button type="button" className={`compare-toggle ${comparing ? "active" : ""}`} aria-pressed={comparing} onClick={() => toggleCompare(product)}><Scale size={15} /> {comparing ? "Added to compare" : "Compare"}</button>
    {product.sizes?.length ? <Link className="shop-button outline" to={`/product/${product._id}`}>Choose size</Link> : <button className="shop-button outline" disabled={soldOut} onClick={() => { addToCart(product); setAdded(true); }}>{soldOut ? "Sold out" : added ? "Added - add another" : "Add to bag"}</button>}
    {added && <Link className="view-bag" to="/cart" role="status">View your bag &rarr;</Link>}
  </article>;
}
