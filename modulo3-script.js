// ================== DATA ==================
let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
let facturas = JSON.parse(localStorage.getItem("facturas")) || [];

let pedidosSeleccionados = [];

// ================== BUSCAR ==================
function buscarPedidos() {
    let mesa = parseInt(document.getElementById("mesaBuscar").value);

    if (!mesa || mesa <= 0)
        return alert("Mesa inválida");

    let tabla = document.getElementById("tablaPedidos");
    tabla.innerHTML = "";

    pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
    facturas = JSON.parse(localStorage.getItem("facturas")) || [];

    // 🚫 excluir pedidos ya facturados
    let codigosFacturados = facturas.flatMap(f =>
        f.pedidos.map(p => p.codigo)
    );

    pedidosSeleccionados = pedidos.filter(p =>
        Number(p.mesa) === mesa &&
        p.estado === "Entregado" &&
        !codigosFacturados.includes(p.codigo)
    );

    if (pedidosSeleccionados.length === 0) {
        alert("No hay pedidos válidos para facturar");
        return;
    }

    let subtotal = 0;

    // 🔥 DETALLE POR PLATOS
    pedidosSeleccionados.forEach(p => {
        (p.platos || []).forEach(pl => {

            subtotal += Number(pl.subtotal);

            tabla.innerHTML += `
            <tr>
                <td>${p.codigo}</td>
                <td>${p.mozo}</td>
                <td>${pl.nombre}</td>
                <td>${pl.cantidad}</td>
                <td>S/ ${Number(pl.precio).toFixed(2)}</td>
                <td>S/ ${Number(pl.subtotal).toFixed(2)}</td>
                <td>${pl.observacion || ""}</td>
            </tr>
            `;
        });
    });

    document.getElementById("subtotal").textContent = subtotal.toFixed(2);
    calcularTotal();
}

// ================== TOTAL ==================
function calcularTotal() {
    let subtotal = parseFloat(document.getElementById("subtotal").textContent) || 0;
    let descuento = parseFloat(document.getElementById("descuento").value) || 0;

    if (descuento < 0) {
        alert("Descuento inválido");
        return;
    }

    if (descuento > subtotal) {
        alert("Descuento mayor al subtotal");
        return;
    }

    let igv = subtotal * 0.18;
    let total = subtotal + igv - descuento;

    document.getElementById("igv").textContent = igv.toFixed(2);
    document.getElementById("total").textContent = total.toFixed(2);
}

// ================== DESCUENTO ==================
document.getElementById("descuento").addEventListener("input", () => {
    let d = parseFloat(document.getElementById("descuento").value) || 0;

    document.getElementById("justDesc").style.display =
        d > 0 ? "block" : "none";

    calcularTotal();
});

// ================== MÉTODO ==================
document.getElementById("metodo").addEventListener("change", function () {
    let recibidoInput = document.getElementById("recibido");

    if (this.value === "Efectivo") {
        recibidoInput.style.display = "block";
    } else {
        recibidoInput.style.display = "none";
        document.getElementById("vuelto").textContent = "0.00";
    }
});

// ================== EFECTIVO ==================
document.getElementById("recibido").addEventListener("input", () => {
    let total = parseFloat(document.getElementById("total").textContent) || 0;
    let recibido = parseFloat(document.getElementById("recibido").value) || 0;

    let vuelto = recibido - total;

    document.getElementById("vuelto").textContent =
        vuelto > 0 ? vuelto.toFixed(2) : "0.00";
});

// ================== CONFIRMAR ==================
function confirmarPago() {

    if (pedidosSeleccionados.length === 0)
        return alert("No hay pedidos seleccionados");

    let metodo = document.getElementById("metodo").value;
    let total = parseFloat(document.getElementById("total").textContent);
    let recibido = parseFloat(document.getElementById("recibido").value) || 0;
    let descuento = parseFloat(document.getElementById("descuento").value) || 0;
    let justificacion = document.getElementById("justDesc").value.trim();
    let estado = document.getElementById("estado").value;
    let motivo = document.getElementById("motivoAnulacion").value.trim();

    // 🔴 VALIDACIONES
    if (!metodo)
        return alert("Seleccione método de pago");

    if (descuento > 0 && justificacion.length < 10)
        return alert("Justificación mínima de 10 caracteres");

    if (metodo === "Efectivo" && recibido < total)
        return alert("Monto recibido menor al total");

    if (estado === "Anulada" && motivo.length < 5)
        return alert("Ingrese motivo de anulación");

    // 🔒 MARCAR PEDIDOS COMO FACTURADOS
    pedidos = pedidos.map(p => {
        if (pedidosSeleccionados.some(sel => sel.codigo === p.codigo)) {
            return { ...p, facturado: true };
        }
        return p;
    });

    localStorage.setItem("pedidos", JSON.stringify(pedidos));

    // 📦 FACTURA
    let factura = {
        mesa: parseInt(document.getElementById("mesaBuscar").value),
        pedidos: pedidosSeleccionados,
        subtotal: document.getElementById("subtotal").textContent,
        igv: document.getElementById("igv").textContent,
        descuento,
        total,
        metodo,
        recibido,
        vuelto: document.getElementById("vuelto").textContent,
        estado,
        fecha: new Date().toLocaleString()
    };

    facturas.push(factura);
    localStorage.setItem("facturas", JSON.stringify(facturas));

    alert("Factura generada correctamente");
    location.reload();
}