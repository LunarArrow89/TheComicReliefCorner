// 1. SUPABASE ACCESS CONFIGURATION BLOCK 
const SUPABASE_URL = "https://pmovxvgnhnfrtfgsgqgp.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_MpaODvUultrdqhu-2Pws_g_BspLF8s6";

const isConfigActive = SUPABASE_URL && !SUPABASE_URL.includes("YOUR_");

window.addEventListener('load', () => {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-msg');
    const chatWindow = document.getElementById('chat-window');
    const systemUsername = "User_" + Math.floor(Math.random() * 9000 + 1000);

    if (!chatWindow) return;

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

    if (!isConfigActive) {
        displayMessage("SYSTEM", "Offline Preview Active.", "12:09 PM");
        return;
    }

    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // FIXED: Form submit inserts into your capitalized 'Mess' table, mapping 'Username' and 'Text'
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const txt = chatInput.value.trim();
        if (!txt) return;

        chatInput.value = '';

        await supabaseClient
            .from('Mess')
            .insert([{ Username: systemUsername, Text: txt }]);
    });

    // FIXED: Real-time pipelines pull and track data matching your capitalized column schema
    async function startDatabasePipeline() {
        const { data: initialLogs } = await supabaseClient
            .from('Mess')
            .select('*')
            .order('created_at', { ascending: true })
            .limit(40);

        if (initialLogs) {
            chatWindow.innerHTML = '';
            initialLogs.forEach(msg => {
                const formattedTime = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                displayMessage(msg.Username, msg.Text, formattedTime);
            });
        }

        supabaseClient
            .channel('public:Mess')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Mess' }, payload => {
                const newMsg = payload.new;
                const formattedTime = new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                displayMessage(newMsg.Username, newMsg.Text, formattedTime);
            })
            .subscribe();
    }

    startDatabasePipeline();
});
