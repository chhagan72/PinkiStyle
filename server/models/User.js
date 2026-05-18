// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  mobile: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  address: String,
  password: String,
  avatarUrl: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
