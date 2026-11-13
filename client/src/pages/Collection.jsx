import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductGrid from "../components/ProductGrid";
export default function Collection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.VITE_API_URL}/api/products`, { signal: controller.signal }).then(res => { if (!res.ok) throw new Error("Unable to load the collection. Please refresh to try again."); return res.json(); }).then(data => { if (!Array.isArray(data)) throw new Error("The collection is unavailable."); setProducts(data); }).catch(err => { if (err.name !== "AbortError") setError(err.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const filtered = useMemo(() => {
    const result = products.filter(p => `${p.name} ${p.description || ""}`.toLowerCase().includes(search.toLowerCase()) && (!category || p.category === category) && (!available || p.available !== false));
    if (sort === "price-low") result.sort((a, b) => a.price - b.price);
    if (sort === "price-high") result.sort((a, b) => b.price - a.price);
    if (sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [products, search, category, sort, available]);
  return <><Navbar /><main className="shop-shell"><div className="collection-intro"><span className="eyebrow">CONSIDERED STYLE. DISTINCTLY YOU.</span><h1>The collection</h1><p>Discover ready-to-wear pieces, occasion styles and the Moris signature.</p></div>
    <div className="shop-toolbar"><label>Find a piece<input type="search" placeholder="Search the collection..." value={search} onChange={e => setSearch(e.target.value)} /></label><label>Category<select value={category} onChange={e => setCategory(e.target.value)}><option value="">All categories</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label><label>Sort by<select value={sort} onChange={e => setSort(e.target.value)}><option value="newest">Newest first</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A-Z</option></select></label><label className="stock-filter"><input type="checkbox" checked={available} onChange={e => setAvailable(e.target.checked)} /> Available only</label></div>
    {loading ? <p role="status">Loading the collection...</p> : error ? <p role="alert" className="shop-error">{error}</p> : <><p className="result-count">{filtered.length} {filtered.length === 1 ? "piece" : "pieces"}</p>{filtered.length ? <ProductGrid products={filtered} /> : <div className="empty-state"><h2>{products.length ? "No pieces match your search." : "New pieces are on their way."}</h2>{products.length > 0 && <button className="shop-button outline" onClick={() => { setSearch(""); setCategory(""); setAvailable(false); }}>Clear filters</button>}</div>}</>}
  </main><Footer /></>;
}
