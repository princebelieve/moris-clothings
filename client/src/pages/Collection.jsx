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

      <div style={{ padding: "40px" }}>
        <h1>All Products</h1>
        <ProductGrid products={products} />
      </div>
    </>
  );
}
