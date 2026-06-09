require("dotenv").config({ override: true });

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const connectDB = require("./src/config/db");
const { configureCloudinary } = require("./src/config/cloudinary");

// Route imports
const authRoutes = require("./src/routes/authRoutes");
const memoryRoutes = require("./src/routes/memoryRoutes");
const mediaRoutes = require("./src/routes/mediaRoutes");
const recoveryRoutes = require("./src/routes/recoveryRoutes");

// ─── App Init ────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

// ─── Connect Services ─────────────────────────────────────────────────────────
connectDB();
configureCloudinary();

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🎶 EchOes API is alive.",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/recovery", recoveryRoutes);
app.use("/api/v1/memories", memoryRoutes);
app.use("/api/v1/media", mediaRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("🔥 Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error.",
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🎵 EchOes API running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`❤️  Health: http://localhost:${PORT}/api/v1/health\n`);
});