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

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// preflight 
app.options('*', cors());

app.use(express.json());
app.use(cookieParser());

connectDB();

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.use("/api/auth", auth);
app.use("/api/cards", cardsRoutes);
app.use("/api/user", userRoutes);

console.log(process.env.MONGO_URI);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
