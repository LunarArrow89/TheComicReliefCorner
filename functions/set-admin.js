const fs = require("node:fs");
const path = require("node:path");
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getDatabase } = require("firebase-admin/database");

const uid = process.argv[2] || process.env.ADMIN_UID;
const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(__dirname, "serviceAccountKey.json");

if (!uid) {
  console.error("Usage: npm run grant-admin -- FIREBASE_AUTH_USER_UID");
  process.exit(1);
}

if (!fs.existsSync(keyPath)) {
  console.error("Service-account key not found.");
  console.error("Put the downloaded private key at functions/serviceAccountKey.json");
  console.error("Do not commit or share this file.");
  process.exit(1);
}

async function main() {
  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));

  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: "https://chatroom-334ac-default-rtdb.firebaseio.com"
  });

  const auth = getAuth();
  const user = await auth.getUser(uid);

  // Preserve any existing custom claims while granting admin.
  await auth.setCustomUserClaims(uid, {
    ...(user.customClaims || {}),
    admin: true
  });

  // Used only to display the admin star; security checks use the Auth claim.
  await getDatabase().ref("profiles/" + uid).update({ isAdmin: true });

  console.log("Admin access granted to:", user.email || uid);
  console.log("Sign out and sign back in (or refresh your ID token) to activate it.");
}

main().catch((error) => {
  console.error("Could not grant admin access:", error.message);
  process.exitCode = 1;
});
