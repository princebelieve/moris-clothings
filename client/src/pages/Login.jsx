import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Navbar from "../components/Navbar";
import GoogleAccountButton from "../components/GoogleAccountButton";
import { loginUser, verifyEmail } from "../services/api";
import { setToken } from "../utils/auth";
export default function Login() {
  const navigate = useNavigate(); const [params] = useSearchParams();
  const [show, setShow] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [notice, setNotice] = useState(params.get("passwordReset") === "1" ? "Password updated. You can now sign in." : "");
  const [form, setForm] = useState({ email: "", password: "" });
  const returnTo = params.get("returnTo") === "/checkout" ? "/checkout" : "";
  useEffect(() => { const token = params.get("verify"); if (!token) return; let active = true; verifyEmail(token).then(data => { if (!active) return; if (data.message && !data.message.includes("invalid")) setNotice(data.message); else setError(data.message || "The confirmation link is invalid or expired."); }).catch(err => { if (active) setError(err.message); }); return () => { active = false; }; }, [params]);
  const onAuthenticated = useCallback(data => { setToken(data.token); navigate(returnTo || (data.role === "admin" ? "/admin" : "/collection")); }, [navigate, returnTo]);
  const onError = useCallback(message => setError(message), []);
  async function submit(e) { e.preventDefault(); setBusy(true); setError(""); try { const data = await loginUser(form); if (!data.token) throw new Error(data.message || "Unable to sign in."); onAuthenticated(data); } catch (err) { setError(err.message); } finally { setBusy(false); } }
  return <><Navbar /><main className="shop-shell"><form className="form account-form" onSubmit={submit}><h1>Welcome back.</h1><p>Sign in to your Moris account.</p>{notice && <p role="status" className="success-message">{notice}</p>}<label>Email address<input required type="email" autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label><label>Password<div className="password-field"><input required type={show ? "text" : "password"} autoComplete="current-password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /><button type="button" className="password-toggle" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(s => !s)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label><Link className="inline-link" to="/forgot-password">Forgot password?</Link>{error && <p role="alert" className="shop-error">{error}</p>}<button className="shop-button" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button><p>New here? <Link className="inline-link" to={`/register${returnTo ? "?returnTo=/checkout" : ""}`}>Create an account</Link></p>{returnTo && <Link className="inline-link" to="/checkout">Continue as a guest</Link>}<GoogleAccountButton mode="signin" onAuthenticated={onAuthenticated} onError={onError} onBusy={setBusy} /></form></main></>;
}
