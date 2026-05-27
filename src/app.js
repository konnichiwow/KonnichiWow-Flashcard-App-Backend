import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";
import "./config/firebase.js";
import "./config/nodemailer.js";
import auth from "./routes/auth.js";
import cookieParser from "cookie-parser";

import cardsRoutes from "./routes/cards.js";
import userRoutes from "./routes/user.js";

dotenv.config();

const app = express();

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        console.warn("[cors] Blocked origin:", origin);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "konnichiwow-api" });
});

app.use("/api/auth", auth);
app.use("/api/cards", cardsRoutes);
app.use("/api/user", userRoutes);

app.use((err, req, res, next) => {
  console.error("[server]", err?.message || err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: "Server error" });
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
}

start();
