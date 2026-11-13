import { NavLink } from "react-router-dom";
export default function AdminNav() { return <nav className="admin-tabs" aria-label="Store administration"><NavLink to="/admin/products">Products</NavLink><NavLink to="/admin/orders">Orders</NavLink><NavLink to="/admin/settings">Delivery &amp; store settings</NavLink></nav>; }
