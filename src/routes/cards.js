import express from "express";

import {
  cards,
  kanji,
  vocabulary,
  star,
  addCard,
  addBulkCards,
  deleteAllCards,
} from "../controllers/Cards.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

// --- Card Retrieval Routes ---
router.get("/kanji", asyncHandler(kanji));
router.get("/vocabulary", asyncHandler(vocabulary));
router.get("/:id", asyncHandler(cards));

// --- User Interaction Routes ---
// Chaining .post and .delete is a clean way to handle the same URL
router
  .route("/star/:id")
  .post(authMiddleware, asyncHandler(star))
  .delete(authMiddleware, asyncHandler(star));

// --- Card Creation & Deletion Routes ---
router.post("/add", authMiddleware, asyncHandler(addCard)); 
router.post("/bulk", authMiddleware, asyncHandler(addBulkCards)); 
router.delete("/all", authMiddleware, asyncHandler(deleteAllCards)); 

export default router;
