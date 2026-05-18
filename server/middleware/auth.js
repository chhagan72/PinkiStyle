// middleware/auth.js
const jwt = require("jsonwebtoken");
require("dotenv").config(); // safe to run; server already loads .env but this keeps file self-contained

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

function auth(req, res, next) {
  try {
    // support Authorization: Bearer <token> or x-access-token
    const header = req.headers.authorization || req.headers["x-access-token"] || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : header || null;
    if (!token) return res.status(401).json({ message: "Missing token" });

    const decoded = jwt.verify(token, JWT_SECRET);

    // token payloads vary. support common variants:
    const userId = decoded.id || decoded.userId || decoded._id;
    if (!userId) return res.status(401).json({ message: "Invalid token (no user id)" });

    // attach both for compatibility with existing code
    req.userId = userId;
    req.userRole = decoded.role || decoded.userRole || "user";
    req.user = { _id: req.userId, role: req.userRole };

    next();
  } catch (e) {
    console.error("Auth middleware error:", e.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = auth;
