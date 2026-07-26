/* ========================================================================== 
   LOAD.JS - GLOBAL COMPONENT & ASYNCHRONOUS TEMPLATE ENGINE 
   ========================================================================== */

// Mount global variables safely to survive navigation
window.audioEngine = window.audioEngine || new Audio();
window.isAudioLooping = window.isAudioLooping || false;

document.addEventListener("DOMContentLoaded", () => {
    const audio = window.audioEngine;

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
                    executeSystemTimeTicks(); // Update clock as soon as header mounts
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

    // Run initial template rendering loop
    executeGlobalTemplateLighter();

    // 3. MUTATION OBSERVER TO WATCH FOR TAB SWAPS CLEANLY
    const pipelineObserver = new MutationObserver(() => {
        pipelineObserver.disconnect(); // Prevent infinite loops
        executeGlobalTemplateLighter();
        executeSystemTimeTicks();
        pipelineObserver.observe(document.body, { childList: true, subtree: true });
    });
    pipelineObserver.observe(document.body, { childList: true, subtree: true });

    // 4. MOVEABLE UNIVERSAL MINI-PLAYER SYSTEM - STYLE INJECTION
    const styleId = "universal-player-dynamic-css";
    if (!document.getElementById(styleId)) {
        const customStyles = `
            .global-mini-player {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 300px;
                background: #2a2a2a;
                border: 2px solid #444;
                border-radius: 12px;
                padding: 12px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.5);
                z-index: 999999;
                cursor: grab;
                user-select: none;
                transition: border-color 0.2s ease;
            }
            .global-mini-player:active {
                cursor: grabbing;
                border-color: #ff69b4;
            }
            .mini-player-top-row {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 10px;
            }
            .mini-cover-wrap img {
                width: 45px;
                height: 45px;
                border-radius: 6px;
                object-fit: cover;
            }
            .mini-details-wrap {
                flex-grow: 1;
                overflow: hidden;
            }
            .mini-status-tag {
                font-size: 10px;
                color: #ff69b4;
                text-transform: uppercase;
                font-weight: bold;
                display: block;
            }
            .mini-title {
                margin: 2px 0 0 0;
                font-size: 13px;
                color: #fff;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .mini-btn {
                background: #444;
                border: none;
                color: #fff;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .mini-btn:hover {
                background: #ff69b4;
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
            }
        `;
        const styleTag = document.createElement("style");
        styleTag.id = styleId;
        styleTag.textContent = customStyles;
        document.head.appendChild(styleTag);
    }
    // 5. MOVEABLE UNIVERSAL MINI-PLAYER SYSTEM - PERSISTENCE CONTROLS
    function processGlobalMiniplayerVisibility() {
        const isMusicTabActive = document.getElementById("song-search") !== null;
        let miniPlayer = document.getElementById("shared-global-mini-deck");

        // Restore instance properties from memory if the local runtime drops state variables
        const storedSrc = localStorage.getItem("audio_active_src");
        if (storedSrc && (!audio.src || audio.src === window.location.href)) {
            audio.src = storedSrc;
            const savedTime = localStorage.getItem("audio_active_time");
            if (savedTime) audio.currentTime = parseFloat(savedTime);
        }

        // Render mini player dynamically if we are off the primary music template tab
        if (!isMusicTabActive && !audio.paused && audio.src && audio.src !== window.location.href) {
            if (!miniPlayer) {
                let markup = '<div id="shared-global-mini-deck" class="global-mini-player">';
                markup += ' <div class="mini-player-top-row" id="mini-deck-drag-handle">';
                markup += '  <div class="mini-cover-wrap"><img id="mini-deck-img" src="music-icon.png" alt="Mini Cover"></div>';
                markup += '  <div class="mini-details-wrap">';
                markup += '   <span class="mini-status-tag">Lounge Streaming</span>';
                markup += '   <p id="mini-deck-title" class="mini-title">Syncing Track...</p>';
                markup += '  </div>';
                markup += '  <button id="mini-deck-pause-btn" class="mini-btn">⏸</button>';
                markup += ' </div>';
                markup += ' <div id="mini-deck-scrub-bar" class="mini-progress-line-bar"><div id="mini-deck-fill" class="mini-progress-fill-node"></div></div>';
                markup += '</div>';

                document.body.insertAdjacentHTML("beforeend", markup);
                miniPlayer = document.getElementById("shared-global-mini-deck");

                setupMoveableDragEngine(miniPlayer);
                setupMiniPlayerControllers();
            }
            updateMiniplayerDataTrack();
        } else if ((isMusicTabActive || audio.paused || !audio.src) && miniPlayer) {
            miniPlayer.remove();
        }
    }

    function updateMiniplayerDataTrack() {
        const titleNode = document.getElementById("mini-deck-title");
        const imageNode = document.getElementById("mini-deck-img");
        const pauseBtn = document.getElementById("mini-deck-pause-btn");

        const localTitle = localStorage.getItem("audio_active_title") || window.audioEngineSrcTitle;
        const localCover = localStorage.getItem("audio_active_img") || window.audioEngineSrcCover;

        if (titleNode && localTitle) titleNode.textContent = localTitle;
        if (imageNode && localCover) imageNode.src = localCover;
        if (pauseBtn) pauseBtn.textContent = audio.paused ? "▶" : "⏸";
    }

    function setupMiniPlayerControllers() {
        const miniPauseBtn = document.getElementById("mini-deck-pause-btn");
        const scrubBar = document.getElementById("mini-deck-scrub-bar");

        if (miniPauseBtn) {
            miniPauseBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                if (!audio.paused) {
                    audio.pause();
                    miniPauseBtn.textContent = "▶";
                } else {
                    audio.play().catch(err => console.log("Mini playback crash:", err));
                    miniPauseBtn.textContent = "⏸";
                }
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
            if (e.target.closest("button") || e.target.closest("#mini-deck-scrub-bar")) return;
            
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
            let currentClientX = 0;
            let currentClientY = 0;

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

    // Intercept clicks on the playlist tiles to store info into persistent storage
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
            
            updateMiniplayerDataTrack();
        }
    });

    // Continuously sync playhead parameters down to localStorage caches
    audio.addEventListener("timeupdate", () => {
        if (!audio.paused && audio.src) {
            localStorage.setItem("audio_active_time", audio.currentTime);
        }
        const fillNode = document.getElementById("mini-deck-fill");
        if (fillNode && !isNaN(audio.duration) && isFinite(audio.duration)) {
            fillNode.style.width = ((audio.currentTime / audio.duration) * 100) + "%";
        }
    });

    audio.addEventListener("pause", () => {
        localStorage.removeItem("audio_active_time");
        processGlobalMiniplayerVisibility();
    });
    audio.addEventListener("play", processGlobalMiniplayerVisibility);
    
    // Fallback sync polling loop to keep track data accurate across navigations
    setInterval(processGlobalMiniplayerVisibility, 500);
    processGlobalMiniplayerVisibility();
});
