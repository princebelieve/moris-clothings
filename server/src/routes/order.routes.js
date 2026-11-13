const express = require("express");
const Order = require("../models/Order");
const stripe = require("../services/stripe");
const fulfillOrder = require("../services/fulfillOrder");
const { sendPaidOrderEmail } = require("../services/gmail");
const { sendPaidOrderNotification, sendCustomerOrderCopy, isWhatsAppConfigured } = require("../services/whatsapp");
const { protect, adminOnly } = require("../middleware/auth");
const router = express.Router();
router.get("/recent-sales", async (_req, res) => {
  try {
    const order = await Order.findOne({ status: "paid", "items.0": { $exists: true } }).sort({ createdAt: -1 }).select("items.name createdAt").lean();
    const item = order?.items?.[0];
    if (!item) return res.json(null);
    res.set("Cache-Control", "public, max-age=300").json({ name: item.name, createdAt: order.createdAt });
  } catch { res.status(503).json({ message: "Recent sales are unavailable." }); }
});
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
router.get("/mine", protect, async (req, res) => {
  try {
    const orders = await Order.find({ "customer.email": req.user.email.toLowerCase() })
      .select("items amount subtotal delivery currency status fulfillment trackingNumber createdAt paidAt")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return res.set("Cache-Control", "no-store").json(orders);
  } catch {
    return res.status(500).json({ message: "Unable to load your orders." });
  }
});
router.use(protect, adminOnly);
router.get("/summary", async (_req, res) => {
  try {
    const [total, paid, revenue] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: "paid" }),
      Order.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, amount: { $sum: "$amount" } } }]),
    ]);
    res.json({ total, paid, revenue: revenue[0]?.amount || 0 });
  } catch { res.status(500).json({ message: "Unable to load order summary." }); }
});
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, Math.min(100000, parseInt(req.query.page, 10) || 1));
    const query = {};
    if (["pending", "paid", "failed", "expired"].includes(req.query.status)) query.status = req.query.status;
    const [orders, total] = await Promise.all([Order.find(query).sort({ createdAt: -1 }).skip((page - 1) * 25).limit(25), Order.countDocuments(query)]);
    res.set("Cache-Control", "no-store").json({ orders, total, page, pages: Math.ceil(total / 25) });
  } catch { res.status(500).json({ message: "Unable to load orders." }); }
});
router.post("/:id/notify-email", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });
    if (order.status !== "paid") return res.status(400).json({ message: "Only paid orders can be emailed." });
    await sendPaidOrderEmail(order);
    order.orderEmailNotifiedAt = new Date(); order.orderEmailNotificationError = ""; await order.save();
    res.json({ orderEmailNotifiedAt: order.orderEmailNotifiedAt });
  } catch (error) {
    const order = await Order.findById(req.params.id).catch(() => null);
    if (order) { order.orderEmailNotificationError = String(error.message).slice(0, 500); await order.save().catch(() => {}); }
    res.status(502).json({ message: error.message || "Order email failed." });
  }
});
router.post("/:id/notify-whatsapp", async (req, res) => {
  if (!isWhatsAppConfigured()) return res.status(503).json({ message: "WhatsApp Cloud API is not configured on the server." });
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });
    if (order.status !== "paid") return res.status(400).json({ message: "Only paid orders can be sent to WhatsApp." });
    const notification = await sendPaidOrderNotification(order);
    order.whatsappNotifiedAt = new Date(); order.whatsappMessageId = notification.messageId || ""; order.whatsappDeliveryStatus = "sent"; order.whatsappDeliveryError = ""; order.whatsappNotificationError = ""; await order.save();
    res.json({ whatsappNotifiedAt: order.whatsappNotifiedAt });
  } catch (error) {
    const order = await Order.findById(req.params.id).catch(() => null);
    if (order) { order.whatsappNotificationError = String(error.message).slice(0, 500); await order.save().catch(() => {}); }
    res.status(502).json({ message: error.message || "WhatsApp notification failed." });
  }
});
router.post("/:id/notify-customer-whatsapp", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });
    if (order.status !== "paid") return res.status(400).json({ message: "Only paid orders can be sent to WhatsApp." });
    if (!order.customerWhatsappOptIn) return res.status(400).json({ message: "The customer did not opt in to WhatsApp updates." });
    const notification = await sendCustomerOrderCopy(order);
    order.customerWhatsappNotifiedAt = new Date(); order.customerWhatsappMessageId = notification.messageId || ""; order.customerWhatsappDeliveryStatus = "sent"; order.customerWhatsappNotificationError = ""; await order.save();
    res.json({ customerWhatsappNotifiedAt: order.customerWhatsappNotifiedAt });
  } catch (error) {
    const order = await Order.findById(req.params.id).catch(() => null);
    if (order) { order.customerWhatsappNotificationError = String(error.message).slice(0, 500); await order.save().catch(() => {}); }
    res.status(502).json({ message: error.message || "Customer WhatsApp notification failed." });
  }
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
