import { openCart } from "./CartDrawer";
import useCart from "../hooks/useCart";
//client/src/components/Navbar.jsx
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Menu, Scale, X } from "lucide-react";
import useAuth from "../hooks/useAuth";
import useClickOutside from "../hooks/useClickOutside";
import { useStore } from "../context/StoreContext";

export default function Navbar() {
  const { count } = useCart();
  const { wishlist, compare } = useStore();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isLoggedIn, isAdmin, logout } = useAuth();

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useClickOutside({ current: [menuRef.current, buttonRef.current] }, () =>
    setOpen(false),
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function handleLogout() {
    logout();
    navigate("/login");
    setOpen(false);
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={() => setOpen(false)}>
        <img
          src="/logo.png"
          alt="Moris Clothing"
          className={`logo ${scrolled ? "hide-logo" : ""}`}
        />
        <span className="brand-name">Moris Clothing</span>
      </Link>

      <div className="desktop-nav">
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/collection">Collection</Link>
          <Link to="/blog">Journal</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>

          {isAdmin && <Link to="/admin">Dashboard</Link>}

          {!isLoggedIn ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : (
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>

        <button
          type="button"
          className="cta"
          onClick={() => navigate("/collection")}
        >
          Shop now
        </button>
      </div>

      <div className="nav-shopping-tools">
        <Link className="saved-link" to="/wishlist" aria-label={`Wishlist, ${wishlist.length} saved items`}><Heart size={18} /><span>{wishlist.length}</span></Link>
        <Link className="saved-link" to="/compare" aria-label={`Compare, ${compare.length} products`}><Scale size={18} /><span>{compare.length}</span></Link>
        <button className="bag-link" onClick={openCart} aria-label={`Shopping bag, ${count} items`}>Bag <span>{count}</span></button>
      </div>
      <button
        ref={buttonRef}
        type="button"
        className="hamburger"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        aria-expanded={open}
        aria-controls="mobile-navigation"
      >
        {open ? <X size={30} /> : <Menu size={30} />}
      </button>

      <div
        ref={menuRef}
        id="mobile-navigation"
        className={`mobile-menu-overlay ${open ? "active" : ""}`}
      >
        <div className="mobile-menu-links">
          <Link to="/" onClick={() => setOpen(false)}>
            Home
          </Link>

          <Link to="/collection" onClick={() => setOpen(false)}>
            Collection
          </Link>
          <Link to="/wishlist" onClick={() => setOpen(false)}>Wishlist ({wishlist.length})</Link>
          <Link to="/compare" onClick={() => setOpen(false)}>Compare ({compare.length})</Link>
          <Link to="/blog" onClick={() => setOpen(false)}>Journal</Link>

          <Link to="/about" onClick={() => setOpen(false)}>
            About
          </Link>

          <Link to="/contact" onClick={() => setOpen(false)}>
            Contact
          </Link>
          {isAdmin && (
            <Link to="/admin" onClick={() => setOpen(false)}>
              Dashboard
            </Link>
          )}

          {!isLoggedIn ? (
            <>
              <Link to="/login" onClick={() => setOpen(false)}>
                Login
              </Link>

              <Link to="/register" onClick={() => setOpen(false)}>
                Register
              </Link>
            </>
          ) : (
            <button
              type="button"
              className="mobile-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
