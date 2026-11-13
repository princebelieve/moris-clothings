import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useStore } from "../context/StoreContext";
import { money } from "../utils/money";

export default function Compare() {
  const { compare, removeFromCompare, clearCompare } = useStore();
  return <><Navbar /><main className="shop-shell"><p className="eyebrow">COMPARE YOUR SHORTLIST</p><h1>Compare pieces</h1>{compare.length ? <><div className="compare-grid">{compare.map(product => <article key={product._id || product.id}><img src={product.image || "/logo.png"} alt={product.name} /><span className="eyebrow">{product.category || "Moris collection"}</span><h2>{product.name}</h2><p>{product.description || "Made for a distinctive Moris look."}</p><strong>{money(product.price)}</strong>{product.sizes?.length > 0 && <p>Sizes: {product.sizes.join(", ")}</p>}<Link className="shop-button" to={`/product/${product._id || product.id}`}>View piece</Link><button className="text-button" onClick={() => removeFromCompare(product._id || product.id)}>Remove</button></article>)}</div><button className="text-button" onClick={clearCompare}>Clear comparison</button></> : <div className="empty-state"><h2>No pieces selected to compare.</h2><p>Add up to four pieces from the collection to compare them side by side.</p></div>}</main><Footer /></>;
}
