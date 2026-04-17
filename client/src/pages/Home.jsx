//client/src/pages/Home.jsx
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ProductGrid from "../components/ProductGrid";
import useScrollReveal from "../hooks/useScrollReveal";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function Home() {
  useScrollReveal();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []));
  }, []);

  return (
    <>
      <Navbar />

      <section className="hero-section reveal">
        <Hero />
      </section>

      <section className="section-alt reveal">
        <div className="container">
          <h2 className="title">Featured Collection</h2>
          <p className="muted">
            Discover premium tailoring and modern fashion pieces
          </p>

          <ProductGrid products={products} />
        </div>
      </section>
    </>
  );
}
