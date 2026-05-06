let platos = [];
let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
let facturas = JSON.parse(localStorage.getItem("facturas")) || [];

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

    platos
        .filter(p => p.estado && p.estado.trim() === "Activo")
        .forEach(p => {
            let option = document.createElement("option");
            option.value = p.codigo;
            option.textContent = `${p.nombre} - S/ ${p.precio}`;
            platoSelect.appendChild(option);
        });
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

// ================== CÓDIGO ÚNICO ==================
function generarCodigo() {
    let num = 1;

    while (pedidos.some(p => p.codigo === "PED" + String(num).padStart(3, "0"))) {
        num++;
    }

    return "PED" + String(num).padStart(3, "0");
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
    if (obs.length > 150) return alert("Observación muy larga");

    let subtotal = cantidad * parseFloat(plato.precio);

    detalle.push({
        codigo,
        nombre: plato.nombre,
        precio: plato.precio,
        tiempo: parseInt(plato.tiempo) || 0,
        cantidad,
        subtotal,
        observacion: obs
    });

    renderDetalle();
}

// ================== RENDER ==================
function renderDetalle() {
    detalleTabla.innerHTML = "";
    let total = 0;
    let tiempoTotal = 0;

    detalle.forEach(d => {
        total += d.subtotal;
        tiempoTotal += d.tiempo * d.cantidad;

        detalleTabla.innerHTML += `
        <tr>
            <td>${d.nombre}</td>
            <td>${d.cantidad}</td>
            <td>${d.precio}</td>
            <td>${d.subtotal.toFixed(2)}</td>
            <td>${d.observacion}</td>
        </tr>
        `;
    });

    document.getElementById("total").textContent = total.toFixed(2);
    document.getElementById("tiempoTotal").textContent = tiempoTotal;

    // PRIORIDAD AUTOMÁTICA
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

// ================== VALIDAR FACTURADO ==================
function estaFacturado(pedido) {
    return facturas.some(f =>
        f.pedidos.some(p => p.codigo === pedido.codigo)
    );
}

// ================== GUARDAR ==================
document.getElementById("formPedido").addEventListener("submit", function (e) {
    e.preventDefault();

    let mozo = document.getElementById("mozo").value.trim();
    let mesa = parseInt(document.getElementById("mesa").value);
    let prioridad = document.getElementById("prioridad").value;
    let justificacion = document.getElementById("justificacion").value;

    // VALIDACIONES
    if (mozo.length < 3 || /^\d+$/.test(mozo))
        return alert("Mozo inválido");

    if (isNaN(mesa) || mesa <= 0 || mesa > 50)
        return alert("Mesa inválida");

    if (detalle.length === 0)
        return alert("Agregue platos");

    if (prioridad === "Urgente" && justificacion.length < 10)
        return alert("Justificación mínima 10 caracteres");

    let pedido = {
        codigo: generarCodigo(),
        mozo,
        mesa,
        fecha: new Date().toLocaleString(),
        prioridad,
        justificacion,
        estado: "Enviado a cocina", // ✅ CORREGIDO
        platos: [...detalle],       // ✅ CONSISTENTE CON MÓDULO 3
        total: document.getElementById("total").textContent,
        tiempoTotal: document.getElementById("tiempoTotal").textContent
    };

    pedidos.push(pedido);
    localStorage.setItem("pedidos", JSON.stringify(pedidos));

    alert("Pedido registrado y enviado a cocina");
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
            <td>${p.prioridad}</td>
            <td>${p.fecha}</td>
            <td>${p.estado}</td>
            <td>
                <button onclick="preparar(${i})">Preparar</button>
                <button onclick="listar(${i})">Listo</button>
                <button onclick="entregar(${i})">Entregar</button>
                <button onclick="cancelar(${i})">Cancelar</button>
            </td>
        </tr>
        `;
    });
}

// ================== ESTADOS ==================
function preparar(i) {
    if (estaFacturado(pedidos[i])) return alert("Pedido ya facturado");

    pedidos[i].estado = "En preparación";
    localStorage.setItem("pedidos", JSON.stringify(pedidos));
    mostrarPedidos();
}

function listar(i) {
    pedidos[i].estado = "Listo para servir";
    localStorage.setItem("pedidos", JSON.stringify(pedidos));
    mostrarPedidos();
}

function entregar(i) {
    pedidos[i].estado = "Entregado";
    localStorage.setItem("pedidos", JSON.stringify(pedidos));
    mostrarPedidos();
}

function cancelar(i) {
    if (pedidos[i].estado === "Entregado")
        return alert("No se puede cancelar un pedido entregado");

    if (estaFacturado(pedidos[i]))
        return alert("No se puede cancelar un pedido facturado");

    pedidos[i].estado = "Cancelado";
    localStorage.setItem("pedidos", JSON.stringify(pedidos));
    mostrarPedidos();
}

mostrarPedidos();