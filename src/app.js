import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import "./config/firebase.js"; 
import auth from "./routes/auth.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser());
dotenv.config();

connectDB();

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.use('/api/auth', auth);

console.log(process.env.MONGO_URI);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
