import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Navbar from "../components/Navbar";
import { loginUser } from "../services/api";
import { setToken } from "../utils/auth";
export default function Login() {
  const navigate = useNavigate(); const [params] = useSearchParams();
  const [show, setShow] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });
  const returnTo = params.get("returnTo") === "/checkout" ? "/checkout" : "";
  async function submit(e) { e.preventDefault(); setBusy(true); setError(""); try { const data = await loginUser(form); if (!data.token) throw new Error(data.message || "Unable to sign in."); setToken(data.token); navigate(returnTo || (data.role === "admin" ? "/admin/products" : "/collection")); } catch (err) { setError(err.message); } finally { setBusy(false); } }
  return <><Navbar /><main className="shop-shell"><form className="form account-form" onSubmit={submit}><h1>Welcome back.</h1><p>Sign in to your Moris account.</p><label>Email address<input required type="email" autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label><label>Password<div className="password-field"><input required type={show ? "text" : "password"} autoComplete="current-password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /><button type="button" className="password-toggle" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(s => !s)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>{error && <p role="alert" className="shop-error">{error}</p>}<button className="shop-button" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button><p>New here? <Link className="inline-link" to={`/register${returnTo ? "?returnTo=/checkout" : ""}`}>Create an account</Link></p>{returnTo && <Link className="inline-link" to="/checkout">Continue as a guest</Link>}</form></main></>;
}
