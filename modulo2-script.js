let platos = [];
let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

let detalle = [];

const platoSelect = document.getElementById("platoSelect");
const detalleTabla = document.getElementById("detalle");

// ================== CARGAR PLATOS ==================
function cargarPlatos() {
    let seleccionado = platoSelect.value;

    let nuevos = JSON.parse(localStorage.getItem("platos")) || [];

    if (nuevos.length === 0) return;

    platos = nuevos;

    platoSelect.innerHTML = "";

    let seleccionadoExiste = false;

    platos
        .filter(p => p.estado && p.estado.trim() === "Activo")
        .forEach(p => {
            let option = document.createElement("option");
            option.value = p.codigo;
            option.textContent = `${p.nombre} - S/ ${p.precio}`;

            if (p.codigo === seleccionado) {
                option.selected = true;
                seleccionadoExiste = true;
            }

            platoSelect.appendChild(option);
        });

    if (!seleccionadoExiste && platoSelect.options.length > 0) {
        platoSelect.selectedIndex = 0;
    }
}

cargarPlatos();

// ================== AUTO ACTUALIZACIÓN ==================
let snapshot = JSON.stringify(platos);

setInterval(() => {
    let nuevos = JSON.parse(localStorage.getItem("platos")) || [];
    let nuevoSnapshot = JSON.stringify(nuevos);

    if (nuevoSnapshot !== snapshot) {
        snapshot = nuevoSnapshot;
        cargarPlatos();
    }
}, 2000);

// ================== GENERAR CÓDIGO ==================
function generarCodigo() {
    return "PED" + String(pedidos.length + 1).padStart(3, "0");
}
document.getElementById("codigoPedido").value = generarCodigo();

// ================== AGREGAR PLATO ==================
function agregarPlato() {
    let codigo = platoSelect.value;
    let cantidad = parseInt(document.getElementById("cantidad").value);
    let obs = document.getElementById("obs").value;

    let plato = platos.find(p => p.codigo === codigo);

    if (!plato) return alert("Plato no encontrado");
    if (!cantidad || cantidad <= 0) return alert("Cantidad inválida");

    let subtotal = cantidad * parseFloat(plato.precio);

    detalle.push({
        codigo,
        nombre: plato.nombre,
        precio: plato.precio,
        tiempo: parseInt(plato.tiempo) || 0, // 🔥 NUEVO
        cantidad,
        subtotal,
        obs
    });

    renderDetalle();
}

// ================== RENDER ==================
function renderDetalle() {
    detalleTabla.innerHTML = "";
    let total = 0;
    let tiempoTotal = 0; // 🔥 NUEVO

    detalle.forEach(d => {
        total += d.subtotal;
        tiempoTotal += d.tiempo * d.cantidad; // 🔥 NUEVO

        detalleTabla.innerHTML += `
        <tr>
            <td>${d.nombre}</td>
            <td>${d.cantidad}</td>
            <td>${d.precio}</td>
            <td>${d.subtotal.toFixed(2)}</td>
            <td>${d.obs}</td>
        </tr>
        `;
    });

    document.getElementById("total").textContent = total.toFixed(2);
    document.getElementById("tiempoTotal").textContent = tiempoTotal; // 🔥 NUEVO

    // 🔥 PRIORIDAD SUGERIDA (NO OBLIGATORIA)
    let prioridadAuto = "Normal";

    if (tiempoTotal > 40) prioridadAuto = "Urgente";
    else if (tiempoTotal >= 20) prioridadAuto = "Alta";

    document.getElementById("prioridad").value = prioridadAuto;
}

// ================== PRIORIDAD ==================
document.getElementById("prioridad").addEventListener("change", function () {
    document.getElementById("justificacion").style.display =
        this.value === "Urgente" ? "block" : "none";
});

// ================== GUARDAR ==================
document.getElementById("formPedido").addEventListener("submit", function (e) {
    e.preventDefault();

    let mozo = document.getElementById("mozo").value.trim();
    let mesa = parseInt(document.getElementById("mesa").value);
    let prioridad = document.getElementById("prioridad").value;
    let justificacion = document.getElementById("justificacion").value;

    if (mozo.length < 3) return alert("Mozo inválido");
    if (isNaN(mesa) || mesa <= 0 || mesa > 50) return alert("Mesa inválida");
    if (detalle.length === 0) return alert("Agregue platos");

    if (prioridad === "Urgente" && justificacion.length < 10)
        return alert("Justificación requerida");

    let pedido = {
        codigo: generarCodigo(),
        mozo,
        mesa,
        fecha: new Date().toLocaleString(),
        prioridad,
        justificacion,
        estado: "Registrado",
        detalle: [...detalle],
        total: document.getElementById("total").textContent,
        tiempoTotal: document.getElementById("tiempoTotal").textContent // 🔥 NUEVO
    };

    pedidos.push(pedido);
    localStorage.setItem("pedidos", JSON.stringify(pedidos));

    location.reload();
});

// ================== MOSTRAR ==================
function mostrarPedidos() {
    pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

    let tabla = document.getElementById("tablaPedidos");
    tabla.innerHTML = "";

    pedidos.forEach((p, i) => {
        tabla.innerHTML += `
        <tr>
            <td>${p.codigo}</td>
            <td>${p.mesa}</td>
            <td>${p.mozo}</td>
            <td>S/ ${p.total}</td>
            <td>${p.estado}</td>
            <td>
                <button onclick="enviar(${i})">Enviar</button>
                <button onclick="entregar(${i})">Entregar</button>
                <button onclick="cancelar(${i})">Cancelar</button>
            </td>
        </tr>
        `;
    });
}

// ================== ESTADOS ==================
function enviar(i) {
    pedidos[i].estado = "Enviado a cocina";
    localStorage.setItem("pedidos", JSON.stringify(pedidos));
    mostrarPedidos();
}

function entregar(i) {
    pedidos[i].estado = "Entregado";
    localStorage.setItem("pedidos", JSON.stringify(pedidos));
    mostrarPedidos();
}

function cancelar(i) {
    pedidos[i].estado = "Cancelado";
    localStorage.setItem("pedidos", JSON.stringify(pedidos));
    mostrarPedidos();
}

mostrarPedidos();