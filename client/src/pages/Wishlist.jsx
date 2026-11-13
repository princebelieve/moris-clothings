import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductGrid from "../components/ProductGrid";
import { useStore } from "../context/StoreContext";

export default function Wishlist() {
  const { wishlist, clearWishlist } = useStore();
  return <><Navbar /><main className="shop-shell"><p className="eyebrow">YOUR SAVED PIECES</p><h1>Wishlist</h1>{wishlist.length ? <><p>{wishlist.length} saved {wishlist.length === 1 ? "piece" : "pieces"}</p><ProductGrid products={wishlist} /><button className="text-button" onClick={clearWishlist}>Clear wishlist</button></> : <div className="empty-state"><h2>Your wishlist is waiting.</h2><p>Save pieces you love and come back to them later.</p></div>}</main><Footer /></>;
}
