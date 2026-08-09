/* ==========================================================================
   LOAD.JS - PART 1: CORE HOOKS, ROUTING ASSESSMENTS & STYLESHEETS
   ========================================================================== */

window.audioEngine = window.audioEngine || new Audio();
window.isAudioLooping = window.isAudioLooping || false;

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

const pipelineObserver = new MutationObserver(() => {
    pipelineObserver.disconnect();
    executeGlobalTemplateLighter();
    executeSystemTimeTicks();
    pipelineObserver.observe(document.body, { childList: true, subtree: true });
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

// Custom Stylesheet Engine Injection
const styleId = "universal-player-dynamic-css";
if (!document.getElementById(styleId)) {
    const customStyles = `
    .global-mini-player {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 360px !important; /* Widened slightly to account for the third circular node */
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
        background: #444;
        border: none;
        color: #fff;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        padding: 0;
        transition: background 0.2s, color 0.2s;
    }
    .mini-btn:hover {
        background: #ff69b4;
    }
    .mini-btn.close-style:hover {
        background: #ff6565 !important;
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
/* ==========================================================================
   LOAD.JS - PART 2: DYNAMIC DOM STRING WRAPPERS & CLICK HANDLING
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const audio = window.audioEngine;
    executeGlobalTemplateLighter();

    function processGlobalMiniplayerVisibility() {
        const isMusicTabActive = document.getElementById("song-search") !== null;
        let miniPlayer = document.getElementById("shared-global-mini-deck");
        const cachedSrc = localStorage.getItem("audio_active_src");
        const isManuallyHidden = sessionStorage.getItem("mini_player_closed") === "true";

        if (!isMusicTabActive && cachedSrc && !isManuallyHidden) {
            if (!miniPlayer) {
                // FIXED: The string block structure explicitly appends the third circular .mini-btn with font-awesome payload structure inside the controls array
                let markup = '<div id="shared-global-mini-deck" class="global-mini-player">';
                markup += '<div class="mini-player-top-row" id="mini-deck-drag-handle">';
                markup += '<div class="mini-cover-wrap"><img id="mini-deck-img" src="music-icon.png" alt="Mini Cover"></div>';
                markup += '<div class="mini-details-wrap">';
                markup += '<span class="mini-status-tag" id="mini-deck-status">Lounge Streaming</span>';
                markup += ' <p id="mini-deck-title" class="mini-title">Syncing Track...</p>';
                markup += '</div>';
                markup += '<div class="mini-controls-cluster">';
                markup += ' <button id="mini-deck-restart-btn" class="mini-btn" title="Restart"><i class="fa-solid fa-backward-step"></i></button>';
                markup += ' <button id="mini-deck-pause-btn" class="mini-btn" title="Play/Pause"><i class="fa-solid fa-pause"></i></button>';
                markup += ' <button id="mini-deck-close-btn" class="mini-btn close-style" title="Close Player"><i class="fa-solid fa-xmark"></i></button>';
                markup += '</div>';
                markup += '</div>';
                markup += '<div id="mini-deck-scrub-bar" class="mini-progress-line-bar"><div id="mini-deck-fill" class="mini-progress-fill-node"></div></div>';
                markup += '</div>';
                
                document.body.insertAdjacentHTML("beforeend", markup);
                miniPlayer = document.getElementById("shared-global-mini-deck");
                
                setupMoveableDragEngine(miniPlayer);
                setupMiniPlayerControllers();
                updateMiniplayerDataTrack();
            }
        } else if ((isMusicTabActive || !cachedSrc || isManuallyHidden) && miniPlayer) {
            miniPlayer.remove();
        }
    }

    function updateMiniplayerDataTrack() {
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
                // Keep UI synced natively with FontAwesome layout structures
                pauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
                if (statusNode) statusNode.textContent = "Paused";
            } else {
                pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                if (statusNode) statusNode.textContent = "Lounge Streaming";
            }
        }
    }

    function setupMiniPlayerControllers() {
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
                localStorage.setItem("audio_was_playing", "false");
                sessionStorage.setItem("mini_player_closed", "true");
                const currentMini = document.getElementById("shared-global-mini-deck");
                if (currentMini) currentMini.remove();
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
            
            if (e.type === "touchstart") { activeX = e.touches.clientX; activeY = e.touches.clientY; } 
            else { activeX = e.clientX; activeY = e.clientY; }
            
            document.addEventListener("mousemove", dragMotionExecution);
            document.addEventListener("mouseup", dragClosureCleanup);
            document.addEventListener("touchmove", dragMotionExecution, { passive: false });
            document.addEventListener("touchend", dragClosureCleanup);
        }
        
        function dragMotionExecution(e) {
            let currentClientX = 0, currentClientY = 0;
            if (e.type === "touchmove") { currentClientX = e.touches.clientX; currentClientY = e.touches.clientY; } 
            else { currentClientX = e.clientX; currentClientY = e.clientY; }
            
            deltaX = activeX - currentClientX; deltaY = activeY - currentClientY;
            activeX = currentClientX; activeY = currentClientY;
            
            element.style.top = (element.offsetTop - deltaY) + "px";
            element.style.left = (element.offsetLeft - deltaX) + "px";
            element.style.bottom = "auto"; element.style.right = "auto";
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
            sessionStorage.removeItem("mini_player_closed");
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

    audio.addEventListener("timeupdate", () => {
        if (audio.src) {
            localStorage.setItem("audio_active_time", audio.currentTime);
            const fillNode = document.getElementById("mini-deck-fill");
            if (fillNode && !isNaN(audio.duration) && isFinite(audio.duration)) {
                fillNode.style.width = ((audio.currentTime / audio.duration) * 100) + "%";
            }
        }
    });

    audio.addEventListener("pause", updateMiniplayerDataTrack);
    audio.addEventListener("play", updateMiniplayerDataTrack);
    
    setInterval(processGlobalMiniplayerVisibility, 500);
    processGlobalMiniplayerVisibility();
});
