import { auth } from "../config/firebase.js";

function extractBearerToken(req) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  return null;
}

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken || extractBearerToken(req);
    if (!token) return res.status(401).json({ error: "No accessToken provided" });

    const userdata = await auth.verifyIdToken(token);
    req.user = userdata;
    next();
  } catch (e) {
    console.log(e);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
