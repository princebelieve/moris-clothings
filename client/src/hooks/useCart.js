import { useSyncExternalStore } from "react";

const KEY = "moris-shopping-bag";
const validRows = rows => Array.isArray(rows) ? rows.filter(i => i && typeof i.productId === "string" && typeof i.key === "string" && typeof i.name === "string" && typeof i.size === "string" && Number.isFinite(i.price) && i.price >= 0 && Number.isInteger(i.quantity) && i.quantity > 0 && i.quantity <= 20) : [];
let items = [];
try {
  const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
  items = validRows(saved);
} catch { /* A blocked or outdated storage entry must not prevent shopping. */ }
const listeners = new Set();
function publish(next) {
  items = next;
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* Keep the bag usable in memory. */ }
  listeners.forEach(listener => listener());
}
window.addEventListener("storage", event => {
  if (event.key !== KEY) return;
  try { items = validRows(JSON.parse(event.newValue || "[]")); listeners.forEach(listener => listener()); } catch { /* Ignore invalid storage. */ }
});
export function addToCart(product, quantity = 1, size = "") {
  const key = `${product._id}:${size}`;
  const existing = items.find(item => item.key === key);
  if (existing) publish(items.map(item => item.key === key ? { ...item, quantity: Math.min(20, item.quantity + quantity) } : item));
  else publish([...items, { key, productId: product._id, name: product.name, price: product.price, image: product.image, size, quantity: Math.min(20, Math.max(1, quantity)) }]);
  window.dispatchEvent(new Event("moris:open-bag"));
}
export function updateQuantity(key, quantity) {
  if (Number.isInteger(quantity) && quantity >= 1 && quantity <= 20) publish(items.map(item => item.key === key ? { ...item, quantity } : item));
}
export const removeFromCart = key => publish(items.filter(item => item.key !== key));
// Remove only the quantities belonging to the verified checkout; later additions stay in the bag.
export function completeCheckout(sessionId) {
  const key = `moris-checkout:${sessionId}`;
  let purchased;
  try { purchased = JSON.parse(localStorage.getItem(key) || "null"); } catch { return; }
  if (!Array.isArray(purchased)) return;
  publish(items.flatMap(item => {
    const bought = purchased.find(p => p.key === item.key);
    const quantity = item.quantity - (bought?.quantity || 0);
    return quantity > 0 ? [{ ...item, quantity }] : [];
  }));
  try { localStorage.removeItem(key); } catch { /* Storage may be unavailable. */ }
}
const subscribe = listener => { listeners.add(listener); return () => listeners.delete(listener); };
const snapshot = () => items;
export default function useCart() {
  const cart = useSyncExternalStore(subscribe, snapshot);
  return { items: cart, count: cart.reduce((sum, item) => sum + item.quantity, 0), subtotal: cart.reduce((sum, item) => sum + item.price * item.quantity, 0) };
}
