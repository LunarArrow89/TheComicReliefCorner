function loadHTML(id, file, callback) {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.getElementById(id).innerHTML = xhr.responseText;

            if (callback) callback();
        }
    };

    xhr.open("GET", file, true);
    xhr.send();
}

/* Load sidebar */
loadHTML("sidebar-container", "sidebar.html");

/* Load header THEN start clock */
loadHTML("header-container", "header.html", startClock);


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
