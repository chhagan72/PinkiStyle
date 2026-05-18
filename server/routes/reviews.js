// routes/reviews.js
const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const Product = require("../models/Product");

const reviewStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir =
      req.app?.locals?.UPLOAD_DIRS?.REVIEW_DIR ||
      path.join(__dirname, "..", "uploads", "reviews");
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".png";
    cb(null, `r_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const reviewUpload = multer({
  storage: reviewStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype);
    cb(ok ? null : new Error("Only image files are allowed"), ok);
  },
});

router.post(
  "/products/:id/reviews",
  reviewUpload.array("images", 5),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product)
        return res.status(404).json({ message: "Product not found" });

      const review = {
        user: req.body.user || "Anonymous",
        rating: Number(req.body.rating),
        comment: req.body.comment,
        images: req.files
          ? req.files.map((f) => `/uploads/reviews/${f.filename}`)
          : [],
      };

      product.reviews.push(review);
      await product.save();

      res.json({ message: "Review added", product });
    } catch (err) {
      console.error("Review error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
