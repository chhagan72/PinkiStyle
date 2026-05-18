// models/Order.js
const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
  requestedAt: { type: Date, default: Date.now },
  repaymentDetails: {
    upiId: String,
    bankName: String,
    accountNumber: String,
    ifsc: String,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  processedAt: Date,
  adminNote: String,
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      title: String,
      size: { label: String, price: Number, discountPercent: Number },
      quantity: { type: Number, default: 1 },
    },
  ],
  amount: { type: Number, required: true }, // stored in paise
  currency: { type: String, default: 'INR' },
  address: {
    name: String,   // ✅ Added name field here
    line1: String,
    city: String,
    state: String,
    pincode: String,
    mobile: String,
  },
  paymentMethod: { type: String, enum: ['RAZORPAY', 'COD'], required: true },
  razorpay: {
    orderId: String,
    paymentId: String,
    signature: String,
  },
  paid: { type: Boolean, default: false },

  // statuses: created -> payment_pending -> paid / processing / cod / shipped / cancelled
  status: {
    type: String,
    enum: ['created', 'payment_pending', 'processing', 'paid', 'cod', 'shipped', 'cancelled', 'returned'],
    default: 'created',
  },

  // track attempts to open checkout
  paymentAttempts: { type: Number, default: 0 },

  // cancellation info (if user cancels order)
  cancellation: {
    reason: String,
    comment: String,
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancelledAt: Date,
  },
  refund: refundSchema,
  estimatedDeliveryDays: { type: Number }, // integer days
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
