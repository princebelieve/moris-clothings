import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { API_BASE } from "../services/apiBase";
import { readApiJson } from "../services/apiResponse";
const API = API_BASE;

export default function Blog() {
  const { id } = useParams();
  const [posts, setPosts] = useState([]);
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API}/api/blog${id ? `/${id}` : ""}`, { signal: controller.signal })
      .then(async response => {
        const data = await readApiJson(response, "The journal is temporarily unavailable. Please try again later.");
        if (!response.ok) throw new Error(data.message || "Unable to load the journal.");
        return data;
      })
      .then(data => id ? setPost(data) : setPosts(Array.isArray(data) ? data : []))
      .catch(err => { if (err.name !== "AbortError") setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id]);
  return <><Navbar /><main className="shop-shell"><p className="eyebrow">THE MORIS JOURNAL</p>{id ? <>{loading ? <p role="status">Loading article...</p> : error ? <p role="alert" className="shop-error">{error}</p> : post && <article className="journal-article">{post.image && <img src={post.image} alt="" />}<h1>{post.title}</h1><p className="muted">{new Date(post.createdAt).toLocaleDateString("en-GB", { dateStyle: "long" })}</p><div className="journal-content">{post.content.split(/\r?\n/).filter(Boolean).map((line, index) => <p key={index}>{line}</p>)}</div><Link className="inline-link" to="/blog">Back to the journal</Link></article>}</> : <><h1>The journal</h1><p>Notes on considered style, fit and caring for the pieces you love.</p>{loading ? <p role="status">Loading articles...</p> : error ? <p role="alert" className="shop-error">{error}</p> : posts.length ? <div className="journal-grid">{posts.map(item => <article key={item._id}>{item.image && <Link to={`/blog/${item._id}`}><img src={item.image} alt="" loading="lazy" /></Link>}<span className="eyebrow">{new Date(item.createdAt).toLocaleDateString("en-GB", { dateStyle: "medium" })}</span><h2><Link to={`/blog/${item._id}`}>{item.title}</Link></h2><p>{item.excerpt}</p><Link className="inline-link" to={`/blog/${item._id}`}>Read article</Link></article>)}</div> : <div className="empty-state"><h2>Journal coming soon.</h2><p>Check back for notes from the Moris tailoring studio.</p></div>}</>}</main><Footer /></>;
}
