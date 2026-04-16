//client/src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { loginUser } from "../services/api";
import { setToken } from "../utils/auth";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await loginUser(form);

    if (res.token) {
      setToken(res.token);
      navigate("/admin/products");
    } else {
      alert(res.message || "Login failed");
    }
  }

  return (
    <>
      <Navbar />

      <div style={{ maxWidth: 420, margin: "40px auto", padding: 24 }}>
        <h1>Login</h1>
        <p>Welcome back. Sign in to manage your products.</p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              style={{ width: "100%", paddingRight: 40 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            style={{
              padding: "10px 16px",
              backgroundColor: "#000",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            Sign In
          </button>
        </form>

        <p style={{ marginTop: 16, fontSize: 14 }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#0066cc" }}>
            Register here
          </Link>
        </p>
      </div>
    </>
  );
}
