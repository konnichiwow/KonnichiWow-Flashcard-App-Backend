import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadServiceAccount() {
  const fromPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (fromPath) {
    const resolved = path.isAbsolute(fromPath)
      ? fromPath
      : path.resolve(process.cwd(), fromPath);
    return JSON.parse(fs.readFileSync(resolved, "utf8"));
  }

  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (inline) {
    return JSON.parse(inline);
  }

  throw new Error(
    "Firebase Admin: set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_KEY in .env"
  );
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(loadServiceAccount()),
  });
}

const auth = admin.auth();

export { auth };
