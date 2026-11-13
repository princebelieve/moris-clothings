const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  productId: String,
  items: [{ productId: String, name: String, image: String, size: String, quantity: Number, price: Number }],
  stripeSessionId: { type: String, unique: true, sparse: true },
  amount: Number,
  subtotal: Number,
  delivery: { type: Number, default: 0 },
  currency: { type: String, default: "gbp" },
  customer: { name: String, email: String, phone: String },
  shipping: { name: String, address: { line1: String, line2: String, city: String, state: String, postal_code: String, country: String } },
  status: { type: String, default: "pending", enum: ["pending", "paid", "failed", "expired"] },
  fulfillment: { type: String, default: "unfulfilled", enum: ["unfulfilled", "processing", "shipped", "delivered"] },
  trackingNumber: { type: String, maxlength: 200, default: "" },
  paidAt: Date,
}, { timestamps: true });
module.exports = mongoose.model("Order", orderSchema);
