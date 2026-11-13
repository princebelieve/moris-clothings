const notify = () => window.dispatchEvent(new Event("moris:auth"));
export function setToken(token) { localStorage.setItem("token", token); notify(); }
export function getToken() { try { return localStorage.getItem("token"); } catch { return null; } }
export function logout() { localStorage.removeItem("token"); notify(); }
