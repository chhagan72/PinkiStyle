// routes/orders.js
const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

const auth = require('../middleware/auth'); // must provide req.userId

const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const RAZOR_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZOR_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const DEFAULT_SHIPPING_DAYS = Number(process.env.DEFAULT_SHIPPING_DAYS || 5);

const razorpay = new Razorpay({
  key_id: RAZOR_KEY_ID,
  key_secret: RAZOR_KEY_SECRET,
});

// helper to compute estimated delivery days
async function computeDeliveryDays(items) {
  const productIds = items.map(i => i.productId);
  const prods = await Product.find({ _id: { $in: productIds } });
  let days = DEFAULT_SHIPPING_DAYS;
  for (const it of items) {
    const p = prods.find(x => x._id.equals(it.productId));
    if (p && p.deliveryDays) {
      days = Math.max(days, p.deliveryDays);
    }
  }
  return days;
}

// Create an order (Razorpay order or COD)
router.post('/create', auth, async (req, res) => {
  try {
    const { items, address, paymentMethod } = req.body;
    const userId = req.userId || (req.user && req.user._id);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    if (!items || !items.length) return res.status(400).json({ error: 'No items' });

    // compute amount in paise
    let amountINR = 0;
    for (const it of items) {
      const price = Number(it.size?.price || 0);
      amountINR += price * (it.quantity || 1);
    }
    const amountPaise = Math.round(amountINR * 100);

    const estDays = await computeDeliveryDays(items);

    // Create DB order. For ONLINE we set status to payment_pending.
    const orderDoc = await Order.create({
      userId,
      items,
      amount: amountPaise,
      currency: 'INR',
      address,
      paymentMethod: paymentMethod === 'COD' ? 'COD' : 'RAZORPAY',
      estimatedDeliveryDays: estDays,
      paid: false,
      status: paymentMethod === 'COD' ? 'cod' : 'payment_pending',
      paymentAttempts: 0,
    });

    if (paymentMethod === 'COD') {
      return res.json({ ok: true, order: orderDoc });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: String(orderDoc._id),
      payment_capture: 1, // auto-capture
    });

    // store razorpay order id and increment attempts
    orderDoc.razorpay = { orderId: razorpayOrder.id };
    orderDoc.paymentAttempts = (orderDoc.paymentAttempts || 0) + 1;
    await orderDoc.save();

    res.json({
      ok: true,
      razorpayOrderId: razorpayOrder.id,
      orderId: orderDoc._id,
      amount: amountPaise,
      keyId: RAZOR_KEY_ID,
    });
  } catch (err) {
    console.error('create order error', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// Verify payment signature (after Checkout success)
router.post('/verify', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const generated_signature = crypto
      .createHmac('sha256', RAZOR_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ ok: false, error: 'Invalid signature' });
    }

    // mark order paid
    order.paid = true;
    order.status = 'paid';
    order.razorpay = {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    };
    await order.save();

    res.json({ ok: true, order });
  } catch (err) {
    console.error('verify error', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// === NEW: create a Razorpay order for an existing DB order (reopen payment) ===
router.post('/pay/:orderId', auth, async (req, res) => {
  try {
    const userId = req.userId || (req.user && req.user._id);
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (String(order.userId) !== String(userId)) return res.status(403).json({ error: 'Forbidden' });
    if (order.paid) return res.status(400).json({ error: 'Order already paid' });

    // Create new razorpay order for this DB order
    const razorpayOrder = await razorpay.orders.create({
      amount: order.amount,
      currency: order.currency || 'INR',
      receipt: String(order._id),
      payment_capture: 1,
    });

    order.razorpay = { orderId: razorpayOrder.id };
    order.status = 'payment_pending';
    order.paymentAttempts = (order.paymentAttempts || 0) + 1;
    await order.save();

    res.json({
      ok: true,
      razorpayOrderId: razorpayOrder.id,
      orderId: order._id,
      amount: order.amount,
      keyId: RAZOR_KEY_ID,
    });
  } catch (err) {
    console.error('pay error', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// === NEW: called when user closes/dismisses the Razorpay modal (optional handling) ===
router.post('/payment-dismiss/:orderId', auth, async (req, res) => {
  try {
    const userId = req.userId || (req.user && req.user._id);
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (String(order.userId) !== String(userId)) return res.status(403).json({ error: 'Forbidden' });

    // set status back to processing (or keep payment_pending if you prefer)
    order.status = 'processing';
    order.paymentAttempts = (order.paymentAttempts || 0) + 1;
    await order.save();

    res.json({ ok: true, order });
  } catch (err) {
    console.error('payment-dismiss error', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// === NEW: Cancel an order with a reason (user cancels order intentionally) ===

router.post('/cancel/:orderId', auth, async (req, res) => {
  try {
    const userId = req.userId || (req.user && req.user._id);
    const { orderId } = req.params;
    const { reason, comment, repayment } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (String(order.userId) !== String(userId))
      return res.status(403).json({ error: 'Forbidden' });

    // If already cancelled, prevent multiple cancels
    if (order.status === 'cancelled') {
      return res.status(400).json({ error: 'Order already cancelled' });
    }

    // Handle refund data if paid
    if (order.paid) {
      order.refund = {
        requestedAt: new Date(),
        repaymentDetails: repayment || {},
        status: 'pending', // admin can later mark refunded
      };
    }

    order.status = 'cancelled';
    order.cancellation = {
      reason: reason || 'User cancelled',
      comment: comment || '',
      cancelledBy: userId,
      cancelledAt: new Date(),
    };

    await order.save();

    res.json({ ok: true, order });
  } catch (err) {
    console.error('cancel error', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// Get logged-in user's orders
router.get('/my', auth, async (req, res) => {
  try {
    const userId = req.userId || (req.user && req.user._id);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate('items.productId', 'title images discountPercent deliveryDays');

    res.json({ ok: true, orders });
  } catch (err) {
    console.error('fetch my orders error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ NEW: Get single order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const userId = req.userId || (req.user && req.user._id);
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('items.productId', 'title images discountPercent deliveryDays');

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (String(order.userId) !== String(userId))
      return res.status(403).json({ error: 'Forbidden' });

    res.json({ ok: true, order });
  } catch (err) {
    console.error('get order error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
