// Firebase setup: replace these values with the config from your Firebase project.
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
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  push,
  query,
  limitToLast,
  onChildAdded,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

const authContainer = document.getElementById("auth-container");
const chatContainer = document.getElementById("secure-chat-container");
const authForm = document.getElementById("auth-form");
const emailInput = document.getElementById("auth-email");
const passwordInput = document.getElementById("auth-password");
const signupBtn = document.getElementById("signup-btn");
const authError = document.getElementById("auth-error");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-msg");
const chatWindow = document.getElementById("chat-window");
const logoutBtn = document.getElementById("logout-btn");

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

let currentUser = null;
let stopMessagesListener = null;
let messagesStartedForUid = null;

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

function showMessage(username, messageText, createdAt) {
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble";

  const name = document.createElement("span");
  name.className = "chat-meta";
  name.textContent = username || "Community member";

  const content = document.createElement("span");
  content.textContent = messageText || "";

  const timestamp = document.createElement("span");
  timestamp.className = "chat-timestamp";
  timestamp.textContent = createdAt
    ? new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Sending…";

  bubble.append(name, document.createTextNode(": "), content, timestamp);
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function startMessages() {
  if (!currentUser || messagesStartedForUid === currentUser.uid) return;

  if (stopMessagesListener) stopMessagesListener();
  messagesStartedForUid = currentUser.uid;
  chatWindow.replaceChildren();
  const messagesQuery = query(ref(database, "messages"), limitToLast(100));

  stopMessagesListener = onChildAdded(messagesQuery, (snapshot) => {
    const message = snapshot.val();
    if (!message) return;
    showMessage(message.username, message.text, message.createdAt);
  }, (error) => {
    showAuthError("Could not load messages: " + error.message);
  });
}

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    authContainer.style.display = "none";
    chatContainer.style.display = "flex";
    clearAuthError();
    startMessages();
  } else {
    if (stopMessagesListener) stopMessagesListener();
    stopMessagesListener = null;
    messagesStartedForUid = null;
    currentUser = null;
    chatWindow.replaceChildren();
    authContainer.style.display = "flex";
    chatContainer.style.display = "none";
  }
});

signupBtn.addEventListener("click", async () => {
  clearAuthError();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (!email || !password) {
    showAuthError("Enter your email and password first.");
    return;
  }
  try {
    await createUserWithEmailAndPassword(auth, email, password);
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

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const messageText = chatInput.value.trim();
  if (!messageText || !currentUser) return;

  const username = currentUser.email ? currentUser.email.split("@")[0] : "Community member";
  chatInput.value = "";
  try {
    await push(ref(database, "messages"), {
      uid: currentUser.uid,
      username,
      text: messageText,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    chatInput.value = messageText;
    showAuthError("Message could not be sent: " + error.message);
  }
});
