/* ==========================================================================
   PART 1: ASYNCHRONOUS COMPONENT LOADER & TARGET REAL-TIME CLOCK ENGINE
   ========================================================================== */

// Mount variables onto global browser window namespace to survive async tab swaps
window.audioEngine = window.audioEngine || new Audio();
window.isAudioLooping = window.isAudioLooping || false;

document.addEventListener("DOMContentLoaded", () => {
    const audio = window.audioEngine;

    // 🛠️ 1. GLOBAL ASYNCHRONOUS SIDENAV & HEADER LOADER ENGINE
    // Automatically checks every single tab you visit and loads your clean component files
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
                    executeSystemTimeTicks(); // Instantly update clock elements as soon as header mounts
                })
                .catch(err => console.error("Error loading header layout:", err));
        }
    }

    // 🕒 2. HIGH-ACCURACY DIGITAL REAL-TIME CLOCK RENDER INTERVAL
    // Direct selector mapping targeting your exact .time-box and .date-box template cards
    function executeSystemTimeTicks() {
        const timeBox = document.querySelector(".time-box");
        const dateBox = document.querySelector(".date-box");
        
        if (timeBox || dateBox) {
            const now = new Date();
            
            // Render hours and minutes string configurations cleanly
            if (timeBox) {
                timeBox.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
            
            // Format calendar matrix matching your deep plum visual headers
            if (dateBox) {
                const choices = { month: 'short', day: 'numeric' };
                dateBox.textContent = now.toLocaleDateString([], choices).toUpperCase();
            }
        }
    }

    // Fire engines immediately on window compilation load loops
    executeGlobalTemplateLighter();
    setInterval(executeSystemTimeTicks, 1000);

    // Core Music Interface Layout Element Mappings
    const playBtn = document.getElementById("play-pause-btn");
    const shape = document.getElementById("btn-shape");
    const slider = document.getElementById("progress-slider");
    const timeLabel = document.getElementById("current-time-label");
    const loopBtn = document.getElementById("loop-toggle-btn");
    const tiles = document.querySelectorAll(".square-song-tile");
    const searchBox = document.getElementById("song-search");

    // Initialize Default Media Directory Track if blank
    if (!audio.src && tiles.length > 0) {
        audio.src = tiles[0].getAttribute("data-src");
    }

    // Synchronize UI visual states if track is already running out-of-tab
    if (playBtn && shape && !audio.paused) {
        shape.className = "play-state-shape pause-bars";
    }
    if (loopBtn && window.isAudioLooping) {
        loopBtn.classList.add("loop-active");
    }

    // Dynamic Master Play / Pause Geometric Toggles
    if (playBtn) {
        playBtn.addEventListener("click", () => {
            if (audio.paused) {
                audio.play();
                if (shape) shape.className = "play-state-shape pause-bars";
            } else {
                audio.pause();
                if (shape) shape.className = "play-state-shape triangle";
            }
        });
    }

    // Toggle Groove Infinite Looping Modifiers
    if (loopBtn) {
        loopBtn.addEventListener("click", () => {
            window.isAudioLooping = !window.isAudioLooping;
            audio.loop = window.isAudioLooping;
            loopBtn.classList.toggle("loop-active", window.isAudioLooping);
        });
    }

    // Seamless Position Timeline Location Track Scrubber Input Controls
    if (slider) {
        slider.addEventListener("input", () => {
            if (!isNaN(audio.duration) && isFinite(audio.duration)) {
                audio.currentTime = (slider.value / 100) * audio.duration;
            }
        });

        audio.addEventListener("timeupdate", () => {
            if (!isNaN(audio.duration) && !slider.matches(":focus")) {
                slider.value = (audio.currentTime / audio.duration) * 100;
                let mins = Math.floor(audio.currentTime / 60);
                let secs = Math.floor(audio.currentTime % 60);
                if (timeLabel) {
                    timeLabel.textContent = mins + ":" + (secs < 10 ? '0' + secs : secs);
                }
            }
        });
    }
/* ==========================================================================
   PART 2: TILE SELECTION INTERCEPTORS, SEARCH MATRIX & MINIPLAYER INTERFACES
   ========================================================================== */

    // Theater Deck Grid Song Tile Selection Router Loop
    tiles.forEach(tile => {
        tile.addEventListener("click", () => {
            tiles.forEach(t => t.classList.remove("active"));
            tile.classList.add("active");

            const songSrc = tile.getAttribute("data-src");
            const songTitle = tile.getAttribute("data-title");
            const songImg = tile.getAttribute("data-img");

            audio.src = songSrc;
            
            const displayTitleNode = document.getElementById("display-title");
            const displayCoverNode = document.getElementById("display-cover");
            
            if (displayTitleNode) displayTitleNode.textContent = songTitle;
            if (displayCoverNode && songImg) displayCoverNode.src = songImg;

            audio.loop = window.isAudioLooping;
            audio.play();
            if (shape) shape.className = "play-state-shape pause-bars";
        });
    });

    // Instant Live String Pattern Query Search Filter Lookups
    if (searchBox) {
        searchBox.addEventListener("input", () => {
            const query = searchBox.value.toLowerCase();
            tiles.forEach(tile => {
                const titleText = tile.getAttribute("data-title").toLowerCase();
                tile.style.display = titleText.includes(query) ? "flex" : "none";
            });
        });
    }

    // DETACHED AUTOMATIC TAB SWAP FLOATING MINIPLAYER WIDGET INJECTOR ROUTINE
    function processMiniplayerVisibilities() {
        const isInMusicTab = document.getElementById("song-search") !== null;
        let miniPlayer = document.getElementById("shared-global-mini-deck");

        if (!isInMusicTab && !audio.paused) {
            if (!miniPlayer) {
                const displayCoverNode = document.getElementById("display-cover");
                const displayTitleNode = document.getElementById("display-title");
                
                const currentImg = displayCoverNode ? displayCoverNode.src : "popstar.jpeg";
                const currentTitle = displayTitleNode ? displayTitleNode.textContent : "Popstar Theme";

                let markup = '<div id="shared-global-mini-deck" class="global-mini-player">';
                markup += '  <div class="mini-player-top-row">';
                markup += '    <div class="mini-cover-wrap"><img id="mini-deck-img" src="' + currentImg + '" alt="Mini Cover"></div>';
                markup += '    <div class="mini-details-wrap">';
                markup += '      <span class="mini-status-tag">Playing Outside Lounge</span>';
                markup += '      <p id="mini-deck-title" class="mini-title">' + currentTitle + '</p>';
                markup += '    </div>';
                markup += '    <button id="mini-deck-pause-btn" class="mini-btn"><i class="fa-solid fa-pause"></i></button>';
                markup += '  </div>';
                markup += '  <div class="mini-progress-line-bar"><div id="mini-deck-fill" class="mini-progress-fill-node"></div></div>';
                markup += '</div>';

                document.body.insertAdjacentHTML("beforeend", markup);
                miniPlayer = document.getElementById("shared-global-mini-deck");

                const miniPauseBtn = document.getElementById("mini-deck-pause-btn");
                if (miniPauseBtn) {
                    miniPauseBtn.addEventListener("click", () => {
                        if (!audio.paused) {
                            audio.pause();
                            miniPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
                        } else {
                            audio.play();
                            miniPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                        }
                    });
                }
            }

            // Sync mini progress timeline fill line node percentages
            audio.addEventListener("timeupdate", () => {
                const fillNode = document.getElementById("mini-deck-fill");
                if (fillNode && !isNaN(audio.duration)) {
                    fillNode.style.width = ((audio.currentTime / audio.duration) * 100) + "%";
                }
            });
        } else if ((isInMusicTab || audio.paused) && miniPlayer) {
            miniPlayer.remove();
        }
    }

    // Attach visibility evaluation checking triggers to audio play stream parameters
    audio.addEventListener("pause", processMiniplayerVisibilities);
    audio.addEventListener("play", processMiniplayerVisibilities);

    // 🛠️ THE SYSTEM RECOVERY OBSERVER NODE
    // Constantly checks the DOM for mutations. If navigation shifts or containers are cleared,
    // it automatically triggers a hot reload of sidebar and header files instantly!
    const pipelineObserver = new MutationObserver(() => {
        executeGlobalTemplateLighter();
        executeSystemTimeTicks();
        processMiniplayerVisibilities();
    });
    
    // We target the root document element body so it captures structural updates on ANY tab
    pipelineObserver.observe(document.body, { childList: true, subtree: true });
    
    // Initial runtime scan audit check on page compile
    processMiniplayerVisibilities();
});
