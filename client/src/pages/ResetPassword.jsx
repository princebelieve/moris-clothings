//client/src/pages/ResetPassword.jsx
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/api";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [params] = useSearchParams();
  const nav = useNavigate();

  const token = params.get("token");

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await resetPassword(token, password);

    alert(res.message || "Password reset successful");

    nav("/login");
  }

  return (
    <div className="page">
      <h2>Reset Password</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button>Reset Password</button>
      </form>
    </div>
  );
}
