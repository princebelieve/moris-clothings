import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API_BASE } from "../services/apiBase";
import { readApiJson } from "../services/apiResponse";

const StoreContext = createContext(null);
const API = API_BASE;

function readList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function idOf(product) {
  return String(product?._id || product?.id || "");
}

export function StoreProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => readList("moris-wishlist"));
  const [compare, setCompare] = useState(() => readList("moris-compare"));
  const [storeSettings, setStoreSettings] = useState({});
  const siteSettings = storeSettings.site || {};

  useEffect(() => { fetch(`${API}/api/settings`).then(response => response.ok ? readApiJson(response) : null).then(data => { if (data) setStoreSettings(data); }).catch(() => {}); }, []);
  useEffect(() => {
    const root = document.documentElement;
    const colors = siteSettings.colors || {};
    const css = { accent: "--gold", header: "--navy", body: "--bg", text: "--text", card: "--white", footer: "--navy-light", metal: "--metal" };
    for (const [key, variable] of Object.entries(css)) root.style.setProperty(variable, colors[key] || "");
    const fonts = { system: "system-ui, sans-serif", arial: "Arial, sans-serif", trebuchet: "'Trebuchet MS', sans-serif", georgia: "Georgia, serif" };
    root.style.setProperty("--site-font", fonts[siteSettings.font] || "Arial, sans-serif");
    root.dataset.siteTheme = ["classic", "soft", "editorial"].includes(siteSettings.theme) ? siteSettings.theme : "classic";
  }, [siteSettings]);

  useEffect(() => localStorage.setItem("moris-wishlist", JSON.stringify(wishlist)), [wishlist]);
  useEffect(() => localStorage.setItem("moris-compare", JSON.stringify(compare)), [compare]);

  const value = useMemo(() => ({
    wishlist,
    compare,
    siteSettings,
    storeSettings,
    updateStoreSettings(settings) { setStoreSettings(current => ({ ...current, ...settings })); },
    toggleWish(product) {
      const id = idOf(product);
      if (!id) return;
      setWishlist(items => items.some(item => idOf(item) === id)
        ? items.filter(item => idOf(item) !== id)
        : [...items, { ...product, id }]);
    },
    toggleCompare(product) {
      const id = idOf(product);
      if (!id) return;
      setCompare(items => items.some(item => idOf(item) === id)
        ? items.filter(item => idOf(item) !== id)
        : items.length < 4 ? [...items, { ...product, id }] : items);
    },
    removeFromWishlist(id) { setWishlist(items => items.filter(item => idOf(item) !== String(id))); },
    clearWishlist() { setWishlist([]); },
    removeFromCompare(id) { setCompare(items => items.filter(item => idOf(item) !== String(id))); },
    clearCompare() { setCompare([]); },
  }), [wishlist, compare, siteSettings, storeSettings]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}
