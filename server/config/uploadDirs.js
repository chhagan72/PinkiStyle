// config/uploadDirs.js
const path = require('path');
const fs = require('fs');

const BASE = path.join(__dirname, '..', 'uploads');
const AVATAR_DIR = path.join(BASE, 'avatars');
const PRODUCT_DIR = path.join(BASE, 'products');
const REVIEW_DIR  = path.join(BASE, 'reviews');

function initUploadDirs() {
  fs.mkdirSync(AVATAR_DIR, { recursive: true });
  fs.mkdirSync(PRODUCT_DIR, { recursive: true });
  fs.mkdirSync(REVIEW_DIR, { recursive: true });
}

module.exports = {
  BASE, AVATAR_DIR, PRODUCT_DIR, REVIEW_DIR, initUploadDirs
};
