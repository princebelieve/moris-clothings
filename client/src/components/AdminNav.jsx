import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, BookOpen, Truck, PanelsTopLeft } from "lucide-react";
const links = [["/admin", "Overview", LayoutDashboard, true], ["/admin/products", "Products", Package], ["/admin/orders", "Orders", ShoppingBag], ["/admin/blog", "Journal", BookOpen], ["/admin/settings", "Shipping & store", Truck], ["/admin/site", "Website setup", PanelsTopLeft]];
export default function AdminNav() { return <nav className="admin-tabs" aria-label="Store administration">{links.map(([to, label, Icon, end]) => <NavLink key={to} to={to} end={end}><Icon size={17} aria-hidden="true" /><span>{label}</span></NavLink>)}</nav>; }
