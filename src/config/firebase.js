import fs from "fs";
import admin from "firebase-admin";

const serviceAccount = JSON.parse(
  fs.readFileSync(new URL("../../serviceAccountKey.json", import.meta.url))
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();

export { auth };
