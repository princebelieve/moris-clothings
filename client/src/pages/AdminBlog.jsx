import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdminNav from "../components/AdminNav";
import { getToken } from "../utils/auth";
import { API_BASE } from "../services/apiBase";
import { readApiJson } from "../services/apiResponse";
const API = API_BASE;
const emptyForm = { title: "", excerpt: "", content: "", published: false };

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [importing, setImporting] = useState(false);
  const auth = { Authorization: `Bearer ${getToken()}` };
  async function load() { const response = await fetch(`${API}/api/blog/admin`, { headers: auth }); const data = await readApiJson(response, "Unable to load articles. Please try again shortly."); if (!response.ok) throw new Error(data.message || "Unable to load articles."); setPosts(data); }
  useEffect(() => { load().catch(err => setError(err.message)); }, []);
  function edit(post) { setEditing(post._id); setForm({ title: post.title, excerpt: post.excerpt || "", content: post.content, published: post.published }); setImage(null); window.scrollTo({ top: 0, behavior: "smooth" }); }
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const body = new FormData(); Object.entries(form).forEach(([key, value]) => body.append(key, String(value))); if (image) body.append("image", image);
      const response = await fetch(`${API}/api/blog${editing ? `/${editing}` : ""}`, { method: editing ? "PUT" : "POST", headers: auth, body }); const data = await readApiJson(response, "Unable to save the article. Please try again shortly.");
      if (!response.ok) throw new Error(data.message || "Unable to save article.");
      setNotice(editing ? "Article updated." : "Article created."); setEditing(""); setForm(emptyForm); setImage(null); await load();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  async function remove(post) {
    if (!window.confirm(`Delete “${post.title}”?`)) return;
    setError(""); try { const response = await fetch(`${API}/api/blog/${post._id}`, { method: "DELETE", headers: auth }); const data = await readApiJson(response, "Unable to delete the article. Please try again shortly."); if (!response.ok) throw new Error(data.message || "Unable to delete article."); setPosts(items => items.filter(item => item._id !== post._id)); setNotice("Article deleted."); } catch (err) { setError(err.message); }
  }
  async function importGuides() {
    setImporting(true); setError(""); setNotice("");
    try {
      const response = await fetch(`${API}/api/blog/import-style-guides`, { method: "POST", headers: auth });
      const data = await readApiJson(response, "Unable to import the style guides. Please try again shortly.");
      if (!response.ok) throw new Error(data.message || "Unable to import Moris style guides.");
      await load();
      setNotice(data.imported ? `Published ${data.imported} Moris style guides; skipped ${data.skipped} already in the journal.` : "All 20 Moris style guides are already in the journal.");
    } catch (err) { setError(err.message); }
    finally { setImporting(false); }
  }
  return <><Navbar /><main className="shop-shell admin-page"><p className="eyebrow">MORIS STORE MANAGER</p><h1>Journal articles</h1><AdminNav />{error && <p role="alert" className="shop-error">{error}</p>}<p role="status">{notice}</p><div className="journal-import-tools"><div><h2>Start the Moris journal</h2><p>Import 20 original guides on men's outfits, personal presentation, garment care and UK tailoring. Imported guides are published; existing titles are skipped.</p></div><button className="shop-button outline" type="button" disabled={importing} onClick={importGuides}>{importing ? "Importing articles..." : "Import 20 Moris style guides"}</button></div><div className="admin-products-layout"><form className="form product-editor" onSubmit={submit}><h2>{editing ? "Edit article" : "Write an article"}</h2><label>Title<input maxLength={180} required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} /></label><label>Short summary<textarea maxLength={500} rows={3} value={form.excerpt} onChange={event => setForm({ ...form, excerpt: event.target.value })} /></label><label>Article content<textarea required rows={12} value={form.content} onChange={event => setForm({ ...form, content: event.target.value })} /></label><label>Cover image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setImage(event.target.files?.[0] || null)} /></label><label className="check-label"><input type="checkbox" checked={form.published} onChange={event => setForm({ ...form, published: event.target.checked })} /> Published</label><button className="shop-button" disabled={busy}>{busy ? "Saving..." : editing ? "Save changes" : "Create article"}</button>{editing && <button className="text-button" type="button" onClick={() => { setEditing(""); setForm(emptyForm); }}>Cancel edit</button>}</form><section><h2>Articles ({posts.length})</h2>{posts.map(post => <article className="admin-product-row" key={post._id}>{post.image && <img src={post.image} alt="" />}<div><h3>{post.title}</h3><p>{post.published ? "Published" : "Draft"}</p></div><div className="row-actions"><button onClick={() => edit(post)}>Edit</button><button onClick={() => remove(post)}>Delete</button></div></article>)}</section></div></main><Footer /></>;
}
