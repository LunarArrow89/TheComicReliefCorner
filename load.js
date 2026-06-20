/* =========================
   LOAD HTML COMPONENTS
========================= */

function loadHTML(id, file, callback) {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const container = document.getElementById(id);

            if (!container) return;

            container.innerHTML = xhr.responseText;

            if (callback) callback();
        }
    };

    xhr.open("GET", file, true);
    xhr.send();
}

/* =========================
   LOAD SIDEBAR
========================= */

loadHTML("sidebar-container", "sidebar.html");

/* =========================
   LOAD HEADER + START CLOCK
========================= */

loadHTML("header-container", "header.html", startClock);

/* =========================
   CLOCK FUNCTION
========================= */

function startClock() {
    function updateClock() {
        const timeBox = document.getElementById("timeBox");
        const dateBox = document.getElementById("dateBox");

        if (!timeBox || !dateBox) return;

        const now = new Date();

        timeBox.innerText = now.toLocaleTimeString();
        dateBox.innerText = now.toLocaleDateString();
    }

    updateClock();
    setInterval(updateClock, 1000);
}
