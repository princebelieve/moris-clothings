import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import AdminNav from "../components/AdminNav";
import ProductForm from "../components/ProductForm";
import { getToken } from "../utils/auth";
import { money } from "../utils/money";
import { API_BASE } from "../services/apiBase";
import { readApiJson } from "../services/apiResponse";
const API = API_BASE;
export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleting, setDeleting] = useState("");
  const [importing, setImporting] = useState(false);
  async function loadProducts() { const res = await fetch(`${API}/api/products`); const data = await readApiJson(res, "Unable to load products. Please try again shortly."); if (!res.ok || !Array.isArray(data)) throw new Error(data.message || "Unable to load products."); setProducts(data); }
  useEffect(() => { loadProducts().catch(err => setError(err.message)).finally(() => setLoading(false)); }, []);
  async function submit(form) {
    const body = new FormData();
    ["name", "price", "originalPrice", "category", "description", "sizes", "available"].forEach(key => body.append(key, form[key]));
    if (form.image) body.append("image", form.image);
    const res = await fetch(`${API}/api/products${editing ? `/${editing._id}` : ""}`, { method: editing ? "PUT" : "POST", headers: { Authorization: `Bearer ${getToken()}` }, body });
    const data = await readApiJson(res, "Unable to save the product. Please try again shortly."); if (!res.ok) throw new Error(data.message || data.error || "Unable to save product.");
    setProducts(p => editing ? p.map(item => item._id === data._id ? data : item) : [data, ...p]); setEditing(null); setNotice("Product saved.");
  }
  async function remove(product) {
    if (!window.confirm(`Delete ${product.name}? Existing order records will be kept.`)) return;
    setDeleting(product._id); setError("");
    try { const res = await fetch(`${API}/api/products/${product._id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } }); const data = await readApiJson(res, "Unable to delete the product. Please try again shortly."); if (!res.ok) throw new Error(data.message || "Unable to delete product."); setProducts(p => p.filter(i => i._id !== product._id)); if (editing?._id === product._id) setEditing(null); setNotice("Product deleted."); } catch (err) { setError(err.message); } finally { setDeleting(""); }
  }
  async function importStarters() {
    setImporting(true); setError(""); setNotice("");
    try {
      const response = await fetch(`${API}/api/products/import-starters`, { method: "POST", headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await readApiJson(response, "Unable to import Moris starter products.");
      if (!response.ok) throw new Error(data.message || "Unable to import Moris starter products.");
      setProducts(data.products);
      setNotice(`Imported ${data.imported} missing starter product${data.imported === 1 ? "" : "s"}; updated ${data.pricesUpdated} starter price${data.pricesUpdated === 1 ? "" : "s"}.`);
    } catch (err) { setError(err.message); }
    finally { setImporting(false); }
  }
  const filtered = products.filter(p => `${p.name} ${p.category || ""}`.toLowerCase().includes(search.toLowerCase()) && (availability === "all" || (availability === "available" ? p.available !== false : p.available === false)));
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  return <><Navbar /><main className="shop-shell admin-page"><p className="eyebrow">MORIS STORE MANAGER</p><h1>Products</h1><p className="admin-page-intro">Create and maintain the pieces customers can buy. Add a clear name, category, price, and product photo; use availability to control whether it can be purchased.</p><AdminNav />{error && <p role="alert" className="shop-error">{error}</p>}{notice && <p role="status" className="admin-notice">{notice}</p>}<div className="admin-stat-strip"><div><strong>{products.length}</strong><span>Total catalogue</span></div><div><strong>{products.filter(p => p.available !== false).length}</strong><span>Available to buy</span></div><div><strong>{products.filter(p => p.available === false).length}</strong><span>Hidden / sold out</span></div></div><div className="admin-products-layout"><ProductForm key={editing?._id || "new"} onSubmit={submit} editingProduct={editing} onCancelEdit={() => setEditing(null)} categories={categories} /><section className="admin-catalogue"><div className="shop-heading"><div><p className="eyebrow">YOUR INVENTORY</p><h2>Catalogue <span>({filtered.length})</span></h2></div><label>Search by name<input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Find a product" /></label></div><label className="admin-filter">Show<select value={availability} onChange={e => setAvailability(e.target.value)}><option value="all">All products</option><option value="available">Available to buy</option><option value="unavailable">Hidden / sold out</option></select></label><div className="admin-import-panel"><div><p className="eyebrow">STARTER CATALOGUE</p><h3>Load Moris starter pieces</h3><p>Import the prepared 20-piece catalogue. Existing starter pieces are kept; known prices are refreshed, while pieces without confirmed prices stay unavailable until you set a price.</p></div><button className="shop-button outline" type="button" disabled={importing} onClick={importStarters}>{importing ? "Importing…" : "Import starter products"}</button></div>{loading ? <p role="status">Loading products…</p> : !filtered.length ? <div className="empty-state"><h3>No matching products</h3><p>Change the search or availability filter to find a piece.</p></div> : filtered.map(p => <article className="admin-product-row" key={p._id}><img src={p.image || "/logo.png"} alt={p.name} /><div className="admin-product-copy"><span className={`admin-stock ${p.available === false ? "is-off" : "is-on"}`}>{p.available === false ? "Not for sale" : "Live in shop"}</span><h3>{p.name}</h3><p>{p.category || "Uncategorised"}</p><strong>{money(p.price)}</strong></div><div className="row-actions"><button onClick={() => { setEditing(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Edit details</button><button disabled={deleting === p._id} onClick={() => remove(p)}>{deleting === p._id ? "Deleting…" : "Delete"}</button></div></article>)}</section></div></main></>;
}
