const express = require("express");
const mongoose = require("mongoose");
const BlogPost = require("../models/BlogPost");
const upload = require("../middleware/upload");
const { uploadToR2 } = require("../config/r2");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();
router.get("/", async (_req, res) => {
  try { res.json(await BlogPost.find({ published: true }).sort({ createdAt: -1 }).lean()); }
  catch { res.status(500).json({ message: "Unable to load the journal." }); }
});
router.get("/admin", protect, adminOnly, async (_req, res) => {
  try { res.json(await BlogPost.find().sort({ createdAt: -1 }).lean()); }
  catch { res.status(500).json({ message: "Unable to load journal articles." }); }
});
router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Article not found." });
  try { const post = await BlogPost.findOne({ _id: req.params.id, published: true }).lean(); return post ? res.json(post) : res.status(404).json({ message: "Article not found." }); }
  catch { res.status(404).json({ message: "Article not found." }); }
});
router.post("/", protect, adminOnly, upload.single("image"), async (req, res) => {
  try {
    const { title, excerpt = "", content, published = "false" } = req.body;
    if (typeof title !== "string" || !title.trim() || typeof content !== "string" || !content.trim()) return res.status(400).json({ message: "Article title and content are required." });
    if (title.length > 180 || excerpt.length > 500 || content.length > 50000) return res.status(400).json({ message: "Article text exceeds the allowed length." });
    const image = req.file ? await uploadToR2(req.file, "journal") : "";
    res.status(201).json(await BlogPost.create({ title: title.trim(), excerpt: excerpt.trim(), content, published: published === "true", image }));
  } catch { res.status(500).json({ message: "Unable to create article." }); }
});
router.put("/:id", protect, adminOnly, upload.single("image"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Article not found." });
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Article not found." });
    const { title, excerpt = "", content, published = "false" } = req.body;
    if (typeof title !== "string" || !title.trim() || typeof content !== "string" || !content.trim() || title.length > 180 || excerpt.length > 500 || content.length > 50000) return res.status(400).json({ message: "Enter an article title and content within the length limits." });
    post.title = title.trim(); post.excerpt = excerpt.trim(); post.content = content; post.published = published === "true";
    if (req.file) post.image = await uploadToR2(req.file, "journal");
    await post.save(); res.json(post);
  } catch { res.status(500).json({ message: "Unable to update article." }); }
});
router.delete("/:id", protect, adminOnly, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Article not found." });
  try { const post = await BlogPost.findByIdAndDelete(req.params.id); return post ? res.json({ deleted: true }) : res.status(404).json({ message: "Article not found." }); }
  catch { res.status(500).json({ message: "Unable to delete article." }); }
});
module.exports = router;
