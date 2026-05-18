// routes/adminProducts.js
const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const Product = require("../models/Product");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");
const fs = require("fs");

function safeUnlinkByRelUrl(relUrl, productDir) {
  try {
    const full = path.join(__dirname, "..", relUrl.replace(/^\//, ""));
    if (productDir && full.startsWith(productDir) && fs.existsSync(full)) {
      fs.unlinkSync(full);
    } else if (fs.existsSync(full)) {
      fs.unlinkSync(full);
    }
  } catch (e) {
    console.warn("safeUnlinkByRelUrl warn:", e.message);
  }
}

// product upload storage (use app locals to get dir)
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir =
      req.app?.locals?.UPLOAD_DIRS?.PRODUCT_DIR ||
      path.join(__dirname, "..", "uploads", "products");
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".png";
    cb(null, `p_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const productUpload = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype);
    cb(ok ? null : new Error("Only image files are allowed"), ok);
  },
});

// GET /api/admin/products
router.get("/products", auth, adminOnly, async (req, res) => {
  try {
    const items = await Product.find({}).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/admin/products/:id
router.get("/products/:id", auth, adminOnly, async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Not found" });
    res.json(p);
  } catch (e) {
    res.status(404).json({ message: "Not found" });
  }
});

// POST /api/admin/products
router.post(
  "/products",
  auth,
  adminOnly,
  productUpload.array("images", 10),
  async (req, res) => {
    try {
      const {
        title,
        details = "",
        categories = "[]",
        sizes = "[]",
        discountPercent = "0",
        deliveryDays = null,
        visible = "true",
      } = req.body;

      const cat = Array.isArray(categories)
        ? categories
        : JSON.parse(categories || "[]");
      const sz = Array.isArray(sizes) ? sizes : JSON.parse(sizes || "[]");

      if (!title?.trim())
        return res.status(400).json({ message: "Title is required" });
      if (!sz.length)
        return res
          .status(400)
          .json({ message: "At least one size is required" });
      if (!req.files?.length)
        return res
          .status(400)
          .json({ message: "At least one image is required" });

      const imgs = req.files.map((f) => `/uploads/products/${f.filename}`);

      const product = await Product.create({
        title: title.trim(),
        details,
        categories: cat,
        sizes: sz.map((s) => ({
          label: s.label,
          price: Number(s.price),
          stock: Number(s.stock || 0),
        })),
        discountPercent: Number(discountPercent || 0),
        deliveryDays: deliveryDays ? Number(deliveryDays) : null, // ✅ SAVE
        images: imgs,
        visible: String(visible) === "true",
      });

      res.status(201).json({ message: "Product created", product });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// PUT /api/admin/products/:id
router.put(
  "/products/:id",
  auth,
  adminOnly,
  productUpload.array("newImages", 10),
  async (req, res) => {
    try {
      const {
        title,
        details,
        categories,
        sizes,
        discountPercent,
        deliveryDays,
        visible,
        removeImageUrls,
      } = req.body;

      const existing = await Product.findById(req.params.id);
      if (!existing) return res.status(404).json({ message: "Not found" });

      const cat =
        typeof categories === "string"
          ? JSON.parse(categories || "[]")
          : categories;
      const sz = typeof sizes === "string" ? JSON.parse(sizes || "[]") : sizes;
      const remove =
        typeof removeImageUrls === "string"
          ? JSON.parse(removeImageUrls || "[]")
          : removeImageUrls || [];

      let images = existing.images.slice();
      if (Array.isArray(remove) && remove.length) {
        for (const rel of remove) {
          images = images.filter((i) => i !== rel);
          safeUnlinkByRelUrl(rel, req.app?.locals?.UPLOAD_DIRS?.PRODUCT_DIR);
        }
      }

      if (req.files?.length) {
        images.push(...req.files.map((f) => `/uploads/products/${f.filename}`));
      }

      const update = {};
      if (typeof title === "string") update.title = title.trim();
      if (typeof details === "string") update.details = details;
      if (Array.isArray(cat)) update.categories = cat;
      if (Array.isArray(sz)) {
        update.sizes = sz.map((s) => ({
          label: s.label,
          price: Number(s.price),
          stock: Number(s.stock || 0),
        }));
      }
      if (discountPercent !== undefined)
        update.discountPercent = Number(discountPercent);
      if (deliveryDays !== undefined) {
        update.deliveryDays = deliveryDays ? Number(deliveryDays) : null; // ✅ UPDATE
      }
      if (visible !== undefined) update.visible = String(visible) === "true";
      update.images = images;

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: update },
        { new: true }
      );
      res.json({ message: "Product updated", product });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// DELETE /api/admin/products/:id
router.delete("/products/:id", auth, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ message: `Product with ID ${req.params.id} not found` });

    if (Array.isArray(product.images)) {
      product.images.forEach((rel) =>
        safeUnlinkByRelUrl(rel, req.app?.locals?.UPLOAD_DIRS?.PRODUCT_DIR)
      );
    }
    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (e) {
    console.error("Delete error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
