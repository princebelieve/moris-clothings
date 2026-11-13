import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdminNav from "../components/AdminNav";
import { getToken } from "../utils/auth";
import { money } from "../utils/money";

const API = import.meta.env.VITE_API_URL;
export default function AdminDashboard() {
  const [summary, setSummary] = useState({ products: 0, orders: 0, paid: 0, revenue: 0 });
  const [error, setError] = useState("");
  useEffect(() => {
    const headers = { Authorization: `Bearer ${getToken()}` };
    Promise.all([fetch(`${API}/api/products`, { headers }), fetch(`${API}/api/orders/summary`, { headers })])
      .then(async ([productsResponse, ordersResponse]) => {
        const products = await productsResponse.json();
        const orders = await ordersResponse.json();
        if (!productsResponse.ok || !ordersResponse.ok) throw new Error(orders.message || "Unable to load the store overview.");
        setSummary({ products: products.length, orders: orders.total, paid: orders.paid, revenue: orders.revenue });
      }).catch(err => setError(err.message));
  }, []);
  return <><Navbar /><main className="shop-shell admin-page"><p className="eyebrow">MORIS STORE MANAGER</p><h1>Dashboard</h1><AdminNav />{error && <p role="alert" className="shop-error">{error}</p>}<div className="admin-summary-grid"><article><span>Catalogue</span><strong>{summary.products}</strong><Link to="/admin/products">Manage pieces</Link></article><article><span>Orders</span><strong>{summary.orders}</strong><Link to="/admin/orders">View orders</Link></article><article><span>Paid orders</span><strong>{summary.paid}</strong><Link to="/admin/orders?status=paid">Fulfil paid orders</Link></article><article><span>Paid revenue</span><strong>{money(summary.revenue)}</strong><Link to="/admin/orders?status=paid">Review paid orders</Link></article></div><section className="admin-shortcuts"><h2>Store tools</h2><Link to="/admin/products">Add or edit products</Link><Link to="/admin/orders">Review fulfilment and tracking</Link><Link to="/admin/blog">Publish a journal article</Link><Link to="/admin/settings">Adjust shipping and store appearance</Link></section></main><Footer /></>;
}
