const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 160 },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0, default: null },
  image: { type: String, default: "" },
  category: { type: String, trim: true, maxlength: 80, default: "Ready to wear" },
  description: { type: String, maxlength: 4000, default: "" },
  sizes: { type: [String], default: [] },
  available: { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model("Product", productSchema);
