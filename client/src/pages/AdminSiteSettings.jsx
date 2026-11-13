import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdminNav from "../components/AdminNav";
import { useStore } from "../context/StoreContext";
import { getToken } from "../utils/auth";
import { API_BASE } from "../services/apiBase";
import { readApiJson } from "../services/apiResponse";

const API = API_BASE;
const defaults = { maintenance: false, blockSignIn: false, blockSignUp: false, blockCheckout: false, title: "We’ll be back soon", message: "We’re making a few improvements. Please check back shortly.", launchDate: "", banner: "", font: "system", theme: "classic", colors: { accent: "#bd963f", header: "#172c48", footer: "#102034", body: "#faf9f6", card: "#ffffff", text: "#26364a", metal: "#c9a24a" } };
const palettes = {
  moris: { label: "Moris navy and gold", colors: defaults.colors },
  midnight: { label: "Midnight and champagne", colors: { accent: "#c5a46d", header: "#101923", footer: "#080e14", body: "#f5f3ee", card: "#ffffff", text: "#1c2732", metal: "#d4b87a" } },
  warm: { label: "Warm stone and bronze", colors: { accent: "#9b7046", header: "#45382f", footer: "#2d251f", body: "#f6f1e9", card: "#fffdf9", text: "#342d27", metal: "#b88b51" } },
  monochrome: { label: "Black and ivory", colors: { accent: "#756a58", header: "#202020", footer: "#111111", body: "#f7f6f2", card: "#ffffff", text: "#282828", metal: "#b7a887" } },
};
const colorLabels = { accent: "Buttons and highlights", header: "Header and primary buttons", footer: "Footer background", body: "Page background", card: "Cards and panels", text: "Main text", metal: "Metallic gold details" };
const fonts = { system: "system-ui, sans-serif", arial: "Arial, sans-serif", trebuchet: "'Trebuchet MS', sans-serif", georgia: "Georgia, serif" };

export default function AdminSiteSettings() {
  const { updateStoreSettings } = useStore();
  const [site, setSite] = useState(defaults);
  const [banner, setBanner] = useState(null);
  const [removeBanner, setRemoveBanner] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API}/api/settings`, { signal: controller.signal }).then(async response => {
      const data = await readApiJson(response, "Unable to load site settings. Please try again shortly.");
      if (!response.ok) throw new Error(data.message || "Unable to load site settings.");
      setSite(current => ({ ...current, ...(data.site || {}), colors: { ...current.colors, ...(data.site?.colors || {}) } }));
    }).catch(err => { if (err.name !== "AbortError") setError(err.message); });
    return () => controller.abort();
  }, []);
  const selectedPalette = useMemo(() => Object.entries(palettes).find(([, preset]) => Object.keys(defaults.colors).every(key => (site.colors?.[key] || defaults.colors[key]).toLowerCase() === preset.colors[key].toLowerCase()))?.[0] || "custom", [site.colors]);
  function update(key, value) { setSite(current => ({ ...current, [key]: value })); }
  function applyPalette(name) { if (palettes[name]) setSite(current => ({ ...current, colors: { ...palettes[name].colors } })); }
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    const body = new FormData();
    for (const key of ["maintenance", "blockSignIn", "blockSignUp", "blockCheckout", "title", "message", "launchDate", "font", "theme"]) body.append(key, String(site[key] ?? ""));
    body.append("colors", JSON.stringify(site.colors));
    if (banner) body.append("banner", banner);
    if (removeBanner) body.append("removeBanner", "true");
    try {
      const response = await fetch(`${API}/api/settings/site`, { method: "PUT", headers: { Authorization: `Bearer ${getToken()}` }, body });
      const data = await readApiJson(response, "Unable to save site settings. Please try again shortly.");
      if (!response.ok) throw new Error(data.message || "Unable to save site settings.");
      setSite(current => ({ ...current, ...data, colors: { ...current.colors, ...(data.colors || {}) } }));
      updateStoreSettings({ site: data }); setBanner(null); setRemoveBanner(false); setNotice("Site setup saved and applied.");
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <><Navbar /><main className="shop-shell admin-page"><p className="eyebrow">MORIS STORE MANAGER</p><h1>Site setup</h1><AdminNav />
    <form className="settings-form site-setup-form" onSubmit={save}>
      {error && <p role="alert" className="shop-error">{error}</p>}<p role="status">{notice}</p>
      <p className="site-setup-intro">Choose a ready-made look from the menus, adjust individual colours if you wish, and preview the result before saving. These controls change the storefront; product and delivery details are managed in their own tabs.</p>
      <section className="site-setup-section"><span className="eyebrow">01 / STORE ACCESS</span><h2>When customers can shop</h2><p>Turn on a pause only when you need to temporarily stop access or checkout. Admin pages stay available.</p>
        {[ ["maintenance", "Show a maintenance page to visitors"], ["blockSignIn", "Pause customer sign-in"], ["blockSignUp", "Pause new account registration"], ["blockCheckout", "Pause checkout"] ].map(([key, label]) => <label className="check-label site-setting-toggle" key={key}><input type="checkbox" checked={Boolean(site[key])} onChange={event => update(key, event.target.checked)} />{label}</label>)}
      </section>
      <section className="site-setup-section"><span className="eyebrow">02 / MAINTENANCE MESSAGE</span><h2>What visitors see during a pause</h2><p>These details are used only when the maintenance switch above is on.</p>
        <label>Headline<input maxLength={120} value={site.title || ""} onChange={event => update("title", event.target.value)} /></label>
        <label>Message<textarea maxLength={500} rows={4} value={site.message || ""} onChange={event => update("message", event.target.value)} /><small>Keep visitors informed about what is happening and how to contact Moris.</small></label>
        <label>Expected return<input maxLength={100} placeholder="For example, 20 November 2026" value={site.launchDate || ""} onChange={event => update("launchDate", event.target.value)} /></label>
        <label>Maintenance banner image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { setBanner(event.target.files?.[0] || null); setRemoveBanner(false); }} /><small>Optional image shown above the maintenance message.</small></label>
        {site.banner && !removeBanner && <div className="site-banner-preview"><img src={site.banner} alt="Current maintenance banner" /><button className="text-button" type="button" onClick={() => { setRemoveBanner(true); update("banner", ""); }}>Remove banner</button></div>}
      </section>
      <section className="site-setup-section"><span className="eyebrow">03 / BRAND COLOURS</span><h2>Choose Moris colours</h2><p>Start with a palette from the dropdown, then use the colour controls to fine-tune any part. Metallic details keep their gradient finish.</p>
        <label>Colour palette<select value={selectedPalette} onChange={event => applyPalette(event.target.value)}><option value="custom">Custom colours</option>{Object.entries(palettes).map(([key, preset]) => <option key={key} value={key}>{preset.label}</option>)}</select><small>Choosing a palette updates all colour controls and the preview below.</small></label>
        <div className="site-colour-grid">{Object.entries(colorLabels).map(([key, label]) => <label key={key}><span>{label}</span><input aria-label={label} type="color" value={site.colors?.[key] || defaults.colors[key]} onChange={event => setSite(current => ({ ...current, colors: { ...current.colors, [key]: event.target.value } }))} /></label>)}</div>
      </section>
      <section className="site-setup-section"><span className="eyebrow">04 / TYPE AND FINISH</span><h2>Choose the storefront style</h2><p>Select from the dropdowns and check the preview. These options affect type and surface shape, not your chosen colours.</p>
        <div className="site-select-row"><label>Site font<select value={site.font || "system"} onChange={event => update("font", event.target.value)}><option value="system">System sans-serif</option><option value="arial">Arial</option><option value="trebuchet">Trebuchet</option><option value="georgia">Georgia</option></select></label><label>Visual theme<select value={site.theme || "classic"} onChange={event => update("theme", event.target.value)}><option value="classic">Classic</option><option value="soft">Soft corners</option><option value="editorial">Editorial</option></select></label></div>
        <div className={`site-style-preview site-theme-${site.theme || "classic"}`} style={{ fontFamily: fonts[site.font] || fonts.system, backgroundColor: site.colors?.body || defaults.colors.body, color: site.colors?.text || defaults.colors.text, borderColor: site.colors?.accent || defaults.colors.accent, "--preview-card": site.colors?.card || defaults.colors.card, "--preview-header": site.colors?.header || defaults.colors.header, "--preview-footer": site.colors?.footer || defaults.colors.footer, "--preview-accent": site.colors?.accent || defaults.colors.accent, "--preview-metal": site.colors?.metal || defaults.colors.metal }}><span>MORIS CLOTHING / STOREFRONT PREVIEW</span><strong>Made to fit. Made to be you.</strong><p>This preview shows your selected colours, typeface and visual theme.</p><button type="button">SHOP THE COLLECTION</button><div className="site-preview-swatches"><span style={{ background: "var(--preview-header)", color: "#fff" }}>Header</span><span style={{ background: "var(--preview-card)", color: site.colors?.text || defaults.colors.text }}>Product card</span><span style={{ background: "var(--preview-footer)", color: "#fff" }}>Footer</span><span className="site-preview-metal">Metallic detail</span></div><small>Save to apply these choices across the storefront.</small></div>
      </section>
      <div className="site-setup-save"><p role="status">{notice}</p><button className="shop-button" disabled={busy}>{busy ? "Saving setup..." : "Save and apply site setup"}</button></div>
    </form>
  </main><Footer /></>;
}
