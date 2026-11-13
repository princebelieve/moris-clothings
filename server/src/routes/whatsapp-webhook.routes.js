const crypto = require("crypto");
const express = require("express");
const Order = require("../models/Order");
const router = express.Router();

router.get("/", (req, res) => {
  const token = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  if (!token) return res.status(503).send("WhatsApp webhook verification is not configured.");
  if (req.query["hub.mode"] !== "subscribe" || req.query["hub.verify_token"] !== token || typeof req.query["hub.challenge"] !== "string") return res.sendStatus(403);
  return res.status(200).type("text/plain").send(req.query["hub.challenge"]);
});

function validSignature(body, signature) {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!Buffer.isBuffer(body) || !signature || !secret) return false;
  const expected = Buffer.from(`sha256=${crypto.createHmac("sha256", secret).update(body).digest("hex")}`);
  const received = Buffer.from(signature);
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}
const digits = value => String(value || "").replace(/\D/g, "");
async function saveStatus(status) {
  const order = await Order.findOne({ $or: [{ whatsappMessageId: status.id }, { customerWhatsappMessageId: status.id }] });
  if (!order) return;
  const customer = order.customerWhatsappMessageId === status.id;
  const prefix = customer ? "customerWhatsapp" : "whatsapp";
  order[`${prefix}DeliveryStatus`] = status.status || "unknown";
  order[`${prefix}DeliveryError`] = status.errors?.[0]?.message?.slice(0, 500) || "";
  await order.save();
}
async function saveMessage(message) {
  if (!message.id || !message.from) return;
  const phone = digits(message.from);
  const orders = await Order.find({ "customer.phone": { $exists: true, $ne: "" } }).sort({ createdAt: -1 }).limit(250);
  const order = orders.find(item => digits(item.customer?.phone) === phone);
  if (!order || order.whatsappReplies.some(reply => reply.messageId === message.id)) return;
  const text = message.text?.body || message.button?.text || message.interactive?.button_reply?.title || `[${message.type || "WhatsApp message"}]`;
  order.whatsappReplies.push({ messageId: message.id, from: message.from, text: String(text).slice(0, 2000), receivedAt: message.timestamp ? new Date(Number(message.timestamp) * 1000) : new Date() });
  if (order.whatsappReplies.length > 50) order.whatsappReplies.splice(0, order.whatsappReplies.length - 50);
  await order.save();
}

router.post("/", async (req, res) => {
  if (!validSignature(req.body, req.get("x-hub-signature-256"))) return res.sendStatus(process.env.WHATSAPP_APP_SECRET ? 401 : 503);
  let payload;
  try { payload = JSON.parse(req.body.toString("utf8")); } catch { return res.status(400).json({ message: "Invalid WhatsApp webhook payload." }); }
  try {
    for (const entry of payload.entry || []) for (const change of entry.changes || []) {
      for (const status of change.value?.statuses || []) await saveStatus(status);
      for (const message of change.value?.messages || []) await saveMessage(message);
    }
    return res.sendStatus(200);
  } catch { return res.sendStatus(500); }
});

module.exports = router;
