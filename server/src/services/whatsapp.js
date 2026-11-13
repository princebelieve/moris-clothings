const apiConfigured = () => Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_GRAPH_API_VERSION);
const enabled = () => apiConfigured() && Boolean(process.env.WHATSAPP_ORDER_RECIPIENT && process.env.WHATSAPP_ORDER_TEMPLATE_NAME && process.env.WHATSAPP_TEMPLATE_LANGUAGE);
const short = (value, max = 950) => { const text = String(value || "").trim(); return text.length > max ? `${text.slice(0, max - 1)}…` : text || "Not provided"; };

async function sendTemplateMessage(order, recipient, templateName, { customerCopy = false, language } = {}) {
  const version = process.env.WHATSAPP_GRAPH_API_VERSION;
  if (!/^v\d+\.\d+$/.test(version || "")) throw new Error("WHATSAPP_GRAPH_API_VERSION must look like vXX.0.");
  const to = String(recipient || "").replace(/\D/g, "");
  if (!to) throw new Error("WhatsApp recipient must be an international phone number.");
  const items = Array.isArray(order.items) ? order.items : [];
  const itemSummary = items.length ? items.map(item => `${item.name || "Piece"} × ${item.quantity || 1}${item.size ? ` (${item.size})` : ""}`).join("; ") : "Order items are available in the Moris dashboard.";
  const address = order.shipping?.address;
  const addressSummary = address ? [order.shipping?.name, address.line1, address.line2, address.city, address.state, address.postal_code, address.country].filter(Boolean).join(", ") : "Not provided";
  const values = customerCopy
    ? [order.customer?.name, String(order._id).slice(-8).toUpperCase(), `${Number(order.amount || 0).toFixed(2)} ${String(order.currency || "GBP").toUpperCase()}`, itemSummary]
    : [String(order._id), order.customer?.name, order.customer?.email, order.customer?.phone, `${Number(order.amount || 0).toFixed(2)} ${String(order.currency || "GBP").toUpperCase()}`, itemSummary, addressSummary];
  const parameters = values.map((value, index) => ({ type: "text", text: short(value, index === 5 ? 400 : index === 6 ? 300 : 150) }));
  const response = await fetch(`https://graph.facebook.com/${version}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST", headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to, type: "template", template: { name: templateName, language: { code: language || process.env.WHATSAPP_TEMPLATE_LANGUAGE }, components: [{ type: "body", parameters }] } }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error?.message || "WhatsApp rejected the order notification.");
  return { sent: true, messageId: data.messages?.[0]?.id || "" };
}

async function sendPaidOrderNotification(order) {
  if (!enabled()) throw new Error("WhatsApp order notifications are not configured on the server.");
  return sendTemplateMessage(order, process.env.WHATSAPP_ORDER_RECIPIENT, process.env.WHATSAPP_ORDER_TEMPLATE_NAME);
}
async function sendCustomerOrderCopy(order) {
  if (!order.customerWhatsappOptIn) return { sent: false, skipped: true };
  if (!order.customer?.phone) throw new Error("The customer did not provide a phone number.");
  const template = process.env.WHATSAPP_CUSTOMER_ORDER_TEMPLATE_NAME;
  if (!apiConfigured() || !template || !process.env.WHATSAPP_TEMPLATE_LANGUAGE) throw new Error("Customer WhatsApp order copies are not configured.");
  return sendTemplateMessage(order, order.customer.phone, template, { customerCopy: true, language: process.env.WHATSAPP_CUSTOMER_TEMPLATE_LANGUAGE || process.env.WHATSAPP_TEMPLATE_LANGUAGE });
}
module.exports = { sendPaidOrderNotification, sendCustomerOrderCopy, isWhatsAppConfigured: enabled };
