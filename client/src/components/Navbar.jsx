//client/src/components/Navbar.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout, isLoggedIn } from "../utils/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
    setOpen(false);
  }

  function closeMenu() {
    setOpen(false);
  }

  return (
    <nav className="navbar">
      <Link to="/" onClick={closeMenu}>
        <img src="/logo.png" className="logo" alt="Moris Clothings" />
      </Link>

      {/* HAMBURGER BUTTON */}
      <button className="hamburger" onClick={() => setOpen(!open)}>
        ☰
      </button>

      {/* NAV LINKS */}
      <div className={`nav-links ${open ? "active" : ""}`}>
        <Link to="/" onClick={closeMenu}>
          Home
        </Link>
        <Link to="/collection" onClick={closeMenu}>
          Collection
        </Link>
        <Link to="/about" onClick={closeMenu}>
          About
        </Link>
        <Link to="/contact" onClick={closeMenu}>
          Contact
        </Link>

        {isLoggedIn() && (
          <Link to="/admin/products" onClick={closeMenu}>
            Admin
          </Link>
        )}

        {!isLoggedIn() ? (
          <>
            <Link to="/login" onClick={closeMenu}>
              Login
            </Link>
            <Link to="/register" onClick={closeMenu}>
              Register
            </Link>
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
