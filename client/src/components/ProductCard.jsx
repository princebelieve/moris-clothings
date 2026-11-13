import { Link } from "react-router-dom";
import { useState } from "react";
import { addToCart } from "../hooks/useCart";
import { money } from "../utils/money";
export default function ProductCard({ product }) {
  const [added, setAdded] = useState(false);
  const soldOut = product.available === false;
  return <article className="card product-card">
    <Link className="product-image-link" to={`/product/${product._id}`}><img loading="lazy" src={product.image || "/logo.png"} alt={product.name} /><span className="product-tag">{soldOut ? "Sold out" : product.category || "Moris collection"}</span></Link>
    <div className="product-card-copy"><Link to={`/product/${product._id}`}><h3>{product.name}</h3></Link><p>{money(product.price)}</p></div>
    {product.sizes?.length ? <Link className="shop-button outline" to={`/product/${product._id}`}>Choose size</Link> : <button className="shop-button outline" disabled={soldOut} onClick={() => { addToCart(product); setAdded(true); }}>{soldOut ? "Sold out" : added ? "Added - add another" : "Add to bag"}</button>}
    {added && <Link className="view-bag" to="/cart" role="status">View your bag &rarr;</Link>}
  </article>;
}
