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
  serverTimestamp, get, set, update, remove, runTransaction
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
const chatStatus = document.getElementById("chat-message-status");
const logoutBtn = document.getElementById("logout-btn");
const profileUsernameInput = document.getElementById("profile-username");
const profileColorInput = document.getElementById("profile-color");
const profileAvatarFileInput = document.getElementById("profile-avatar-file");
const profileAvatarPreview = document.getElementById("profile-avatar-preview");
const profileAvatarFallback = document.getElementById("profile-avatar-fallback");
const removeProfileAvatarBtn = document.getElementById("remove-profile-avatar-btn");
const saveProfileBtn = document.getElementById("save-profile-btn");
const profileStatus = document.getElementById("profile-status");
const deleteAccountBtn = document.getElementById("delete-account-btn");
let adminMode = false;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

let currentUser = null;
let currentProfile = { username: "", nameColor: "#ff69b4", siteTheme: "pink", avatarData: "" };
let pendingAvatarData = null;
let pendingAvatarRemoval = false;
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
function showChatStatus(message, isError = false) {
  if (!chatStatus) return;
  chatStatus.textContent = message;
  chatStatus.style.color = isError ? "#ff6b6b" : "inherit";
  chatStatus.hidden = !message;
}
function cleanUsername(value) {
  return value.replace(/[★⭐☆]/g, "").trim().replace(/\s+/g, " ").slice(0, 24);
}

function sanitizeAvatarData(value) {
  if (typeof value !== "string" || value.length > 1400000) return "";
  return /^data:image\/(?:gif|jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value) ? value : "";
}

function setAvatarDisplay(image, fallback, avatarData, username) {
  const safeData = sanitizeAvatarData(avatarData);

  // Explicit display styles ensure the letter and uploaded image can never
  // appear together, even if another stylesheet overrides the [hidden] rule.
  if (safeData) {
    image.src = safeData;
    image.alt = (username || "Member") + " profile picture";
    image.hidden = false;
    image.style.display = "block";
    fallback.hidden = true;
    fallback.style.display = "none";
  } else {
    image.removeAttribute("src");
    image.hidden = true;
    image.style.display = "none";
    fallback.textContent = (username || "?").trim().charAt(0).toUpperCase() || "?";
    fallback.hidden = false;
    fallback.style.display = "inline-flex";
  }
}

function refreshProfileAvatarPreview(avatarData, username = currentProfile.username) {
  if (profileAvatarPreview && profileAvatarFallback) {
    setAvatarDisplay(profileAvatarPreview, profileAvatarFallback, avatarData, username);
  }
}

async function compressProfileImage(file) {
  if (!file || !["image/gif", "image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choose a GIF, JPG, PNG, or WebP image.");
  }
  if (file.size > 8 * 1024 * 1024) throw new Error("Choose an image smaller than 8 MB.");

  // Keep GIF files intact so their animation is preserved. The profile rule
  // must allow up to 1,400,000 characters for this larger animated image.
  if (file.type === "image/gif") {
    if (file.size > 1024 * 1024) {
      throw new Error("This GIF is too large. Choose a GIF under 1 MB.");
    }
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result);
        if (result.length > 1400000) {
          reject(new Error("This GIF is too large. Choose a smaller GIF."));
        } else {
          resolve(result);
        }
      };
      reader.onerror = () => reject(new Error("Could not read this GIF."));
      reader.readAsDataURL(file);
    });
  }
  const bitmap = await createImageBitmap(file);
  try {
    const size = 256;
    const scale = Math.max(size / bitmap.width, size / bitmap.height);
    const sourceWidth = size / scale;
    const sourceHeight = size / scale;
    const sx = (bitmap.width - sourceWidth) / 2;
    const sy = (bitmap.height - sourceHeight) / 2;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not process this image.");
    context.drawImage(bitmap, sx, sy, sourceWidth, sourceHeight, 0, 0, size, size);
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(result => result ? resolve(result) : reject(new Error("Could not compress this image.")), "image/jpeg", 0.72);
    });
    if (blob.size > 220 * 1024) throw new Error("This picture is still too large. Try a simpler image.");
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read the selected image."));
      reader.readAsDataURL(blob);
    });
  } finally {
    bitmap.close();
  }
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
  const avatar = document.createElement("img");
  avatar.className = "chat-avatar";
  avatar.hidden = true;
  const avatarFallback = document.createElement("span");
  avatarFallback.className = "chat-avatar-fallback";
  setAvatarDisplay(avatar, avatarFallback, uid === currentUser?.uid ? currentProfile.avatarData : "", username);
  const body = document.createElement("div");
  body.className = "chat-bubble-body";
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
      alert("Could not delete message: " + (error.message || "Please try again."));
    }
  });
  body.append(name, document.createTextNode(": "), content, timestamp, deleteButton);
  bubble.append(avatar, avatarFallback, body);
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function loadProfile(user) {
  const profileSnapshot = await get(ref(database, "profiles/" + user.uid));
  const profile = profileSnapshot.exists() ? profileSnapshot.val() : {};
  // Admin status must come from a trusted Firebase Auth custom claim, never an editable profile.
  const tokenResult = await user.getIdTokenResult(true);
  const isAdmin = tokenResult.claims.admin === true;
  currentProfile = {
    username: cleanUsername(profile.username || user.displayName || (user.email ? user.email.split("@")[0] : "Community member")) || "Community member",
    nameColor: /^#[0-9a-fA-F]{6}$/.test(profile.nameColor || "") ? profile.nameColor : "#ff69b4",
    siteTheme: typeof profile.siteTheme === "string" ? profile.siteTheme : "pink",
    avatarData: sanitizeAvatarData(profile.avatarData),
    isAdmin
  };
  adminMode = currentProfile.isAdmin;
  chatContainer.classList.toggle("admin-mode", adminMode);
  profileUsernameInput.value = currentProfile.username;
  profileColorInput.value = currentProfile.nameColor;
  pendingAvatarData = null;
  pendingAvatarRemoval = false;
  if (profileAvatarFileInput) profileAvatarFileInput.value = "";
  refreshProfileAvatarPreview(currentProfile.avatarData, currentProfile.username);
}

function refreshVisibleMessagesForProfile(uid, profile) {
  const username = cleanUsername(profile?.username || "") || "Community member";
  const nameColor = /^#[0-9a-fA-F]{6}$/.test(profile?.nameColor || "")
    ? profile.nameColor
    : "#ff69b4";
  const avatarData = sanitizeAvatarData(profile?.avatarData);

  chatWindow.querySelectorAll(".chat-bubble").forEach((bubble) => {
    if (bubble.dataset.uid !== uid) return;
    const name = bubble.querySelector(".chat-meta");
    if (!name) return;
    name.textContent = username;
    name.style.color = nameColor;
    const avatar = bubble.querySelector(".chat-avatar");
    const avatarFallback = bubble.querySelector(".chat-avatar-fallback");
    if (avatar && avatarFallback) setAvatarDisplay(avatar, avatarFallback, avatarData, username);
    name.classList.toggle("admin-author", profile?.isAdmin === true);
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
      avatarData,
      siteTheme: typeof profile?.siteTheme === "string" ? profile.siteTheme : currentProfile.siteTheme,
      // Keep the trusted Auth claim; profile data must not grant admin privileges.
      isAdmin: currentProfile.isAdmin === true
    };
    adminMode = currentProfile.isAdmin;
    chatContainer.classList.toggle("admin-mode", adminMode);
    if (profileUsernameInput && document.activeElement !== profileUsernameInput) {
      profileUsernameInput.value = username;
    }
    if (profileColorInput && document.activeElement !== profileColorInput) {
      profileColorInput.value = nameColor;
    }
    if (pendingAvatarData === null && !pendingAvatarRemoval) {
      refreshProfileAvatarPreview(avatarData, username);
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
    showChatStatus("Could not load messages: " + error.message, true);
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
    if (stopMessagesListener) stopMessagesListener();
    stopMessagesListener = null;
    stopWatchingMessageProfiles();
    messagesStartedForUid = null;
    currentUser = null;
    currentProfile = { username: "", nameColor: "#ff69b4", siteTheme: "pink", avatarData: "" };
    pendingAvatarData = null;
    pendingAvatarRemoval = false;
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
      username, nameColor: "#ff69b4", siteTheme: "pink", avatarData: ""
    });
    await updateProfile(credential.user, { displayName: username });
    currentProfile = { username, nameColor: "#ff69b4", siteTheme: "pink", avatarData: "" };
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

logoutBtn.addEventListener("click", async () => {
  clearAuthError();
  try {
    await signOut(auth);
  } catch (error) {
    showAuthError(error.message);
  }
});

profileAvatarFileInput.addEventListener("change", async () => {
  const file = profileAvatarFileInput.files?.[0];
  if (!file) return;
  showProfileStatus("Preparing picture…");
  try {
    pendingAvatarData = await compressProfileImage(file);
    pendingAvatarRemoval = false;
    refreshProfileAvatarPreview(pendingAvatarData, currentProfile.username);
    showProfileStatus("Picture ready. Select Save changes to publish it.");
  } catch (error) {
    profileAvatarFileInput.value = "";
    showProfileStatus(error.message, true);
  }
});

removeProfileAvatarBtn.addEventListener("click", () => {
  pendingAvatarData = "";
  pendingAvatarRemoval = true;
  if (profileAvatarFileInput) profileAvatarFileInput.value = "";
  refreshProfileAvatarPreview("", currentProfile.username);
  showProfileStatus("Picture will be removed when you save changes.");
});

saveProfileBtn.addEventListener("click", async () => {
  if (!currentUser) return;
  const username = cleanUsername(profileUsernameInput.value);
  const nameColor = profileColorInput.value;
  const avatarData = pendingAvatarRemoval ? "" :
    (pendingAvatarData !== null ? pendingAvatarData : currentProfile.avatarData || "");
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
      await update(profileRef, {
        username,
        nameColor,
        siteTheme: currentProfile.siteTheme || "pink",
        avatarData: avatarData || null
      });
      const savedSnapshot = await get(profileRef);
      const savedProfile = savedSnapshot.exists() ? savedSnapshot.val() : null;
      if (!savedProfile || savedProfile.username !== username || savedProfile.nameColor !== nameColor ||
          sanitizeAvatarData(savedProfile.avatarData) !== avatarData) {
        throw new Error("Firebase did not confirm the saved profile. Check your Realtime Database rules.");
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

    currentProfile = {
      username, nameColor, avatarData,
      siteTheme: currentProfile.siteTheme || "pink",
      isAdmin: currentProfile.isAdmin === true
    };
    pendingAvatarData = null;
    pendingAvatarRemoval = false;
    if (profileAvatarFileInput) profileAvatarFileInput.value = "";
    refreshProfileAvatarPreview(avatarData, username);

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
    showProfileStatus("Saved! Your picture, username, and color will stay after refresh.");
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
  showChatStatus("");
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
    showChatStatus("Message could not be sent: " + error.message, true);
    console.error("Message send failed:", error);
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
