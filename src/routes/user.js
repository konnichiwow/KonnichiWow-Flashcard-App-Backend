import express from "express";

import { stars } from "../controllers/User.controller";
import asyncHandler from "../utils/asyncHandler";

const router = express.Router();

router.get("/stars", asyncHandler(stars));

export default router;