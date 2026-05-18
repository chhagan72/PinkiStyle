// routes/products.js
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET /api/products?category=...
router.get("/products", async (req, res) => {
  try {
    const { category } = req.query;
    const q = { visible: true };
    if (category) q.categories = category;
    const items = await Product.find(q).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/products/:id
router.get("/products/:id", async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p || !p.visible) return res.status(404).json({ message: "Not found" });
    res.json(p);
  } catch (e) {
    res.status(404).json({ message: "Not found" });
  }
});

module.exports = router;
