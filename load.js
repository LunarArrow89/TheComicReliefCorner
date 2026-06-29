// UNIVERSAL STATE ENGINE INTERFACES
window.audioEngine = window.audioEngine || new Audio();
window.isAudioLooping = window.isAudioLooping || false;

document.addEventListener("DOMContentLoaded", () => {
    const audio = window.audioEngine;
    
    // Core Layout Element Mappings
    const playBtn = document.getElementById("play-pause-btn");
    const shape = document.getElementById("btn-shape");
    const slider = document.getElementById("progress-slider");
    const timeLabel = document.getElementById("current-time-label");
    const loopBtn = document.getElementById("loop-toggle-btn");
    const tiles = document.querySelectorAll(".square-song-tile");
    const searchBox = document.getElementById("song-search");

    // Initialize Default Media Source if blank
    if (!audio.src && tiles.length > 0) {
        audio.src = tiles[0].getAttribute("data-src");
    }

    // 1. DYNAMIC INITIALIZATION CHECKS 
    // Synchronize UI if song is already running when tab opens
    if (playBtn && shape) {
        if (!audio.paused) {
            shape.className = "play-state-shape pause-bars";
        }
        
        playBtn.addEventListener("click", () => {
            if (audio.paused) {
                audio.play();
                shape.className = "play-state-shape pause-bars";
            } else {
                audio.pause();
                shape.className = "play-state-shape triangle";
            }
        });
    }

    // 2. TOGGLEABLE GROOVE LOOP ENGINE
    if (loopBtn) {
        if (window.isAudioLooping) loopBtn.classList.add("loop-active");
        
        loopBtn.addEventListener("click", () => {
            window.isAudioLooping = !window.isAudioLooping;
            audio.loop = window.isAudioLooping;
            loopBtn.classList.toggle("loop-active", window.isAudioLooping);
        });
    }

    // 3. SEAMLESS RE-POSITIONING TIMELINE TRACK SCRUBBER
    if (slider) {
        // Change audio location instantly on input adjustments or timeline clicks
        slider.addEventListener("input", () => {
            if (!isNaN(audio.duration) && isFinite(audio.duration)) {
                audio.currentTime = (slider.value / 100) * audio.duration;
            }
        });

        // Continuous state updater loop callback
        audio.addEventListener("timeupdate", () => {
            if (!isNaN(audio.duration) && !slider.matches(":focus")) {
                slider.value = (audio.currentTime / audio.duration) * 100;
                
                let mins = Math.floor(audio.currentTime / 60);
                let secs = Math.floor(audio.currentTime % 60);
                timeLabel.textContent = `${mins}:${secs < 10 ? '0' + secs : secs}`;
            }
        });
    }

    // 4. THEATER DECK TILE LOAD INITIALIZER INTERCEPTORS
    tiles.forEach(tile => {
        tile.addEventListener("click", () => {
            tiles.forEach(t => t.classList.remove("active"));
            tile.classList.add("active");

            audio.src = tile.getAttribute("data-src");
            document.getElementById("display-title").textContent = tile.getAttribute("data-title");
            document.getElementById("display-cover").src = tile.getAttribute("data-img");

            audio.loop = window.isAudioLooping;
            audio.play();
            if (shape) shape.className = "play-state-shape pause-bars";
        });
    });

    // 5. LIVE MATRIX INTERFACE LOOKUP STRING PATTERNS
    if (searchBox) {
        searchBox.addEventListener("input", () => {
            const query = searchBox.value.toLowerCase();
            tiles.forEach(tile => {
                const titleText = tile.getAttribute("data-title").toLowerCase();
                tile.style.display = titleText.includes(query) ? "flex" : "none";
            });
        });
    }

    // 6. DETACHED MULTI-TAB MINI-PLAYER CORNER CORE RENDERS
    // Automatically generates a global miniature container if it's missing on other routing layers
    function processMiniplayerVisibilities() {
        // Detects if the current viewpoint tab is our master audio lounge viewport hub
        const isInMusicTab = document.getElementById("song-search") !== null;
        let miniPlayer = document.getElementById("shared-global-mini-deck");

        if (!isInMusicTab && !audio.paused) {
            // Generate standard structural nodes dynamically if they aren't embedded directly into page headers
            if (!miniPlayer) {
                const markup = `
                    <div id="shared-global-mini-deck" class="global-mini-player">
                        <div class="mini-player-top-row">
                            <div class="mini-cover-wrap"><img id="mini-deck-img" src="${document.getElementById("display-cover")?.src || 'popstar.jpeg'}" alt="Mini Cover"></div>
                            <div class="mini-details-wrap">
                                <span class="mini-status-tag">Playing Outside Lounge</span>
                                <p id="mini-deck-title" class="mini-title">${document.getElementById("display-title")?.textContent || 'Popstar Theme'}</p>
                            </div>
                            <button id="mini-deck-pause-btn" class="mini-btn"><i class="fa-solid fa-pause"></i></button>
                        </div>
                        <div class="mini-progress-line-bar"><div id="mini-deck-fill" class="mini-progress-fill-node"></div></div>
                    </div>`;
                document.body.insertAdjacentHTML("beforeend", markup);
                miniPlayer = document.getElementById("shared-global-mini-deck");
                
                // Active Mini Control Interactions Toggles
                document.getElementById("mini-deck-pause-btn").addEventListener("click", () => {
                    if (!audio.paused) {
                        audio.pause();
                        document.getElementById("mini-deck-pause-btn").innerHTML = '<i class="fa-solid fa-play"></i>';
                    } else {
                        audio.play();
                        document.getElementById("mini-deck-pause-btn").innerHTML = '<i class="fa-solid fa-pause"></i>';
                    }
                });
            }
            
            // Sync mini timeline fill lines node location intervals
            audio.addEventListener("timeupdate", () => {
                const fillNode = document.getElementById("mini-deck-fill");
                if (fillNode && !isNaN(audio.duration)) {
                    fillNode.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
                }
            });
        } else if ((isInMusicTab || audio.paused) && miniPlayer) {
            // Remove float container elements cleanly if user runs back home to the primary playback panel
            miniPlayer.remove();
        }
    }

    // Attach checking hooks into navigation state modifications listeners loops
    audio.addEventListener("pause", processMiniplayerVisibilities);
    audio.addEventListener("play", processMiniplayerVisibilities);
    
    // Execute a visibility frame rendering assessment every single time layout routing updates inside load.js
    const pipelineObserver = new MutationObserver(processMiniplayerVisibilities);
    const contentNode = document.querySelector(".main") || document.body;
    pipelineObserver.observe(contentNode, { childList: true, subtree: true });
    processMiniplayerVisibilities();
});
