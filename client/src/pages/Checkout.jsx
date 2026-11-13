import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import useCart from "../hooks/useCart";
import { createCheckoutSession } from "../services/api";
import { money } from "../utils/money";
import { API_BASE } from "../services/apiBase";
import { readApiJson } from "../services/apiResponse";

export default function Checkout() {
  const { items, subtotal } = useCart();
  const [settings, setSettings] = useState(null);
  const [country, setCountry] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [whatsappOrderCopy, setWhatsappOrderCopy] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/api/settings`, { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error("Unable to load delivery options. Please refresh to try again.");
      const data = await readApiJson(response, "Unable to load delivery options. Please try again shortly."); setSettings(data); setCountry(data.shippingZones?.[0]?.countries?.[0] || "");
    }).catch(err => { if (err.name !== "AbortError") setError(err.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  const destinations = settings?.shippingZones?.flatMap(zone => zone.countries.map(code => ({ code, zone }))) || [];
  const selected = destinations.find(destination => destination.code === country);
  const delivery = selected?.zone.fee || 0;
  async function checkout() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const data = await createCheckoutSession(items.map(({ productId, quantity, size }) => ({ productId, quantity, size })), country, whatsappOrderCopy);
      try { localStorage.setItem(`moris-checkout:${data.sessionId}`, JSON.stringify(items)); } catch { /* Payment remains available without storage. */ }
      window.location.assign(data.url);
    } catch (err) { setError(err.message); setBusy(false); }
  }
  const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
  return <><Navbar /><main className="shop-shell"><p className="eyebrow">YOUR STYLE, SECURELY CHECKED OUT</p><h1>Checkout</h1>{!items.length ? <div className="empty-state"><p>Your bag is empty.</p><Link className="shop-button" to="/collection">Explore the collection</Link></div> : <div className="bag-layout"><section className="checkout-panel"><h2>Delivery &amp; payment</h2><p>Check out as a guest. Your email, contact details and delivery address are collected securely by Stripe.</p><p>Have an account? <Link className="inline-link" to="/login?returnTo=/checkout">Sign in</Link> or continue as a guest.</p>{loading ? <p role="status">Loading delivery options...</p> : <label>Delivery country<select value={country} onChange={event => setCountry(event.target.value)} disabled={busy || !destinations.length}><option value="" disabled>Select your country</option>{destinations.map(destination => <option key={destination.code} value={destination.code}>{countryNames.of(destination.code)}</option>)}</select></label>}{!loading && !error && !destinations.length && <p role="alert">Online delivery is being configured. <Link className="inline-link" to="/contact">Contact us to arrange your order</Link>.</p>}<label className="check-label checkout-whatsapp-optin"><input type="checkbox" checked={whatsappOrderCopy} onChange={event => setWhatsappOrderCopy(event.target.checked)} /> Send me an optional order copy on WhatsApp after checkout.</label>{settings?.checkoutPaused && <p role="alert">Checkout is temporarily paused. Your bag is saved for later.</p>}{error && <p role="alert" className="shop-error">{error}</p>}<details><summary>Have a promotional code?</summary><p>Enter your code on the secure Stripe payment page.</p></details><button className="shop-button" disabled={busy || loading || !selected || settings?.checkoutPaused} onClick={checkout}>{busy ? "Opening secure checkout..." : "Continue to secure payment"}</button><p className="secure-note"><LockKeyhole size={16} /> Secure checkout powered by Stripe</p><p>Available cards and wallets are shown on the payment page.</p></section><aside className="order-summary"><h2>Your order</h2>{items.map(item => <div className="summary-row" key={item.key}><span>{item.name}{item.size ? ` (${item.size})` : ""} &times; {item.quantity}</span><strong>{money(item.price * item.quantity)}</strong></div>)}<div className="summary-row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div className="summary-row"><span>Delivery</span><strong>{selected ? money(delivery) : "Choose country"}</strong></div><div className="summary-row summary-total"><span>Total before discounts</span><strong>{money(subtotal + delivery)}</strong></div><p>Prices and availability are confirmed by the server at payment.</p><Link className="inline-link" to="/cart">Edit your bag</Link></aside></div>}</main><Footer /></>;
}
