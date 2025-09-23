import express from "express";

import {
  cards,
  kanji,
  vocabulary,
  star,
  addCard,
  addBulkCards,
} from "../controllers/Cards.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.get("/kanji", asyncHandler(kanji));
router.get("/vocabulary", asyncHandler(vocabulary));
router.post("/star/:id", authMiddleware, asyncHandler(star));
router.delete("/star/:id", authMiddleware, asyncHandler(star));
router.get("/:id", asyncHandler(cards));
router.post("/addCard", addCard);
router.post("/bulk", addBulkCards);

export default router;
