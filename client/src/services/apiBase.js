const configuredApiBase = String(import.meta.env.VITE_API_URL || "").trim();
// If Vercel builds without the variable, don't silently send /api requests to
// the SPA fallback, which responds with index.html instead of API JSON.
export const API_BASE = (configuredApiBase || "https://moris-clothings.onrender.com").replace(/\/$/, "");
