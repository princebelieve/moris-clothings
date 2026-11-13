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
  const filtered = products.filter(p => `${p.name} ${p.category || ""}`.toLowerCase().includes(search.toLowerCase()));
  return <><Navbar /><main className="shop-shell admin-page"><p className="eyebrow">MORIS STORE MANAGER</p><h1>Products</h1><AdminNav />{error && <p role="alert" className="shop-error">{error}</p>}<p role="status">{notice}</p><div className="admin-products-layout"><ProductForm key={editing?._id || "new"} onSubmit={submit} editingProduct={editing} onCancelEdit={() => setEditing(null)} /><section><div className="shop-heading"><h2>Catalogue ({products.length})</h2><label>Search products<input type="search" value={search} onChange={e => setSearch(e.target.value)} /></label></div><div className="admin-import-tools"><button className="shop-button outline" type="button" disabled={importing} onClick={importStarters}>{importing ? "Importing starters..." : "Import starters and update prices"}</button></div><p className="admin-import-help">Adds any missing items from the Moris starter catalogue and restores their starter prices. Existing descriptions, images and sizes are preserved.</p>{loading ? <p role="status">Loading products...</p> : !filtered.length ? <p>No products to display.</p> : filtered.map(p => <article className="admin-product-row" key={p._id}><img src={p.image || "/logo.png"} alt={p.name} /><div><h3>{p.name}</h3><p>{money(p.price)} &middot; {p.category || "Uncategorised"}</p><span className="status-pill">{p.available === false ? "Sold out" : "Available"}</span></div><div className="row-actions"><button onClick={() => { setEditing(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Edit</button><button disabled={deleting === p._id} onClick={() => remove(p)}>{deleting === p._id ? "Deleting..." : "Delete"}</button></div></article>)}</section></div></main></>;
}
