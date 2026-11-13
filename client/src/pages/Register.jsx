import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { registerUser } from "../services/api";
import { setToken } from "../utils/auth";
export default function Register() {
  const navigate = useNavigate(); const [params] = useSearchParams();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const returnTo = params.get("returnTo") === "/checkout" ? "/checkout" : "/collection";
  async function submit(e) { e.preventDefault(); setBusy(true); setError(""); try { const data = await registerUser(form); if (!data.token) throw new Error(data.message || "Unable to create account."); setToken(data.token); navigate(returnTo); } catch (err) { setError(err.message); } finally { setBusy(false); } }
  return <><Navbar /><main className="shop-shell"><form className="form account-form" onSubmit={submit}><h1>Make yourself at home.</h1><p>Create your Moris account. You can also shop as a guest.</p><label>Your name<input required maxLength={120} autoComplete="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label><label>Email address<input required type="email" autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label><label>Password<input required type="password" minLength={8} maxLength={72} autoComplete="new-password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></label><small>Use at least 8 characters.</small>{error && <p role="alert" className="shop-error">{error}</p>}<button className="shop-button" disabled={busy}>{busy ? "Creating account..." : "Create account"}</button><p>Already a member? <Link className="inline-link" to={`/login${returnTo === "/checkout" ? "?returnTo=/checkout" : ""}`}>Sign in</Link></p></form></main></>;
}
