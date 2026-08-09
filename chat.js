// 1. Establish your secure database platform handshake connection
const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_PUBLIC_KEY";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// UI Targets matching your site design rules
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-msg');
const chatWindow = document.getElementById('chat-window');
const systemUsername = "User_" + Math.floor(Math.random() * 9000 + 1000);

// Helper function: Appends individual bubble frames natively to your screen canvas
function displayMessage(username, text, timestamp) {
    const formattedTime = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const node = document.createElement('div');
    node.className = 'chat-bubble';
    node.innerHTML = `
        <span class="chat-meta">${username}</span>: 
        <span>${text}</span>
        <span class="chat-timestamp">${formattedTime}</span>
    `;
    chatWindow.appendChild(node);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// 2. DISPATCH EVENT RUNNERS: Append new data rows to your table grid layout
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const txt = chatInput.value.trim();
    if (!txt) return;

    chatInput.value = '';

    // Inserts the message data directly into your database row tracking layer
    const { error } = await supabase
        .from('messages')
        .insert([{ username: systemUsername, text: txt }]);

    if (error) console.error("Failed writing chat data payload row:", error);
});

// 3. LISTEN & RENDER EVENTS: Fetch previous chat logs history and listen for updates
async function initializeChatHub() {
    // Pipeline A: Pull the last 40 log lines instantly on page entry
    const { data: initialLogs, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(40);

    if (!error && initialLogs) {
        initialLogs.forEach(msg => displayMessage(msg.username, msg.text, msg.created_at));
    }

    // Pipeline B: Subscribe to live data changes to sync multi-user traffic
    supabase
        .channel('public:messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
            const newMsg = payload.new;
            displayMessage(newMsg.username, newMsg.text, newMsg.created_at);
        })
        .subscribe();
}

initializeChatHub();
