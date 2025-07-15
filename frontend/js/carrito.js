// js/carrito.js

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function toggleCarrito() {
    const popup = document.getElementById("carrito-popup");
    popup.classList.toggle("hidden");
    renderizarCarrito();
}

function agregarAlCarrito(producto) {
    const existente = carrito.find(p =>
        p.nombre === producto.nombre && p.nodo === producto.nodo
    );

    if (existente) {
        existente.cantidad += producto.cantidad;
    } else {
        carrito.push(producto);
    }

    guardarCarrito();
    actualizarContador();
    mostrarToast(`✅ "${producto.nombre}" agregado al carrito`);
}

function actualizarContador() {
    const total = carrito.reduce((acc, prod) => acc + prod.cantidad, 0);
    document.getElementById("carrito-count").textContent = total;
}

function renderizarCarrito() {
    const lista = document.getElementById("carrito-lista");
    lista.innerHTML = "";

    carrito.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.nombre} (${item.cantidad}) - ${item.nodo}`;
        lista.appendChild(li);
    });
}

document.getElementById("finalizar").addEventListener("click", async () => {
    const ong = new URLSearchParams(window.location.search).get("ong");
    if (!carrito.length || !ong) return;

    const resultados = [];

    for (const item of carrito) {
        try {
            const res = await fetch(`${item.url}/pedido/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    producto: item.nombre,
                    cantidad: item.cantidad,
                    organizacion: ong,
                }),
            });

            const data = await res.json();
            resultados.push(data);
        } catch (error) {
            resultados.push({ status: "error", producto: item.nombre });
        }
    }

    localStorage.removeItem("carrito");
    window.location.href = `confirmacion.html?ong=${ong}`;
});
