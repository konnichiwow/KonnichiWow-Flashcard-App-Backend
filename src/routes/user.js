import express from "express";

import { stars } from "../controllers/User.controller.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.get("/stars", asyncHandler(stars));

export default router; 