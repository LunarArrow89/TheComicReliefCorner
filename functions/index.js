const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getDatabase } = require("firebase-admin/database");
const crypto = require("node:crypto");

initializeApp({ databaseURL: "https://chatroom-334ac-default-rtdb.firebaseio.com" });

const ADMIN_PASSCODE = defineSecret("ADMIN_PASSCODE");

exports.activateAdminWithPasscode = onCall(
  { region: "us-central1", secrets: [ADMIN_PASSCODE] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in before requesting admin access.");
    }

    const submitted = request.data && request.data.passcode;
    const expected = ADMIN_PASSCODE.value();

    if (typeof submitted !== "string" || !submitted || !expected) {
      throw new HttpsError("permission-denied", "The admin passcode is incorrect.");
    }

    const submittedBuffer = Buffer.from(submitted, "utf8");
    const expectedBuffer = Buffer.from(expected, "utf8");
    const matches =
      submittedBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(submittedBuffer, expectedBuffer);

    if (!matches) {
      throw new HttpsError("permission-denied", "The admin passcode is incorrect.");
    }

    const auth = getAuth();
    const user = await auth.getUser(request.auth.uid);
    await auth.setCustomUserClaims(request.auth.uid, {
      ...(user.customClaims || {}),
      admin: true
    });

    // This public profile flag is only for display styling. Authorization is enforced
    // separately with the trusted Firebase Auth custom claim.
    await getDatabase().ref("profiles/" + request.auth.uid).update({ isAdmin: true });

    return { success: true };
  }
);

// Delete a chat message only after verifying the caller's trusted admin claim.
// The Admin SDK performs the deletion without granting clients broad write access.
exports.deleteChatMessage = onCall(
  { region: "us-central1" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in before deleting messages.");
    }
    if (request.auth.token.admin !== true) {
      throw new HttpsError("permission-denied", "Only admins can delete messages.");
    }

    const messageId = request.data && request.data.messageId;
    if (typeof messageId !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(messageId)) {
      throw new HttpsError("invalid-argument", "A valid message ID is required.");
    }

    const messageRef = getDatabase().ref("messages/" + messageId);
    const snapshot = await messageRef.get();
    if (!snapshot.exists()) {
      throw new HttpsError("not-found", "That message no longer exists.");
    }
    await messageRef.remove();
    return { success: true };
  }
);
