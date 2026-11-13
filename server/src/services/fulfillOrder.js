const Order = require("../models/Order");
async function fulfillOrder(session) {
  if (session.payment_status !== "paid") return null;
  const shipping = session.collected_information?.shipping_details || session.shipping_details;
  const fields = {
    stripeSessionId: session.id,
    amount: session.amount_total / 100,
    currency: session.currency,
    status: "paid",
    customer: { name: session.customer_details?.name, email: session.customer_details?.email, phone: session.customer_details?.phone },
    shipping: shipping || {},
  };
  // Repeated webhook deliveries must preserve fulfillment edits and the original paid timestamp.
  const paid = await Order.findOneAndUpdate({ stripeSessionId: session.id, status: { $ne: "paid" } }, { $set: { ...fields, paidAt: new Date() } }, { new: true });
  if (paid) return paid;
  const existing = await Order.findOne({ stripeSessionId: session.id });
  if (existing) return existing;
  // Recover if the webhook beats the checkout route's session-id write.
  if (session.metadata?.orderId && /^[a-f0-9]{24}$/i.test(session.metadata.orderId)) {
    const recovered = await Order.findOneAndUpdate({ _id: session.metadata.orderId, stripeSessionId: { $exists: false } }, { $set: { ...fields, paidAt: new Date() } }, { new: true });
    if (recovered) return recovered;
    return Order.findOne({ stripeSessionId: session.id });
  }
  // Preserve payments from checkout sessions created before this upgrade.
  if (session.metadata?.productId) return Order.findOneAndUpdate({ stripeSessionId: session.id }, { $setOnInsert: { ...fields, productId: session.metadata.productId, paidAt: new Date() } }, { upsert: true, new: true });
  return null;
}
module.exports = fulfillOrder;
