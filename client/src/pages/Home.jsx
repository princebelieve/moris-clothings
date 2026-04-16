import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ProductGrid from "../components/ProductGrid";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
      })
      .catch(() => setProducts([]));
  }, []);

  return (
    <>
      <Navbar />
      <Hero />

      <h2 style={{ paddingLeft: 40 }}>Featured Collection</h2>
      <ProductGrid products={products} />
    </>
  );
}
