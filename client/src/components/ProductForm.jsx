import { useState } from "react";

const baseCategories = ["Ready to wear", "Senator Wear", "Traditional Wear", "Suits", "Shirts", "Trousers", "Gowns", "Women's Tailoring"];
const customCategory = "__custom_category__";

export default function ProductForm({ onSubmit, editingProduct, onCancelEdit, categories = [] }) {
  const knownCategories = [...new Set([...baseCategories, ...categories].filter(Boolean))];
  const initialCategory = editingProduct?.category || "Ready to wear";
  const [custom, setCustom] = useState(!knownCategories.includes(initialCategory));
  const [form, setForm] = useState({ name: editingProduct?.name || "", price: editingProduct?.price ?? "", originalPrice: editingProduct?.originalPrice ?? "", category: initialCategory, description: editingProduct?.description || "", sizes: editingProduct?.sizes?.join(", ") || "", available: editingProduct?.available !== false });
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  function change(e) { setForm(f => ({ ...f, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value })); }
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      await onSubmit({ ...form, category: custom ? form.category : form.category, price: Number(form.price), originalPrice: form.originalPrice === "" ? "" : Number(form.originalPrice), image });
      if (!editingProduct) { setForm({ name: "", price: "", originalPrice: "", category: "Ready to wear", description: "", sizes: "", available: true }); setImage(null); setCustom(false); e.target.reset(); }
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  function chooseCategory(e) { if (e.target.value === customCategory) { setCustom(true); setForm(f => ({ ...f, category: "" })); } else { setCustom(false); setForm(f => ({ ...f, category: e.target.value })); } }
  return <form onSubmit={submit} className="form product-editor">
    <header className="product-editor-heading"><p className="eyebrow">CATALOGUE EDITOR</p><h2>{editingProduct ? "Update this piece" : "Add a piece"}</h2><p>Enter the details customers need to choose the right garment. Fields marked required must be completed before saving.</p></header>
    <fieldset className="product-editor-section"><legend>1. Piece details</legend>
      <label>Product name <span>Required</span><input name="name" maxLength={160} value={form.name} onChange={change} placeholder="e.g. Classic Senator Wear" required /></label>
      <label>Collection category <span>Choose the closest fit</span><select value={custom ? customCategory : form.category} onChange={chooseCategory}><option value="" disabled>Select a category</option>{knownCategories.map(c => <option key={c} value={c}>{c}</option>)}<option value={customCategory}>Please specify a new category…</option></select></label>
      {custom && <label>New category name<input name="category" maxLength={80} value={form.category} onChange={change} placeholder="Type a clear category name" required /></label>}
      <label>Description <span>Optional</span><textarea name="description" rows={4} maxLength={4000} value={form.description} onChange={change} placeholder="Describe the fabric, fit, occasion, or tailoring details." /></label>
      <label>Available sizes <span>Separate sizes with commas</span><input name="sizes" maxLength={500} placeholder="S, M, L, XL — leave blank if not applicable" value={form.sizes} onChange={change} /></label>
    </fieldset>
    <fieldset className="product-editor-section"><legend>2. Pricing &amp; availability</legend>
      <div className="editor-row"><label>Selling price (GBP)<span>Required</span><input name="price" type="number" min="0" max="100000" step="0.01" value={form.price} onChange={change} placeholder="0.00" required /></label><label>Was price (GBP)<span>Optional reference price</span><input name="originalPrice" type="number" min={form.price || "0"} max="100000" step="0.01" value={form.originalPrice} onChange={change} placeholder="Leave blank if no reduction" /></label></div>
      <label className="product-availability"><input name="available" type="checkbox" checked={form.available} onChange={change} /><span><strong>Available to purchase</strong><small>Turn this off while a piece is being prepared or is out of stock.</small></span></label>
    </fieldset>
    <fieldset className="product-editor-section"><legend>3. Product image</legend><p className="admin-field-help">Use a clear JPG, PNG, or WebP photo. A portrait image works best in the catalogue.</p><label>Choose image<input type="file" accept="image/jpeg,image/png,image/webp" required={!editingProduct} onChange={e => setImage(e.target.files[0] || null)} /></label>{image && <div className="product-image-preview"><img src={URL.createObjectURL(image)} alt="Selected product preview" /><span>{image.name}</span></div>}{editingProduct?.image && !image && <div className="product-image-preview"><img className="editor-preview" src={editingProduct.image} alt="Current product" /><span>Current product image</span></div>}</fieldset>
    {error && <p role="alert" className="shop-error">{error}</p>}<div className="form-actions"><button type="submit" disabled={busy} className="btn-primary">{busy ? "Saving piece…" : editingProduct ? "Save product changes" : "Add product to catalogue"}</button>{editingProduct && <button disabled={busy} type="button" onClick={onCancelEdit}>Cancel</button>}</div>
  </form>;
}
