// 1. SUPABASE ACCESS CONFIGURATION BLOCK 
const SUPABASE_URL = "https://supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_MpaODvUultrdqhu-2Pws_g_BspLF8s6";

window.addEventListener('load', () => {
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Document Elements Reference Mapping
    const mainContentLayout = document.getElementById('main-content-layout');
    const authBackdrop = document.getElementById('auth-backdrop');
    const authForm = document.getElementById('auth-form');
    const usernameInput = document.getElementById('auth-username');
    const passwordInput = document.getElementById('auth-password');
    const signupBtn = document.getElementById('signup-btn');
    const authError = document.getElementById('auth-error');
    
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-msg');
    const chatWindow = document.getElementById('chat-window');
    const chatSendNode = document.getElementById('chat-send-node');
    const logoutBtn = document.getElementById('logout-btn');

    if (!chatWindow || !authBackdrop) return;

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

    // 2. STYLED BLUR TARGET SWITCHES (BLURS ENTIRE SITE MINUS THE LOG IN WINDOW)
    function openAuthModal() {
        authBackdrop.classList.add('modal-active');
        
        // Dynamically apply blur filtering parameters down onto loaded framework panels safely
        const sideNode = document.getElementById('sidebar-container');
        const headNode = document.getElementById('header-container');
        
        if (mainContentLayout) mainContentLayout.classList.add('background-blur-active');
        if (sideNode) sideNode.classList.add('background-blur-active');
        if (headNode) headNode.classList.add('background-blur-active');

        chatInput.disabled = true;
        if (chatSendNode) chatSendNode.disabled = true;
        chatInput.placeholder = "You must log in to transmit data...";
        logoutBtn.style.display = 'none';
    }

    function closeAuthModal() {
        authBackdrop.classList.remove('modal-active');
        
        // Clear background distortion filters natively
        const sideNode = document.getElementById('sidebar-container');
        const headNode = document.getElementById('header-container');

        if (mainContentLayout) mainContentLayout.classList.remove('background-blur-active');
        if (sideNode) sideNode.classList.remove('background-blur-active');
        if (headNode) headNode.classList.remove('background-blur-active');

        chatInput.disabled = false;
        if (chatSendNode) chatSendNode.disabled = false;
        chatInput.placeholder = "Type an encrypted transmission...";
        logoutBtn.style.display = 'block';
    }

    // 3. USER AUTHENTICATION SESSION STATUS VERIFIER
    async function checkUserSession() {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
            currentSessionUser = user.email.split('@')[0];
            closeAuthModal();
            startDatabasePipeline();
        } else {
            openAuthModal();
        }
    }

    // 4. AUTHENTICATION TRANSACTION FORM LOGIC
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

    logoutBtn.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        currentSessionUser = null;
        chatWindow.innerHTML = '';
        checkUserSession();
    });

    // 5. WRITE MESSAGES TO SYSTEM TABLES
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const txt = chatInput.value.trim();
        if (!txt || !currentSessionUser) return;

        chatInput.value = '';

        await supabaseClient
            .from('Mess')
            .insert([{ Username: currentSessionUser, Text: txt }]);
    });

    // 6. REAL-TIME DATA STREAM SYNC
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
