/*
LOAD.JS GLOBAL COMPONENT & ASYNCHRONOUS TEMPLATE ENGINE - PART A
*/
window.audioEngine = window.audioEngine || new Audio();
window.isAudioLooping = window.isAudioLooping || false;

// 1. GLOBAL SIDENAV & HEADER FETCH ENGINE
function executeGlobalTemplateLighter() {
    const sidebarWrap = document.getElementById("sidebar-container");
    const headerWrap = document.getElementById("header-container");

    if (sidebarWrap && sidebarWrap.innerHTML.trim() === "") {
        fetch("sidebar.html")
            .then(res => res.text())
            .then(html => { sidebarWrap.innerHTML = html; })
            .catch(err => console.error("Error loading sidebar layout:", err));
    }

    if (headerWrap && headerWrap.innerHTML.trim() === "") {
        fetch("header.html")
            .then(res => res.text())
            .then(html => {
                headerWrap.innerHTML = html;
                executeSystemTimeTicks();
            })
            .catch(err => console.error("Error loading header layout:", err));
    }
}

// 2. HIGH-ACCURACY DIGITAL REAL-TIME CLOCK ENGINE
function executeSystemTimeTicks() {
    const timeBox = document.querySelector(".time-box");
    const dateBox = document.querySelector(".date-box");
    if (timeBox || dateBox) {
        const now = new Date();
        if (timeBox) {
            timeBox.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        if (dateBox) {
            const choices = { month: 'short', day: 'numeric' };
            dateBox.textContent = now.toLocaleDateString([], choices).toUpperCase();
        }
    }
}

executeGlobalTemplateLighter();

// 3. MUTATION OBSERVER TO WATCH FOR TAB SWAPS
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

document.addEventListener("DOMContentLoaded", () => {
    executeGlobalTemplateLighter();
    
    // 4. MOVEABLE UNIVERSAL MINI-PLAYER SYSTEM OVERRIDE STYLES
    const styleId = "universal-player-dynamic-css";
    if (!document.getElementById(styleId)) {
        const customStyles = `
        .global-mini-player {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 320px !important;
            height: 90px !important;
            min-height: 90px !important;
            max-height: 90px !important;
            background: #2a2a2a;
            border: 2px solid #444;
            border-radius: 12px;
            padding: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.5);
            z-index: 999999;
            cursor: grab;
            user-select: none;
            transition: border-color 0.2s ease;
            display: flex;
            flex-direction: column;
            gap: 10px;
            overflow: hidden !important;
        }
        .global-mini-player:active {
            cursor: grabbing;
            border-color: #ff69b4;
        }
        .mini-player-top-row {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
        }
        .mini-cover-wrap img {
            width: 45px;
            height: 45px;
            border-radius: 6px;
            object-fit: cover;
            display: block;
        }
        .mini-details-wrap {
            flex-grow: 1;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .mini-status-tag {
            font-size: 10px;
            color: #ff69b4;
            text-transform: uppercase;
            font-weight: bold;
            display: block;
            line-height: 1.2;
        }
        .mini-title {
            margin: 2px 0 0 0;
            font-size: 13px;
            color: #fff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.2;
        }
        .mini-controls-cluster {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .mini-btn {
            background: transparent;
            border: none;
            color: #fff;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            padding: 0;
            transition: background 0.2s, transform 0.2s;
        }
        .mini-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: scale(1.1);
        }
        .mini-progress-line-bar {
            width: 100%;
            height: 4px;
            background: #555;
            border-radius: 2px;
            overflow: hidden;
            cursor: pointer;
            position: relative;
        }
        .mini-progress-fill-node {
            width: 0%;
            height: 100%;
            background: #ff69b4;
            position: absolute;
            top: 0;
            left: 0;
        }`;
        
        const styleTag = document.createElement("style");
        styleTag.id = styleId;
        styleTag.textContent = customStyles;
        document.head.appendChild(styleTag);
    }
});
/*
LOAD.JS GLOBAL COMPONENT & ASYNCHRONOUS TEMPLATE ENGINE - PART B
*/

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
                        <button id="mini-deck-restart-btn" class="mini-btn" title="Restart"><i class="fas fa-redo"></i></button>
                        <button id="mini-deck-pause-btn" class="mini-btn" title="Play/Pause"><i class="fas fa-pause"></i></button>
                        <button id="mini-deck-close-btn" class="mini-btn" title="Close">X</button>
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
        }
        updateMiniplayerDataTrack();
    } else if (!cachedSrc && miniPlayer) {
        miniPlayer.remove();
    }
}

function updateMiniplayerDataTrack() {
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
            pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            if (statusNode) statusNode.textContent = "Paused";
        } else {
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            if (statusNode) statusNode.textContent = "Lounge Streaming";
        }
    }
}

function setupMiniPlayerControllers() {
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
                }).catch(err => console.log("Playback restart blocked:", err));
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
                const clickPositionRatio = (e.clientX - rect.left) / rect.width;
                audio.currentTime = clickPositionRatio * audio.duration;
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

setInterval(processGlobalMiniplayerVisibility, 500);
processGlobalMiniplayerVisibility();
