import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { completeCheckout } from "../hooks/useCart";
import { money } from "../utils/money";
import { API_BASE } from "../services/apiBase";
import { readApiJson } from "../services/apiResponse";
export default function Success() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!sessionId) return;
    let active = true; let timer; let tries = 0;
    const controller = new AbortController();
    async function verify() {
      try {
        const res = await fetch(`${API_BASE}/api/orders/session/${encodeURIComponent(sessionId)}`, { signal: controller.signal });
        const data = await readApiJson(res, "Unable to verify payment. Please retry shortly."); if (!res.ok) throw new Error(data.message || "Unable to verify payment.");
        if (!active) return;
        setOrder(data); setError("");
        if (data.status === "paid") completeCheckout(sessionId);
        else if (++tries < 8) timer = setTimeout(verify, 3000);
      } catch (err) { if (active && err.name !== "AbortError") setError(err.message); }
    }
    verify(); return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [sessionId, attempt]);
  const paid = order?.status === "paid";
  return <><Navbar /><main className="shop-shell receipt"><p className="eyebrow">MORIS CLOTHING</p><h1>{paid ? "Thank you for your order." : "Checking your payment"}</h1>
    {!sessionId ? <p>There is no checkout reference in this link. Please use the confirmation link from your payment or contact us.</p> : error ? <p role="alert" className="shop-error">{error}</p> : !order ? <p role="status">Verifying your secure payment...</p> : paid ? <section className="order-summary"><p>Payment confirmed. We will prepare your pieces with care.</p><p>Order reference: <strong>{order.id}</strong></p>{order.items?.map((item, index) => <div className="summary-row" key={index}><span>{item.name}{item.size ? ` (${item.size})` : ""} &times; {item.quantity}</span><span>{money(item.price * item.quantity)}</span></div>)}<div className="summary-row summary-total"><span>Total paid</span><strong>{money(order.amount)}</strong></div></section> : <p role="status">Your payment is still being confirmed. You can check again in a moment. Your bag will stay saved until payment is verified.</p>}
    {sessionId && !paid && <button className="shop-button outline" onClick={() => { setError(""); setAttempt(a => a + 1); }}>Check payment again</button>}<div className="receipt-actions"><Link className="shop-button" to="/collection">Continue shopping</Link><Link className="inline-link" to="/contact">Contact Moris</Link></div></main><Footer /></>;
}
