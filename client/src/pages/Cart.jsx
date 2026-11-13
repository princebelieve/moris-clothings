import { Link } from "react-router-dom";
import { LockKeyhole, ShoppingBag, Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import useCart, { updateQuantity, removeFromCart } from "../hooks/useCart";
import { money } from "../utils/money";

export default function Cart() {
  const { items, count, subtotal } = useCart();
  return <><Navbar /><main className="shop-shell">
    <p className="eyebrow">A LITTLE CLOSER TO YOUR NEXT FAVOURITE</p>
    <div className="shop-heading"><h1>Your shopping bag <span>({count})</span></h1><Link to="/collection">Continue shopping &rarr;</Link></div>
    {!items.length ? <div className="empty-state"><ShoppingBag size={48} /><h2>Your next favourite is waiting.</h2><p>Explore the collection and add something you love.</p><Link className="shop-button" to="/collection">Explore the collection</Link></div> : <div className="bag-layout">
      <div>{items.map(item => <article className="bag-item" key={item.key}>
        <Link to={`/product/${item.productId}`}><img src={item.image || "/logo.png"} alt={item.name} /></Link>
        <div><Link to={`/product/${item.productId}`}><h2>{item.name}</h2></Link>{item.size && <p>Size: {item.size}</p>}<p>{money(item.price)} each</p>
          <label>Quantity <input aria-label={`Quantity for ${item.name}${item.size ? `, ${item.size}` : ""}`} type="number" min="1" max="20" value={item.quantity} onChange={e => updateQuantity(item.key, Number(e.target.value))} /></label>
          <button className="text-button" onClick={() => removeFromCart(item.key)}><Trash2 size={14} /> Remove</button>
        </div><strong>{money(item.price * item.quantity)}</strong>
      </article>)}</div>
      <aside className="order-summary"><h2>Order summary</h2><div className="summary-row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div><p>Delivery options and your final total are shown at secure checkout. Prices and availability are confirmed before payment.</p>
        <Link className="shop-button" to="/checkout">Proceed to checkout</Link>
        <p className="secure-note"><LockKeyhole size={16} /> Secure payment with Stripe</p><p>No account needed. Enter your email and delivery address at checkout.</p>
      </aside>
    </div>}
  </main><Footer /></>;
}
