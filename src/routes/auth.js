import { createUser , signInUser, refreshTokenController, logOutController} from "../controllers/auth.js";
import { authMiddleware } from "../middlewares/auth.js";
import express from "express";

const router = express.Router();

router.post('/register', createUser);
router.post('/login', signInUser);

router.post('/me', authMiddleware , (req,res)=>{
    return res.status(200).json({userDetails : req.user});
});

router.post('/refresh', refreshTokenController);
router.post('/logout', authMiddleware, logOutController);

export default router;