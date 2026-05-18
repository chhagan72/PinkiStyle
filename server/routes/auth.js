// routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const multer = require("multer");
require("dotenv").config({ path: "./.env" });
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

const User = require("../models/User");
const auth = require("../middleware/auth");

// register
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, mobile, email, address, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      firstName,
      lastName,
      mobile,
      email,
      address,
      password: hashedPassword,
    });
    res.status(201).json({ message: "User registered successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// login
router.post("/login", async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }],
    });

    if (!user) return res.status(400).json({ message: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    // determine role using app-level admin lists if available
    const adminEmails = req.app?.locals?.ADMIN_EMAILS || [];
    const adminMobiles = req.app?.locals?.ADMIN_MOBILES || [];

    let role = "user";
    if (
      (user.email && adminEmails.includes(user.email)) ||
      (user.mobile && adminMobiles.includes(user.mobile))
    ) {
      role = "admin";
    }

    const token = jwt.sign({ id: user._id, role }, JWT_SECRET, {
      expiresIn: "365d",
    });
    res.json({
      message: "Login successful",
      token,
      role,
      user: { ...user.toObject(), password: undefined },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// get my profile
router.get("/me", auth, async (req, res) => {
  try {
    const u = await User.findById(req.userId).select("-password");
    if (!u) return res.status(404).json({ message: "User not found" });
    res.json(u);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// update profile (firstName,lastName,address)
router.put("/me", auth, async (req, res) => {
  try {
    const { firstName, lastName, address } = req.body;
    const update = {};
    if (typeof firstName === "string") update.firstName = firstName;
    if (typeof lastName === "string") update.lastName = lastName;
    if (typeof address === "string") update.address = address;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: update },
      { new: true }
    ).select("-password");
    res.json({ message: "Profile updated", user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// avatar upload
const AVATAR_DIR = (req, res, next) => req.app?.locals?.UPLOAD_DIRS?.AVATAR_DIR;
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(
      null,
      AVATAR_DIR(req) || path.join(__dirname, "..", "uploads", "avatars")
    ),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".png";
    cb(null, `${req.userId}_${Date.now()}${ext}`);
  },
});
const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype);
    cb(ok ? null : new Error("Only image files are allowed"), ok);
  },
});

router.post(
  "/me/avatar",
  auth,
  avatarUpload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: "No file uploaded" });
      const relPath = `/uploads/avatars/${req.file.filename}`;
      const user = await User.findByIdAndUpdate(
        req.userId,
        { $set: { avatarUrl: relPath } },
        { new: true }
      ).select("-password");
      res.json({ message: "Avatar uploaded", user });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
