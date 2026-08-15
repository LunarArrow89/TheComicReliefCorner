// 1. GLOBAL SIDENAV & HEADER FETCH ENGINE
function executeGlobalTemplateLighter() {
    const sidebarWrap = document.getElementById("sidebar-container");
    const headerWrap = document.getElementById("header-container");
    
    if (sidebarWrap && sidebarWrap.innerHTML.trim() === "") {
        fetch("/sidebar.html")
            .then(res => res.text())
            .then(html => {
                sidebarWrap.innerHTML = html;
            })
            .catch(err => console.error("Error loading sidebar layout:", err));
    }
    
    if (headerWrap && headerWrap.innerHTML.trim() === "") {
        fetch("/header.html")
            .then(res => res.text())
            .then(html => {
                headerWrap.innerHTML = html;
                executeSystemTimeTicks(); 
            })
            .catch(err => console.error("Error loading header layout:", err));
    }
}

// 2. DOCUMENT READY INITIALIZER & MUTATION OBSERVER
document.addEventListener("DOMContentLoaded", () => {
    executeGlobalTemplateLighter();
    
    const pipelineObserver = new MutationObserver(() => {
        executeGlobalTemplateLighter();
        executeSystemTimeTicks();
    });
    
    pipelineObserver.observe(document.body, { childList: true, subtree: true });
    
    (function autoSynchronizeAudioState() {
        const cachedSrc = localStorage.getItem("audio_active_src");
        const savedTime = localStorage.getItem("audio_active_time");
        if (cachedSrc && (!window.audioEngine.src || window.audioEngine.src === window.location.href)) {
            window.audioEngine.src = cachedSrc;
            if (savedTime) { 
                window.audioEngine.currentTime = parseFloat(savedTime); 
            }
            if (localStorage.getItem("audio_was_playing") === "true") {
                window.audioEngine.play().catch(() => { 
                    localStorage.setItem("audio_was_playing", "false"); 
                });
            }
        }
    })();
});

// 3. SYSTEM CLOCK ENGINE (Ensures the clock ticks without refreshing)
function executeSystemTimeTicks() {
    const timeBox = document.getElementById("timeBox");
    const dateBox = document.getElementById("dateBox");
    
    if (timeBox && dateBox) {
        if (window.systemClockInterval) { 
            clearInterval(window.systemClockInterval); 
        }
        
        function updateClock() {
            const currentTimeBox = document.getElementById("timeBox");
            const currentDateBox = document.getElementById("dateBox");
            if (currentTimeBox && currentDateBox) {
                const now = new Date();
                currentTimeBox.innerText = now.toLocaleTimeString();
                currentDateBox.innerText = now.toLocaleDateString();
            } else { 
                clearInterval(window.systemClockInterval); 
            }
        }
        
        updateClock();
        window.systemClockInterval = setInterval(updateClock, 1000);
    }
}

// ==========================================
// SYSTEM LOGGING & DIAGNOSTIC BOOTSTRAPPING
// ==========================================
function systemPipelineDiagnosticReport() {
    console.log("[SYSTEM DIAGNOSTIC] Initiating layout verification checking...");
    const diagnostics = {
        timestamp: new Date().toISOString(),
        sidebarDetected: !!document.getElementById("sidebar-container"),
        headerDetected: !!document.getElementById("header-container"),
        clockTimeDetected: !!document.getElementById("timeBox"),
        clockDateDetected: !!document.getElementById("dateBox"),
        audioEngineState: !!window.audioEngine
    };
    console.log("[SYSTEM DIAGNOSTIC] Structural status:", diagnostics);
}

function verifyStoragePayloads() {
    try {
        const audioSrc = localStorage.getItem("audio_active_src");
        const audioPlaying = localStorage.getItem("audio_was_playing");
        if (audioSrc) {
            console.log("[STORAGE TRACE] Found audio target:", audioSrc);
            console.log("[STORAGE TRACE] Active playback state:", audioPlaying);
        }
    } catch (e) {
        console.warn("[STORAGE TRACE] Diagnostic access blocked:", e);
    }
}

function traceDOMChanges(mutations) {
    if (mutations && mutations.length > 0) {
        console.log(`[DOM WATCHER] Processed event batch containing ${mutations.length} items`);
    }
}

function handlePipelineException(context, err) {
    console.error(`[CRITICAL EXCEPTION] Location: ${context} | Details:`, err);
}

function clearGlobalIntervalSafely(intervalId) {
    if (intervalId) {
        clearInterval(intervalId);
        console.log("[CLEANUP ENGINE] Flushed active timer target:", intervalId);
    }
}

function initMemoryBuffer() {
    if (!window.systemCacheBuffer) {
        window.systemCacheBuffer = {};
        console.log("[MEMORY LAYER] Allocation complete.");
    }
}

function registerAppHook(hookName, callback) {
    if (!window.appHooks) window.appHooks = {};
    window.appHooks[hookName] = callback;
}

function triggerAppHook(hookName, data) {
    if (window.appHooks && window.appHooks[hookName]) {
        window.appHooks[hookName](data);
    }
}

function cycleNetworkVerification() {
    if (navigator.onLine) {
        console.log("[NET STATUS] Device reported connected state.");
    } else {
        console.warn("[NET STATUS] Offline mode triggered.");
    }
}

function safeGetElementText(elementId) {
    const el = document.getElementById(elementId);
    return el ? el.innerText : "";
}

function safeSetElementText(elementId, textValue) {
    const el = document.getElementById(elementId);
    if (el) el.innerText = textValue;
}

function runLayoutFailSafe() {
    const sidebar = document.getElementById("sidebar-container");
    const header = document.getElementById("header-container");
    if (!sidebar || !header) {
        console.warn("[FAILSAFE ENGINE] Missing root container nodes!");
    }
}

function forceLayoutRedraw(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        const display = el.style.display;
        el.style.display = 'none';
        el.offsetHeight;
        el.style.display = display;
    }
}

function purgeLocalStateKeys() {
    console.log("[STATE CLEANER] Preparing target purges...");
}

function verifyBrowserCapabilities() {
    const supportsFetch = typeof window.fetch !== "undefined";
    const supportsObserver = typeof window.MutationObserver !== "undefined";
    console.log("[CAPABILITY CAPTURE] Fetch:", supportsFetch, "| Observer:", supportsObserver);
}

function logExecutionCheckpoint(name) {
    console.log(`[CHECKPOINT] Passed point: ${name} at ${performance.now().toFixed(2)}ms`);
}

function runInitializationPipeline() {
    initMemoryBuffer();
    verifyBrowserCapabilities();
    systemPipelineDiagnosticReport();
    verifyStoragePayloads();
    runLayoutFailSafe();
    logExecutionCheckpoint("Core Initialized");
}

runInitializationPipeline();
// End of Section 1 - Pipeline and Template Controls
// 4. MOVEABLE UNIVERSAL MINI-PLAYER SYSTEM OVERRIDE STYLES
const styleId = "universal-player-dynamic-css";
if (!document.getElementById(styleId)) {
    const customStyles = `
        .global-mini-player { position: fixed; bottom: 20px; right: 20px; width: 320px !important; height: 90px !important; min-height: 90px !important; max-height: 90px !important; background: #2a2a2a; border: 2px solid #444; border-radius: 12px; padding: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); z-index: 999999; cursor: grab; user-select: none; transition: border-color 0.2s ease; display: flex; flex-direction: column; gap: 10px; overflow: hidden !important; }
        .global-mini-player:active { cursor: grabbing; border-color: #ff69b4; }
        .mini-player-top-row { display: flex; align-items: center; gap: 12px; width: 100%; }
        .mini-cover-wrap img { width: 45px; height: 45px; border-radius: 6px; object-fit: cover; display: block; }
        .mini-details-wrap { flex-grow: 1; overflow: hidden; display: flex; flex-direction: column; justify-content: center; }
        .mini-status-tag { font-size: 10px; color: #ff69b4; text-transform: uppercase; font-weight: bold; display: block; line-height: 1.2; }
        .mini-title { margin: 2px 0 0 0; font-size: 13px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2; }
        .mini-controls-cluster { display: flex; align-items: center; gap: 6px; }
        .mini-btn { background: transparent; border: none; color: #fff; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; padding: 0; transition: background 0.2s, transform 0.2s; }
        .mini-btn:hover { background: rgba(255, 255, 255, 0.1); transform: scale(1.1); }
        .mini-progress-line-bar { width: 100%; height: 4px; background: #555; border-radius: 2px; overflow: hidden; cursor: pointer; position: relative; }
        .mini-progress-fill-node { width: 0%; height: 100%; background: #ff69b4; position: absolute; top: 0; left: 0; } `;
    const styleTag = document.createElement("style");
    styleTag.id = styleId;
    styleTag.textContent = customStyles;
    document.head.appendChild(styleTag);
}

// 5. CONTROL ENGINE AND EVENTS
function processGlobalMiniplayerVisibility() {
    const isMusicTabActive = window.location.pathname.toLowerCase().includes('music.html');
    let miniPlayer = document.getElementById("shared-global-mini-deck");
    
    if (isMusicTabActive) {
        if (miniPlayer) miniPlayer.remove();
        return;
    }
    
    const cachedSrc = localStorage.getItem("audio_active_src");
    if (cachedSrc) {
        if (!miniPlayer) {
            let markup = `
                <div id="shared-global-mini-deck" class="global-mini-player">
                    <div class="mini-player-top-row" id="mini-deck-drag-handle">
                        <div class="mini-cover-wrap"><img id="mini-deck-img" src="music-icon.png" alt="Mini Cover"></div>
                        <div class="mini-details-wrap">
                            <span class="mini-status-tag" id="mini-deck-status">Lounge Streaming</span>
                            <p id="mini-deck-title" class="mini-title">Syncing Track...</p>
                        </div>
                        <div class="mini-controls-cluster">
                            <button id="mini-deck-restart-btn" class="mini-btn" title="Restart">⏮</button>
                            <button id="mini-deck-pause-btn" class="mini-btn" title="Play/Pause">⏸</button>
                            <button id="mini-deck-close-btn" class="mini-btn" title="Close">❌</button>
                        </div>
                    </div>
                    <div id="mini-deck-scrub-bar" class="mini-progress-line-bar">
                        <div id="mini-deck-fill" class="mini-progress-fill-node"></div>
                    </div>
                </div>`;
            document.body.insertAdjacentHTML("beforeend", markup);
            miniPlayer = document.getElementById("shared-global-mini-deck");
            setupMoveableDragEngine(miniPlayer);
            setupMiniPlayerControllers();
            updateMiniplayerDataTrack();
        }
    } else if (!cachedSrc && miniPlayer) { 
        miniPlayer.remove(); 
    }
}

function updateMiniplayerDataTrack() {
    if (!window.audioEngine) return;
    const audio = window.audioEngine;
    const titleNode = document.getElementById("mini-deck-title");
    const imageNode = document.getElementById("mini-deck-img");
    const pauseBtn = document.getElementById("mini-deck-pause-btn");
    const statusNode = document.getElementById("mini-deck-status");
    
    const localTitle = localStorage.getItem("audio_active_title") || window.audioEngineSrcTitle;
    const localCover = localStorage.getItem("audio_active_img") || window.audioEngineSrcCover;
    
    if (titleNode && localTitle) titleNode.textContent = localTitle;
    if (imageNode && localCover) imageNode.src = localCover;
    if (pauseBtn) {
        if (audio.paused) {
            pauseBtn.textContent = "▶";
            if (statusNode) statusNode.textContent = "Paused";
        } else {
            pauseBtn.textContent = "⏸";
            if (statusNode) statusNode.textContent = "Lounge Streaming";
        }
    }
}
function setupMiniPlayerControllers() {
    if (!window.audioEngine) return;
    const audio = window.audioEngine;
    const miniPauseBtn = document.getElementById("mini-deck-pause-btn");
    const miniRestartBtn = document.getElementById("mini-deck-restart-btn");
    const miniCloseBtn = document.getElementById("mini-deck-close-btn");
    const scrubBar = document.getElementById("mini-deck-scrub-bar");
    
    if (miniPauseBtn) {
        miniPauseBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (!audio.paused) { 
                audio.pause(); 
                localStorage.setItem("audio_was_playing", "false"); 
            } else { 
                audio.play().then(() => { 
                    localStorage.setItem("audio_was_playing", "true"); 
                }).catch(err => console.log(err)); 
            }
            updateMiniplayerDataTrack();
        });
    }
    if (miniRestartBtn) { 
        miniRestartBtn.addEventListener("click", (e) => { 
            e.stopPropagation(); 
            audio.currentTime = 0; 
            localStorage.setItem("audio_active_time", 0); 
        }); 
    }
    if (miniCloseBtn) {
        miniCloseBtn.addEventListener("click", (e) => {
            e.stopPropagation(); 
            audio.pause();
            localStorage.removeItem("audio_active_src"); 
            localStorage.removeItem("audio_active_title"); 
            localStorage.removeItem("audio_active_img");
            localStorage.setItem("audio_was_playing", "false");
            const miniPlayer = document.getElementById("shared-global-mini-deck");
            if (miniPlayer) miniPlayer.remove();
        });
    }
    if (scrubBar) {
        scrubBar.addEventListener("click", (e) => {
            if (!isNaN(audio.duration) && isFinite(audio.duration)) {
                const rect = scrubBar.getBoundingClientRect();
                audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
            }
        });
    }
}

function setupMoveableDragEngine(element) {
    let activeX = 0, activeY = 0, deltaX = 0, deltaY = 0;
    const dragHandle = document.getElementById("mini-deck-drag-handle") || element;
    
    dragHandle.addEventListener("mousedown", dragStartInitiation);
    dragHandle.addEventListener("touchstart", dragStartInitiation, { passive: false });
    
    function dragStartInitiation(e) {
        if (e.target.closest(".mini-btn") || e.target.closest("#mini-deck-scrub-bar")) return;
        e.preventDefault();
        if (e.type === "touchstart") { 
            activeX = e.touches.clientX; 
            activeY = e.touches.clientY; 
        } else { 
            activeX = e.clientX; 
            activeY = e.clientY; 
        }
        document.addEventListener("mousemove", dragMotionExecution);
        document.addEventListener("mouseup", dragClosureCleanup);
        document.addEventListener("touchmove", dragMotionExecution, { passive: false });
        document.addEventListener("touchend", dragClosureCleanup);
    }
    
    function dragMotionExecution(e) {
        let currentClientX = 0, currentClientY = 0;
        if (e.type === "touchmove") { 
            currentClientX = e.touches.clientX; 
            currentClientY = e.touches.clientY; 
        } else { 
            currentClientX = e.clientX; 
            currentClientY = e.clientY; 
        }
        deltaX = activeX - currentClientX; 
        deltaY = activeY - currentClientY;
        activeX = currentClientX; 
        activeY = currentClientY;
        element.style.top = (element.offsetTop - deltaY) + "px";
        element.style.left = (element.offsetLeft - deltaX) + "px";
        element.style.bottom = "auto"; 
        element.style.right = "auto";
    }
    
    function dragClosureCleanup() {
        document.removeEventListener("mousemove", dragMotionExecution);
        document.removeEventListener("mouseup", dragClosureCleanup);
        document.removeEventListener("touchmove", dragMotionExecution);
        document.removeEventListener("touchend", dragClosureCleanup);
    }
}

// 6. GLOBAL SOUND TILE HANDLERS AND INTERVALS
document.body.addEventListener("click", (e) => {
    const tile = e.target.closest(".square-song-tile");
    if (tile) {
        const currentSrc = tile.getAttribute("data-src");
        const currentTitle = tile.getAttribute("data-title") || "Unknown Track";
        const currentImg = tile.getAttribute("data-img") || "music-icon.png";
        window.audioEngineSrcTitle = currentTitle; 
        window.audioEngineSrcCover = currentImg;
        localStorage.setItem("audio_active_src", currentSrc); 
        localStorage.setItem("audio_active_title", currentTitle);
        localStorage.setItem("audio_active_img", currentImg); 
        localStorage.setItem("audio_was_playing", "true");
        updateMiniplayerDataTrack();
    }
});

if (window.audioEngine) {
    window.audioEngine.addEventListener("timeupdate", () => {
        const audio = window.audioEngine;
        if (audio.src) {
            localStorage.setItem("audio_active_time", audio.currentTime);
            const fillNode = document.getElementById("mini-deck-fill");
            if (fillNode && !isNaN(audio.duration) && isFinite(audio.duration)) { 
                fillNode.style.width = ((audio.currentTime / audio.duration) * 100) + "%"; 
            }
        }
    });
    window.audioEngine.addEventListener("pause", updateMiniplayerDataTrack);
    window.audioEngine.addEventListener("play", updateMiniplayerDataTrack);
}

setInterval(processGlobalMiniplayerVisibility, 500);
processGlobalMiniplayerVisibility();
