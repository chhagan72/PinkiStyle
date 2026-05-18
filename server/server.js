// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: './.env' });

// Admin identifiers (edit as you like)
const ADMIN_EMAILS = ['chhagankumarkumawat1212@gmail.com'];
const ADMIN_MOBILES = ['7232083504'];

const app = express();
const PORT = process.env.PORT || 5000;

// Upload dirs
const UPLOAD_BASE = path.join(__dirname, 'uploads');
const AVATAR_DIR = path.join(UPLOAD_BASE, 'avatars');
const PRODUCT_DIR = path.join(UPLOAD_BASE, 'products');
const REVIEW_DIR = path.join(UPLOAD_BASE, 'reviews');
fs.mkdirSync(AVATAR_DIR, { recursive: true });
fs.mkdirSync(PRODUCT_DIR, { recursive: true });
fs.mkdirSync(REVIEW_DIR, { recursive: true });

// Make the upload paths accessible
app.use('/uploads', express.static(UPLOAD_BASE));

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// attach config to app locals so routes can access them (like admin lists)
app.locals.ADMIN_EMAILS = ADMIN_EMAILS;
app.locals.ADMIN_MOBILES = ADMIN_MOBILES;
app.locals.UPLOAD_DIRS = { AVATAR_DIR, PRODUCT_DIR, REVIEW_DIR };

// DB connect
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pinkiStyle';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected')).catch(err => {
  console.error('MongoDB connection error:', err.message);
  process.exit(1);
});

// route imports
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const adminProductRoutes = require('./routes/adminProducts');
const reviewRoutes = require('./routes/reviews');
const ordersRoutes = require('./routes/orders');

// mount routes
app.use('/api', authRoutes);              // /api/register, /api/login, /api/me, /api/me/avatar
app.use('/api', productRoutes);           // /api/products, /api/products/:id
app.use('/api/admin', adminProductRoutes);// /api/admin/products ...
app.use('/api', reviewRoutes);            // /api/products/:id/reviews
app.use('/api/orders', ordersRoutes); // order create/verify endpoints

// optional simple health route
app.get('/', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'development' }));

// seed admin user if enabled (same logic as before)
const bcrypt = require('bcryptjs');
const User = require('./models/User');
(async () => {
  try {
    if (process.env.SEED_ADMIN === 'true') {
      const exists = await User.findOne({
        $or: [
          { email: { $in: ADMIN_EMAILS } },
          { mobile: { $in: ADMIN_MOBILES } },
        ],
      });
      if (!exists) {
        const pwd = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@123';
        const hashed = await bcrypt.hash(pwd, 10);
        await User.create({
          firstName: 'Chhagan',
          lastName: 'Kumawat',
          email: ADMIN_EMAILS[0],
          mobile: ADMIN_MOBILES[0],
          address: '',
          password: hashed,
          avatarUrl: '',
        });
        console.log('Seeded default admin user with password:', pwd);
      }
    }
  } catch (e) {
    console.error('Admin seed failed:', e.message);
  }
})();

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
