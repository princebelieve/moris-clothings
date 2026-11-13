import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import AdminNav from "../components/AdminNav";
import { getToken } from "../utils/auth";
import { useStore } from "../context/StoreContext";
import { API_BASE } from "../services/apiBase";
import { readApiJson } from "../services/apiResponse";
const API = API_BASE;
export default function AdminSettings() {
  const { updateStoreSettings } = useStore();
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); setError("");
    fetch(`${API}/api/settings`, { signal: controller.signal }).then(async res => { const data = await readApiJson(res, "Unable to load store settings. Please try again shortly."); if (!res.ok) throw new Error(data.message || "Unable to load store settings."); setSettings(data); }).catch(err => { if (err.name !== "AbortError") setError(err.message); });
    return () => controller.abort();
  }, [refresh]);
  function updateZone(index, key, value) { setSettings(s => ({ ...s, shippingZones: s.shippingZones.map((z, i) => i === index ? { ...z, [key]: value } : z) })); }
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try { const payload = { shippingZones: settings.shippingZones.map(z => ({ ...z, countries: (typeof z.countries === "string" ? z.countries.split(",") : z.countries).map(c => c.trim().toUpperCase()).filter(Boolean), fee: Number(z.fee) })), checkoutPaused: Boolean(settings.checkoutPaused), announcement: settings.announcement || "" }; const res = await fetch(`${API}/api/settings`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(payload) }); const result = await readApiJson(res, "Unable to save settings. Please try again shortly."); if (!res.ok) throw new Error(result.message || "Unable to save settings."); setSettings(result); updateStoreSettings(result); setNotice("Store settings saved. New checkouts will use these delivery fees."); } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <><Navbar /><main className="shop-shell admin-page"><p className="eyebrow">MORIS STORE MANAGER</p><h1>Delivery &amp; store settings</h1><AdminNav />{error && <p role="alert" className="shop-error">{error}</p>}{!settings ? <><p>Loading store settings?</p>{error && <button onClick={() => setRefresh(r => r + 1)}>Retry</button>}</> : <form className="settings-form" onSubmit={save}><h2>Shipping zones</h2><p>Set the countries you deliver to and the flat delivery fee for each group. Checkout is unavailable until at least one zone is configured.</p>{settings.shippingZones.map((z, i) => <fieldset className="shipping-zone" key={i}><legend>Zone {i + 1}</legend><label>Zone name<input required maxLength={80} value={z.name} onChange={e => updateZone(i, "name", e.target.value)} /></label><label>Country codes, separated by commas<input required placeholder="GB, IE" value={Array.isArray(z.countries) ? z.countries.join(", ") : z.countries} onChange={e => updateZone(i, "countries", e.target.value)} /></label><label>Delivery fee (GBP)<input required type="number" min="0" max="10000" step="0.01" value={z.fee} onChange={e => updateZone(i, "fee", e.target.value)} /></label><button className="text-button" type="button" onClick={() => setSettings(s => ({ ...s, shippingZones: s.shippingZones.filter((_, n) => n !== i) }))}>Remove zone</button></fieldset>)}<button type="button" className="shop-button outline" onClick={() => setSettings(s => ({ ...s, shippingZones: [...s.shippingZones, { name: "", countries: [], fee: 0 }] }))}>Add shipping zone</button><h2>Store availability</h2><label className="check-label"><input type="checkbox" checked={Boolean(settings.checkoutPaused)} onChange={e => setSettings(s => ({ ...s, checkoutPaused: e.target.checked }))} /> Pause checkout</label><label>Store announcement<input maxLength={200} value={settings.announcement || ""} placeholder="Optional message for shoppers" onChange={e => setSettings(s => ({ ...s, announcement: e.target.value }))} /></label><p role="status">{notice}</p><button className="shop-button" disabled={busy}>{busy ? "Saving..." : "Save store settings"}</button></form>}</main></>;
}
