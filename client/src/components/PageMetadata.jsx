import { useEffect } from "react";
import { useLocation } from "react-router-dom";
const origin = "https://morisclothing.co.uk";
export default function PageMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const labels = { "/": "Premium Fashion & Bespoke Tailoring", "/collection": "Shop the Collection", "/cart": "Your Shopping Bag", "/checkout": "Secure Checkout", "/about": "Our Story", "/contact": "Contact & Bespoke Orders", "/login": "Sign In", "/register": "Create an Account" };
    document.title = `${labels[pathname] || (pathname.startsWith("/admin") ? "Store Manager" : "Moris Collection")} | Moris Clothing`;
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", origin + pathname);
    document.querySelector('meta[property="og:url"]')?.setAttribute("content", origin + pathname);
    const robots = document.querySelector('meta[name="robots"]');
    robots?.setAttribute("content", ["/admin", "/checkout", "/cart", "/success", "/cancel", "/login", "/register", "/reset-password", "/forgot-password"].some(p => pathname.startsWith(p)) ? "noindex, nofollow" : "index, follow");
  }, [pathname]);
  return null;
}
