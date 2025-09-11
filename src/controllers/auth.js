import { auth } from "../config/firebase.js";
import User from "../models/user.js";

/**
 * Create a new user
 * Steps:
 * 1. Validate input
 * 2. Check if user exists in MongoDB
 * 3. Create user in Firebase Auth
 * 4. Save minimal user info in MongoDB
 * 5. Return success response
 */
export const createUser = async (req, res) => {
  try {
    const{ email, password, name}= req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password and name are required" });
    }
    const existingUser = await User.findOne({ email });
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
    console.error("Error creating user:", e);
    res.status(500).json({ error: "Server error" });
  }
};
