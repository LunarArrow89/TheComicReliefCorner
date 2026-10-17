const firebaseConfig = {
  apiKey: "AIzaSyArdYErhvY-c_c3qADYQEKve5EGuNzDcIM",
  authDomain: "chatroom-334ac.firebaseapp.com",
  databaseURL: "https://chatroom-334ac-default-rtdb.firebaseio.com",
  projectId: "chatroom-334ac",
  storageBucket: "chatroom-334ac.firebasestorage.app",
  messagingSenderId: "207072115223",
  appId: "1:207072115223:web:647e6ac870013cc3b6fa52"
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile, EmailAuthProvider,
  reauthenticateWithCredential, deleteUser
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
  getDatabase, ref, push, query, limitToLast, onChildAdded, onValue,
  serverTimestamp, get, set, remove, runTransaction
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

const authContainer = document.getElementById("auth-container");
const chatContainer = document.getElementById("secure-chat-container");
const authForm = document.getElementById("auth-form");
const emailInput = document.getElementById("auth-email");
const passwordInput = document.getElementById("auth-password");
const signupUsernameInput = document.getElementById("auth-username");
const signupBtn = document.getElementById("signup-btn");
const authError = document.getElementById("auth-error");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-msg");
const chatWindow = document.getElementById("chat-window");
const logoutBtn = document.getElementById("logout-btn");
const profileUsernameInput = document.getElementById("profile-username");
const profileColorInput = document.getElementById("profile-color");
const saveProfileBtn = document.getElementById("save-profile-btn");
const profileStatus = document.getElementById("profile-status");
const deleteAccountBtn = document.getElementById("delete-account-btn");
const adminPasswordInput = document.getElementById("admin-password");
let adminMode = false;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

let currentUser = null;
let currentProfile = { username: "", nameColor: "#ff69b4", siteTheme: "pink" };
let stopMessagesListener = null;
let messagesStartedForUid = null;
const messageProfileListeners = new Map();

function showAuthError(message) {
  authError.textContent = message;
  authError.hidden = false;
  authError.style.display = "block";
}
function clearAuthError() {
  authError.textContent = "";
  authError.hidden = true;
  authError.style.display = "none";
}
function showProfileStatus(message, isError = false) {
  profileStatus.textContent = message;
  profileStatus.style.color = isError ? "#ff6b6b" : "inherit";
}
function cleanUsername(value) {
  return value.replace(/[★⭐☆]/g, "").trim().replace(/\s+/g, " ").slice(0, 24);
}

// Username uniqueness is case-insensitive. This key is safe for Firebase paths.
function usernameIndexKey(username) {
  return cleanUsername(username).toLowerCase().replace(/[^a-z0-9_-]/g, "_");
}

async function claimUsername(username, uid) {
  const key = usernameIndexKey(username);
  if (!key) throw new Error("Please choose a username using letters or numbers.");

  // Check existing profiles too, so accounts created before username indexing are protected.
  const profilesSnapshot = await get(ref(database, "profiles"));
  let takenByAnotherProfile = false;
  profilesSnapshot.forEach((profileSnapshot) => {
    const profile = profileSnapshot.val();
    if (profileSnapshot.key !== uid &&
        typeof profile?.username === "string" &&
        usernameIndexKey(profile.username) === key) {
      takenByAnotherProfile = true;
    }
  });
  if (takenByAnotherProfile) {
    throw new Error("That username is already taken. Please choose a different one.");
  }

  const indexRef = ref(database, "usernameIndex/" + key);
  const existingIndex = await get(indexRef);
  if (existingIndex.exists() && existingIndex.val() !== uid) {
    // A deleted account may have left an old username reservation behind.
    const formerOwnerProfile = await get(ref(database, "profiles/" + existingIndex.val()));
    if (!formerOwnerProfile.exists()) {
      // Remove the stale reservation only if it still belongs to that former account.
      await runTransaction(indexRef, (currentUid) => {
        if (currentUid === existingIndex.val()) return null;
        return;
      });
    }
  }

  const result = await runTransaction(indexRef, (existingUid) => {
    if (existingUid === null || existingUid === uid) return uid;
    return; // Abort if another account already owns this username.
  });
  if (!result.committed || result.snapshot.val() !== uid) {
    throw new Error("That username is already taken. Please choose a different one.");
  }
  return key;
}

async function releaseUsername(username, uid) {
  if (!username) return;
  const key = usernameIndexKey(username);
  const indexRef = ref(database, "usernameIndex/" + key);
  const snapshot = await get(indexRef);
  if (snapshot.val() === uid) await remove(indexRef);
}

function showMessage(username, messageText, createdAt, nameColor, uid = "", messageId = "") {
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble";
  if (uid) bubble.dataset.uid = uid;
  if (messageId) bubble.dataset.messageId = messageId;
  const name = document.createElement("span");
  name.className = "chat-meta";
  name.style.color = /^#[0-9a-fA-F]{6}$/.test(nameColor || "") ? nameColor : "#ff69b4";
  name.textContent = username || "Community member";
  const content = document.createElement("span");
  content.textContent = messageText || "";
  const timestamp = document.createElement("span");
  timestamp.className = "chat-timestamp";
  timestamp.textContent = createdAt
    ? new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Sending…";
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "admin-delete-btn";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", async () => {
    if (!adminMode || !messageId) return;
    if (!confirm("Delete this message for everyone?")) return;
    deleteButton.disabled = true;
    try {
      await remove(ref(database, "messages/" + messageId));
      bubble.remove();
    } catch (error) {
      deleteButton.disabled = false;
      alert("Could not delete message. Your Firebase Database rules may not allow this: " + error.message);
    }
  });
  bubble.append(name, document.createTextNode(": "), content, timestamp, deleteButton);
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function loadProfile(user) {
  const profileSnapshot = await get(ref(database, "profiles/" + user.uid));
  const profile = profileSnapshot.exists() ? profileSnapshot.val() : {};
  currentProfile = {
    username: cleanUsername(profile.username || user.displayName || (user.email ? user.email.split("@")[0] : "Community member")) || "Community member",
    nameColor: /^#[0-9a-fA-F]{6}$/.test(profile.nameColor || "") ? profile.nameColor : "#ff69b4",
    siteTheme: typeof profile.siteTheme === "string" ? profile.siteTheme : "pink",
    isAdmin: profile.isAdmin === true
  };
  adminMode = currentProfile.isAdmin;
  chatContainer.classList.toggle("admin-mode", adminMode);
  profileUsernameInput.value = currentProfile.username;
  profileColorInput.value = currentProfile.nameColor;
}

function refreshVisibleMessagesForProfile(uid, profile) {
  const username = cleanUsername(profile?.username || "") || "Community member";
  const nameColor = /^#[0-9a-fA-F]{6}$/.test(profile?.nameColor || "")
    ? profile.nameColor
    : "#ff69b4";

  chatWindow.querySelectorAll(".chat-bubble").forEach((bubble) => {
    if (bubble.dataset.uid !== uid) return;
    const name = bubble.querySelector(".chat-meta");
    if (!name) return;
    name.textContent = username;
    name.style.color = nameColor;
    const oldBadge = name.querySelector(".admin-star");
    if (oldBadge) oldBadge.remove();
    if (profile?.isAdmin === true) {
      const star = document.createElement("span");
      star.className = "admin-star";
      star.textContent = " ★";
      star.title = "Admin";
      star.setAttribute("aria-label", "Admin");
      name.appendChild(star);
    }
  });

  if (currentUser && currentUser.uid === uid) {
    currentProfile = {
      ...currentProfile,
      username,
      nameColor,
      siteTheme: typeof profile?.siteTheme === "string" ? profile.siteTheme : currentProfile.siteTheme,
      isAdmin: profile?.isAdmin === true
    };
    adminMode = currentProfile.isAdmin;
    chatContainer.classList.toggle("admin-mode", adminMode);
    if (profileUsernameInput && document.activeElement !== profileUsernameInput) {
      profileUsernameInput.value = username;
    }
    if (profileColorInput && document.activeElement !== profileColorInput) {
      profileColorInput.value = nameColor;
    }
  }
}

function watchMessageAuthorProfile(uid) {
  if (!uid || messageProfileListeners.has(uid)) return;
  const stop = onValue(ref(database, "profiles/" + uid), (snapshot) => {
    refreshVisibleMessagesForProfile(uid, snapshot.exists() ? snapshot.val() : null);
  }, (error) => {
    console.warn("Could not watch chat profile:", error.message);
  });
  messageProfileListeners.set(uid, stop);
}

function stopWatchingMessageProfiles() {
  for (const stop of messageProfileListeners.values()) stop();
  messageProfileListeners.clear();
}

function startMessages() {
  if (!currentUser || messagesStartedForUid === currentUser.uid) return;
  if (stopMessagesListener) stopMessagesListener();
  stopWatchingMessageProfiles();
  messagesStartedForUid = currentUser.uid;
  chatWindow.replaceChildren();
  const messagesQuery = query(ref(database, "messages"), limitToLast(100));
  stopMessagesListener = onChildAdded(messagesQuery, (snapshot) => {
    const message = snapshot.val();
    if (!message) return;
    const isOwnMessage = message.uid && currentUser && message.uid === currentUser.uid;
    showMessage(
      isOwnMessage ? currentProfile.username : message.username,
      message.text,
      message.createdAt,
      isOwnMessage ? currentProfile.nameColor : message.nameColor,
      message.uid,
      snapshot.key
    );
    // Resolve each author's current profile and keep it live, so other people see
    // username and color edits without requiring a new message or page refresh.
    watchMessageAuthorProfile(message.uid);
  }, (error) => {
    showAuthError("Could not load messages: " + error.message);
  });
}

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    authContainer.style.display = "none";
    chatContainer.style.display = "flex";
    clearAuthError();
    showProfileStatus("");
    try {
      await loadProfile(user);
      startMessages();
    } catch (error) {
      showProfileStatus("Could not load your profile: " + error.message, true);
    }
  } else {
    adminMode = false;
    chatContainer.classList.remove("admin-mode");
    if (adminPasswordInput) adminPasswordInput.value = "";
    if (stopMessagesListener) stopMessagesListener();
    stopMessagesListener = null;
    stopWatchingMessageProfiles();
    messagesStartedForUid = null;
    currentUser = null;
    currentProfile = { username: "", nameColor: "#ff69b4", siteTheme: "pink" };
    chatWindow.replaceChildren();
    authContainer.style.display = "flex";
    chatContainer.style.display = "none";
  }
});

signupBtn.addEventListener("click", async () => {
  clearAuthError();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const username = cleanUsername(signupUsernameInput.value);
  if (!username) {
    showAuthError("Choose a username before creating your account.");
    signupUsernameInput.focus();
    return;
  }
  if (!email || !password) {
    showAuthError("Enter your email and password first.");
    return;
  }
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    // Reserve the username before writing the profile so two people cannot claim it.
    await claimUsername(username, credential.user.uid);
    await set(ref(database, "profiles/" + credential.user.uid), {
      username, nameColor: "#ff69b4", siteTheme: "pink"
    });
    await updateProfile(credential.user, { displayName: username });
    currentProfile = { username, nameColor: "#ff69b4" };
    profileUsernameInput.value = username;
    profileColorInput.value = "#ff69b4";
  } catch (error) {
    showAuthError(error.message);
  }
});

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearAuthError();
  try {
    await signInWithEmailAndPassword(auth, emailInput.value.trim(), passwordInput.value);
  } catch (error) {
    showAuthError(error.message);
  }
});

adminUnlockBtn.addEventListener("click", () => {
  if (adminPasswordInput.value === String(2600 + 97)) {
    adminMode = true;
    chatContainer.classList.add("admin-mode");
    adminStatus.textContent = "Admin mode enabled.";
    adminPasswordInput.value = "";
  } else {
    adminMode = false;
    chatContainer.classList.remove("admin-mode");
    adminStatus.textContent = "Incorrect admin password.";
  }
});
logoutBtn.addEventListener("click", async () => {
  clearAuthError();
  try {
    await signOut(auth);
  } catch (error) {
    showAuthError(error.message);
  }
});

saveProfileBtn.addEventListener("click", async () => {
  if (!currentUser) return;
  const username = cleanUsername(profileUsernameInput.value);
  const nameColor = profileColorInput.value;
  if (!username) {
    showProfileStatus("Please enter a username.", true);
    profileUsernameInput.focus();
    return;
  }
  saveProfileBtn.disabled = true;
  showProfileStatus("Saving…");
  try {
    const previousUsername = currentProfile.username;
    const usernameChanged = username.toLowerCase() !== previousUsername.toLowerCase();

    // Only reserve a username when it actually changes. This lets color edits save
    // even if an older username index entry needs cleanup.
    if (usernameChanged) await claimUsername(username, currentUser.uid);

    // Save the username and color in the database, then verify the saved values.
    const profileRef = ref(database, "profiles/" + currentUser.uid);
    try {
      await set(profileRef, { username, nameColor, siteTheme: currentProfile.siteTheme || "pink" });
      const savedSnapshot = await get(profileRef);
      const savedProfile = savedSnapshot.exists() ? savedSnapshot.val() : null;
      if (!savedProfile || savedProfile.username !== username || savedProfile.nameColor !== nameColor) {
        throw new Error("Firebase did not confirm the saved username and color. Check your Realtime Database rules.");
      }
    } catch (saveError) {
      if (usernameChanged) await releaseUsername(username, currentUser.uid).catch(() => {});
      throw saveError;
    }

    if (usernameChanged) {
      await releaseUsername(previousUsername, currentUser.uid).catch((releaseError) => {
        console.warn("Username saved, but the previous username index could not be released:", releaseError);
      });
    }

    currentProfile = { username, nameColor, siteTheme: currentProfile.siteTheme || "pink" };

    // The database profile is the source of truth. Auth display-name syncing is optional.
    try {
      await updateProfile(currentUser, { displayName: username });
    } catch (authProfileError) {
      console.warn("Profile saved to the database, but Firebase Auth display name could not be synced:", authProfileError);
    }

    // Update this user's messages already visible in the current chat window too.
    chatWindow.querySelectorAll(".chat-bubble").forEach((bubble) => {
      if (bubble.dataset.uid !== currentUser.uid) return;
      const name = bubble.querySelector(".chat-meta");
      if (name) {
        name.textContent = username;
        name.style.color = nameColor;
      }
    });
    showProfileStatus("Saved! Your username and color will stay after refresh.");
  } catch (error) {
    showProfileStatus("Could not save: " + error.message, true);
  } finally {
    saveProfileBtn.disabled = false;
  }
});

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const messageText = chatInput.value.trim();
  if (!messageText || !currentUser) return;
  const message = {
    uid: currentUser.uid,
    username: currentProfile.username || currentUser.displayName || "Community member",
    nameColor: currentProfile.nameColor || "#ff69b4",
    text: messageText,
    createdAt: serverTimestamp()
  };
  chatInput.value = "";
  try {
    await push(ref(database, "messages"), message);
  } catch (error) {
    chatInput.value = messageText;
    showAuthError("Message could not be sent: " + error.message);
  }
});

deleteAccountBtn.addEventListener("click", async () => {
  if (!currentUser) return;
  const confirmed = confirm("Delete your account permanently? This will also try to remove your saved profile and messages. This cannot be undone.");
  if (!confirmed) return;
  const password = prompt("For security, enter your account password to confirm deletion:");
  if (password === null) return;
  if (!currentUser.email) {
    showProfileStatus("This account cannot be re-authenticated with email/password here.", true);
    return;
  }
  deleteAccountBtn.disabled = true;
  showProfileStatus("Verifying your password…");
  try {
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    await reauthenticateWithCredential(currentUser, credential);
    const allMessages = await get(ref(database, "messages"));
    if (allMessages.exists()) {
      const removals = [];
      allMessages.forEach((snapshot) => {
        if (snapshot.val()?.uid === currentUser.uid) {
          removals.push(remove(ref(database, "messages/" + snapshot.key)));
        }
      });
      await Promise.all(removals);
    }
    // Release the username reservation so another account can use the name.
    await releaseUsername(currentProfile.username, currentUser.uid);
    await remove(ref(database, "profiles/" + currentUser.uid));
    await deleteUser(currentUser);
    showProfileStatus("Your account was deleted.");
  } catch (error) {
    showProfileStatus("Account deletion failed: " + error.message, true);
  } finally {
    deleteAccountBtn.disabled = false;
  }
});
