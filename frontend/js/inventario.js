// js/inventario.js

// Aquí defines tus nodos con nombre y URL
window.nodos = [
    { nombre: "Proveedor A", url: "http://localhost:8000" },
    { nombre: "Proveedor B", url: "http://localhost:8001" }
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

                const proveedor = document.createElement("p");
                proveedor.className = "nodo";
                proveedor.textContent = `Proveedor: ${nodo.nombre}`;

                const cantidad = document.createElement("p");
                cantidad.textContent = `Cantidad disponible: ${prod.cantidad}`;

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
                card.appendChild(proveedor);
                card.appendChild(cantidad);
                card.appendChild(acciones);

                contenedor.appendChild(card);
            });
        } catch (e) {
            console.error("Error al cargar desde", nodo.url);
        }
    }
}

document.addEventListener("DOMContentLoaded", cargar);
