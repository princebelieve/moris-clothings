import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { resetPassword } from "../services/api";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const token = params.get("token") || "";
  async function submit(event) { event.preventDefault(); setError(""); if (!token) { setError("This password reset link is missing or invalid."); return; } if (password !== confirm) { setError("Your passwords do not match."); return; } setBusy(true); try { await resetPassword(token, password); navigate("/login?passwordReset=1"); } catch (err) { setError(err.message); } finally { setBusy(false); } }
  return <><Navbar /><main className="shop-shell"><form className="form account-form" onSubmit={submit}><h1>Choose a new password</h1><p>Use at least 8 characters.</p><label>New password<input type="password" autoComplete="new-password" minLength={8} maxLength={72} required value={password} onChange={event => setPassword(event.target.value)} /></label><label>Confirm password<input type="password" autoComplete="new-password" minLength={8} maxLength={72} required value={confirm} onChange={event => setConfirm(event.target.value)} /></label>{error && <p role="alert" className="shop-error">{error}</p>}<button className="shop-button" disabled={busy || !token}>{busy ? "Updating..." : "Update password"}</button>{!token && <Link className="inline-link" to="/forgot-password">Request a new link</Link>}</form></main><Footer /></>;
}
