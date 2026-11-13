import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Minus, Plus, X } from "lucide-react";
import useCart, { updateQuantity, removeFromCart } from "../hooks/useCart";
import { money } from "../utils/money";
export function openCart() { window.dispatchEvent(new Event("moris:open-bag")); }
export default function CartDrawer() {
  const ref = useRef(null);
  const { items, count, subtotal } = useCart();
  const location = useLocation();
  useEffect(() => { const open = () => ref.current?.showModal(); window.addEventListener("moris:open-bag", open); return () => window.removeEventListener("moris:open-bag", open); }, []);
  useEffect(() => { ref.current?.close(); }, [location.pathname]);
  function close() { ref.current?.close(); }
  return <dialog ref={ref} className="cart-drawer" aria-labelledby="bag-title" onClick={e => { if (e.target === e.currentTarget) { const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close(); } }}><header><h2 id="bag-title">Your bag <span>({count})</span></h2><button autoFocus className="icon-button" onClick={close} aria-label="Close shopping bag"><X /></button></header><div className="drawer-lines">{!items.length && <div className="empty-state"><p>Your bag is waiting for something special.</p><Link className="shop-button" to="/collection" onClick={close}>Explore the collection</Link></div>}{items.map(i => <article className="drawer-line" key={i.key}><Link to={`/product/${i.productId}`} onClick={close}><img src={i.image || "/logo.png"} alt={i.name} /></Link><div><div className="drawer-item-title"><Link to={`/product/${i.productId}`} onClick={close}>{i.name}</Link><button className="icon-button" aria-label={`Remove ${i.name}`} onClick={() => removeFromCart(i.key)}><X size={16} /></button></div>{i.size && <p>Size: {i.size}</p>}<p>{money(i.price * i.quantity)}</p><div className="quantity-stepper"><button aria-label={`Decrease quantity of ${i.name}`} disabled={i.quantity <= 1} onClick={() => updateQuantity(i.key, i.quantity - 1)}><Minus size={14} /></button><span>{i.quantity}</span><button aria-label={`Increase quantity of ${i.name}`} disabled={i.quantity >= 20} onClick={() => updateQuantity(i.key, i.quantity + 1)}><Plus size={14} /></button></div></div></article>)}</div>{items.length > 0 && <footer><div className="summary-row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div><p>Delivery calculated at checkout.</p><Link className="shop-button outline" to="/cart" onClick={close}>View bag</Link><Link className="shop-button" to="/checkout" onClick={close}>Checkout</Link></footer>}</dialog>;
}
