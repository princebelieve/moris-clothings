import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdminNav from "../components/AdminNav";
import { useStore } from "../context/StoreContext";
import { getToken } from "../utils/auth";
import { API_BASE } from "../services/apiBase";
import { readApiJson } from "../services/apiResponse";

const API = API_BASE;
const defaults = { maintenance: false, blockSignIn: false, blockSignUp: false, blockCheckout: false, title: "We’ll be back soon", message: "We’re making a few improvements. Please check back shortly.", launchDate: "", banner: "", font: "system", theme: "classic", colors: { accent: "#c9a24a", header: "#1f3556", footer: "#2d4a73", body: "#f7f9fc", card: "#ffffff", text: "#1b2a41", metal: "#c9a24a" } };
const colorLabels = { accent: "Accent", header: "Header and primary buttons", footer: "Footer", body: "Page background", card: "Cards", text: "Text", metal: "Metallic accent" };

export default function AdminSiteSettings() {
  const { updateStoreSettings } = useStore();
  const [site, setSite] = useState(defaults);
  const [banner, setBanner] = useState(null);
  const [removeBanner, setRemoveBanner] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { fetch(`${API}/api/settings`).then(async response => { const data = await readApiJson(response, "Unable to load site settings. Please try again shortly."); if (!response.ok) throw new Error(data.message || "Unable to load site settings."); setSite(current => ({ ...current, ...(data.site || {}), colors: { ...current.colors, ...(data.site?.colors || {}) } })); }).catch(err => setError(err.message)); }, []);
  function update(key, value) { setSite(current => ({ ...current, [key]: value })); }
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    const body = new FormData();
    for (const key of ["maintenance", "blockSignIn", "blockSignUp", "blockCheckout", "title", "message", "launchDate", "font", "theme"]) body.append(key, String(site[key] ?? ""));
    body.append("colors", JSON.stringify(site.colors));
    if (banner) body.append("banner", banner);
    if (removeBanner) body.append("removeBanner", "true");
    try { const response = await fetch(`${API}/api/settings/site`, { method: "PUT", headers: { Authorization: `Bearer ${getToken()}` }, body }); const data = await readApiJson(response, "Unable to save site settings. Please try again shortly."); if (!response.ok) throw new Error(data.message || "Unable to save site settings."); setSite(current => ({ ...current, ...data, colors: { ...current.colors, ...(data.colors || {}) } })); updateStoreSettings({ site: data }); setBanner(null); setRemoveBanner(false); setNotice("Site setup saved."); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <><Navbar /><main className="shop-shell admin-page"><p className="eyebrow">MORIS STORE MANAGER</p><h1>Site setup</h1><AdminNav /><form className="settings-form" onSubmit={save}>{error && <p role="alert" className="shop-error">{error}</p>}<p role="status">{notice}</p><h2>Store availability</h2><p>Pause customer access while keeping admin pages available.</p>{[["maintenance", "Show a maintenance page to visitors"], ["blockSignIn", "Pause customer sign-in"], ["blockSignUp", "Pause new account registration"], ["blockCheckout", "Pause checkout"]].map(([key, label]) => <label className="check-label" key={key}><input type="checkbox" checked={Boolean(site[key])} onChange={event => update(key, event.target.checked)} /> {label}</label>)}<h2>Maintenance page</h2><label>Headline<input maxLength={120} value={site.title || ""} onChange={event => update("title", event.target.value)} /></label><label>Message<textarea maxLength={500} rows={4} value={site.message || ""} onChange={event => update("message", event.target.value)} /></label><label>Expected return<input maxLength={100} value={site.launchDate || ""} onChange={event => update("launchDate", event.target.value)} /></label><label>Banner image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { setBanner(event.target.files?.[0] || null); setRemoveBanner(false); }} /></label>{site.banner && !removeBanner && <div className="site-banner-preview"><img src={site.banner} alt="Current maintenance banner" /><button type="button" onClick={() => { setRemoveBanner(true); update("banner", ""); }}>Remove banner</button></div>}<h2>Store colors</h2><div className="site-colour-grid">{Object.entries(colorLabels).map(([key, label]) => <label key={key}>{label}<input type="color" value={site.colors?.[key] || defaults.colors[key]} onChange={event => setSite(current => ({ ...current, colors: { ...current.colors, [key]: event.target.value } }))} /></label>)}</div><h2>Typography and layout</h2><label>Font<select value={site.font || "system"} onChange={event => update("font", event.target.value)}><option value="system">System sans-serif</option><option value="arial">Arial</option><option value="trebuchet">Trebuchet</option><option value="georgia">Georgia</option></select></label><label>Theme<select value={site.theme || "classic"} onChange={event => update("theme", event.target.value)}><option value="classic">Classic</option><option value="soft">Soft corners</option><option value="editorial">Editorial</option></select></label><button className="shop-button" disabled={busy}>{busy ? "Saving..." : "Save site setup"}</button></form></main><Footer /></>;
}
