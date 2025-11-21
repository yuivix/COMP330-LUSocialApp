// backend/src/app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db/connection"); // ✅ add this line
const reviewsRoutes = require("./modules/reviews/routes");

const authRoutes = require("./modules/auth/routes");
const profileRoutes = require("./modules/profiles/routes");
const listingRoutes = require("./modules/listings/routes");
const searchRoutes = require("./modules/search/routes");
const bookingRoutes = require("./modules/bookings/routes");

const app = express();

app.use(
  cors({
    origin: [
      "https://lututor-app.vercel.app",
      "https://lu-tutor-app.vercel.app",
      "https://lututor-app.vercel.app", // redundant but safe
      "http://localhost:3000",
      "http://localhost:5173", // if using Vite
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use("/reviews", reviewsRoutes);

// ✅ Health check (supports both /health and /healthz)
app.get(["/health", "/healthz"], async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS now");
    res.json({ ok: true, time: result.rows[0].now });
  } catch (err) {
    console.error("Health check failed:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/", (_req, res) => {
  res.json({ ok: true, service: "LU-Tutor API", version: "Cycle 2" });
});

// Mount module routers
app.use("/auth", authRoutes);
app.use("/profiles", profileRoutes);
app.use("/listings", listingRoutes);
app.use("/search", searchRoutes);
app.use("/bookings", bookingRoutes);

// Basic 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found", path: req.originalUrl });
});

// Error handler (must be last)
app.use(require("./middleware/errorHandler"));

module.exports = app;
