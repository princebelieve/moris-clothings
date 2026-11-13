import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { forgotPassword } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) { event.preventDefault(); setBusy(true); setError(""); try { await forgotPassword(email); setSent(true); } catch (err) { setError(err.message); } finally { setBusy(false); } }
  return <><Navbar /><main className="shop-shell"><form className="form account-form" onSubmit={submit}><h1>Reset your password</h1><p>Enter the email address on your account.</p>{sent ? <p role="status" className="success-message">If an account exists, a password reset link has been sent.</p> : <><label>Email address<input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} /></label>{error && <p role="alert" className="shop-error">{error}</p>}<button className="shop-button" disabled={busy}>{busy ? "Sending..." : "Send reset link"}</button></>}<p><Link className="inline-link" to="/login">Back to sign in</Link></p></form></main><Footer /></>;
}
