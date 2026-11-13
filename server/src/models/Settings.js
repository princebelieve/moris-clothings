const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  _id: { type: String, default: "store" },
  shippingZones: { type: [{ name: String, countries: [String], fee: Number }], default: [] },
  checkoutPaused: { type: Boolean, default: false },
  announcement: { type: String, default: "" },
  site: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });
module.exports = mongoose.model("Settings", schema);
