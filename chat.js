// 1. SUPABASE ACCESS CONFIGURATION BLOCK 
const SUPABASE_URL = "https://supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_MpaODvUultrdqhu-2Pws_g_BspLF8s6";

window.addEventListener('load', () => {
    // Framework Initialization
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Document Elements Reference Mapping
    const authContainer = document.getElementById('auth-container');
    const chatContainer = document.getElementById('secure-chat-container');
    const authForm = document.getElementById('auth-form');
    const emailInput = document.getElementById('auth-email');
    const passwordInput = document.getElementById('auth-password');
    const signupBtn = document.getElementById('signup-btn');
    const loginBtn = document.getElementById('login-btn');
    const authError = document.getElementById('auth-error');
    
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-msg');
    const chatWindow = document.getElementById('chat-window');
    const logoutBtn = document.getElementById('logout-btn');

    let currentSessionUser = null;

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

    // 2. CHECK FOR ACTIVE USER STATUS ON RETRY LOOPS
    async function checkUserSession() {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
            currentSessionUser = user.email.split('@')[0]; // Creates a clean nickname from email handle
            authContainer.style.display = 'none';
            chatContainer.style.display = 'flex';
            startDatabasePipeline();
        } else {
            authContainer.style.display = 'flex';
            chatContainer.style.display = 'none';
        }
    }

    // 3. SECURE AUTHENTICATION FLOW ACTIONS
    // Sign-Up Register Runner
    signupBtn.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        if (!email || !password) return;

        const { data, error } = await supabaseClient.auth.signUp({ email, password });
        if (error) {
            authError.textContent = error.message;
            authError.style.display = 'block';
        } else {
            alert("Account requested! If confirmation emails are enabled in your console, verify your inbox, then press LOG IN.");
        }
    });

    // Log-In Action Process Runner
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
            authError.textContent = error.message;
            authError.style.display = 'block';
        } else {
            authError.style.display = 'none';
            checkUserSession();
        }
    });

    // Logout Session Destructor Engine
    logoutBtn.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        currentSessionUser = null;
        chatWindow.innerHTML = '';
        checkUserSession();
    });

    // 4. WRITE ACCOUNT DATA TO MESS ROW CHANNELS
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const txt = chatInput.value.trim();
        if (!txt || !currentSessionUser) return;

        chatInput.value = '';

        await supabaseClient
            .from('Mess')
            .insert([{ Username: currentSessionUser, Text: txt }]);
    });

    // 5. LIVE MATRIX SYNC SYSTEM TRANSMISSIONS PIPELINE
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

    // Run session check instantly upon load
    checkUserSession();
});
