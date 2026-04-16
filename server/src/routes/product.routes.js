// server/src/routes/product.routes.js
const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

const { protect, adminOnly } = require("../middleware/auth");

router.get("/", getProducts);
router.get("/:id", getProduct);

// 🔐 PROTECTED ADMIN ACTIONS
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;
