import { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function Success() {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/api/orders/latest`)
      .then((res) => res.json())
      .then((data) => setOrder(data));
  }, []);

  if (!order) return <p>Loading...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>Payment Successful 🎉</h1>

      <h3>Order Details</h3>

      <div>
        <p>Product ID: {order.productId}</p>
        <p>Amount: ₦{order.amount}</p>
        <p>Status: {order.status}</p>
      </div>
    </div>
  );
}
