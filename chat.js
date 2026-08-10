// 1. SUPABASE ACCESS CONFIGURATION BLOCK 
const SUPABASE_URL = "https://pmovxvgnhnfrtfgsgqgp.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_MpaODvUultrdqhu-2Pws_g_BspLF8s6";

window.addEventListener('load', () => {
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Document Elements Reference Mapping
    const authContainer = document.getElementById('auth-container');
    const chatContainer = document.getElementById('secure-chat-container');
    const authForm = document.getElementById('auth-form');
    const usernameInput = document.getElementById('auth-username');
    const passwordInput = document.getElementById('auth-password');
    const adminCheckbox = document.getElementById('auth-admin-check'); // Safely found but ignored
    const signupBtn = document.getElementById('signup-btn');
    const authError = document.getElementById('auth-error');
    
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-msg');
    const chatWindow = document.getElementById('chat-window');
    const logoutBtn = document.getElementById('logout-btn');

    let currentSessionUser = null;

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

    // 2. USER AUTHENTICATION SESSION STATUS VERIFIER
    async function checkUserSession() {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
            // Decodes your username clean token directly out of your data schema structures
            currentSessionUser = user.email.split('@')[0];
            authContainer.style.display = 'none';
            chatContainer.style.display = 'flex';
            startDatabasePipeline();
        } else {
            authContainer.style.display = 'flex';
            chatContainer.style.display = 'none';
        }
    }

    // 3. SECURE AUTH ACTION FORM HANDLERS (Admin Checkbox runs passively for now)
    // Sign Up Process Handler
    signupBtn.addEventListener('click', async () => {
        const username = usernameInput.value.trim().replace(/\s+/g, '_');
        const password = passwordInput.value;
        if (!username || !password) return;

        const simulatedEmail = `${username}@comic.com`;

        const { error } = await supabaseClient.auth.signUp({ email: simulatedEmail, password: password });
        if (error) {
            authError.textContent = error.message;
            authError.style.display = 'block';
        } else {
            alert(`Account registered successfully as "${username}"! Click Log In to enter.`);
            authError.style.display = 'none';
        }
    });

    // Sign In Process Handler
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim().replace(/\s+/g, '_');
        const password = passwordInput.value;

        const simulatedEmail = `${username}@comic.com`;

        const { error } = await supabaseClient.auth.signInWithPassword({ email: simulatedEmail, password: password });
        if (error) {
            authError.textContent = "Access Denied: Invalid username or key password.";
            authError.style.display = 'block';
        } else {
            authError.style.display = 'none';
            checkUserSession();
        }
    });

    // Session Log Out Disconnect Handler
    logoutBtn.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        currentSessionUser = null;
        chatWindow.innerHTML = '';
        checkUserSession();
    });

    // 4. WRITE ACCOUNT TRANSITIONS TO MESS ROW CHANNELS
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const txt = chatInput.value.trim();
        if (!txt || !currentSessionUser) return;

        chatInput.value = '';

        await supabaseClient
            .from('Mess')
            .insert([{ Username: currentSessionUser, Text: txt }]);
    });

    // 5. REAL-TIME DATA SYNC FLOW CORES PIPELINE
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

    checkUserSession();
});
