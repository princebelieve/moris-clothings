import { useSyncExternalStore } from "react";
import { getToken, logout } from "../utils/auth";
function subscribe(listener) { window.addEventListener("moris:auth", listener); window.addEventListener("storage", listener); return () => { window.removeEventListener("moris:auth", listener); window.removeEventListener("storage", listener); }; }
export default function useAuth() {
  const token = useSyncExternalStore(subscribe, getToken);
  let user = null;
  try { if (token) { const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))); if (payload.exp * 1000 > Date.now()) user = payload; } } catch { /* Invalid saved tokens are treated as signed out. */ }
  return { user, token, isLoggedIn: !!user, isAdmin: user?.role === "admin", logout };
}
