const express = require("express");
const Order = require("../models/Order");
const stripe = require("../services/stripe");
const fulfillOrder = require("../services/fulfillOrder");
const { protect, adminOnly } = require("../middleware/auth");
const router = express.Router();
// The unguessable checkout session is a receipt capability. Never return customer addresses here.
router.get("/session/:sessionId", async (req, res) => {
  res.set("Cache-Control", "no-store");
  if (!/^cs_(test_|live_)?[a-zA-Z0-9_]{10,250}$/.test(req.params.sessionId)) return res.status(400).json({ message: "Invalid checkout reference." });
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    const order = await fulfillOrder(session);
    if (!order) return res.json({ status: session.payment_status === "paid" ? "processing" : "pending" });
    res.json({ id: order._id, status: order.status, amount: order.amount, currency: order.currency, items: order.items?.map(i => ({ name: i.name, size: i.size, quantity: i.quantity, price: i.price })), delivery: order.delivery });
  } catch { res.status(503).json({ message: "We could not verify your payment yet. Please retry or contact Moris with your checkout reference." }); }
});
router.use(protect, adminOnly);
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, Math.min(100000, parseInt(req.query.page, 10) || 1));
    const query = {};
    if (["pending", "paid", "failed", "expired"].includes(req.query.status)) query.status = req.query.status;
    const [orders, total] = await Promise.all([Order.find(query).sort({ createdAt: -1 }).skip((page - 1) * 25).limit(25), Order.countDocuments(query)]);
    res.set("Cache-Control", "no-store").json({ orders, total, page, pages: Math.ceil(total / 25) });
  } catch { res.status(500).json({ message: "Unable to load orders." }); }
});
router.patch("/:id", async (req, res) => {
  const { fulfillment, trackingNumber } = req.body;
  if (!/^[a-f0-9]{24}$/i.test(req.params.id) || !["unfulfilled", "processing", "shipped", "delivered"].includes(fulfillment) || typeof trackingNumber !== "string" || trackingNumber.length > 200) return res.status(400).json({ message: "Invalid fulfillment details." });
  try {
    const order = await Order.findOneAndUpdate({ _id: req.params.id, status: "paid" }, { $set: { fulfillment, trackingNumber: trackingNumber.trim() } }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ message: "Paid order not found." });
    res.json(order);
  } catch { res.status(500).json({ message: "Unable to update order." }); }
});
module.exports = router;
