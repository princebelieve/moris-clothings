//client/src/components/Navbar.jsx
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout, isLoggedIn } from "../utils/auth";

export default function Navbar() {
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
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
  }

  return (
    <nav className="navbar">
      <Link to="/">
        <img
          src="/logo.png"
          className={`logo ${scrolled ? "hide-logo" : ""}`}
          alt="Moris Clothings"
        />
      </Link>

      <div ref={menuRef} className="nav-links">
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
