const mongoose = require("mongoose");
const Product = require("../models/Product");
const { uploadToR2 } = require("../config/r2");
function productFields(body) {
  const { name, price, originalPrice, category, description, sizes, available } = body;
  if (typeof name !== "string" || !name.trim() || name.length > 160 || price === undefined || price === "" || !Number.isFinite(Number(price)) || Number(price) < 0 || Number(price) > 100000) throw new Error("Enter a product name and a valid price between GBP 0 and GBP 100,000.");
  const fields = { name: name.trim(), price: Math.round(Number(price) * 100) / 100 };
  if (originalPrice !== undefined) {
    if (originalPrice === "" || originalPrice === null) fields.originalPrice = null;
    else if (!Number.isFinite(Number(originalPrice)) || Number(originalPrice) < Number(price) || Number(originalPrice) > 100000) throw new Error("Original price must be at least the current price and no more than GBP 100,000.");
    else fields.originalPrice = Math.round(Number(originalPrice) * 100) / 100;
  }
  if (category !== undefined) { if (typeof category !== "string" || category.length > 80) throw new Error("Category must be under 80 characters."); fields.category = category.trim(); }
  if (description !== undefined) { if (typeof description !== "string" || description.length > 4000) throw new Error("Description must be under 4,000 characters."); fields.description = description.trim(); }
  if (sizes !== undefined) {
    if (typeof sizes !== "string" || sizes.length > 500) throw new Error("Enter sizes separated by commas.");
    fields.sizes = [...new Set(sizes.split(",").map(s => s.trim()).filter(Boolean))];
    if (fields.sizes.length > 20 || fields.sizes.some(s => s.length > 30)) throw new Error("Use at most 20 sizes of up to 30 characters each.");
  }
  if (available !== undefined) { if (!["true", "false"].includes(available)) throw new Error("Invalid product availability."); fields.available = available === "true"; }
  return fields;
}
async function getProducts(_req, res) { try { res.json(await Product.find().sort({ _id: -1 })); } catch { res.status(500).json({ message: "Unable to load products." }); } }
async function getProduct(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Product not found" });
  try { const p = await Product.findById(req.params.id); if (!p) return res.status(404).json({ message: "Product not found" }); res.json(p); } catch { res.status(500).json({ message: "Unable to load product." }); }
}
async function getBestsellers(req, res) {
  const days = Math.max(1, Math.min(90, Number.parseInt(req.query.days, 10) || 7));
  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const sales = await require("../models/Order").aggregate([
      { $match: { status: "paid", createdAt: { $gte: since } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.productId", units: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
      { $sort: { units: -1, revenue: -1 } },
      { $limit: 10 },
    ]);
    const ids = sales.map(item => item._id).filter(id => mongoose.isValidObjectId(id));
    const products = await Product.find({ _id: { $in: ids } });
    const byId = new Map(products.map(product => [String(product._id), product]));
    res.json({ products: sales.map(item => ({ product: byId.get(String(item._id)), units: item.units })).filter(item => item.product).map(item => ({ ...item.product.toObject(), unitsSold: item.units })) });
  } catch {
    res.status(500).json({ message: "Unable to load bestsellers." });
  }
}
async function createProduct(req, res) {
  let fields; try { fields = productFields(req.body); } catch (err) { return res.status(400).json({ message: err.message }); }
  if (!req.file) return res.status(400).json({ message: "Choose an image for this product." });
  try { fields.image = await uploadToR2(req.file); res.status(201).json(await Product.create(fields)); } catch { res.status(500).json({ message: "Unable to save product. Check image storage and try again." }); }
}
async function updateProduct(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Product not found" });
  let fields; try { fields = productFields(req.body); } catch (err) { return res.status(400).json({ message: err.message }); }
  try { const p = await Product.findById(req.params.id); if (!p) return res.status(404).json({ message: "Product not found" }); if (req.file) fields.image = await uploadToR2(req.file); Object.assign(p, fields); await p.save(); res.json(p); } catch { res.status(500).json({ message: "Unable to update product." }); }
}
async function deleteProduct(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Product not found" });
  try { const p = await Product.findByIdAndDelete(req.params.id); if (!p) return res.status(404).json({ message: "Product not found" }); res.json({ message: "Product deleted successfully" }); } catch { res.status(500).json({ message: "Unable to delete product." }); }
}
module.exports = { getProducts, getProduct, getBestsellers, createProduct, updateProduct, deleteProduct };
