//client/src/components/Navbar.jsx
//client/src/components/Navbar.jsx
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout, isLoggedIn } from "../utils/auth";

export default function Navbar() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 50);
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
    setOpen(false);
  }

  return (
    <nav className="navbar">
      <Link to="/" onClick={() => setOpen(false)}>
        <img
          src="/logo.png"
          className={`logo ${scrolled ? "hide-logo" : ""}`}
          alt="Moris Clothings"
        />
      </Link>

      {/* HAMBURGER (RESTORED) */}
      <button className="hamburger" onClick={() => setOpen(!open)}>
        ☰
      </button>

      <div ref={menuRef} className={`nav-links ${open ? "active" : ""}`}>
        <Link to="/" onClick={() => setOpen(false)}>
          Home
        </Link>
        <Link to="/collection" onClick={() => setOpen(false)}>
          Collection
        </Link>
        <Link to="/about" onClick={() => setOpen(false)}>
          About
        </Link>
        <Link to="/contact" onClick={() => setOpen(false)}>
          Contact
        </Link>

        {isLoggedIn() && (
          <Link to="/admin/products" onClick={() => setOpen(false)}>
            Admin
          </Link>
        )}

        {!isLoggedIn() ? (
          <>
            <Link to="/login" onClick={() => setOpen(false)}>
              Login
            </Link>
            <Link to="/register" onClick={() => setOpen(false)}>
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
