import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import AdminNav from "../components/AdminNav";
import { getToken } from "../utils/auth";
import { API_BASE } from "../services/apiBase";
import { readApiJson } from "../services/apiResponse";
import { money } from "../utils/money";
const API = API_BASE;
export default function AdminOrders() {
  const [data, setData] = useState({ orders: [], total: 0, pages: 0 });
  const [status, setStatus] = useState("paid");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [selectedOrders, setSelectedOrders] = useState([]);
  function printSelected() {
    const ids = [...selectedOrders];
    ids.forEach(id => document.querySelector(`[data-order-id="${id}"]`)?.classList.add("print-selected"));
    document.body.dataset.printOrders = "true";
    const finish = () => { ids.forEach(id => document.querySelector(`[data-order-id="${id}"]`)?.classList.remove("print-selected")); delete document.body.dataset.printOrders; window.removeEventListener("afterprint", finish); };
    window.addEventListener("afterprint", finish, { once: true }); window.print();
  }
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError("");
    fetch(`${API}/api/orders?page=${page}&status=${status}`, { signal: controller.signal, headers: { Authorization: `Bearer ${getToken()}` } }).then(async res => { const result = await readApiJson(res, "Unable to load orders. Please try again shortly."); if (!res.ok) throw new Error(result.message || "Unable to load orders."); setData(result); }).catch(err => { if (err.name !== "AbortError") setError(err.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page, status, refresh]);
  return <><Navbar /><main className="shop-shell admin-page"><p className="eyebrow">MORIS STORE MANAGER</p><h1>Orders</h1><p className="admin-page-intro">Work through paid orders from payment to delivery: check the customer and items, prepare the parcel, enter tracking, then send the customer update.</p><AdminNav /><div className="order-workflow"><span><b>1</b> Confirm payment</span><span><b>2</b> Prepare &amp; dispatch</span><span><b>3</b> Add tracking &amp; notify</span></div><div className="shop-heading"><label>Show orders by payment<select value={status} onChange={e => { setStatus(e.target.value); setPage(1); setSelectedOrders([]); }}><option value="">All payment statuses</option>{["paid", "pending", "failed", "expired"].map(s => <option key={s}>{s}</option>)}</select></label><button className="shop-button outline" onClick={() => setRefresh(r => r + 1)}>Refresh order list</button></div>
    {error && <p role="alert" className="shop-error">{error}</p>}{loading ? <p role="status">Loading orders…</p> : <><div className="orders-list-heading"><div><p className="eyebrow">ORDER QUEUE</p><h2>{data.total} {status || "total"} orders</h2></div><div className="order-bulk-actions"><label><input type="checkbox" checked={data.orders.length > 0 && data.orders.every(o => selectedOrders.includes(o._id))} onChange={e => setSelectedOrders(e.target.checked ? data.orders.map(o => o._id) : [])} /> Select orders on this page</label><span>{selectedOrders.length} selected on this page</span><button className="shop-button outline" disabled={!selectedOrders.length} onClick={printSelected}>Print selected orders</button></div></div>{!data.orders.length && <div className="empty-state"><h2>No orders in this view</h2><p>Completed checkouts appear here automatically. Choose another payment status to check a different queue.</p></div>}{data.orders.map(order => <OrderCard key={order._id} order={order} selected={selectedOrders.includes(order._id)} onSelect={checked => setSelectedOrders(ids => checked ? [...ids, order._id] : ids.filter(id => id !== order._id))} />)}<div className="pagination"><button disabled={page <= 1} onClick={() => { setSelectedOrders([]); setPage(p => p - 1); }}>Previous</button><span>Page {page} of {Math.max(1, data.pages)}</span><button disabled={page >= data.pages} onClick={() => { setSelectedOrders([]); setPage(p => p + 1); }}>Next</button></div></>}
  </main></>;
}
function OrderCard({ order, selected, onSelect }) {
  const [fulfillment, setFulfillment] = useState(order.fulfillment || "unfulfilled");
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [notificationBusy, setNotificationBusy] = useState("");
  const [notifications, setNotifications] = useState({ email: order.orderEmailNotifiedAt, whatsapp: order.whatsappNotifiedAt, customer: order.customerWhatsappNotifiedAt });
  const address = order.shipping?.address;
  async function save() {
    setBusy(true); setNotice("");
    try { const res = await fetch(`${API}/api/orders/${order._id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify({ fulfillment, trackingNumber }) }); const result = await readApiJson(res, "Unable to save the order. Please try again shortly."); if (!res.ok) throw new Error(result.message || "Unable to save."); setNotice("Fulfillment updated."); } catch (err) { setNotice(err.message); } finally { setBusy(false); }
  }
  async function notify(path, key, label) {
    setNotificationBusy(key); setNotice("");
    try { const response = await fetch(`${API}/api/orders/${order._id}/${path}`, { method: "POST", headers: { Authorization: `Bearer ${getToken()}` } }); const data = await readApiJson(response, `Unable to send ${label}. Please try again shortly.`); if (!response.ok) throw new Error(data.message || `Unable to send ${label}.`); setNotifications(current => ({ ...current, [key]: data.orderEmailNotifiedAt || data.whatsappNotifiedAt || data.customerWhatsappNotifiedAt || new Date().toISOString() })); setNotice(`${label} sent.`); }
    catch (err) { setNotice(err.message); }
    finally { setNotificationBusy(""); }
  }
  function print() { const el = document.querySelector(`[data-order-id="${order._id}"]`); el?.classList.add("print-selected"); document.body.dataset.printOrder = order._id; window.print(); delete document.body.dataset.printOrder; el?.classList.remove("print-selected"); }
  return <article className="admin-order" data-order-id={order._id}><header><label className="admin-order-select"><input type="checkbox" checked={selected} onChange={e => onSelect(e.target.checked)} /> Select order</label><div><p className="eyebrow">ORDER {order._id.slice(-8).toUpperCase()}</p><h2>{order.customer?.name || "Customer details unavailable"}</h2><p>{new Date(order.createdAt).toLocaleString("en-GB")}</p></div><div><span className={`status-pill ${order.status}`}>{order.status}</span><h2>{money(order.amount)}</h2></div></header><div className="admin-order-columns"><section><h3>Items in this order</h3>{order.items?.length ? order.items.map((i, n) => <div className="summary-row" key={n}><span>{i.name}{i.size ? ` (${i.size})` : ""} &times; {i.quantity}</span><strong>{money(i.price * i.quantity)}</strong></div>) : <p>Legacy product reference: {order.productId || "Unavailable"}</p>}<p>Delivery fee: {money(order.delivery)}</p></section><section><h3>Customer &amp; delivery address</h3><p>{order.customer?.email || "Email unavailable"}<br />{order.customer?.phone}</p><address>{order.shipping?.name}{address && <><br />{[address.line1, address.line2, address.city, address.state, address.postal_code, address.country].filter(Boolean).join(", ")}</>}</address></section></div>
    {order.status === "paid" && <div className="fulfillment-form"><label>Fulfillment<select value={fulfillment} onChange={e => setFulfillment(e.target.value)}>{["unfulfilled", "processing", "shipped", "delivered"].map(s => <option key={s}>{s}</option>)}</select></label><label>Tracking number<input maxLength={200} value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} /></label><button className="shop-button" disabled={busy} onClick={save}>{busy ? "Saving..." : "Save fulfillment"}</button></div>}
    {order.status === "paid" && <section className="order-notifications"><h3>Order notifications</h3><div><button disabled={!!notificationBusy} onClick={() => notify("notify-email", "email", "Order email")}>{notificationBusy === "email" ? "Sending..." : notifications.email ? "Resend order email" : "Send order email"}</button><span>{notifications.email ? `Last sent ${new Date(notifications.email).toLocaleString("en-GB")}` : order.orderEmailNotificationError || "Not sent"}</span></div><div><button disabled={!!notificationBusy} onClick={() => notify("notify-whatsapp", "whatsapp", "Store WhatsApp notification")}>{notificationBusy === "whatsapp" ? "Sending..." : notifications.whatsapp ? "Resend store WhatsApp" : "Send to store WhatsApp"}</button><span>{notifications.whatsapp ? `Last sent ${new Date(notifications.whatsapp).toLocaleString("en-GB")}` : order.whatsappNotificationError || "Not sent"}{order.whatsappDeliveryStatus ? ` · ${order.whatsappDeliveryStatus}` : ""}{order.whatsappDeliveryError ? ` · ${order.whatsappDeliveryError}` : ""}</span></div>{order.customerWhatsappOptIn && <div><button disabled={!!notificationBusy} onClick={() => notify("notify-customer-whatsapp", "customer", "Customer WhatsApp copy")}>{notificationBusy === "customer" ? "Sending..." : notifications.customer ? "Resend customer WhatsApp" : "Send customer WhatsApp copy"}</button><span>{notifications.customer ? `Last sent ${new Date(notifications.customer).toLocaleString("en-GB")}` : order.customerWhatsappNotificationError || "Customer opted in"}{order.customerWhatsappDeliveryStatus ? ` · ${order.customerWhatsappDeliveryStatus}` : ""}{order.customerWhatsappDeliveryError ? ` · ${order.customerWhatsappDeliveryError}` : ""}</span></div>}</section>}
    {order.whatsappReplies?.length > 0 && <section className="admin-whatsapp-replies"><h3>Customer WhatsApp replies</h3>{order.whatsappReplies.map(reply => <p key={reply.messageId}><time>{new Date(reply.receivedAt).toLocaleString("en-GB")}</time><span>{reply.text}</span></p>)}</section>}
    <p role="status">{notice}</p><button className="text-button print-order" onClick={print}>Print order</button><p className="order-reference">Payment reference: {order.stripeSessionId || "Awaiting checkout"}</p>
  </article>;
}
