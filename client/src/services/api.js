//client/src/services/api.js
const BASE_URL = import.meta.env.VITE_API_URL;

// -------------------------
// AUTH
// -------------------------

export async function registerUser(data) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function loginUser(data) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
}

// -------------------------
// PASSWORD RESET
// -------------------------

export async function forgotPassword(email) {
  const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  return res.json();
}

export async function resetPassword(token, password) {
  const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });

  return res.json();
}

// -------------------------
// STRIPE (UNCHANGED)
// -------------------------

export async function createCheckoutSession(productId) {
  const res = await fetch(`${BASE_URL}/api/payments/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || "Payment session failed");
  }

  return data;
}
