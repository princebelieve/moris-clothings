import { useCallback, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import GoogleAccountButton from "../components/GoogleAccountButton";
import { registerUser } from "../services/api";
import { setToken } from "../utils/auth";
export default function Register() {
  const navigate = useNavigate(); const [params] = useSearchParams();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  const returnTo = params.get("returnTo") === "/checkout" ? "/checkout" : "/collection";
  const onAuthenticated = useCallback(data => { setToken(data.token); navigate(data.role === "admin" ? "/admin" : returnTo); }, [navigate, returnTo]);
  const onError = useCallback(message => setError(message), []);
  async function submit(e) { e.preventDefault(); if (form.password !== form.confirmPassword) { setError("Your passwords do not match."); return; } setBusy(true); setError(""); setNotice(""); try { const data = await registerUser({ name: form.name, email: form.email, password: form.password }); if (!data.message || data.token) throw new Error(data.message || "Unable to create account."); setNotice(data.message); setForm(current => ({ ...current, password: "", confirmPassword: "" })); } catch (err) { setError(err.message); } finally { setBusy(false); } }
  return <><Navbar /><main className="shop-shell"><form className="form account-form" onSubmit={submit}><h1>Make yourself at home.</h1><p>Create your Moris account. You can also shop as a guest.</p><label>Your name<input required maxLength={120} autoComplete="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label><label>Email address<input required type="email" autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label><label>Password<input required type="password" minLength={8} maxLength={72} autoComplete="new-password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></label><label>Confirm password<input required type="password" minLength={8} maxLength={72} autoComplete="new-password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} /></label><small>Use at least 8 characters.</small>{error && <p role="alert" className="shop-error">{error}</p>}{notice && <p role="status" className="success-message">{notice}</p>}<button className="shop-button" disabled={busy}>{busy ? "Creating account..." : "Create account"}</button><p>Already a member? <Link className="inline-link" to={`/login${returnTo === "/checkout" ? "?returnTo=/checkout" : ""}`}>Sign in</Link></p><GoogleAccountButton mode="signup" onAuthenticated={onAuthenticated} onError={onError} onBusy={setBusy} /></form></main></>;
}
