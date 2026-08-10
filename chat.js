// 1. SUPABASE ACCESS CONFIGURATION BLOCK
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

// Check if credentials are placeholders or populated keys
const isConfigActive = SUPABASE_URL && !SUPABASE_URL.includes("YOUR_");

// 2. WAIT UNTIL CONTAINER ELEMENTS ARE FULLY LOADED NATIVELY BY LOAD.JS
window.addEventListener('load', () => {
    // Identify targets after injection loops close cleanly
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-msg');
    const chatWindow = document.getElementById('chat-window');
    const systemUsername = "User_" + Math.floor(Math.random() * 9000 + 1000);

    if (!chatWindow) {
        console.error("Chat viewport target not verified in DOM loop yet.");
        return;
    }

    // Helper: Appends message rows to UI box smoothly
    function displayMessage(username, text, timestamp) {
        const node = document.createElement('div');
        node.className = 'chat-bubble';
        node.innerHTML = `
            <span class="chat-meta">${username}</span>: 
            <span>${text}</span>
            <span class="chat-timestamp">${timestamp}</span>
        `;
        chatWindow.appendChild(node);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // 3. OFFLINE FALLBACK MODE (Allows testing prior to adding keys)
    if (!isConfigActive) {
        displayMessage("SYSTEM", "Chat visual interface engine loaded successfully! Input your real Supabase credentials inside chat.js to connect database sync tracking.", "11:54 AM");
        
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const txt = chatInput.value.trim();
            if (!txt) return;
            
            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            displayMessage(systemUsername, txt, timeStr);
            chatInput.value = '';
        });
        return;
    }

    // 4. ONLINE RE-ROUTING DATABASE RULES
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const txt = chatInput.value.trim();
        if (!txt) return;

        chatInput.value = '';

        await supabaseClient
            .from('messages')
            .insert([{ username: systemUsername, text: txt }]);
    });

    async function startDatabasePipeline() {
        const { data: initialLogs } = await supabaseClient
            .from('messages')
            .select('*')
            .order('created_at', { ascending: true })
            .limit(40);

        if (initialLogs) {
            chatWindow.innerHTML = '';
            initialLogs.forEach(msg => {
                const formattedTime = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                displayMessage(msg.username, msg.text, formattedTime);
            });
        }

        supabaseClient
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
                const newMsg = payload.new;
                const formattedTime = new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                displayMessage(newMsg.username, newMsg.text, formattedTime);
            })
            .subscribe();
    }

    startDatabasePipeline();
});
