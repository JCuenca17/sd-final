// js/inventario.js

// Configura tus nodos aquí (puedes agregar más fácilmente)
window.nodos = [
    { nombre: "Proveedor A - Banco de Agua", url: "http://localhost:8000" },
    { nombre: "Proveedor B - Banco de Papel", url: "http://localhost:8001" }
];

async function cargar() {
    const contenedor = document.getElementById("inventario");

    for (const nodo of window.nodos) {
        try {
            const res = await fetch(`${nodo.url}/inventario/`);
            const productos = await res.json();

            productos.forEach(prod => {
                const card = document.createElement("div");
                card.className = "card";

                const nombre = document.createElement("h3");
                nombre.textContent = prod.nombre;

                const desc = document.createElement("p");
                desc.textContent = prod.descripcion;

                const nodoLabel = document.createElement("p");
                nodoLabel.className = "nodo";
                nodoLabel.textContent = nodo.nombre;

                const cantidadInput = document.createElement("input");
                cantidadInput.type = "number";
                cantidadInput.min = "1";
                cantidadInput.max = prod.cantidad;
                cantidadInput.value = "1";

                const btn = document.createElement("button");
                btn.textContent = "Agregar al carrito";
                btn.onclick = () => {
                    const cantidad = parseInt(cantidadInput.value);
                    if (cantidad > 0 && cantidad <= prod.cantidad) {
                        agregarAlCarrito({
                            nombre: prod.nombre,
                            cantidad: cantidad,
                            nodo: nodo.nombre,
                            url: nodo.url
                        });
                    }
                };

                const acciones = document.createElement("div");
                acciones.className = "acciones";
                acciones.appendChild(cantidadInput);
                acciones.appendChild(btn);

                card.appendChild(nombre);
                card.appendChild(desc);
                card.appendChild(nodoLabel);
                card.appendChild(acciones);

                contenedor.appendChild(card);
            });
        } catch (e) {
            console.error("Error al cargar desde", nodo.url);
        }
    }
}

document.addEventListener("DOMContentLoaded", cargar);
