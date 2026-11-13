const express = require("express");
const Settings = require("../models/Settings");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { uploadToR2 } = require("../config/r2");
const router = express.Router();
router.get("/", async (_req, res) => {
  try { res.json(await Settings.findById("store") || { shippingZones: [], checkoutPaused: false, announcement: "", site: {} }); }
  catch { res.status(503).json({ message: "Store settings are temporarily unavailable." }); }
});
router.put("/site", protect, adminOnly, upload.single("banner"), async (req, res) => {
  try {
    let colors;
    try { colors = JSON.parse(req.body.colors || "{}"); } catch { return res.status(400).json({ message: "Invalid store colors." }); }
    const allowedColors = ["accent", "header", "footer", "body", "card", "text", "metal"];
    if (typeof req.body.title !== "string" || req.body.title.length > 120 || typeof req.body.message !== "string" || req.body.message.length > 500 || typeof req.body.launchDate !== "string" || !["system", "arial", "trebuchet", "georgia"].includes(req.body.font) || !["classic", "soft", "editorial"].includes(req.body.theme) || !colors || typeof colors !== "object" || Array.isArray(colors) || Object.keys(colors).some(key => !allowedColors.includes(key) || !/^#[0-9a-f]{6}$/i.test(colors[key]))) return res.status(400).json({ message: "Invalid site settings." });
    const current = await Settings.findById("store") || new Settings({ _id: "store" });
    const site = { ...(current.site || {}), maintenance: req.body.maintenance === "true", blockSignIn: req.body.blockSignIn === "true", blockSignUp: req.body.blockSignUp === "true", blockCheckout: req.body.blockCheckout === "true", title: req.body.title.trim(), message: req.body.message.trim(), launchDate: req.body.launchDate.trim(), font: req.body.font, theme: req.body.theme, colors };
    if (req.file) site.banner = await uploadToR2(req.file, "site");
    else if (req.body.removeBanner === "true") site.banner = "";
    current.site = site; current.markModified("site"); await current.save(); res.json(site);
  } catch { res.status(500).json({ message: "Unable to save site settings. Check image storage and try again." }); }
});
router.put("/", protect, adminOnly, async (req, res) => {
  const { shippingZones, checkoutPaused, announcement } = req.body;
  const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
  const seen = new Set();
  if (!Array.isArray(shippingZones) || shippingZones.length > 30 || typeof checkoutPaused !== "boolean" || typeof announcement !== "string" || announcement.length > 200) return res.status(400).json({ message: "Invalid store settings." });
  for (const zone of shippingZones) {
    if (!zone || typeof zone.name !== "string" || !zone.name.trim() || zone.name.length > 80 || !Array.isArray(zone.countries) || !zone.countries.length || !Number.isFinite(zone.fee) || zone.fee < 0 || zone.fee > 10000) return res.status(400).json({ message: "Each shipping zone needs a name, countries, and a valid fee." });
    for (const code of zone.countries) {
      if (typeof code !== "string" || !/^[A-Z]{2}$/.test(code) || countryNames.of(code) === code || ["EU", "UN", "EZ", "QO", "XA", "XB"].includes(code) || seen.has(code)) return res.status(400).json({ message: "Use valid country codes and place each country in only one zone." });
      seen.add(code);
    }
  }
  try {
    const settings = await Settings.findByIdAndUpdate("store", { $set: { shippingZones: shippingZones.map(z => ({ name: z.name.trim(), countries: z.countries, fee: Math.round(z.fee * 100) / 100 })), checkoutPaused, announcement: announcement.trim() } }, { upsert: true, new: true, runValidators: true });
    res.json(settings);
  } catch { res.status(500).json({ message: "Unable to save settings." }); }
});
module.exports = router;
