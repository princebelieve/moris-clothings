const mongoose = require("mongoose");
function normalizeItems(input) {
  if (!Array.isArray(input) || !input.length || input.length > 50) throw new Error("Your bag must contain between 1 and 50 items.");
  const grouped = new Map();
  for (const item of input) {
    if (!item || typeof item.productId !== "string" || !/^[a-f0-9]{24}$/i.test(item.productId) || !mongoose.isValidObjectId(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20 || (item.size !== undefined && typeof item.size !== "string") || (item.size || "").length > 30) throw new Error("Please check the products, sizes and quantities in your bag.");
    const productId = item.productId.toLowerCase();
    const size = (item.size || "").trim();
    const key = `${productId}:${size}`;
    const quantity = (grouped.get(key)?.quantity || 0) + item.quantity;
    if (quantity > 20) throw new Error("A maximum of 20 of each piece can be ordered.");
    grouped.set(key, { productId, size, quantity });
  }
  return [...grouped.values()];
}
function priceItems(items, products) {
  return items.map(item => {
    const product = products.find(p => String(p._id) === item.productId);
    if (!product || product.available === false) throw new Error("A piece in your bag is no longer available. Please update your bag.");
    if (!Number.isFinite(product.price) || product.price <= 0) throw new Error(`${product.name} is not available for online payment yet.`);
    if ((product.sizes?.length && !product.sizes.includes(item.size)) || (!product.sizes?.length && item.size)) throw new Error(`Please choose an available size for ${product.name}.`);
    return { ...item, name: product.name, image: product.image, price: Math.round(product.price * 100) / 100 };
  });
}
module.exports = { normalizeItems, priceItems };
