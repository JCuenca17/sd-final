// js/confirmacion.js

let segundos = 5;
const span = document.getElementById("contador");
const ong = new URLSearchParams(window.location.search).get("ong") || "";

const intervalo = setInterval(() => {
    segundos--;
    span.textContent = segundos;

    if (segundos <= 0) {
        clearInterval(intervalo);
        window.location.href = `index.html?ong=${encodeURIComponent(ong)}`;
    }
}, 1000);
