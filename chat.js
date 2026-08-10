/* CHAT.JS - CONTROLLER INTERFACE - PART A */
const SUPABASE_URL = "https://pmovxvgnhnfrtfgsgqgp.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_MpaODvUultrdqhu-2Pws_g_BspLF8s6";

window.addEventListener('load', () => {
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
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
        node.innerHTML = `<span class="chat-meta">${username}</span>: <span>${text}</span><span class="chat-timestamp">${timestamp}</span>`;
        chatWindow.appendChild(node);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function openAuthModal() {
        authBackdrop.classList.add('modal-active');
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

                        /* CHAT.JS - PIPELINE SYNC MECHANICS - PART B */
    function closeAuthModal() {
        authBackdrop.classList.remove('modal-active');
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

    async function checkUserSession() {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) { currentSessionUser = user.email.split('@'); closeAuthModal(); startDatabasePipeline(); }
        else { openAuthModal(); }
    }

    signupBtn.addEventListener('click', async () => {
        const username = usernameInput.value.trim().replace(/\s+/g, '_');
        const password = passwordInput.value; if (!username || !password) return;
        const { error } = await supabaseClient.auth.signUp({ email: `${username}@comic.com`, password: password });
        if (error) { authError.textContent = error.message; authError.style.display = 'block'; }
        else { alert(`Registered as "${username}"! Click Log In.`); authError.style.display = 'none'; }
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim().replace(/\s+/g, '_');
        const password = passwordInput.value;
        const { error } = await supabaseClient.auth.signInWithPassword({ email: `${username}@comic.com`, password: password });
        if (error) { authError.textContent = "Invalid username or password."; authError.style.display = 'block'; }
        else { authError.style.display = 'none'; checkUserSession(); }
    });

    logoutBtn.addEventListener('click', async () => { await supabaseClient.auth.signOut(); currentSessionUser = null; chatWindow.innerHTML = ''; checkUserSession(); });
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault(); const txt = chatInput.value.trim(); if (!txt || !currentSessionUser) return; chatInput.value = '';
        await supabaseClient.from('Mess').insert([{ Username: currentSessionUser, Text: txt }]);
    });

    async function startDatabasePipeline() {
        const { data: logs } = await supabaseClient.from('Mess').select('*').order('created_at', { ascending: true }).limit(40);
        if (logs) { chatWindow.innerHTML = ''; logs.forEach(msg => { displayMessage(msg.Username, msg.Text, new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })); }); }
        supabaseClient.channel('public:Mess').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Mess' }, p => { displayMessage(p.new.Username, p.new.Text, new Date(p.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })); }).subscribe();
    }
    checkUserSession();
});
