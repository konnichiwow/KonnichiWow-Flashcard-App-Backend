import { createUser , signInUser} from "../controllers/auth.js";
import { authMiddleware } from "../middlewares/auth.js";
import express from "express";

const router = express.Router();

router.post('/register', createUser);
router.post('/login', signInUser);

//dummy route to test authMiddleware.
router.post('/try', authMiddleware , (req,res)=>{
    return res.status(200).json({message : "successfully reached here"});
})

export default router;