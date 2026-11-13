const express = require("express");
const Settings = require("../models/Settings");
const { protect, adminOnly } = require("../middleware/auth");
const router = express.Router();
router.get("/", async (_req, res) => {
  try { res.json(await Settings.findById("store") || { shippingZones: [], checkoutPaused: false, announcement: "" }); }
  catch { res.status(503).json({ message: "Store settings are temporarily unavailable." }); }
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
