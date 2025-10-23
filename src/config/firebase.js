import fs from "fs";
import admin from "firebase-admin";

const firebaseServiceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const serviceAccount = JSON.parse(firebaseServiceAccountKey);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();

export { auth };
