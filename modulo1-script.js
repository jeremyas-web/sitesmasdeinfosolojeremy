const form = document.getElementById("formPlato");
const tabla = document.getElementById("tablaPlatos");

let platos = JSON.parse(localStorage.getItem("platos")) || [];

document.getElementById("checkOtro").addEventListener("change", function() {
    document.getElementById("otroAlergeno").disabled = !this.checked;
});

form.addEventListener("submit", function(e) {
    e.preventDefault();

    let codigo = document.getElementById("codigo").value.trim();
    let nombre = document.getElementById("nombre").value.trim();
    let descripcion = document.getElementById("descripcion").value.trim();
    let categoria = document.getElementById("categoria").value;
    let precio = parseFloat(document.getElementById("precio").value);
    let tiempo = parseInt(document.getElementById("tiempo").value);
    let estado = document.getElementById("estado").value;
    let modificables = document.getElementById("modificables").value.trim();
    let editIndex = document.getElementById("editIndex").value;

    let alergenos = [];
    document.querySelectorAll("#alergenos input:checked").forEach(el => {
        alergenos.push(el.value);
    });

    let otro = document.getElementById("otroAlergeno").value.trim();

    // VALIDACIONES
    if (codigo.length < 3) return alert("Código inválido");
    if (platos.some((p, i) => p.codigo === codigo && i != editIndex))
        return alert("Código duplicado");

    if (nombre.length < 3 || nombre.length > 60 || !isNaN(nombre))
        return alert("Nombre inválido");

    if (descripcion.length < 10 || descripcion.length > 250)
        return alert("Descripción inválida");

    if (!categoria) return alert("Seleccione categoría");

    if (isNaN(precio) || precio <= 0 || precio > 500)
        return alert("Precio inválido");

    if (isNaN(tiempo) || tiempo < 1 || tiempo > 120)
        return alert("Tiempo inválido");

    if (alergenos.length === 0)
        return alert("Seleccione al menos un alérgeno");

    if (alergenos.includes("Ninguno") && alergenos.length > 1)
        return alert("Ninguno no puede combinarse");

    if (alergenos.includes("Otro") && otro === "")
        return alert("Debe especificar el otro alérgeno");

    if (modificables.length === 0 || modificables.length > 200)
        return alert("Ingredientes modificables inválidos");

    let plato = {
        codigo, nombre, descripcion, categoria,
        precio: precio.toFixed(2),
        tiempo, estado, alergenos, modificables
    };

    if (editIndex === "") {
        platos.push(plato);
    } else {
        platos[editIndex] = plato;
    }

    localStorage.setItem("platos", JSON.stringify(platos));
    form.reset();
    document.getElementById("editIndex").value = "";

    mostrarPlatos();
});

function mostrarPlatos() {
    tabla.innerHTML = "";

    let buscar = document.getElementById("buscar").value.toLowerCase();
    let filtro = document.getElementById("filtroEstado").value;

    platos.forEach((p, i) => {

        if (buscar && !p.nombre.toLowerCase().includes(buscar)) return;
        if (filtro !== "Todos" && p.estado !== filtro) return;

        let row = `
        <tr>
            <td>${p.codigo}</td>
            <td>${p.nombre}</td>
            <td>${p.categoria}</td>
            <td>S/ ${p.precio}</td>
            <td>${p.estado}</td>
            <td>
                <button onclick="editar(${i})">Editar</button>
                <button onclick="eliminar(${i})">Eliminar</button>
                <button onclick="toggleEstado(${i})">Estado</button>
            </td>
        </tr>
        `;
        tabla.innerHTML += row;
    });
}

function editar(i) {
    let p = platos[i];

    document.getElementById("codigo").value = p.codigo;
    document.getElementById("nombre").value = p.nombre;
    document.getElementById("descripcion").value = p.descripcion;
    document.getElementById("categoria").value = p.categoria;
    document.getElementById("precio").value = p.precio;
    document.getElementById("tiempo").value = p.tiempo;
    document.getElementById("estado").value = p.estado;
    document.getElementById("modificables").value = p.modificables;

    document.getElementById("editIndex").value = i;
}

function eliminar(i) {
    if (confirm("¿Eliminar plato?")) {
        platos.splice(i, 1);
        localStorage.setItem("platos", JSON.stringify(platos));
        mostrarPlatos();
    }
}

function toggleEstado(i) {
    platos[i].estado = platos[i].estado === "Activo" ? "Inactivo" : "Activo";
    localStorage.setItem("platos", JSON.stringify(platos));
    mostrarPlatos();
}

document.getElementById("buscar").addEventListener("input", mostrarPlatos);
document.getElementById("filtroEstado").addEventListener("change", mostrarPlatos);

mostrarPlatos();