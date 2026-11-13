//client/src/components/RequireAdmin.jsx
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function RequireAdmin({ children }) {
  const { isLoggedIn, isAdmin } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login?returnTo=%2Fadmin" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/account" replace />;
  }

  return children;
}
