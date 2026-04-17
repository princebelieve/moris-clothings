//client/src/pages/Collection.jsx
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductGrid from "../components/ProductGrid";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function Collection() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));
  }, []);

  return (
    <>
      <Navbar />

      <section className="section-alt">
        <div className="container">
          <h1 className="title">All Products</h1>
          <p className="muted">
            Explore premium tailoring, custom gowns, senator wears and more.
          </p>

          <ProductGrid products={products} />
        </div>
      </section>
    </>
  );
}
