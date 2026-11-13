import { useEffect } from "react";
import { useLocation } from "react-router-dom";
const origin = "https://morisclothing.co.uk";
export default function PageMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const labels = { "/": "Moris Clothing", "/collection": "Shop the Collection", "/cart": "Your Shopping Bag", "/checkout": "Secure Checkout", "/about": "Our Story", "/contact": "Contact & Bespoke Orders", "/login": "Sign In", "/register": "Create an Account", "/wishlist": "Your Wishlist", "/compare": "Compare Pieces", "/blog": "The Moris Journal", "/faq": "Frequently Asked Questions", "/terms": "Terms of Service", "/privacy": "Privacy Notice", "/shipping": "Shipping Information", "/returns-refunds": "Returns and Refunds", "/disclaimer": "Product Information" };
    document.title = pathname === "/" ? "Moris Clothing" : `${labels[pathname] || (pathname.startsWith("/admin") ? "Store Manager" : "Moris Collection")} | Moris Clothing`;
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", origin + pathname);
    document.querySelector('meta[property="og:url"]')?.setAttribute("content", origin + pathname);
    const robots = document.querySelector('meta[name="robots"]');
    robots?.setAttribute("content", ["/admin", "/checkout", "/cart", "/success", "/cancel", "/login", "/register", "/account", "/sign-in", "/sign-up", "/reset-password", "/forgot-password", "/wishlist", "/compare"].some(p => pathname.startsWith(p)) ? "noindex, nofollow" : "index, follow");
  }, [pathname]);
  return null;
}
