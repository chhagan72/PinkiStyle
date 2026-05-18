// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    details: { type: String, default: "" },
    categories: [{ type: String, trim: true }],
    sizes: [
      {
        label: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        stock: { type: Number, default: 0, min: 0 },
        _id: false,
      },
    ],
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    deliveryDays: { type: Number, default: null },
    images: [{ type: String }],
    visible: { type: Boolean, default: true },
    reviews: [
      {
        user: { type: String, required: true },
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String, required: true },
        images: [{ type: String }],
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
