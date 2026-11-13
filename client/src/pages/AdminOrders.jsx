import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import AdminNav from "../components/AdminNav";
import { getToken } from "../utils/auth";
import { money } from "../utils/money";
const API = import.meta.env.VITE_API_URL;
export default function AdminOrders() {
  const [data, setData] = useState({ orders: [], total: 0, pages: 0 });
  const [status, setStatus] = useState("paid");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError("");
    fetch(`${API}/api/orders?page=${page}&status=${status}`, { signal: controller.signal, headers: { Authorization: `Bearer ${getToken()}` } }).then(async res => { const result = await res.json(); if (!res.ok) throw new Error(result.message || "Unable to load orders."); setData(result); }).catch(err => { if (err.name !== "AbortError") setError(err.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page, status, refresh]);
  return <><Navbar /><main className="shop-shell admin-page"><p className="eyebrow">MORIS STORE MANAGER</p><h1>Orders</h1><AdminNav /><div className="shop-heading"><label>Payment status <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">All orders</option>{["paid", "pending", "failed", "expired"].map(s => <option key={s}>{s}</option>)}</select></label><button className="shop-button outline" onClick={() => setRefresh(r => r + 1)}>Refresh orders</button></div>
    {error && <p role="alert" className="shop-error">{error}</p>}{loading ? <p role="status">Loading orders...</p> : <><p>{data.total} matching orders</p>{!data.orders.length && <div className="empty-state"><h2>No orders here yet.</h2><p>Completed checkouts will appear here automatically.</p></div>}{data.orders.map(order => <OrderCard key={order._id} order={order} />)}<div className="pagination"><button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button><span>Page {page} of {Math.max(1, data.pages)}</span><button disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}>Next</button></div></>}
  </main></>;
}
function OrderCard({ order }) {
  const [fulfillment, setFulfillment] = useState(order.fulfillment || "unfulfilled");
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [notificationBusy, setNotificationBusy] = useState("");
  const [notifications, setNotifications] = useState({ email: order.orderEmailNotifiedAt, whatsapp: order.whatsappNotifiedAt, customer: order.customerWhatsappNotifiedAt });
  const address = order.shipping?.address;
  async function save() {
    setBusy(true); setNotice("");
    try { const res = await fetch(`${API}/api/orders/${order._id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify({ fulfillment, trackingNumber }) }); const result = await res.json(); if (!res.ok) throw new Error(result.message || "Unable to save."); setNotice("Fulfillment updated."); } catch (err) { setNotice(err.message); } finally { setBusy(false); }
  }
  async function notify(path, key, label) {
    setNotificationBusy(key); setNotice("");
    try { const response = await fetch(`${API}/api/orders/${order._id}/${path}`, { method: "POST", headers: { Authorization: `Bearer ${getToken()}` } }); const data = await response.json(); if (!response.ok) throw new Error(data.message || `Unable to send ${label}.`); setNotifications(current => ({ ...current, [key]: data.orderEmailNotifiedAt || data.whatsappNotifiedAt || data.customerWhatsappNotifiedAt || new Date().toISOString() })); setNotice(`${label} sent.`); }
    catch (err) { setNotice(err.message); }
    finally { setNotificationBusy(""); }
  }
  function print() { const el = document.querySelector(`[data-order-id="${order._id}"]`); el?.classList.add("print-selected"); document.body.dataset.printOrder = order._id; window.print(); delete document.body.dataset.printOrder; el?.classList.remove("print-selected"); }
  return <article className="admin-order" data-order-id={order._id}><header><div><p className="eyebrow">ORDER {order._id.slice(-8).toUpperCase()}</p><h2>{order.customer?.name || "Customer details unavailable"}</h2><p>{new Date(order.createdAt).toLocaleString("en-GB")}</p></div><div><span className={`status-pill ${order.status}`}>{order.status}</span><h2>{money(order.amount)}</h2></div></header><div className="admin-order-columns"><section><h3>Items</h3>{order.items?.length ? order.items.map((i, n) => <div className="summary-row" key={n}><span>{i.name}{i.size ? ` (${i.size})` : ""} &times; {i.quantity}</span><strong>{money(i.price * i.quantity)}</strong></div>) : <p>Legacy product reference: {order.productId || "Unavailable"}</p>}<p>Delivery: {money(order.delivery)}</p></section><section><h3>Customer &amp; delivery</h3><p>{order.customer?.email || "Email unavailable"}<br />{order.customer?.phone}</p><address>{order.shipping?.name}{address && <><br />{[address.line1, address.line2, address.city, address.state, address.postal_code, address.country].filter(Boolean).join(", ")}</>}</address></section></div>
    {order.status === "paid" && <div className="fulfillment-form"><label>Fulfillment<select value={fulfillment} onChange={e => setFulfillment(e.target.value)}>{["unfulfilled", "processing", "shipped", "delivered"].map(s => <option key={s}>{s}</option>)}</select></label><label>Tracking number<input maxLength={200} value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} /></label><button className="shop-button" disabled={busy} onClick={save}>{busy ? "Saving..." : "Save fulfillment"}</button></div>}
    {order.status === "paid" && <section className="order-notifications"><h3>Order notifications</h3><div><button disabled={!!notificationBusy} onClick={() => notify("notify-email", "email", "Order email")}>{notificationBusy === "email" ? "Sending..." : notifications.email ? "Resend order email" : "Send order email"}</button><span>{notifications.email ? `Last sent ${new Date(notifications.email).toLocaleString("en-GB")}` : order.orderEmailNotificationError || "Not sent"}</span></div><div><button disabled={!!notificationBusy} onClick={() => notify("notify-whatsapp", "whatsapp", "Store WhatsApp notification")}>{notificationBusy === "whatsapp" ? "Sending..." : notifications.whatsapp ? "Resend store WhatsApp" : "Send to store WhatsApp"}</button><span>{notifications.whatsapp ? `Last sent ${new Date(notifications.whatsapp).toLocaleString("en-GB")}` : order.whatsappNotificationError || "Not sent"}{order.whatsappDeliveryStatus ? ` · ${order.whatsappDeliveryStatus}` : ""}{order.whatsappDeliveryError ? ` · ${order.whatsappDeliveryError}` : ""}</span></div>{order.customerWhatsappOptIn && <div><button disabled={!!notificationBusy} onClick={() => notify("notify-customer-whatsapp", "customer", "Customer WhatsApp copy")}>{notificationBusy === "customer" ? "Sending..." : notifications.customer ? "Resend customer WhatsApp" : "Send customer WhatsApp copy"}</button><span>{notifications.customer ? `Last sent ${new Date(notifications.customer).toLocaleString("en-GB")}` : order.customerWhatsappNotificationError || "Customer opted in"}{order.customerWhatsappDeliveryStatus ? ` · ${order.customerWhatsappDeliveryStatus}` : ""}{order.customerWhatsappDeliveryError ? ` · ${order.customerWhatsappDeliveryError}` : ""}</span></div>}</section>}
    {order.whatsappReplies?.length > 0 && <section className="admin-whatsapp-replies"><h3>Customer WhatsApp replies</h3>{order.whatsappReplies.map(reply => <p key={reply.messageId}><time>{new Date(reply.receivedAt).toLocaleString("en-GB")}</time><span>{reply.text}</span></p>)}</section>}
    <p role="status">{notice}</p><button className="text-button print-order" onClick={print}>Print order</button><p className="order-reference">Payment reference: {order.stripeSessionId || "Awaiting checkout"}</p>
  </article>;
}
