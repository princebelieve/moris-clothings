import { useEffect, useState } from "react";
import { ArrowRight, ImagePlus, Newspaper, Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdminNav from "../components/AdminNav";
import { getToken } from "../utils/auth";
import { API_BASE } from "../services/apiBase";
import { readApiJson } from "../services/apiResponse";

const API = API_BASE;
const emptyForm = { title: "", excerpt: "", content: "", published: false };
const dateLabel = value => value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Not published yet";

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [importing, setImporting] = useState(false);
  const auth = { Authorization: `Bearer ${getToken()}` };
  const editingPost = posts.find(post => post._id === editing);
  async function load() {
    const response = await fetch(`${API}/api/blog/admin`, { headers: auth });
    const data = await readApiJson(response, "Unable to load articles. Please try again shortly.");
    if (!response.ok) throw new Error(data.message || "Unable to load articles.");
    setPosts(data);
  }
  useEffect(() => { load().catch(err => setError(err.message)); }, []);
  useEffect(() => {
    if (!image) { setImagePreview(editingPost?.image || ""); return undefined; }
    const url = URL.createObjectURL(image); setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image, editingPost?.image, editing]);
  function edit(post) {
    setEditing(post._id); setForm({ title: post.title, excerpt: post.excerpt || "", content: post.content, published: post.published }); setImage(null); setNotice("");
    document.getElementById("journal-composer")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function resetForm() { setEditing(""); setForm(emptyForm); setImage(null); }
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const body = new FormData(); Object.entries(form).forEach(([key, value]) => body.append(key, String(value))); if (image) body.append("image", image);
      const response = await fetch(`${API}/api/blog${editing ? `/${editing}` : ""}`, { method: editing ? "PUT" : "POST", headers: auth, body });
      const data = await readApiJson(response, "Unable to save the article. Please try again shortly.");
      if (!response.ok) throw new Error(data.message || "Unable to save article.");
      setNotice(editing ? "Your article has been updated." : "Your article has been created."); resetForm(); await load();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  async function remove(post) {
    if (!window.confirm(`Delete "${post.title}" from the journal?`)) return;
    setError("");
    try {
      const response = await fetch(`${API}/api/blog/${post._id}`, { method: "DELETE", headers: auth });
      const data = await readApiJson(response, "Unable to delete the article. Please try again shortly.");
      if (!response.ok) throw new Error(data.message || "Unable to delete article.");
      setPosts(items => items.filter(item => item._id !== post._id));
      if (editing === post._id) resetForm();
      setNotice("The article has been removed.");
    } catch (err) { setError(err.message); }
  }
  async function importGuides() {
    setImporting(true); setError(""); setNotice("");
    try {
      const response = await fetch(`${API}/api/blog/import-style-guides`, { method: "POST", headers: auth });
      const data = await readApiJson(response, "Unable to import the style guides. Please try again shortly.");
      if (!response.ok) throw new Error(data.message || "Unable to import Moris style guides.");
      await load();
      setNotice(data.imported ? `${data.imported} articles imported and published. ${data.skipped} existing titles skipped.` : "All 20 Moris style guides are already in the journal.");
    } catch (err) { setError(err.message); } finally { setImporting(false); }
  }
  return <><Navbar /><main className="shop-shell admin-page journal-admin-page"><p className="eyebrow">MORIS STORE MANAGER</p><h1>Journal studio</h1><AdminNav />
    {error && <p role="alert" className="shop-error">{error}</p>}{notice && <p role="status" className="success-message">{notice}</p>}
    <section className="journal-import-panel"><div className="journal-import-icon"><Newspaper size={25} /></div><div><span className="eyebrow">A HEAD START FOR THE JOURNAL</span><h2>Import Moris style guides</h2><p>Publish 20 original articles about men's outfits, neat presentation, garment care and tailoring in the UK. Existing titles are skipped, so it is safe to run again.</p></div><button className="shop-button" type="button" disabled={importing} onClick={importGuides}>{importing ? "Importing stories..." : "Import 20 style guides"}<ArrowRight size={16} /></button></section>
    <div className="journal-studio-grid">
      <form id="journal-composer" className="journal-composer" onSubmit={submit}>
        <div className="journal-composer-heading"><span className="eyebrow">{editing ? "UPDATE A STORY" : "CREATE SOMETHING TO READ"}</span><h2>{editing ? "Edit article" : "Write an article"}</h2><p>Give readers a clear reason to open the story, then share practical advice from the Moris point of view.</p></div>
        <label>Article title<input maxLength={180} required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} placeholder="For example, A better fit for the modern suit" /></label>
        <label>Short introduction<textarea maxLength={500} rows={3} value={form.excerpt} onChange={event => setForm({ ...form, excerpt: event.target.value })} placeholder="Summarise what the reader will learn." /><small>{form.excerpt.length}/500 characters</small></label>
        <label>Article content<textarea required rows={12} value={form.content} onChange={event => setForm({ ...form, content: event.target.value })} placeholder="Write in short paragraphs. Use a blank line to start a new paragraph." /><small>Separate paragraphs with a blank line to make the public article easier to read.</small></label>
        <label className="journal-image-input">Cover image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setImage(event.target.files?.[0] || null)} /><small>Optional. Use a clear portrait or landscape fashion image.</small></label>
        {imagePreview ? <div className="journal-image-preview"><img src={imagePreview} alt="Article cover preview" /><span>Cover preview</span></div> : <div className="journal-image-empty"><ImagePlus size={19} /><span>Add a cover image to give the story its own visual.</span></div>}
        <label className="journal-publish-toggle"><input type="checkbox" checked={form.published} onChange={event => setForm({ ...form, published: event.target.checked })} /><span><strong>Publish this article</strong><small>Turn this off to save the article as a draft.</small></span></label>
        <div className="journal-form-actions"><button className="shop-button" disabled={busy}>{busy ? "Saving article..." : editing ? "Save changes" : "Save article"}</button>{editing && <button className="text-button" type="button" onClick={resetForm}>Cancel editing</button>}</div>
      </form>
      <section className="journal-admin-list"><div className="journal-list-heading"><div><span className="eyebrow">YOUR STORIES</span><h2>Articles <span>{posts.length}</span></h2></div><button className="text-button" type="button" onClick={() => load().catch(err => setError(err.message))}>Refresh list</button></div>
        {!posts.length ? <div className="journal-list-empty"><Newspaper size={24} /><h3>No articles imported yet</h3><p>Use the import button above to add the 20 written Moris guides, or write a new article here.</p></div> : <div className="journal-admin-items">{posts.map(post => <article className="journal-admin-item" key={post._id}><div className="journal-admin-thumb">{post.image ? <img src={post.image} alt="" /> : <span>MORIS<br />JOURNAL</span>}</div><div className="journal-admin-copy"><div><span className={`journal-status ${post.published ? "is-published" : "is-draft"}`}>{post.published ? "Published" : "Draft"}</span><time>{dateLabel(post.createdAt)}</time></div><h3>{post.title}</h3><p>{post.excerpt || post.content.slice(0, 105)}</p><div className="journal-admin-actions"><button type="button" onClick={() => edit(post)}>Edit article</button><button type="button" className="journal-delete-action" onClick={() => remove(post)}><Trash2 size={14} /> Delete</button></div></div></article>)}</div>}
      </section>
    </div>
  </main><Footer /></>;
}
