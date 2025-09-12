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

     res.cookie("accessToken",idToken,{
      httpOnly: true,
      secure: false, //for now
      sameSite: "strict",
      maxAge: parseInt(expiresIn) * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
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