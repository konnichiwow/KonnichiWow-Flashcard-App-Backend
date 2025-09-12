import { createUser , signInUser} from "../controllers/auth.js";
import express from "express";

const router = express.Router();

router.post('/register', createUser);
router.post('/login', signInUser);

export default router;