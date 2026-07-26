<!DOCTYPE html>
<html lang="en">
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <title>The Comic Relief Corner - Music</title>
 <!-- Unified CSS Styling Engine Link -->
 <link rel="stylesheet" href="style.css?v=unified_spacing">
 <!-- Loader Script Engine Link -->
 <script defer src="load.js"></script>
 
 <style>
 /* MATCHING YOUR SKETCH MOCKUP STACK ORDER */
 .showcase-box {
 display: flex;
 flex-direction: column;
 align-items: center;
 justify-content: center;
 text-align: center;
 }
 /* Force the header or text below the image wrapper */
 .showcase-img-wrap {
 order: 1; /* Puts image first */
 margin-bottom: 15px;
 }
 .showcase-title {
 order: 2; /* Puts text directly beneath the image */
 margin: 0;
 }
 /* Completely hide the header tag element from view */
 .showcase-header {
 display: none !important;
 }
 /* CONTROL DECK VISIBILITY MODIFIER */
 .custom-control-bar {
 display: none; /* Hidden by default until a track is chosen */
 background: #2a2a2a;
 border-radius: 8px;
 padding: 10px;
 }
 /* CSS Class triggered via JavaScript engine when a track becomes active */
 .custom-control-bar.deck-visible {
 display: flex !important;
 }
 /* PURE HTML/CSS DRAWN LOOP ARROW BUTTON */
 .loop-control-node {
 background: #2a2a2a;
 border: 2px solid #555;
 border-radius: 6px;
 cursor: pointer;
 width: 42px;
 height: 42px;
 display: flex;
 align-items: center;
 justify-content: center;
 transition: all 0.2s ease;
 position: relative;
 }
 .loop-html-container {
 width: 22px;
 height: 16px;
 position: relative;
 }
 .loop-track {
 position: absolute;
 top: 2px;
 left: 2px;
 width: 16px;
 height: 10px;
 border: 2px solid #fff;
 border-radius: 3px;
 background: transparent;
 }
 .loop-mask-top {
 position: absolute;
 top: 0px;
 left: 5px;
 width: 6px;
 height: 4px;
 background: #2a2a2a;
 transition: background 0.2s ease;
 }
 .loop-arrowhead {
 position: absolute;
 top: -2px;
 left: 7px;
 width: 0;
 height: 0;
 border-left: 4px solid transparent;
 border-right: 4px solid transparent;
 border-bottom: 6px solid #fff;
 }
 /* ACTIVE HIGHLIGHT STATE: VIVID HOT PINK */
 .loop-control-node.loop-active {
 background-color: #ff69b4;
 border-color: #ff1493;
 }
 .loop-control-node.loop-active .loop-mask-top {
 background: #ff69b4;
 }
 .loop-control-node:hover {
 background-color: #3a3a3a;
 }
 .loop-control-node.loop-active:hover {
 background-color: #ff1493;
 }
 </style>
</head>
<body>
 <!-- TARGET LAYOUT MODULE BOX CONTAINERS -->
 <div id="sidebar-container"></div>
 <div id="header-container"></div>
 <!-- CENTRAL MAIN WORKSPACE MODULE CANVAS -->
 <div class="main">
 <div class="hero">
 <h1>The Music Lounge</h1>
 <p>Turn up the volume, adjust your position, and lock the groove.</p>
 </div>
 <!-- SPLIT INTERFACE GRID ARCHITECTURE -->
 <div class="split-player-layout">
 
 <!-- LEFT COLUMN: LIVE QUERY SEARCH & SQUARE TRACK COVER MATRIX -->
 <div class="music-library-column">
 <div class="music-search-wrap">
 <input type="text" id="song-search" class="music-search-box" placeholder="Search songs...">
 </div>
 
 <div class="square-song-grid">
 <!-- ALBUM OBJECT CARD ITEM 1 -->
 <div class="square-song-tile active" data-src="Pop_star.mp3" data-title="Popstar Theme" data-img="popstar.jpeg">
 <div class="tile-art">
 <div class="tile-play-overlay-geo"></div>
 <img src="popstar.jpeg" class="tile-img" alt="Track Cover">
 </div>
 <p class="tile-title">Popstar Theme</p>
 </div>
 
 <!-- ALBUM OBJECT CARD ITEM 2 -->
 <div class="square-song-tile" data-src="https://soundhelix.com" data-title="Synthwave Sunsets" data-img="luna.gif">
 <div class="tile-art">
 <div class="tile-play-overlay-geo"></div>
 <img src="luna.gif" class="tile-img" alt="Track Cover">
 </div>
 <p class="tile-title">Synthwave Sunsets</p>
 </div>
 </div>
 </div>
 
 <!-- RIGHT COLUMN: NOW PLAYING THEATER WINDOW & TIMELINE DECK -->
 <div class="now-playing-column">
 <div class="showcase-box">
 <span class="showcase-header">Now Playing...</span>
 <div class="showcase-img-wrap">
 <img src="music-icon.png" id="display-cover" alt="Song Image">
 </div>
 <h2 id="display-title" class="showcase-title">No song is playing</h2>
 </div>
 
 <!-- DECK BAR SYSTEM COMPONENT PANEL ROW PANEL MODULE -->
 <div id="control-deck-bar" class="custom-control-bar">
 <div class="playback-btn-wrap">
 <button id="play-pause-btn" class="custom-geo-btn">
 <div id="btn-shape" class="play-state-shape triangle"></div>
 </button>
 </div>
 <!-- POSITION-ADJUSTING RANGE SCRUBBER SLIDER -->
 <div class="progress-container">
 <span id="current-time-label" class="time-stamp">0:00</span>
 <input type="range" id="progress-slider" min="0" max="100" step="0.01" value="0">
 </div>
 <!-- TOGGLE TRACK REPEAT MODIFIER BUTTON -->
 <button id="loop-toggle-btn" class="loop-control-node" title="Toggle Loop Mode">
 <div class="loop-html-container">
 <div class="loop-track"></div>
 <div class="loop-mask-top"></div>
 <div class="loop-arrowhead"></div>
 </div>
 </button>
 </div>
 </div> <!-- CLOSE RIGHT LAYOUT COLUMN -->
 </div> <!-- CLOSE SPLIT PLAYER LAYOUT -->
 </div> <!-- CLOSE PRIMARY MAIN WORKSPACE WRAPPER BOX -->
 <!-- UNIVERSAL RUNTIME INTERFACE ARCHITECTURE JAVASCRIPT CONTROL ENGINE -->
 <script>
 if (!window.audioEngine) {
     window.audioEngine = new Audio();
 }
 window.isAudioLooping = window.isAudioLooping || false;

 document.addEventListener("DOMContentLoaded", () => {
 const audio = window.audioEngine;
 const playBtn = document.getElementById("play-pause-btn");
 const shape = document.getElementById("btn-shape");
 const slider = document.getElementById("progress-slider");
 const timeLabel = document.getElementById("current-time-label");
 const loopBtn = document.getElementById("loop-toggle-btn");
 const tiles = document.querySelectorAll(".square-song-tile");
 const displayCover = document.getElementById("display-cover");
 const displayTitle = document.getElementById("display-title");
 const searchBox = document.getElementById("song-search");
 const deckBar = document.getElementById("control-deck-bar");

 let isUserDraggingSlider = false;

 function synchronizePlayerUI() {
     if (!shape) return;
     if (!audio.paused && audio.src && audio.src !== window.location.href) {
         shape.className = "play-state-shape pause-bars";
     } else {
         shape.className = "play-state-shape triangle";
     }
 }

 // FIX: Pull cached memory parameters out of storage to restore titles when coming back to the page
 const localStoredSrc = localStorage.getItem("audio_active_src");
 const localStoredTitle = localStorage.getItem("audio_active_title");
 const localStoredImg = localStorage.getItem("audio_active_img");

 if (localStoredSrc && (!audio.src || audio.src === window.location.href)) {
     audio.src = localStoredSrc;
     const savedTime = localStorage.getItem("audio_active_time");
     if (savedTime) audio.currentTime = parseFloat(savedTime);
 }

 // Check if a song is configured in global storage or actively playing in the background
 if (localStoredSrc || (!audio.paused && audio.src && audio.src !== window.location.href)) {
     if (deckBar) deckBar.classList.add("deck-visible");
     if (displayTitle) displayTitle.textContent = localStoredTitle || "Track Syncing...";
     if (displayCover && localStoredImg) displayCover.src = localStoredImg;
     
     // Highlight the active tile in your list matching the cached song source path
     tiles.forEach(t => {
         if (t.getAttribute("data-src") === localStoredSrc) {
             t.classList.add("active");
         } else {
             t.classList.remove("active");
         }
     });
 } else {
     if (displayTitle) displayTitle.textContent = "No song is playing";
     if (displayCover) displayCover.src = "music-icon.png";
     if (deckBar) deckBar.classList.remove("deck-visible");
 }
 synchronizePlayerUI();

 if (window.isAudioLooping && loopBtn) {
     loopBtn.classList.add("loop-active");
     audio.loop = true;
 }

 if (playBtn) {
     playBtn.addEventListener("click", () => {
         if (audio.paused) {
             audio.play().then(synchronizePlayerUI).catch(err => console.log("Playback failed:", err));
             localStorage.setItem("audio_was_playing", "true");
         } else {
             audio.pause();
             synchronizePlayerUI();
             localStorage.setItem("audio_was_playing", "false");
         }
     });
 }

 if (loopBtn) {
     loopBtn.addEventListener("click", () => {
         window.isAudioLooping = !window.isAudioLooping;
         audio.loop = window.isAudioLooping;
         loopBtn.classList.toggle("loop-active", window.isAudioLooping);
     });
 }

 function formatAndDisplayTime(secondsValue) {
     if (isNaN(secondsValue) || !isFinite(secondsValue)) return;
     let mins = Math.floor(secondsValue / 60);
     let secs = Math.floor(secondsValue % 60);
     if (timeLabel) {
         timeLabel.textContent = mins + ":" + (secs < 10 ? "0" + secs : secs);
     }
 }

 if (slider) {
     slider.addEventListener("input", () => {
         isUserDraggingSlider = true;
         if (!isNaN(audio.duration) && isFinite(audio.duration)) {
             const targetTime = (parseFloat(slider.value) / 100) * audio.duration;
             formatAndDisplayTime(targetTime);
         }
     });

     slider.addEventListener("change", () => {
         if (!isNaN(audio.duration) && isFinite(audio.duration)) {
             audio.currentTime = (parseFloat(slider.value) / 100) * audio.duration;
         }
         isUserDraggingSlider = false;
     });
 }

 audio.addEventListener("timeupdate", () => {
     if (!isNaN(audio.duration) && isFinite(audio.duration) && !isUserDraggingSlider) {
         slider.value = (audio.currentTime / audio.duration) * 100;
         formatAndDisplayTime(audio.currentTime);
     }
 });

 audio.addEventListener("play", synchronizePlayerUI);
 audio.addEventListener("pause", synchronizePlayerUI);

 tiles.forEach(tile => {
     tile.addEventListener("click", () => {
         tiles.forEach(t => t.classList.remove("active"));
         tile.classList.add("active");
         
         const songSrc = tile.getAttribute("data-src");
         const songTitle = tile.getAttribute("data-title");
         const songImg = tile.getAttribute("data-img");
         
         audio.src = songSrc;
         if (displayTitle) displayTitle.textContent = songTitle;
         if (displayCover && songImg) displayCover.src = songImg;
         
         // Update localStorage parameters immediately on selection
         localStorage.setItem("audio_active_src", songSrc);
         localStorage.setItem("audio_active_title", songTitle);
         localStorage.setItem("audio_active_img", songImg);
         localStorage.setItem("audio_was_playing", "true");

         if (deckBar) deckBar.classList.add("deck-visible");
         audio.loop = window.isAudioLooping;
         audio.play().then(synchronizePlayerUI).catch(err => console.log("Tile play crash:", err));
     });
 });

 if (searchBox) {
     searchBox.addEventListener("input", () => {
         const query = searchBox.value.toLowerCase();
         tiles.forEach(tile => {
             const titleText = tile.getAttribute("data-title").toLowerCase();
             tile.style.display = titleText.includes(query) ? "flex" : "none";
         });
     });
 }
 });
 </script>
</body>
</html>
