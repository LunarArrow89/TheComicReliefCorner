/* ========================================================================== 
   LOAD.JS - GLOBAL COMPONENT & ASYNCHRONOUS TEMPLATE ENGINE 
   ========================================================================== */

// Mount global variables safely to survive navigation
window.audioEngine = window.audioEngine || new Audio();
window.isAudioLooping = window.isAudioLooping || false;

document.addEventListener("DOMContentLoaded", () => {
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
});
