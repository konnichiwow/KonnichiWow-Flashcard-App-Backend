import { auth } from "../config/firebase.js";
import axios from "axios";
import User from "../models/Users.js";
import transporter from "../config/nodemailer.js";

const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return false;
  return /^\d+$/.test(phoneNumber);
};

function sessionPayload(userDoc) {
  return {
    email: userDoc.email,
    name: userDoc.name,
    uid: userDoc.firebaseUID,
  };
}

function setSessionCookies(res, idToken, expiresInSeconds = 3600) {
  res.cookie("accessToken", idToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    path: "/",
    maxAge: parseInt(expiresInSeconds, 10) * 1000,
  });
}

export const createUser = async (req, res) => {
  try {
    const { token, name, phone } = req.body;

    if (token) {
      const decoded = await auth.verifyIdToken(token);
      const email = decoded.email;
      if (!email) {
        return res.status(400).json({ error: "Token missing email claim" });
      }
      if (!name || !phone) {
        return res.status(400).json({ error: "Name and phone number are required" });
      }
      const phoneNumber = String(phone).trim();
      if (phoneNumber.length !== 10 || !validatePhoneNumber(phoneNumber)) {
        return res.status(400).json({
          error: "Phone number must be exactly 10 digits (numbers only)",
        });
      }
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          error: "An account with this email already exists. Please sign in.",
        });
      }
      const newUser = await User.create({
        firebaseUID: decoded.uid,
        email,
        name,
        isProfileComplete: true,
        phoneNumber,
      });
      setSessionCookies(res, token);
      return res.status(201).json({
        message: "User created successfully",
        token,
        user: sessionPayload(newUser),
      });
    }

    const { email, password, name: legacyName, phone: legacyPhone } = req.body;
    if (!email || !password || !legacyName || !legacyPhone) {
      return res.status(400).json({
        error: "Email, password, name and phone-number are required",
      });
    }
    const phoneNumber = String(legacyPhone).trim();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    if (phoneNumber.length !== 10 || !validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({ error: "Invalid Phone Number" });
    }
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: legacyName,
    });
    const newUser = await User.create({
      firebaseUID: userRecord.uid,
      email,
      name: legacyName,
      isProfileComplete: true,
      phoneNumber,
    });
    return res.status(201).json({
      message: "User created successfully",
      user: sessionPayload(newUser),
    });
  } catch (e) {
    if (e?.code === 11000) {
      return res.status(400).json({
        error: "An account with this email already exists. Please sign in.",
      });
    }
    if (e?.code?.startsWith?.("auth/")) {
      console.log(`Error creating user (Firebase): ${e.code} ${e.message}`);
      return res.status(401).json({
        error: "Session expired or invalid. Close the tab and try signing up again.",
      });
    }
    if (e?.name === "MongoServerError" || e?.name === "MongooseError") {
      console.log(`Error creating user (MongoDB): ${e.message}`);
      return res.status(503).json({
        error: "Database is not ready. Wait a moment and try again.",
      });
    }
    console.log(`Error creating user: ${e?.message || e}`);
    res.status(500).json({ error: "Server error" });
  }
};

export const signInUser = async (req, res) => {
  try {
    const { token, email, password } = req.body;

    if (token) {
      const decoded = await auth.verifyIdToken(token);
      let user = await User.findOne({ email: decoded.email });
      if (!user) {
        user = await User.create({
          firebaseUID: decoded.uid,
          email: decoded.email,
          name: decoded.name || decoded.email?.split("@")[0],
          isProfileComplete: false,
        });
      }
      setSessionCookies(res, token);
      return res.status(200).json({
        message: "Login successful",
        token,
        user: sessionPayload(user),
      });
    }

    if (!email) {
      return res.status(400).json({ error: "No email received" });
    }
    if (!password) {
      return res.status(400).json({ error: "No password received" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        error: "User email not found. Please signup first",
      });
    }

    const firebaseRes = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      { email, password, returnSecureToken: true }
    );

    const { idToken, refreshToken, expiresIn } = firebaseRes.data;

    res.cookie("accessToken", idToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
      maxAge: parseInt(expiresIn, 10) * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login succesful",
      token: idToken,
      user: sessionPayload(user),
    });
  } catch (e) {
    const err = e.response?.data?.error?.message;

    if (err === "INVALID_LOGIN_CREDENTIALS") {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (err === "USER_DISABLED") {
      return res.status(403).json({ error: "User account disabled" });
    }

    console.log(
      `Error in signing in user :`,
      JSON.stringify(e.response?.data, null, 2) || e.message
    );
    return res.status(500).json({ error: "Server Error" });
  }
};

export const refreshTokenController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({ error: "No refresh token found" });
    }

    const response = await axios.post(
      `https://securetoken.googleapis.com/v1/token?key=${process.env.FIREBASE_API_KEY}`,
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const {
      id_token: newIdToken,
      refresh_token: newRefreshToken,
      expires_in,
    } = response.data;

    res.cookie("accessToken", newIdToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
      maxAge: parseInt(expires_in, 10) * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      message: "Token refreshed successfully",
      token: newIdToken,
    });
  } catch (e) {
    const err = e.response?.data?.error?.message;
    if (err === "INVALID_REFRESH_TOKEN") {
      return res.status(401).json({ error: "invalid refresh token" });
    }
    console.log(err || e.message);
    return res.status(500).json({ error: "Server Error" });
  }
};

export const userDetailsController = async (req, res) => {
  try {
    const userdoc = await User.findOne({ email: req.user.email });
    return res.status(200).json({
      userFirebaseDetails: req.user,
      phoneNumber: userdoc?.phoneNumber,
    });
  } catch (e) {
    console.log(
      `Error : User is signed in yet unable to query their user document : ${e.message}`
    );
    return res.status(500).json({ error: "Server Error" });
  }
};

export const forgotPasswordController = async (req, res) => {
  const email = req.body.email;
  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    await auth.getUserByEmail(email);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const firebaseLink = await auth.generatePasswordResetLink(email, {
      url: `${frontendUrl}/reset-password`,
      handleCodeInApp: true,
    });

    const parsed = new URL(firebaseLink);
    const oobCode = parsed.searchParams.get("oobCode");
    const resetLink = oobCode
      ? `${frontendUrl}/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(oobCode)}`
      : firebaseLink;

    const mailOptions = {
      from: `"KonnichiWow" <${process.env.NODEMAILER_EMAIL}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
          <p>Hello,</p>
          <p>You requested a password reset for your account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}" style="background-color: #EC275F; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (e) {
    if (e.code === "auth/user-not-found") {
      console.log(
        `Password reset tried for an account that does not exist : ${email}`
      );
    }
    console.log(`Server Error in forgotPasswordController : ${e.message}`);
  } finally {
    return res.status(200).json({
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${process.env.FIREBASE_API_KEY}`,
      { oobCode: token, newPassword }
    );

    if (email) {
      try {
        const user = await auth.getUserByEmail(email);
        await auth.revokeRefreshTokens(user.uid);
      } catch {
        /* optional */
      }
    }

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (e) {
    const err = e.response?.data?.error?.message;
    if (err === "INVALID_OOB_CODE" || err === "EXPIRED_OOB_CODE") {
      return res.status(400).json({
        error: "This reset link is invalid or expired. Request a new one.",
      });
    }
    console.log(`resetPasswordController:`, e.response?.data || e.message);
    return res.status(500).json({ error: "Server Error" });
  }
};

export const logOutController = async (req, res) => {
  try {
    const uid = req.user.uid;
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });
    await auth.revokeRefreshTokens(uid);
    res.status(200).json({ message: "Logged User Out Successfully" });
  } catch (e) {
    console.log(`Error in logging out a user : ${e} `);
    return res.status(500).json({ error: "Server Error" });
  }
};

export const googleSignIn = async (req, res) => {
  try {
    const token = req.body.token;
    if (!token) {
      return res.status(400).json({ error: "Token not found in request body" });
    }
    const userdata = await auth.verifyIdToken(token);

    let user = await User.findOne({ email: userdata.email });

    if (!user) {
      user = await User.create({
        firebaseUID: userdata.uid,
        email: userdata.email,
        name: userdata.name || userdata.email?.split("@")[0],
        isProfileComplete: false,
      });
    }

    setSessionCookies(res, token);

    return res.status(200).json({
      message: "User signed in successfully",
      token,
      user: sessionPayload(user),
    });
  } catch (e) {
    console.log(`Error in logging user in via google : ${e}`);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const setPhoneNumberController = async (req, res) => {
  try {
    const uid = req.user.uid;
    const phone = req.body.phone;
    if (!phone) {
      return res.status(400).json({ error: "phoneNumber required !" });
    }
    const phoneNumber = phone.trim();
    if (phoneNumber.length !== 10 || !validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({ error: "Invalid Phone Number" });
    }
    const user = await User.findOne({ firebaseUID: uid });
    if (!user) {
      console.log(
        `Error : User with uid : ${uid} is logged in , but their document is not found in database.`
      );
      return res.status(404).json({ error: "User not found!" });
    }
    user.phoneNumber = phoneNumber;
    user.isProfileComplete = true;
    await user.save();
    return res.status(200).json({ message: "User Profile updated." });
  } catch (e) {
    console.log(`Error in setting User Phone Number : ${e}`);
    return res.status(500).json({ error: "Server Error" });
  }
};
