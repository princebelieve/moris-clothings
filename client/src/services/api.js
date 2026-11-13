//client/src/services/api.js
const BASE_URL = import.meta.env.VITE_API_URL;
async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error || "The request could not be completed.");
  return data;
}

// -------------------------
// AUTH
// -------------------------

export async function registerUser(data) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return readResponse(res);
}

export async function loginUser(data) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return readResponse(res);
}

export async function verifyEmail(token) {
  const res = await fetch(`${BASE_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`);
  return readResponse(res);
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

  return readResponse(res);
}

export async function resetPassword(token, password) {
  const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });

  return readResponse(res);
}

// -------------------------
// STRIPE (UNCHANGED)
// -------------------------

export async function createCheckoutSession(items, shippingCountry, customerWhatsappOptIn = false) {
  const res = await fetch(`${BASE_URL}/api/payments/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, shippingCountry, customerWhatsappOptIn }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || "Payment session failed");
  }

  return data;
}
