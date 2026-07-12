const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const sequelize = require("./config/db");

dotenv.config();

const app = express();

const allowedOrigins = [
  "https://kapato.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin || true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("KAPATO Backend is Running!");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/health/db", async (req, res) => {
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({
      status: "error",
      db: "DATABASE_URL is not set on Vercel",
    });
  }

  try {
    await sequelize.authenticate();
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", db: err.message });
  }
});

let isDbConnected = false;

const ensureDb = async (req, res, next) => {
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({
      error: "Database connection failed",
      message: "DATABASE_URL is not set on Vercel",
    });
  }

  if (isDbConnected) {
    return next();
  }

  try {
    await sequelize.authenticate();
    isDbConnected = true;
    next();
  } catch (err) {
    console.error("Database connection failed:", err);
    res.status(500).json({
      error: "Database connection failed",
      message: err.message,
    });
  }
};

app.use("/api/products", ensureDb, require("./routes/products"));

module.exports = app;
