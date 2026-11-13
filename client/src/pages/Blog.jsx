import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ShareLinks from "../components/ShareLinks";
import { API_BASE } from "../services/apiBase";
import { readApiJson } from "../services/apiResponse";

const API = API_BASE;
function topicFor(title = "") {
  if (/tailor|suit|fitting|cloth|bespoke/i.test(title)) return "THE TAILORING EDIT";
  if (/neat|care|shirt|shoe|groom|presentation/i.test(title)) return "THE FINISHING TOUCHES";
  if (/wedding|occasion|weather|season/i.test(title)) return "DRESS FOR THE MOMENT";
  return "THE STYLE NOTES";
}
function readingTime(content = "") { return Math.max(2, Math.ceil(content.trim().split(/\s+/).length / 220)); }
function formatDate(value) { return value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "Moris style guide"; }
function Cover({ article, compact = false }) {
  return <div className={`journal-cover${compact ? " journal-cover-compact" : ""}`}>
    {article.image ? <img src={article.image} alt="" loading="lazy" /> : <div className="journal-cover-art" aria-hidden="true"><span>MORIS</span><i /><b>MADE TO FIT</b></div>}
    <span className="journal-cover-topic">{topicFor(article.title)}</span>
    {compact && <strong>{article.title}</strong>}
  </div>;
}
function recommendationFor(post, products) {
  const text = `${post.title} ${post.excerpt || ""}`.toLowerCase();
  const terms = text.includes("senator") || text.includes("agbada") || text.includes("kaftan") ? ["senator", "agbada", "kaftan"] : text.includes("gown") || text.includes("dress") ? ["gown", "dress"] : text.includes("shirt") ? ["shirt"] : text.includes("trouser") || text.includes("chino") ? ["trouser", "chino"] : text.includes("suit") || text.includes("tailor") || text.includes("wedding") ? ["suit", "tailor"] : [];
  return products.find(product => product.available !== false && terms.some(term => product.name?.toLowerCase().includes(term))) || null;
}

export default function Blog() {
  const { id } = useParams();
  const [posts, setPosts] = useState([]);
  const [post, setPost] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(""); setPost(null);
    Promise.all([
      fetch(`${API}/api/blog${id ? `/${id}` : ""}`, { signal: controller.signal }).then(async response => { const data = await readApiJson(response, "The journal service returned an unexpected response."); if (!response.ok) throw new Error(data.message || `The journal service returned HTTP ${response.status}.`); return data; }),
      id ? fetch(`${API}/api/products`, { signal: controller.signal }).then(async response => response.ok ? readApiJson(response) : []).catch(() => []) : Promise.resolve([]),
    ]).then(([content, catalogue]) => {
      if (id) setPost(content);
      else setPosts(Array.isArray(content) ? content : []);
      setProducts(Array.isArray(catalogue) ? catalogue : []);
    }).catch(err => { if (err.name !== "AbortError") setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id]);

  if (id) {
    const recommendation = post ? recommendationFor(post, products) : null;
    return <><Navbar /><main className="shop-shell journal-page journal-detail-page"><Link to="/blog" className="journal-back"><ArrowLeft size={16} /> All journal entries</Link>
      {loading ? <p role="status">Loading article...</p> : error ? <p role="alert" className="shop-error">{error}</p> : post && <article className="journal-article">
        <header className="journal-article-hero"><span>{topicFor(post.title)} / MORIS CLOTHING</span><h1>{post.title}</h1><div><time>{formatDate(post.createdAt)}</time><span><Clock3 size={15} /> {readingTime(post.content)} min read</span></div></header>
        <Cover article={post} />
        {post.excerpt && <p className="journal-excerpt">{post.excerpt}</p>}
        <div className="journal-content">{post.content.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
        {recommendation && <aside className="journal-product-cta"><div><span>FROM THE MORIS COLLECTION</span><h2>{recommendation.name}</h2><p>A considered piece to explore alongside this style note.</p></div><Link to={`/product/${recommendation._id}`}>Discover the piece <ArrowRight size={16} /></Link></aside>}
        <ShareLinks path={`/blog/${id}`} title={post.title} />
      </article>}
    </main><Footer /></>;
  }

  return <><Navbar /><main className="shop-shell journal-page">
    <header className="journal-hero"><p>THE MORIS CLOTHING JOURNAL</p><h1>Well dressed.<br />Well considered.</h1><span>Notes on modern menswear, personal presentation, garment care and the craft of tailoring in the UK.</span><a href="#journal-articles">Explore the journal <ArrowRight size={16} /></a></header>
    <div className="journal-intro"><div><span className="eyebrow">STYLE, WITH PURPOSE</span><h2>Ideas for the way you dress.</h2></div><p>Practical advice from the Moris studio, from getting a clean fit to choosing the right piece for the occasion.</p></div>
    {error && <p role="alert" className="shop-error">{error}</p>}
    {loading ? <p role="status">Loading articles...</p> : posts.length ? <section id="journal-articles" className="journal-grid" aria-label="Moris journal articles">{posts.map(article => <article className="journal-card" key={article._id}>
      <Link to={`/blog/${article._id}`} className="journal-card-link"><Cover article={article} compact /><div className="journal-card-copy"><div className="journal-card-meta"><span>{topicFor(article.title)}</span><time>{formatDate(article.createdAt)}</time></div><h2>{article.title}</h2><p>{article.excerpt || article.content.slice(0, 150)}</p><span className="journal-read-link">Read the story <ArrowRight size={16} /></span></div></Link>
    </article>)}</section> : <div className="journal-empty"><span className="eyebrow">FROM THE MORIS STUDIO</span><h2>The next story is being prepared.</h2><p>Visit again soon for advice on fit, style and caring for your favourite pieces.</p><Link className="shop-button" to="/collection">Explore the collection</Link></div>}
  </main><Footer /></>;
}
