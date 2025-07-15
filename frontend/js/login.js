// js/login.js

document.getElementById("login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const nombre = document.getElementById("ong").value.trim();

    if (nombre.length > 0) {
        window.location.href = `index.html?ong=${encodeURIComponent(nombre)}`;
    }
});
