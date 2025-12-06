// backend/src/app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db/connection");

// Import routes
const authRoutes = require("./modules/auth/routes");
const profileRoutes = require("./modules/profiles/routes");
const listingRoutes = require("./modules/listings/routes");
const searchRoutes = require("./modules/search/routes");
const bookingRoutes = require("./modules/bookings/routes");
const reviewsRoutes = require("./modules/reviews/routes");

const app = express();

/* ------------------------------------------------------
   CORS — SIMPLE, PROFESSOR-FRIENDLY, LOCAL + PROD SAFE
------------------------------------------------------- */
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:5173",
      "https://lututor-app.vercel.app",
      "https://lu-tutor-app.vercel.app",
    ],
    credentials: true,
  })
);

// Handle preflight OPTIONS requests (required)
app.options("*", cors());

/* ------------------------------------------------------
   Middleware
------------------------------------------------------- */
app.use(express.json());

/* ------------------------------------------------------
   Health Check — required for Render + professor
------------------------------------------------------- */
app.get(["/health", "/healthz"], async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS now");
    res.json({ ok: true, time: result.rows[0].now });
  } catch (err) {
    console.error("Health check failed:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* ------------------------------------------------------
   Root endpoint
------------------------------------------------------- */
app.get("/", (_req, res) => {
  res.json({ ok: true, service: "LU-Tutor API", version: "Cycle 2" });
});

/* ------------------------------------------------------
   Mount all module routers
------------------------------------------------------- */
app.use("/auth", authRoutes);
app.use("/profiles", profileRoutes);
app.use("/listings", listingRoutes);
app.use("/search", searchRoutes);
app.use("/bookings", bookingRoutes);
app.use("/reviews", reviewsRoutes);

/* ------------------------------------------------------
   404 Handler
------------------------------------------------------- */
app.use((req, res) => {
  res.status(404).json({ error: "Not found", path: req.originalUrl });
});

/* ------------------------------------------------------
   Global Error Handler (MUST BE LAST)
------------------------------------------------------- */
app.use(require("./middleware/errorHandler"));

module.exports = app;
