import { createUser , signInUser, refreshTokenController, logOutController, googleSignIn, setPhoneNumberController, userDetailsController} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import express from "express";

const router = express.Router();

router.post('/register', createUser);
router.post('/login', signInUser); 

router.get('/me', authMiddleware , userDetailsController);

router.post('/refresh', refreshTokenController);
router.post('/logout', authMiddleware, logOutController);
router.post('/google', googleSignIn);
router.patch('/setPhoneNumber', authMiddleware, setPhoneNumberController);

export default router;