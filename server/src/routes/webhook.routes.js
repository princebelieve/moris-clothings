const express = require("express");
const stripe = require("../services/stripe");
const Order = require("../models/Order");
const fulfillOrder = require("../services/fulfillOrder");
const { sendCustomerOrderCopy } = require("../services/whatsapp");
const router = express.Router();
router.post("/", async (req, res) => {
  let event;
  try { event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET); }
  catch { return res.status(400).send("Invalid webhook signature"); }
  try {
    const session = event.data.object;
    if (["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) {
      const order = await fulfillOrder(session);
      if (order?.customerWhatsappOptIn && !order.customerWhatsappNotifiedAt) {
        const claimed = await Order.findOneAndUpdate({ _id: order._id, status: "paid", customerWhatsappOptIn: true, customerWhatsappNotifiedAt: { $exists: false }, customerWhatsappMessageId: { $in: [null, ""] } }, { $set: { customerWhatsappMessageId: "sending" } }, { new: true });
        if (claimed) {
          try {
            const sent = await sendCustomerOrderCopy(claimed);
            claimed.customerWhatsappNotifiedAt = new Date(); claimed.customerWhatsappMessageId = sent.messageId || ""; claimed.customerWhatsappDeliveryStatus = "sent"; claimed.customerWhatsappNotificationError = ""; await claimed.save();
          } catch (error) {
            claimed.customerWhatsappMessageId = ""; claimed.customerWhatsappNotificationError = String(error.message).slice(0, 500); await claimed.save();
          }
        }
      }
    }
    if (["checkout.session.expired", "checkout.session.async_payment_failed"].includes(event.type)) await Order.updateOne({ stripeSessionId: session.id, status: "pending" }, { $set: { status: event.type.endsWith("expired") ? "expired" : "failed" } });
    res.json({ received: true });
  } catch (err) { console.error("Order webhook failed:", err.message); res.status(500).json({ message: "Order processing failed; please retry." }); }
});
module.exports = router;
