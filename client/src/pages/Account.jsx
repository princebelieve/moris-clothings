import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import useAuth from "../hooks/useAuth";
import { getToken } from "../utils/auth";
import { money } from "../utils/money";
import { API_BASE } from "../services/apiBase";
import { readApiJson } from "../services/apiResponse";

export default function Account() {
  const { user, isAdmin } = useAuth();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${getToken()}` }, signal: controller.signal })
      .then(async response => { const data = await readApiJson(response, "Your account service returned an unexpected response."); if (!response.ok) throw new Error(data.message || "Unable to load your account details."); return data; })
      .then(setProfile)
      .catch(err => { if (err.name !== "AbortError") setError(err.message); });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/api/orders/mine`, { headers: { Authorization: `Bearer ${getToken()}` }, signal: controller.signal })
      .then(async response => {
        const data = await readApiJson(response, "Your account service returned an unexpected response.");
        if (!response.ok) throw new Error(data.message || `Unable to load your orders (HTTP ${response.status}).`);
        return data;
      })
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(err => { if (err.name !== "AbortError") setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  return <><Navbar /><main className="shop-shell admin-page"><p className="eyebrow">YOUR MORIS ACCOUNT</p><h1>Hello, {profile?.name || "there"}.</h1><p>{profile?.email || user?.email}</p><div className="account-shortcuts"><Link className="shop-button outline" to="/collection">Continue shopping</Link>{isAdmin && <Link className="shop-button" to="/admin">Open store dashboard</Link>}</div><section className="account-orders"><h2>Your orders</h2>{error && <p className="shop-error" role="alert">{error}</p>}{loading ? <p role="status">Loading your orders...</p> : !orders.length ? <div className="empty-state"><h3>No orders yet.</h3><p>Orders placed with this account email will appear here.</p><Link className="inline-link" to="/collection">Browse the collection</Link></div> : orders.map(order => <article className="account-order" key={order._id}><div><strong>Order {String(order._id).slice(-8).toUpperCase()}</strong><span>{new Date(order.createdAt).toLocaleDateString("en-GB", { dateStyle: "long" })}</span></div><div><span className="status-pill">{order.status}{order.fulfillment === "shipped" ? " - shipped" : ""}</span><strong>{money(order.amount)}</strong></div>{order.trackingNumber && <p>Tracking reference: {order.trackingNumber}</p>}<ul>{order.items?.map((item, index) => <li key={`${order._id}-${index}`}>{item.name}{item.size ? ` (${item.size})` : ""} x {item.quantity}</li>)}</ul></article>)}</section></main><Footer /></>;
}
