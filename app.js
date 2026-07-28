// =====================================
// MAPA
// =====================================

const map = L.map('map').setView(
    [29.0469, -13.5899],
    10
);

L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
        attribution: 'Tiles © Esri'
    }
).addTo(map);

// =====================================
// CLUSTER
// =====================================

const cluster = L.markerClusterGroup();

map.addLayer(cluster);

const markers = [];

// Día seleccionado para los botones Día 1-7
let diaSeleccionado = "";


// =====================================
// CARGAR JSON
// =====================================

fetch("lanzarote-data.json")
    .then(r => r.json())
    .then(data => {

        data.lugares.forEach(item => {

            let color;
            let faIcon;

            switch (item.tipo) {

                case "hotel":
                    color = "#2563eb";
                    faIcon = "fa-hotel";
                    break;

                case "restaurante":
                    color = "#dc2626";
                    faIcon = "fa-utensils";
                    break;

                case "playa":
                    color = "#0ea5e9";
                    faIcon = "fa-umbrella-beach";
                    break;

                default:
                    color = "#16a34a";
                    faIcon = "fa-camera";
            }

            const icon = L.divIcon({

                className: "",

                html: `
                <i
                    class="fa-solid ${faIcon}"
                    style="
                        font-size:28px;
                        color:${color};
                        text-shadow:0 0 3px white;
                    ">
                </i>
            `
            });

            // ====================================
            // POPUP
            // =====================================



            let popup = `
<div style="
    width:320px;
    max-width:320px;
">
`;
popup += `
    <div
        class="popup-title"
        style="
            font-size:22px;
            font-weight:bold;
            text-align:center;
            color:#111827;
            margin-bottom:10px;
        "
    >
        ${item.nombre}
    </div>
`;

            if (item.precio) {

                popup += `
        <p>
            <strong>💰 Precio:</strong>
            ${typeof item.precio === "number"
                        ? "€".repeat(item.precio)
                        : item.precio
                    }
        </p>

        <hr>
    `;
            }

            if (item.descripcion) {

                popup += `
        <p>
            <strong>📝 Descripción:</strong><br>
            ${item.descripcion}
        </p>
    `;
            }

            if (item.favorito) {

                popup += `
        <p class="favorito">
            ⭐ Recomendado por Fernando
        </p>
    `;
            }

            if (item.web && item.web !== "na") {

                popup += `
        <p>
            ${item.web}
                🌐 Página Web
            </a>
        </p>
    `;
            }

            if (item.maps) {

                popup += `
        <p>
            ${item.maps}
                📍 Google Maps
            </a>
        </p>
    `;
            }

            popup += `
</div>
`;

            const marker = L.marker(
                [item.lat, item.lng],
                {
                    icon: icon
                }
            );

            marker.info = item;

            marker.bindPopup(popup);

            marker.on("mouseover", function () {

                this.openPopup();

            });

            markers.push(marker);

        });

        actualizarFiltros();

    });

// =====================================
// EVENTOS
// =====================================

document
    .querySelectorAll(
        '#sidebar input[type="checkbox"]'
    )
    .forEach(cb => {

        cb.addEventListener(
            "change",
            actualizarFiltros
        );

    });

document
    .getElementById("buscador")
    .addEventListener(
        "input",
        actualizarFiltros
    );



document
    .getElementById("btnCentro")
    .addEventListener(
        "click",
        () => {

            map.setView(
                [29.0469, -13.5899],
                10
            );

        }
    );

document
    .getElementById("btnReset")
    .addEventListener(
        "click",
        resetFiltros
    );

document
    .querySelectorAll(".btn-dia")
    .forEach(btn => {

        btn.addEventListener("click", () => {

            document
                .querySelectorAll(".btn-dia")
                .forEach(b => b.classList.remove("active"));

            btn.classList.add("active");

            diaSeleccionado =
                btn.dataset.dia;

            actualizarFiltros();

        });

    });

// =====================================
// FILTROS
// =====================================

function resetFiltros() {

    // Marcar todas las categorías

    document
        .querySelectorAll(
            'input[data-tipo]'
        )
        .forEach(cb => {

            cb.checked = true;

        });

    // Quitar favoritos

    document.getElementById(
        "soloFavoritos"
    ).checked = false;

    document.getElementById(
        "soloAtardecer"
    ).checked = false;

    // Quitar días

    diaSeleccionado = "";

    document
        .querySelectorAll(".btn-dia")
        .forEach(btn => {

            btn.classList.remove("active");

        });

    document
        .querySelector(
            '.btn-dia[data-dia=""]'
        )
        .classList.add("active");

    // Limpiar buscador

    document.getElementById(
        "buscador"
    ).value = "";



    // Centrar mapa

    map.setView(
        [29.0469, -13.5899],
        10
    );

    // Recargar filtros

    actualizarFiltros();

}

function actualizarFiltros() {

    cluster.clearLayers();

    const categorias = [];

    document
        .querySelectorAll(
            'input[data-tipo]'
        )
        .forEach(cb => {

            if (cb.checked) {

                categorias.push(
                    cb.dataset.tipo
                );

            }

        });

    const diasSeleccionados =
        diaSeleccionado;

    const soloFavoritos =
        document.getElementById(
            "soloFavoritos"
        ).checked;

    const soloAtardecer =
        document.getElementById(
            "soloAtardecer"
        ).checked;

    const texto =
        document.getElementById(
            "buscador"
        )
            .value
            .toLowerCase()
            .trim();

    let contador = 0;



    markers.forEach(marker => {

        const info = marker.info;

        let mostrar = true;

        // ==================
        // CATEGORÍA
        // ==================

        if (
            !categorias.includes(
                info.tipo
            )
        ) {
            mostrar = false;
        }

        // ==================
        // DÍAS
        // ==================


        if (
            diasSeleccionados &&
            String(info.dia) !== diasSeleccionados
        ) {
            mostrar = false;
        }


        // ==================
        // FAVORITOS
        // ==================

        if (
            soloFavoritos &&
            !info.favorito
        ) {
            mostrar = false;
        }
        // ==================
        // ATARDECER
        // ==================

        if (
            soloAtardecer &&
            !info.atardecer
        ) {
            mostrar = false;
        }

        // ==================
        // BUSCADOR
        // ==================

        if (
            texto &&
            !info.nombre
                .toLowerCase()
                .includes(texto)
        ) {
            mostrar = false;
        }

        // ==================
        // MOSTRAR
        // ==================

        if (mostrar) {

            cluster.addLayer(
                marker
            );

            contador++;

        }

    });

    document
        .getElementById("contador")
        .innerHTML =
        `📍 ${contador} lugares`;

}