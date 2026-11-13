const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  excerpt: { type: String, trim: true, maxlength: 500, default: "" },
  content: { type: String, required: true, maxlength: 50000 },
  image: { type: String, default: "" },
  published: { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model("BlogPost", schema);
