const requiredSettings = ["GMAIL_CLIENT_ID", "GMAIL_CLIENT_SECRET", "GMAIL_REFRESH_TOKEN", "GMAIL_USER"];

async function getAccessToken() {
  const missing = requiredSettings.filter(key => !process.env[key]);
  if (missing.length) throw new Error(`Gmail API is not configured. Missing: ${missing.join(", ")}`);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: process.env.GMAIL_CLIENT_ID, client_secret: process.env.GMAIL_CLIENT_SECRET, refresh_token: process.env.GMAIL_REFRESH_TOKEN, grant_type: "refresh_token" }),
  });
  if (!(response.headers.get("content-type") || "").toLowerCase().includes("application/json")) throw new Error("Gmail API returned an unexpected response.");
  const data = await response.json();
  if (!response.ok || !data.access_token) throw new Error("Gmail API could not issue an access token.");
  return data.access_token;
}

async function sendEmail({ to, subject, text }) {
  const accessToken = await getAccessToken();
  const safeSubject = String(subject).replace(/[\r\n]+/g, " ");
  const contactEmail = process.env.CONTACT_EMAIL || "contact@morisclothing.co.uk";
  const message = [`From: Moris Clothing <${process.env.GMAIL_USER}>`, `Reply-To: ${contactEmail}`, `To: ${to}`, `Subject: ${safeSubject}`, "MIME-Version: 1.0", "Content-Type: text/plain; charset=UTF-8", "", text].join("\r\n");
  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw: Buffer.from(message, "utf8").toString("base64url") }),
  });
  if (!response.ok) throw new Error("Gmail API could not send the email.");
}

async function sendPaidOrderEmail(order) {
  const recipients = (process.env.ORDER_NOTIFICATION_EMAILS || process.env.ADMIN_EMAILS || "").split(",").map(value => value.trim()).filter(Boolean);
  if (!recipients.length) throw new Error("No order notification email recipients are configured.");
  const items = Array.isArray(order.items) ? order.items : [];
  const customer = order.customer || {};
  const address = order.shipping?.address;
  const addressText = address ? [order.shipping.name, address.line1, address.line2, address.city, address.state, address.postal_code, address.country].filter(Boolean).join(", ") : "Not provided";
  const lines = items.map(item => `- ${item.name} x ${item.quantity}${item.size ? ` (${item.size})` : ""} — ${Number(item.price * item.quantity).toFixed(2)} GBP`).join("\n") || "No item details available.";
  await sendEmail({ to: recipients.join(", "), subject: `New paid order ${String(order._id).slice(-8).toUpperCase()} — Moris Clothing`, text: [`New paid order received.`, `Order: ${order._id}`, `Date: ${new Date(order.createdAt || Date.now()).toISOString()}`, `Customer: ${customer.name || "Not provided"}`, `Email: ${customer.email || "Not provided"}`, `Phone: ${customer.phone || "Not provided"}`, `Delivery: ${addressText}`, "", "Items:", lines, "", `Total: ${Number(order.amount || 0).toFixed(2)} ${String(order.currency || "GBP").toUpperCase()}`].join("\n") });
}

module.exports = { sendEmail, sendPaidOrderEmail };
