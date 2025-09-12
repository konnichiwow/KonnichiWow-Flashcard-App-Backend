import express from "express";

import { cards, kanji, vocabulary, star } from "../controllers/Cards.controller.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.get("/:id", asyncHandler(cards));
router.get("/kanji", asyncHandler(kanji));
router.get("/vocabulary", asyncHandler(vocabulary));
router.post("/star/:id", asyncHandler(star));
router.delete("/star/:id", asyncHandler(star));

export default router;