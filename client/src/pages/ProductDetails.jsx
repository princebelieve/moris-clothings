import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { createCheckoutSession } from "../services/api";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data));
  }, [id]);

  async function buyNow() {
    const email = prompt("Enter your email address");

    if (!email) {
      alert("Email is required");
      return;
    }

    try {
      const data = await createCheckoutSession(id, email);
      window.location.href = data.url;
    } catch (err) {
      alert("Payment failed. Try again.");
      console.error(err);
    }
  }

  if (!product) return <p>Loading...</p>;

  return (
    <>
      <Navbar />

      <div style={{ padding: 40 }}>
        <img src={product.image} width="300" alt={product.name} />
        <h1>{product.name}</h1>
        <h2>₦{product.price}</h2>

        <button onClick={buyNow}>Buy Now</button>
      </div>
    </>
  );
}
