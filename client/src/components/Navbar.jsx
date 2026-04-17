//client/src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { logout, isLoggedIn } from "../utils/auth";

export default function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <Link to="/">
        <img src="/logo.png" className="logo" alt="Moris Clothings" />
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/collection">Collection</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>

        {isLoggedIn() && <Link to="/admin/products">Admin</Link>}

        {!isLoggedIn() ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <button onClick={handleLogout}>Logout</button>
        )}
      </div>

      <button className="cta" onClick={() => navigate("/contact")}>
        Order Now
      </button>
    </nav>
  );
}
