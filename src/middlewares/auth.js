import {auth} from "../config/firebase.js";

export const authMiddleware = async (req,res,next)=>{
    try{
        const token = req.cookies.accessToken;
        if(!token) return res.status(401).json({error : "No accessToken provided"});

        const userdata = await auth.verifyIdToken(token);
        //console.log(userdata);
        req.user = userdata;
        next();
    }
    catch(e){
        console.log(e);
        return res.status(401).json({error:"Invalid or expired token"});
    }
}
