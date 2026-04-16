//client/src/pages/ForgotPassword.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { forgotPassword } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await forgotPassword(email);

    if (res.message) {
      setSent(true);
    } else {
      alert("Something went wrong");
    }
  }

  return (
    <>
      <Navbar />

      <div style={{ maxWidth: 420, margin: "40px auto", padding: 24 }}>
        <h1>Forgot Password</h1>
        <p>Enter your email and we will send you a reset link.</p>

        {!sent ? (
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button type="submit">Send Reset Link</button>
          </form>
        ) : (
          <p>
            If that email exists, a password reset link has been sent.
          </p>
        )}

        <div style={{ marginTop: 20 }}>
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </>
  );
}