import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import AdminNav from "../components/AdminNav";
import { getToken } from "../utils/auth";
import { useStore } from "../context/StoreContext";
import { API_BASE } from "../services/apiBase";
import { readApiJson } from "../services/apiResponse";

const API = API_BASE;
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
const excludedRegions = new Set(["EU", "EZ", "UN", "QO", "XA", "XB"]);
const countries = Array.from({ length: 26 * 26 }, (_, i) => String.fromCharCode(65 + Math.floor(i / 26), 65 + i % 26))
  .map(code => ({ code, name: regionNames.of(code) }))
  .filter(({ code, name }) => name && name !== code && name !== "Unknown Region" && !excludedRegions.has(code))
  .sort((a, b) => a.name.localeCompare(b.name));
const blankZone = () => ({ name: "", countries: [], fee: "" });

export default function AdminSettings() {
  const { updateStoreSettings } = useStore();
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [zoneDraft, setZoneDraft] = useState(null);
  const [editingZone, setEditingZone] = useState(null);
  const [countrySearch, setCountrySearch] = useState("");
  useEffect(() => {
    const controller = new AbortController(); setError("");
    fetch(`${API}/api/settings`, { signal: controller.signal }).then(async res => { const data = await readApiJson(res, "Unable to load store settings. Please try again shortly."); if (!res.ok) throw new Error(data.message || "Unable to load store settings."); setSettings(data); }).catch(err => { if (err.name !== "AbortError") setError(err.message); });
    return () => controller.abort();
  }, [refresh]);

  const availableCountries = useMemo(() => countries.filter(c => !zoneDraft?.countries.includes(c.code) && !(settings?.shippingZones || []).some((z, i) => i !== editingZone && z.countries.includes(c.code)) && c.name.toLowerCase().includes(countrySearch.toLowerCase())), [settings, zoneDraft, editingZone, countrySearch]);
  function updateZone(key, value) { setZoneDraft(d => ({ ...d, [key]: value })); }
  function closeEditor() { setZoneDraft(null); setEditingZone(null); setCountrySearch(""); }
  function editZone(index) { setEditingZone(index); setZoneDraft({ ...settings.shippingZones[index], countries: [...settings.shippingZones[index].countries] }); }
  function saveZoneDraft() {
    if (!zoneDraft?.name.trim() || !zoneDraft.countries.length || !Number.isFinite(Number(zoneDraft.fee)) || Number(zoneDraft.fee) < 0) return;
    const zone = { ...zoneDraft, name: zoneDraft.name.trim(), fee: Number(zoneDraft.fee) };
    setSettings(s => ({ ...s, shippingZones: editingZone === null ? [...s.shippingZones, zone] : s.shippingZones.map((z, i) => i === editingZone ? zone : z) })); closeEditor();
  }
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try { const payload = { shippingZones: settings.shippingZones.map(z => ({ ...z, countries: z.countries.map(c => c.trim().toUpperCase()).filter(Boolean), fee: Number(z.fee) })), checkoutPaused: Boolean(settings.checkoutPaused), announcement: settings.announcement || "" }; const res = await fetch(`${API}/api/settings`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(payload) }); const result = await readApiJson(res, "Unable to save settings. Please try again shortly."); if (!res.ok) throw new Error(result.message || "Unable to save settings."); setSettings(result); updateStoreSettings(result); setNotice("Saved. New checkouts will use these delivery zones and fees."); } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  const countryName = code => countries.find(c => c.code === code)?.name || code;
  return <><Navbar /><main className="shop-shell admin-page"><p className="eyebrow">MORIS STORE MANAGER</p><h1>Delivery &amp; store settings</h1><p className="admin-page-intro">Set where you deliver and what customers pay at checkout. Then manage whether the shop is accepting new orders and what message shoppers see.</p><AdminNav />{error && <p role="alert" className="shop-error">{error}</p>}{!settings ? <div className="admin-loading"><p>Loading your store settings…</p>{error && <button className="shop-button outline" onClick={() => setRefresh(r => r + 1)}>Try again</button>}</div> : <form className="settings-form admin-settings-form" onSubmit={save}>
    <section className="admin-settings-section"><header><p className="eyebrow">DELIVERY RULES</p><h2>Shipping zones</h2><p>Create a zone for each delivery price. Customers choose their country at checkout and see the matching fee before payment.</p></header>
      {settings.shippingZones.length ? <div className="shipping-zone-list">{settings.shippingZones.map((zone, index) => <article className="shipping-zone-card" key={`${zone.name}-${index}`}><div><h3>{zone.name || `Zone ${index + 1}`}</h3><p>{zone.countries.map(countryName).join(", ") || "No destinations added"}</p></div><strong>{new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(zone.fee) || 0)}</strong><div className="shipping-zone-actions"><button type="button" onClick={() => editZone(index)}>Edit zone</button><button type="button" onClick={() => setSettings(s => ({ ...s, shippingZones: s.shippingZones.filter((_, i) => i !== index) }))}>Remove</button></div></article>)}</div> : <div className="shipping-empty"><strong>No delivery zones yet</strong><p>Add at least one zone before customers can complete checkout.</p></div>}
      {zoneDraft ? <div className="shipping-zone-editor"><div className="shipping-zone-editor-heading"><p className="eyebrow">{editingZone === null ? "NEW DELIVERY ZONE" : "EDIT DELIVERY ZONE"}</p><h3>Where will this fee apply?</h3><p>Give the group a name customers understand, add its destinations, and set one delivery price.</p></div><label>Zone name<input value={zoneDraft.name} onChange={e => updateZone("name", e.target.value)} placeholder="e.g. United Kingdom" maxLength={80} required /></label><label>Delivery fee (GBP)<input type="number" min="0" max="10000" step="0.01" value={zoneDraft.fee} onChange={e => updateZone("fee", e.target.value)} placeholder="0.00" required /></label><div className="shipping-country-picker"><label htmlFor="country-search">Add a destination</label><input id="country-search" type="search" value={countrySearch} onChange={e => { setCountrySearch(e.target.value); }} placeholder="Search for a country" />{countrySearch && <div className="shipping-country-results">{availableCountries.slice(0, 8).map(c => <button type="button" key={c.code} onClick={() => { updateZone("countries", [...zoneDraft.countries, c.code]); setCountrySearch(""); }}>{c.name} <span>{c.code}</span></button>)}{!availableCountries.length && <p>No matching destinations available.</p>}</div>}</div><div className="shipping-country-tags">{zoneDraft.countries.map(code => <span key={code}>{countryName(code)}<button type="button" aria-label={`Remove ${countryName(code)}`} onClick={() => updateZone("countries", zoneDraft.countries.filter(c => c !== code))}>×</button></span>)}</div><div className="shipping-zone-actions"><button type="button" disabled={!zoneDraft.name.trim() || !zoneDraft.countries.length || !Number.isFinite(Number(zoneDraft.fee)) || Number(zoneDraft.fee) < 0} onClick={saveZoneDraft}>Save zone</button><button type="button" onClick={closeEditor}>Cancel</button></div></div> : <button type="button" className="shop-button outline" onClick={() => { setEditingZone(null); setZoneDraft(blankZone()); }}>Add a shipping zone</button>}
    </section>
    <section className="admin-settings-section"><header><p className="eyebrow">SHOP STATUS</p><h2>Store availability</h2><p>Use these controls when you need to pause orders or share a short notice with customers.</p></header><label className="check-label"><input type="checkbox" checked={Boolean(settings.checkoutPaused)} onChange={e => setSettings(s => ({ ...s, checkoutPaused: e.target.checked }))} /> Pause checkout <small>Customers can browse, but cannot place new orders.</small></label><label>Store announcement <small>Optional. Keep it short; it appears to shoppers across the site.</small><input maxLength={200} value={settings.announcement || ""} placeholder="e.g. Orders placed this week ship from Monday." onChange={e => setSettings(s => ({ ...s, announcement: e.target.value }))} /></label></section>
    <div className="admin-settings-save"><p role="status">{notice || "Remember to save your changes before leaving this page."}</p><button className="shop-button" disabled={busy || Boolean(zoneDraft) || settings.shippingZones.length === 0}>{busy ? "Saving settings…" : "Save delivery & store settings"}</button></div>
  </form>}</main></>;
}
