// 1. DATABASE CONFIGURATION BLOCK
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// 2. CRITICAL RUNTIME LOAD GUARD
// Prevents the browser engine from crashing if keys are still placeholder text
const isConfigValid = firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("YOUR_");

if (isConfigValid) {
    try {
        supabase.createClient(firebaseConfig.databaseURL, firebaseConfig.apiKey);
        initializeChatHub();
    } catch(err) {
        console.warn("Database initialization handshake paused:", err);
    }
} else {
    console.log("Database offline: Running interface UI preview configuration mode.");
    // Load simulation entry lines so your layout workspace isn't empty
    setTimeout(() => {
        const win = document.getElementById('chat-window');
        if(win) {
            win.innerHTML = `<div class="chat-bubble">
                <span class="chat-meta">SYSTEM:</span> 
                <span>Interface engine active. Connect your Supabase keys inside chat.js to begin broadcasting live text transmissions.</span>
                <span class="chat-timestamp">11:50 AM</span>
            </div>`;
        }
    }, 500);
}

// UI Targets
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-msg');
const chatWindow = document.getElementById('chat-window');
const systemUsername = "User_" + Math.floor(Math.random() * 9000 + 1000);

// Appends message bubbles natively to your screen canvas
function displayMessage(username, text, timestamp) {
    const node = document.createElement('div');
    node.className = 'chat-bubble';
    node.innerHTML = `
        <span class="chat-meta">${username}</span>: 
        <span>${text}</span>
        <span class="chat-timestamp">${timestamp}</span>
    `;
    if(chatWindow) {
        chatWindow.appendChild(node);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
}

// Dispatch form submission runners
if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const txt = chatInput.value.trim();
        if (!txt) return;

        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Speculative UI generation so you can test typing instantly
        displayMessage(systemUsername, txt, currentTime);
        chatInput.value = '';

        if (isConfigValid) {
            await supabase.from('messages').insert([{ username: systemUsername, text: txt }]);
        }
    });
}

async function initializeChatHub() {
    const { data: initialLogs } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(40);

    if (initialLogs) {
        if(chatWindow) chatWindow.innerHTML = '';
        initialLogs.forEach(msg => {
            const formattedTime = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            displayMessage(msg.username, msg.text, formattedTime);
        });
    }

    supabase
        .channel('public:messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
            const newMsg = payload.new;
            const formattedTime = new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            displayMessage(newMsg.username, newMsg.text, formattedTime);
        })
        .subscribe();
}
