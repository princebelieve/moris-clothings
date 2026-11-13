import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import useCart from "../hooks/useCart";
import { createCheckoutSession } from "../services/api";
import { money } from "../utils/money";
export default function Checkout() {
  const { items, subtotal } = useCart();
  const [settings, setSettings] = useState(null);
  const [country, setCountry] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.VITE_API_URL}/api/settings`, { signal: controller.signal }).then(async res => {
      if (!res.ok) throw new Error("Unable to load delivery options. Please refresh to try again.");
      const data = await res.json(); setSettings(data); setCountry(data.shippingZones?.[0]?.countries?.[0] || "");
    }).catch(err => { if (err.name !== "AbortError") setError(err.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  const destinations = settings?.shippingZones?.flatMap(zone => zone.countries.map(code => ({ code, zone }))) || [];
  const selected = destinations.find(d => d.code === country);
  const delivery = selected?.zone.fee || 0;
  async function checkout() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const data = await createCheckoutSession(items.map(({ productId, quantity, size }) => ({ productId, quantity, size })), country);
      try { localStorage.setItem(`moris-checkout:${data.sessionId}`, JSON.stringify(items)); } catch { /* Payment remains available without storage. */ }
      window.location.assign(data.url);
    } catch (err) { setError(err.message); setBusy(false); }
  }
  const names = new Intl.DisplayNames(["en"], { type: "region" });
  return <><Navbar /><main className="shop-shell"><p className="eyebrow">YOUR STYLE, SECURELY CHECKED OUT</p><h1>Checkout</h1>{!items.length ? <div className="empty-state"><p>Your bag is empty.</p><Link className="shop-button" to="/collection">Explore the collection</Link></div> : <div className="bag-layout"><section className="checkout-panel"><h2>Delivery &amp; payment</h2><p>Check out as a guest. Your email, contact details and full delivery address will be collected securely by Stripe.</p><p>Have an account? <Link className="inline-link" to="/login?returnTo=/checkout">Sign in</Link> or continue as a guest.</p>
    {loading ? <p role="status">Loading delivery options...</p> : <label>Delivery country<select value={country} onChange={e => setCountry(e.target.value)} disabled={busy || !destinations.length}><option value="" disabled>Select your country</option>{destinations.map(d => <option key={d.code} value={d.code}>{names.of(d.code)}</option>)}</select></label>}
    {!loading && !error && !destinations.length && <p role="alert">Online delivery is being configured. <Link className="inline-link" to="/contact">Contact us to arrange your order</Link>.</p>}
    {settings?.checkoutPaused && <p role="alert">Checkout is temporarily paused. Your bag is saved for later.</p>}
    {error && <p role="alert" className="shop-error">{error}</p>}
    <details><summary>Have a promotional code?</summary><p>Enter your code on the secure Stripe payment page.</p></details>
    <button className="shop-button" disabled={busy || loading || !selected || settings?.checkoutPaused} onClick={checkout}>{busy ? "Opening secure checkout..." : "Continue to secure payment"}</button><p className="secure-note"><LockKeyhole size={16} /> Secure checkout powered by Stripe</p><p>Available cards and wallets are shown on the payment page.</p>
    </section><aside className="order-summary"><h2>Your order</h2>{items.map(i => <div className="summary-row" key={i.key}><span>{i.name}{i.size ? ` (${i.size})` : ""} &times; {i.quantity}</span><strong>{money(i.price * i.quantity)}</strong></div>)}<div className="summary-row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div className="summary-row"><span>Delivery</span><strong>{selected ? money(delivery) : "Choose country"}</strong></div><div className="summary-row summary-total"><span>Total before discounts</span><strong>{money(subtotal + delivery)}</strong></div><p>Prices and availability are confirmed by the server at payment.</p><Link className="inline-link" to="/cart">Edit your bag</Link></aside></div>}</main><Footer /></>;
}
