import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowLeft, ArrowRight, Scissors, ShieldCheck, ShoppingBag } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductGrid from "../components/ProductGrid";
import useScrollReveal from "../hooks/useScrollReveal";

const API = import.meta.env.VITE_API_URL;
const slides = [
  { image: "/hero.jpg", title: "Tailored style. Everyday confidence.", eyebrow: "MORIS CLOTHING · DISTINCTLY YOURS", description: "Refined ready-to-wear and bespoke pieces, thoughtfully made for the moments that matter.", action: "Explore the collection", to: "/collection" },
  { image: "/about.jpg", title: "Made to fit. Made to be you.", eyebrow: "THE MORIS SIGNATURE", description: "Bring your vision to the studio. We’ll take care of the details.", action: "Create a bespoke piece", to: "/contact" },
  { image: "/contact-hero.jpg", title: "A look that feels like yours.", eyebrow: "CONSIDERED STYLE", description: "Find the right piece for your everyday wardrobe and the occasions worth remembering.", action: "Shop new arrivals", to: "/collection" },
];

function HeroCarousel() {
  const [active, setActive] = useState(0);
  useEffect(() => { const timer = window.setInterval(() => setActive(index => (index + 1) % slides.length), 8500); return () => window.clearInterval(timer); }, []);
  const show = index => setActive((index + slides.length) % slides.length);
  const slide = slides[active];
  return <section className="moris-carousel reveal" aria-label="Featured Moris collections"><img className="moris-carousel-image" key={slide.image} src={slide.image} alt="" /><div className="moris-carousel-shade" /><div className="moris-carousel-copy" key={slide.title}><span className="eyebrow">{slide.eyebrow}</span><h1>{slide.title}</h1><p>{slide.description}</p><Link className="shop-button" to={slide.to}>{slide.action}<ArrowRight size={18} /></Link></div><a className="moris-carousel-scroll" href="#home-content"><ArrowDown size={18} /> Scroll to explore</a><div className="moris-carousel-controls"><div>{slides.map((item, index) => <button key={item.title} type="button" className={index === active ? "active" : ""} onClick={() => show(index)} aria-label={`Show slide ${index + 1}`} aria-current={index === active ? "true" : undefined} />)}</div><button type="button" aria-label="Previous slide" onClick={() => show(active - 1)}><ArrowLeft size={18} /></button><button type="button" aria-label="Next slide" onClick={() => show(active + 1)}><ArrowRight size={18} /></button></div></section>;
}

function FeaturePromos({ products }) {
  const [start, setStart] = useState(0);
  useEffect(() => { if (products.length < 2) return undefined; const timer = window.setInterval(() => setStart(index => (index + 1) % products.length), 18000); return () => window.clearInterval(timer); }, [products.length]);
  if (!products.length) return null;
  const picks = products.length === 1 ? [products[0]] : [products[start], products[(start + 1) % products.length]];
  return <section className="home-promo-pair reveal" aria-label="Featured pieces">{picks.map((product, index) => <Link className={`home-product-promo promo-${index + 1}`} to={`/product/${product._id}`} key={product._id}><img src={product.image || "/logo.png"} alt={product.name} loading="lazy" /><span><small>MORIS CLOTHING FAVOURITE</small><strong>{product.name}</strong><span>{product.category || "The Moris collection"}</span><b>DISCOVER THIS PIECE <ArrowRight size={15} /></b></span></Link>)}</section>;
}

function SectionTitle({ eyebrow, title, to = "/collection", linkText = "VIEW THE COLLECTION" }) {
  return <div className="home-section-title"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div><Link className="inline-link" to={to}>{linkText}<ArrowRight size={16} /></Link></div>;
}

export default function Home() {
  useScrollReveal();
  const [products, setProducts] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [salesLoaded, setSalesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [offers, setOffers] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API}/api/products`, { signal: controller.signal }).then(async response => { if (!response.ok) throw new Error("The collection is temporarily unavailable."); const data = await response.json(); if (!Array.isArray(data)) throw new Error("The collection is unavailable."); setProducts(data); }).catch(err => { if (err.name !== "AbortError") setError(err.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    fetch(`${API}/api/products/bestsellers?days=7`, { signal: controller.signal }).then(response => response.ok ? response.json() : { products: [] }).then(data => { if (!controller.signal.aborted) setBestsellers(Array.isArray(data.products) ? data.products : []); }).catch(() => {}).finally(() => { if (!controller.signal.aborted) setSalesLoaded(true); });
    return () => controller.abort();
  }, []);
  const newest = useMemo(() => products.slice(0, 10), [products]);
  const featured = salesLoaded && bestsellers.length ? bestsellers : newest;
  const categories = useMemo(() => [...new Set(products.map(product => product.category).filter(Boolean))].map(name => ({ name, count: products.filter(product => product.category === name).length })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).slice(0, 8), [products]);
  const discounted = useMemo(() => products.filter(product => Number(product.originalPrice) > Number(product.price)).slice(0, 10), [products]);
  const picks = offers ? discounted : featured.slice(0, 10);

  return <><Navbar /><main className="home-page"><HeroCarousel /><div id="home-content" className="home-page-content"><section className="shopping-promises reveal" aria-label="Shopping with Moris"><div><ShoppingBag /><span><strong>Shop your way</strong><small>Ready to wear and occasion pieces</small></span></div><div><Scissors /><span><strong>Made personal</strong><small>Bespoke tailoring and considered fit</small></span></div><div><ShieldCheck /><span><strong>Secure checkout</strong><small>Guest shopping, protected payments</small></span></div></section>
    <FeaturePromos products={featured.slice(0, 6)} />
    <section className="home-products-section reveal"><SectionTitle eyebrow={bestsellers.length ? "MOST ORDERED IN THE LAST 7 DAYS" : "FROM THE CURRENT COLLECTION"} title={bestsellers.length ? "Week bestsellers" : "Discover the collection"} />{loading ? <p role="status">Loading the collection...</p> : error ? <p role="alert" className="shop-error">{error}</p> : <ProductGrid products={featured.slice(0, 10)} />}</section>
    {!!categories.length && <section className="home-categories-section reveal"><SectionTitle eyebrow="FIND THE RIGHT LOOK" title="Shop by category" linkText="EXPLORE ALL PIECES" /><div className="home-category-grid">{categories.map(({ name, count }) => <Link to={`/category/${encodeURIComponent(name)}`} key={name}><span>{name}</span><small>{count} {count === 1 ? "piece" : "pieces"}</small><ArrowRight size={17} /></Link>)}</div></section>}
    <section className="bespoke-feature reveal"><div className="bespoke-photo"><img src="/about.jpg" alt="Moris Clothing tailoring and design" loading="lazy" /></div><div><span className="eyebrow">THE MORIS SIGNATURE</span><h2>Made to fit.<br />Made to be you.</h2><p>From a standout occasion to your everyday wardrobe, create a piece that feels like your own. Tell us your vision. We will take care of the details.</p><Link className="shop-button" to="/contact">Explore bespoke tailoring <ArrowRight size={16} /></Link><Link className="inline-link" to="/about">Discover our story</Link></div></section>
    <section className="home-products-section home-new-arrivals reveal"><SectionTitle eyebrow="JUST ADDED TO THE COLLECTION" title="New arrivals" /><ProductGrid products={newest.slice(0, 10)} /></section>
    <section className="home-editors reveal"><div className="home-editors-heading"><span className="eyebrow">THE MORIS CLOTHING EDIT</span><h2>Pieces to make your own</h2><div className="home-editor-tabs" role="tablist" aria-label="Featured and discounted pieces"><button role="tab" aria-selected={!offers} className={!offers ? "active" : ""} onClick={() => setOffers(false)}>FEATURED PIECES</button><button role="tab" aria-selected={offers} className={offers ? "active" : ""} onClick={() => setOffers(true)}>SPECIAL PRICES</button></div></div>{picks.length ? <ProductGrid products={picks} /> : <p className="home-empty-state">There are no special prices at the moment.</p>}</section>
    <section className="home-closing reveal"><span className="eyebrow">STYLE STARTS HERE</span><h2>A wardrobe with a point of view.</h2><Link className="shop-button" to="/collection">Explore the collection</Link></section></div></main><Footer /></>;
}
