let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
let facturas = JSON.parse(localStorage.getItem("facturas")) || [];

let pedidosSeleccionados = [];

// 🔍 BUSCAR PEDIDOS
function buscarPedidos() {
    let mesa = parseInt(document.getElementById("mesaBuscar").value);

    if (!mesa) return alert("Mesa inválida");

    let tabla = document.getElementById("tablaPedidos");
    tabla.innerHTML = "";

    pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

    // 🔥 FILTRO SIMPLE (SIN FALLAR)
    pedidosSeleccionados = pedidos.filter(p =>
        Number(p.mesa) === Number(mesa) &&
        p.estado && p.estado.trim() === "Entregado"
    );

    console.log("TODOS:", pedidos);
    console.log("FILTRADOS:", pedidosSeleccionados);

    if (pedidosSeleccionados.length === 0) {
        alert("No hay pedidos entregados para esta mesa");
        return;
    }

    let subtotal = 0;

    pedidosSeleccionados.forEach(p => {
        subtotal += parseFloat(p.total);

        tabla.innerHTML += `
        <tr>
            <td>${p.codigo}</td>
            <td>${p.mozo}</td>
            <td>S/ ${p.total}</td>
        </tr>
        `;
    });

    document.getElementById("subtotal").textContent = subtotal.toFixed(2);
    calcularTotal();
}

// 💰 TOTAL
function calcularTotal() {
    let subtotal = parseFloat(document.getElementById("subtotal").textContent);
    let descuento = parseFloat(document.getElementById("descuento").value) || 0;

    if (descuento > subtotal) {
        alert("Descuento inválido");
        return;
    }

    let total = subtotal - descuento;
    document.getElementById("total").textContent = total.toFixed(2);
}

// 🎯 DESCUENTO
document.getElementById("descuento").addEventListener("input", () => {
    let d = parseFloat(document.getElementById("descuento").value) || 0;

    document.getElementById("justDesc").style.display =
        d > 0 ? "block" : "none";

    calcularTotal();
});

// 💵 EFECTIVO
document.getElementById("recibido").addEventListener("input", () => {
    let total = parseFloat(document.getElementById("total").textContent) || 0;
    let recibido = parseFloat(document.getElementById("recibido").value) || 0;

    let vuelto = recibido - total;
    document.getElementById("vuelto").textContent = vuelto.toFixed(2);
});

// ✅ CONFIRMAR
function confirmarPago() {
    if (pedidosSeleccionados.length === 0)
        return alert("No hay pedidos seleccionados");

    let factura = {
        mesa: parseInt(document.getElementById("mesaBuscar").value),
        pedidos: pedidosSeleccionados,
        total: document.getElementById("total").textContent,
        fecha: new Date().toLocaleString()
    };

    facturas.push(factura);
    localStorage.setItem("facturas", JSON.stringify(facturas));

    alert("Factura generada");
    location.reload();
}