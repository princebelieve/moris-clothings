const express = require("express");
const stripe = require("../services/stripe");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Settings = require("../models/Settings");
const { normalizeItems, priceItems } = require("../utils/checkout");
const { CLIENT_URL } = require("../config/site");
const router = express.Router();
router.post("/create-checkout-session", async (req, res) => {
  let items;
  try { items = normalizeItems(req.body.items || (req.body.productId ? [{ productId: req.body.productId, quantity: 1 }] : [])); }
  catch (err) { return res.status(400).json({ message: err.message }); }
  try {
    const settings = await Settings.findById("store");
    if (settings?.checkoutPaused) return res.status(409).json({ message: "Checkout is temporarily paused. Please try again later." });
    const country = req.body.shippingCountry;
    const zone = settings?.shippingZones?.find(z => z.countries.includes(country));
    if (!zone) return res.status(400).json({ message: "Please choose a configured delivery destination. Contact us if your country is not listed." });
    const products = await Product.find({ _id: { $in: items.map(i => i.productId) } });
    let lines;
    try { lines = priceItems(items, products); } catch (err) { return res.status(409).json({ message: err.message }); }
    const subtotal = lines.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0) / 100;
    const customerWhatsappOptIn = req.body.customerWhatsappOptIn === true;
    const order = await Order.create({ items: lines, subtotal, delivery: zone.fee, amount: Math.round((subtotal + zone.fee) * 100) / 100, customerWhatsappOptIn, customerWhatsappOptInAt: customerWhatsappOptIn ? new Date() : undefined });
    const clientUrl = CLIENT_URL;
    const embedded = req.body.uiMode === "embedded";
    const sessionOptions = {
      mode: "payment",
      metadata: { orderId: String(order._id), customerWhatsappOptIn: String(customerWhatsappOptIn) },
      client_reference_id: String(order._id),
      line_items: lines.map(item => ({ price_data: { currency: "gbp", product_data: { name: item.name + (item.size ? ` - ${item.size}` : "") }, unit_amount: Math.round(item.price * 100) }, quantity: item.quantity })),
      shipping_address_collection: { allowed_countries: [country] },
      shipping_options: [{ shipping_rate_data: { type: "fixed_amount", fixed_amount: { amount: Math.round(zone.fee * 100), currency: "gbp" }, display_name: zone.name } }],
      phone_number_collection: { enabled: true },
      billing_address_collection: "required",
      allow_promotion_codes: true,
    };
    if (embedded) {
      sessionOptions.ui_mode = "embedded";
      sessionOptions.redirect_on_completion = "always";
      sessionOptions.return_url = `${clientUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
    } else {
      sessionOptions.success_url = `${clientUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
      sessionOptions.cancel_url = `${clientUrl}/cancel`;
    }
    const session = await stripe.checkout.sessions.create(sessionOptions);
    await Order.updateOne({ _id: order._id }, { $set: { stripeSessionId: session.id } });
    res.json(embedded ? { clientSecret: session.client_secret, sessionId: session.id } : { url: session.url, sessionId: session.id });
  } catch (err) { console.error("Checkout failed:", err.message); res.status(503).json({ message: "Unable to open secure checkout. Please try again shortly." }); }
});
module.exports = router;
