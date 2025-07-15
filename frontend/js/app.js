// js/app.js

// Obtener nombre de la organización desde la URL
function getOng() {
    const params = new URLSearchParams(window.location.search);
    return params.get("ong");
}

function logout() {
    localStorage.removeItem("carrito");
    window.location.href = "login.html";
}

function mostrarToast(mensaje) {
    const toast = document.getElementById("toast");
    toast.textContent = mensaje;
    toast.classList.remove("hidden");
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
        toast.classList.add("hidden");
    }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
    const ong = getOng();
    if (!ong) {
        window.location.href = "login.html";
    } else {
        document.getElementById("ong-name").textContent = `Sesión: ${ong}`;
    }
});
