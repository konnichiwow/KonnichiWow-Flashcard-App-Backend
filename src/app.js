import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import cardsRoutes from "./routes/cards.js";
import userRoutes from "./routes/user.js";

const app = express();
app.use(express.json());
dotenv.config();

app.use("/api/cards", cardsRoutes);
app.use("/api/user", userRoutes);

connectDB();

app.get("/", (req, res) => {
  res.send("Hello world");
});

console.log(process.env.MONGO_URI);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
