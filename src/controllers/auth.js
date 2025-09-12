import { auth } from "../config/firebase.js";
import axios from "axios";
import User from "../models/user.js";

export const createUser = async (req, res) => {
  /* This controller is used by the register route.*/
  /* This controller expects email , password and name in the body*/
  try {
    const{ email, password, name}= req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password and name are required" });
    }
    const existingUser = await User.findOne({ email:email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    //Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });
    console.log(userRecord.uid);
    //save it in DB
    const newUser = await User.create({
      firebaseUID: userRecord.uid,
      email,
      name,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
      },
    });

  } 
  catch(e){
    console.log(`Error creating user: ${e}`);
    res.status(500).json({ error: "Server error" });
  }
};

export const signInUser = async (req,res) => {
  try{
    const {email, password} = req.body;
    //make checks if data is given properly
    if(!email){
      return res.status(400).json({error : "No email received"});
    }
    if(!password){
      return res.status(400).json({error : "No password received"});
    }
    //query our db to see if this user exists or not
    const user = await User.findOne({email:email});
    if(!user){
      return res.status(404).json({error : "User email not found. Please signup first"});
    }

    //sign the user in
    const firebaseRes = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      { email, password, returnSecureToken: true }
    );

    const {idToken,refreshToken,expiresIn} = firebaseRes.data;

    //now lets set the cookies
    //console.log(expiresIn);//check how long :-> 1 hour
    res.cookie("accessToken",idToken,{
      httpOnly: true,
      secure: false, //for now
      sameSite: "strict",
      path:"/",
      maxAge: parseInt(expiresIn) * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path:"/",
      maxAge: 7 * 24 * 60 * 60 * 1000, //refresh token remains valid on client for 7 days
    });

    return res.status(200).json({ message : "Login succesful" , user : {email : user.email, name : user.name}});
  }
  catch(e){
    const err = e.response?.data?.error?.message;

    if(err === "INVALID_LOGIN_CREDENTIALS"){
      //most common error to be expected
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if(err === "USER_DISABLED"){
      return res.status(403).json({ error: "User account disabled" });
    }

    console.log(`Error in signing in user :`,JSON.stringify(e.response?.data, null, 2) || e.message);
    return res.status(500).json({ error: "Server Error" });
  }
}

export const refreshTokenController = async (req,res)=>{
  try{
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken){
      return res.status(400).json({error : "No refresh token found"});
    }

    const response = await axios.post(
      `https://securetoken.googleapis.com/v1/token?key=${process.env.FIREBASE_API_KEY}`,
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }
    );

    const { id_token: newIdToken, refresh_token: newRefreshToken, expires_in } = response.data;

    //Set the new cookies
    res.cookie("accessToken", newIdToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path : "/",
      maxAge: parseInt(expires_in) * 1000 // convert seconds to ms
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path:"/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days validity for refreshToken
    });
    return res.status(200).json({message:"Token refreshed successfully"});

  }
  catch(e){
    const err = e.response?.data?.error?.message;
    if(err==="INVALID_REFRESH_TOKEN"){
      return res.status(401).json({error:"invalid refresh token"});
    }
    console.log(err||e.message);
    return res.status(500).json({error:"Server Error"});
  }
}


export const logOutController = async (req,res)=>{
  try{
    const uid = req.user.uid;
    res.clearCookie("accessToken", {path : "/"});
    res.clearCookie("refreshToken", {path: "/"});
    await auth.revokeRefreshTokens(uid);
    res.status(200).json({message:"Logged User Out Successfully"});
  }
  catch(e){
    console.log(`Error in logging out a user : ${e} `);
    return res.status(500).json({error:"Server Error"});
  }
}