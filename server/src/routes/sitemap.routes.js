const express = require("express");
const Product = require("../models/Product");
const BlogPost = require("../models/BlogPost");
const { CLIENT_URL } = require("../config/site");
const router = express.Router();
const fixedPaths = ["/", "/collection", "/about", "/contact", "/faq", "/blog", "/terms", "/privacy", "/shipping", "/returns-refunds", "/disclaimer"];
const xmlEscape = value => String(value).replace(/[<>&'\"]/g, char => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;" }[char]));
router.get("/", async (_req, res) => {
  try {
    const [products, posts, categories] = await Promise.all([
      Product.find({}, { _id: 1, updatedAt: 1 }).lean(),
      BlogPost.find({ published: true }, { _id: 1, updatedAt: 1 }).lean(),
      Product.distinct("category"),
    ]);
    const entries = [
      ...fixedPaths.map(path => ({ loc: `${CLIENT_URL}${path}` })),
      ...categories.filter(Boolean).map(category => ({ loc: `${CLIENT_URL}/category/${encodeURIComponent(category)}` })),
      ...products.map(product => ({ loc: `${CLIENT_URL}/product/${encodeURIComponent(product._id)}`, updatedAt: product.updatedAt })),
      ...posts.map(post => ({ loc: `${CLIENT_URL}/blog/${encodeURIComponent(post._id)}`, updatedAt: post.updatedAt })),
    ].map(({ loc, updatedAt }) => `  <url><loc>${xmlEscape(loc)}</loc>${updatedAt ? `<lastmod>${new Date(updatedAt).toISOString().slice(0, 10)}</lastmod>` : ""}</url>`).join("\n");
    res.set("Content-Type", "application/xml; charset=utf-8").set("Cache-Control", "public, max-age=300, stale-while-revalidate=600").send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`);
  } catch { res.status(500).type("text/plain").send("Could not generate the Moris Clothing sitemap."); }
});
module.exports = router;
