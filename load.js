async function loadComponent(id, file) {
    try {
        const res = await fetch(file);

        if (!res.ok) {
            console.error(`Failed to load ${file}: ${res.status}`);
            return;
        }

        const html = await res.text();
        document.getElementById(id).innerHTML = html;

    } catch (err) {
        console.error(`Error loading ${file}:`, err);
    }
}

/* Load Sidebar */
loadComponent("sidebar-container", "sidebar.html");

/* Load Header */
loadComponent("header-container", "header.html");