// Definir la proyección EPSG:9377 con Proj4
proj4.defs("EPSG:9377", "+proj=tmerc +lat_0=4.59620041666667 +lon_0=-74.07750791666666 +k=0.999925 +x_0=1000000 +y_0=1000000 +ellps=GRS80 +units=m +no_defs");

// Inicializar el mapa
const map = L.map('map').setView([10.44391052895503,-75.36980804129303], 15);

var capaPuntoCentro;
// Objeto para almacenar las capas GeoJSON que ya han sido añadidas al mapa
const capasGeoJSON = {};


// Recarga todo al inicio
function refreshPage() {
    location.reload(); // Recarga la página
}

// Asegúrate de que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", function() {
    const hamburger = document.querySelector('.hamburger');
    const layerMenu = document.getElementById('layerMenu');

    // Agrega el evento click al botón hamburguesa
    hamburger.addEventListener('click', function() {
        // Alternar la clase 'active' para mostrar/ocultar el menú
        layerMenu.classList.toggle('active');
    });

});


function toggleMenu() {
    const hamburger = document.querySelector('.hamburger');
    const layerMenu = document.getElementById('layerMenu');

    hamburger.classList.toggle('active'); // Añade la clase para activar la animación
    layerMenu.classList.toggle('show');   // Alterna el menú de capas
}



// Función para manejar las capas (aquí puedes agregar tu lógica)
function toggleLayer(layerName) {
    // Lógica para mostrar u ocultar capas
    console.log(layerName + ' toggled'); // Solo para depuración
}


// Carga el archivo GeoJSON desde la carpeta y lo agrega al mapa
fetch('GeoJSON/PuntoCentro.geojson')
    .then(response => response.json())
    .then(data => {
        // Añade el GeoJSON al mapa y agrega un popup con el nombre
        L.geoJSON(data, {
            onEachFeature: function (feature, layer) {
                if (feature.properties && feature.properties.nombre) {
                    layer.bindPopup(feature.properties.nombre); // Muestra un popup con la propiedad "nombre"
                }
            }
        }).addTo(map);
    })
    .catch(error => console.error('Error al cargar el archivo GeoJSON:', error));


    //Carga la funcion del boton panel de control

    document.querySelector('.control-panel-button').addEventListener('click', function() {
        const cardElement = document.querySelector('.card');
    
        if (cardElement) {
            // Alternar la visibilidad de la clase .card
            if (cardElement.style.display === 'none' || cardElement.style.display === '') {
                cardElement.style.display = 'block'; // Mostrar la tarjeta si está oculta
            } else {
                cardElement.style.display = 'none'; // Ocultar la tarjeta si está visible
            }
        }
    });
    

// Asegúrate de que la barra sea transparente al cargar la página
document.addEventListener("DOMContentLoaded", function() {
    const controlBar = document.querySelector(".bottom-bar"); // Selecciona la barra de control
    if (controlBar) {
        controlBar.classList.add("transparent-bar"); // Aplica la clase transparente
    }
});


// Cargar la capa PuntoCentro al iniciar
cargarCapaGeoJSON('GeoJSON/PuntoCentro.geojson').then(capa => {
    capaPuntoCentro = capa; // Guardar la capa cargada
    addLayerToSelect("Seleccionar");
});


const checkbox = document.querySelector('input[type="checkbox"]');

checkbox.addEventListener('change', function() {
    if (this.checked) {
        console.log('Checkbox está marcado (checked)');
        // Lógica para manejar el checkbox marcado
    } else {
        console.log('Checkbox está desmarcado (unchecked)');
        // Lógica para manejar el checkbox desmarcado
    }
});


// Función para generar un color hexadecimal aleatorio
function generarColorAleatorio() {
    const letras = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letras[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Función para cargar una capa GeoJSON con un estilo aleatorio
function cargarCapaGeoJSON(url) {
    return new Promise((resolve, reject) => {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la red RoCa');
                }
                return response.json();
            })
            .then(data => {
                // Generar colores aleatorios para el borde y el relleno
                const colorBorde = generarColorAleatorio();
                const colorRelleno = generarColorAleatorio();

                // Crear una capa GeoJSON con los datos cargados y un estilo aleatorio
                const geojsonLayer = L.geoJSON(data, {
                    style: function(feature) {
                        return {
                            color: colorBorde, // Color del borde aleatorio
                            weight: 3,         // Grosor del borde
                            opacity: 1,        // Opacidad del borde
                            fillColor: colorRelleno, // Color de relleno aleatorio
                            fillOpacity: 0.5   // Opacidad del relleno
                        };
                    }
                });
                resolve(geojsonLayer); // Resolver la promesa con la capa GeoJSON
            })
            .catch(error => {
                reject(error); // Rechazar la promesa en caso de error
            });
    });
}


// Función para agregar una capa al select de capas visibles
function addLayerToSelect(layerName) {
    const select = document.getElementById("visible-layers");
    if (select) {
        const option = document.createElement("option");
        option.value = layerName;
        option.textContent = layerName;
        select.appendChild(option);
    } else {
        console.error("No se encontró el elemento select con id 'visible-layers'");
    }
}

// Función para quitar una capa del select de capas visibles
function removeLayerFromSelect(layerName) {
    const select = document.getElementById("visible-layers");
    if (select) {
        const options = select.options;
        for (let i = 0; i < options.length; i++) {
            if (options[i].value === layerName) {
                select.remove(i);
                break;
            }
        }
    }
}

// La función toggleLayer agrega capas al mapa y actualize el select de  <select id="visible-layers" onchange="updateLayerControl(this.value)">
function toggleLayer(capa) {
    const checkbox = document.querySelector(`input[type="checkbox"][onclick*="${capa}"]`);

    if (!capasGeoJSON[capa]) {
        cargarCapaGeoJSON(`GeoJSON/${capa}.geojson`).then(capaGeoJSON => {
            capasGeoJSON[capa] = capaGeoJSON;
            capaGeoJSON.addTo(map);

            // Agregar capa al select
            addLayerToSelect(capa);

            // Ajustar vista a los límites de la capa
            const bounds = capaGeoJSON.getBounds();
            map.fitBounds(bounds);

            console.log(`Capa ${capa} agregada al mapa.`);


        }).catch(error => {
            console.log(`Error al cargar ${capa}.geojson:`, error);
        });
    } else {
        map.removeLayer(capasGeoJSON[capa]);
        delete capasGeoJSON[capa];

        // Eliminar capa del select
        removeLayerFromSelect(capa);

        console.log(`Capa ${capa} quitada del mapa.`);

        // Ocultar el panel si no quedan capas activas

    }
}


// Función para ocultar el layer-menu
function cerrarLayerMenu() {
    const layerMenu = document.querySelector('.layer-menu'); // Ajusta el selector según tu HTML
    if (layerMenu) {
        layerMenu.style.display = 'none'; // Ocultar el layer-menu
    }
}



// Función para mostrar u ocultar el layer-menu
function toggleLayerMenu() {
    const layerMenu = document.querySelector('.layer-menu'); // Asegúrate de que este selector sea correcto
    if (layerMenu) {
        if (layerMenu.style.display === 'block') {
            layerMenu.style.display = 'none'; // Ocultar si está visible
        } else {
            layerMenu.style.display = 'block'; // Mostrar si está oculto
        }
    }
}

// Agregar evento de clic al botón de hamburguesa
const hamburgerButton = document.querySelector('.hamburger'); // Cambia el selector según tu HTML
hamburgerButton.addEventListener('click', toggleLayerMenu); // Alternar el menú al hacer clic



// Agregar evento de clic al mapa para cerra Menu
map.on('click', function() {
    const layerMenu = document.querySelector('.layer-menu');
    const hamburger = document.querySelector('.hamburger');
    const cells = document.querySelectorAll('.hamburger .cell');
    
    if (layerMenu) {
        layerMenu.style.display = 'none'; // Ocultar el layer-menu al hacer clic en el mapa
    }

    if (hamburger && hamburger.classList.contains('active')) {
        // Remover la clase 'active' para restaurar los colores
        hamburger.classList.remove('active');
        
        // Restaurar colores originales a las celdas
        cells.forEach((cell, index) => {
            if (index === 0 || index === 1 || index === 2 || index === 4) {
                cell.style.setProperty('--cell-color', '#008b17');; // Color verde
            } else {
                cell.style.setProperty('--cell-color', '#ff0000');// Color rojo
            }
        });
    }
});




// Función para localizar al usuario
function localizarUsuario() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                const marker = L.marker([lat, lon]).addTo(map);
                marker.bindPopup("Estás aquí").openPopup();

                map.setView([lat, lon], 15);
            },
            function () {
                alert("Error al obtener la ubicación. Por favor, habilita la geolocalización.");
            }
        );
    } else {
        alert("La geolocalización no es soportada por este navegador.");
    }
}

// Definir las capas base
const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 30,
    attribution: '© OpenStreetMap'
});

const satelliteLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 30,
    attribution: '© Google Maps',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

// Inicializar el mapa con la capa OSM
osmLayer.addTo(map);
map.zoomControl.remove();

// Variable de estado para rastrear el mapa activo
let mapaBaseActual = 'osm';

// Función para alternar entre mapas base
function alternarMapaBase() {
    if (mapaBaseActual === 'osm') {
        map.removeLayer(osmLayer);
        map.addLayer(satelliteLayer);
        mapaBaseActual = 'satellite';
    } else {
        map.removeLayer(satelliteLayer);
        map.addLayer(osmLayer);
        mapaBaseActual = 'osm';
    }
}


// Crear la capa de Google Labels
const googleLabelLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}', {
    maxZoom: 30,
    attribution: 'Map data ©2024 Google'
});

// Seleccionar el botón y agregar evento de click para alternar la capa
const googleLabelButton = document.getElementById('google-label-button');

let isGoogleLabelActive = false; // Estado inicial de la capa

googleLabelButton.addEventListener('click', () => {
    if (!isGoogleLabelActive) {
        map.addLayer(googleLabelLayer); // Agregar la capa al mapa
        isGoogleLabelActive = true; // Cambiar el estado
    } else {
        map.removeLayer(googleLabelLayer); // Quitar la capa del mapa
        isGoogleLabelActive = false; // Cambiar el estado
    }
});



const medirDistanciaBtn = document.getElementById("medirDistanciaBtn");

let isMeasuring = false;
let measureLine = null;
let totalDistance = 0;
let points = [];

// Escuchar el botón de medir
medirDistanciaBtn.addEventListener("click", () => {
    isMeasuring = !isMeasuring;

    if (isMeasuring) {
        map.getContainer().style.cursor = 'crosshair';
        totalDistance = 0; // Reiniciar la distancia acumulada
        points = []; // Reiniciar la lista de puntos
        if (measureLine) {
            map.removeLayer(measureLine); // Eliminar cualquier línea existente
        }
    } else {
        map.getContainer().style.cursor = ''; // Restaurar el cursor normal
        if (measureLine) {
            map.removeLayer(measureLine); // Eliminar la línea al finalizar
        }
    }
});

// Evento de click en el mapa para agregar puntos
map.on("click", function (e) {
    if (isMeasuring) {
        points.push(e.latlng); // Agregar el punto actual a la lista
        if (points.length > 1) {
            // Calcular la distancia entre el último y penúltimo punto
            const lastPoint = points[points.length - 1];
            const previousPoint = points[points.length - 2];
            const segmentDistance = previousPoint.distanceTo(lastPoint); // Distancia en metros
            totalDistance += segmentDistance;

            // Eliminar la línea existente y dibujar una nueva con el trayecto actualizado
            if (measureLine) {
                map.removeLayer(measureLine);
            }
            measureLine = L.polyline(points, { color: 'blue' }).addTo(map);

            // Mostrar la distancia acumulada en un marcador
            const distanceText = `Distancia total: ${(totalDistance / 1000).toFixed(2)} km`;
            if (measureLine.getTooltip()) {
                measureLine.setTooltipContent(distanceText); // Actualizar el texto de la distancia
            } else {
                measureLine.bindTooltip(distanceText, { permanent: true, direction: "center" }).openTooltip();
            }
        }
    }
});


// Definir las variables principales
let areaMeasurementEnabled = false;
let polygon;
let latLngs = [];

// Función para iniciar la medición de área
function medirArea() {
    if (areaMeasurementEnabled) {
        finalizarMedicion();
        return;
    }

    areaMeasurementEnabled = true;
    latLngs = [];
    polygon = L.polygon([], { color: 'blue', weight: 3, fillOpacity: 0.4 }).addTo(map);

    document.getElementById('medirAreaBtn').style.display = 'none';
    document.getElementById('calcularAreaBtn').style.display = 'inline-block';

    map.on('click', agregarVertice);
}

// Función para agregar un vértice al polígono
function agregarVertice(e) {
    const latlng = e.latlng;
    latLngs.push(latlng);
    polygon.setLatLngs(latLngs);
}

// Función de cálculo de área personalizada (implementa la fórmula de área esférica)
function calcularAreaGeodesica(latLngs) {
    const R = 6378137; // Radio de la Tierra en metros
    let area = 0;

    for (let i = 0, len = latLngs.length; i < len; i++) {
        const p1 = latLngs[i];
        const p2 = latLngs[(i + 1) % len];

        const lat1 = (p1.lat * Math.PI) / 180;
        const lat2 = (p2.lat * Math.PI) / 180;
        const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;

        // Fórmula de cálculo del área
        area += (dLng * (2 + Math.sin(lat1) + Math.sin(lat2))) / 2;
    }

    return Math.abs(area * R * R); // Área en metros cuadrados
}

// Función para calcular el área y mostrar el popup
function calcularArea() {

    document.getElementById('medirAreaBtn').style.display = 'inline-block';
    document.getElementById('calcularAreaBtn').style.display = 'none';

    if (latLngs.length < 3) {
        alert("Necesitas al menos 3 puntos para calcular el área.");
        return;
    }

    const area = calcularAreaGeodesica(latLngs); // Calcula el área con la función personalizada
    const areaText = `Área: ${area.toFixed(2)} m²`;
    const center = polygon.getBounds().getCenter();

    L.popup()
        .setLatLng(center)
        .setContent(areaText)
        .openOn(map);
    


}

// Función para finalizar la medición
function finalizarMedicion() {
    areaMeasurementEnabled = false;
    map.off('click', agregarVertice);

    if (polygon) {
        map.removeLayer(polygon);
        polygon = null;
    }

    latLngs = [];

    document.getElementById('medirAreaBtn').style.display = 'inline-block';
    document.getElementById('calcularAreaBtn').style.display = 'none';
}

// Evento para activar la medición y cálculo
document.getElementById('medirAreaBtn').addEventListener('click', medirArea);
document.getElementById('calcularAreaBtn').addEventListener('click', calcularArea);

function showControlCard() {
    const controlCard = document.getElementById('layer-controls');
    if (controlCard) {
        controlCard.style.display = 'block'; // Muestra la tarjeta
    }
}


function updateLayerControl(layerName) {
    const layerControls = document.getElementById("layer-controls");
    const cardElement = document.querySelector('.card');

    // Limpiar controles previos
    layerControls.innerHTML = '';

    // Verificar si hay una capa seleccionada y si existe en capasGeoJSON
    if (!layerName || !capasGeoJSON[layerName]) {
        // Si no hay capa seleccionada, ocultar el elemento .card y salir
        if (cardElement) {
            cardElement.style.display = 'none';
        }
        return;
    }

    // Si se selecciona una capa válida, mostrar el elemento .card
    if (cardElement) {
        cardElement.style.display = 'block';
    }

    // Llamar a las funciones para agregar controles de color, opacidad y orden
    addColorAndOpacityControls(layerName);
    addOrderControls(layerName);
}




function addColorAndOpacityControls(layerName) {
    const layerControls = document.getElementById("layer-controls");

    // Crear el contenedor principal del panel
    const controlCard = document.createElement("div");
    controlCard.className = "control-card playing";
    controlCard.id = "congCapa";

    // Añadir las ondas decorativas
    for (let i = 0; i < 3; i++) {
        const wave = document.createElement("div");
        wave.className = "wave-capa";
        controlCard.appendChild(wave);
    }

    // Contenedor de información de la capa
    const infoCapa = document.createElement("div");
    infoCapa.className = "infocapa";

    // Título
    const titulo = document.createElement("div");
    titulo.className = "lTitutlo";
    const tituloLabel = document.createElement("label");
    tituloLabel.id = "lbTitulo";
    tituloLabel.textContent = "CONFIG. CAPA";
    titulo.appendChild(tituloLabel);
    infoCapa.appendChild(titulo);

    // Crear controles
    infoCapa.appendChild(createControl("Borde:", "color", "#000000", (e) => {
        capasGeoJSON[layerName].setStyle({ color: e.target.value });
    }));

    infoCapa.appendChild(createControl("Relleno:", "color", "#ff0000", (e) => {
        capasGeoJSON[layerName].setStyle({ fillColor: e.target.value });
    }));

    infoCapa.appendChild(createControl("Opacidad B:", "range", 1, (e) => {
        capasGeoJSON[layerName].setStyle({ opacity: e.target.value });
    }, { min: 0, max: 1, step: 0.1 }));

    infoCapa.appendChild(createControl("Opacidad R:", "range", 1, (e) => {
        capasGeoJSON[layerName].setStyle({ fillOpacity: e.target.value });
    }, { min: 0, max: 1, step: 0.1 }));

    // Botones para mover capas
    const moverSpan = document.createElement("span");
    moverSpan.textContent = "Mover Capa:";
    infoCapa.appendChild(moverSpan);

    const moverDiv = document.createElement("div");
    moverDiv.id = "mover";
    moverDiv.appendChild(createButton("Subir", "/images/up.png", () => {
        map.removeLayer(capasGeoJSON[layerName]);
        capasGeoJSON[layerName].addTo(map);
        console.log(`Capa ${layerName} movida arriba.`);
    }));

    moverDiv.appendChild(createButton("Bajar", "/images/down.png", () => {
        map.removeLayer(capasGeoJSON[layerName]);
        map.addLayer(capasGeoJSON[layerName]);
        console.log(`Capa ${layerName} movida abajo.`);
    }));
    infoCapa.appendChild(moverDiv);

    // Botón para etiquetas
    const etiquetasSpan = document.createElement("span");
    etiquetasSpan.textContent = "Etiquetas:";
    infoCapa.appendChild(etiquetasSpan);

    const etiquetasButton = createButton("", "/images/label.ico", () => {
        const selectedLayer = document.getElementById("visible-layers").value;
        if (selectedLayer) {
            handleLoadLabels(selectedLayer);
        } else {
            console.log("No se ha seleccionado ninguna capa.");
        }
    });
    etiquetasButton.id = "etiquetas";
    infoCapa.appendChild(etiquetasButton);

    // Añadir la información al contenedor principal
    controlCard.appendChild(infoCapa);

    // Agregar la tarjeta al contenedor de controles
    layerControls.appendChild(controlCard);
}

// Función auxiliar para crear un control de entrada
function createControl(labelText, type, defaultValue, onInput, attributes = {}) {
    const container = document.createElement("div");

    const label = document.createElement("span");
    label.textContent = labelText;
    container.appendChild(label);

    const input = document.createElement("input");
    input.type = type;
    input.value = defaultValue;
    for (const attr in attributes) {
        input[attr] = attributes[attr];
    }
    input.oninput = onInput;
    container.appendChild(input);

    return container;
}

// Función auxiliar para crear un botón con ícono
function createButton(text, iconSrc, onClick) {
    const button = document.createElement("button");
    button.textContent = text;

    if (iconSrc) {
        const img = document.createElement("img");
        img.src = iconSrc;
        img.alt = text;
        button.appendChild(img);
    }

    button.onclick = onClick;
    return button;
}




/*
function addColorAndOpacityControls(layerName) {
    const layerControls = document.getElementById("layer-controls");

    // Crear un contenedor tipo "card" para los controles
    const controlCard = document.createElement("div");
    controlCard.className = "control-card";

    // Selector de color de borde
    const borderColorInput = document.createElement("input");
    borderColorInput.type = "color";
    borderColorInput.value = "#000000"; // Color inicial
    borderColorInput.oninput = (e) => {
        capasGeoJSON[layerName].setStyle({ color: e.target.value });
    };

    // Selector de color de relleno
    const fillColorInput = document.createElement("input");
    fillColorInput.type = "color";
    fillColorInput.value = "#ff0000"; // Color inicial
    fillColorInput.oninput = (e) => {
        capasGeoJSON[layerName].setStyle({ fillColor: e.target.value });
    };

    // Control de opacidad de borde
    const borderOpacityInput = document.createElement("input");
    borderOpacityInput.type = "range";
    borderOpacityInput.min = 0;
    borderOpacityInput.max = 1;
    borderOpacityInput.step = 0.1;
    borderOpacityInput.value = 1;
    borderOpacityInput.oninput = (e) => {
        capasGeoJSON[layerName].setStyle({ opacity: e.target.value });
    };

    // Control de opacidad de relleno
    const fillOpacityInput = document.createElement("input");
    fillOpacityInput.type = "range";
    fillOpacityInput.min = 0;
    fillOpacityInput.max = 1;
    fillOpacityInput.step = 0.1;
    fillOpacityInput.value = 1;
    fillOpacityInput.oninput = (e) => {
        capasGeoJSON[layerName].setStyle({ fillOpacity: e.target.value });
    };


    function createTextElement(text) {
        const textElement = document.createTextNode(text);
        const spanWrapper = document.createElement("span");
        spanWrapper.style.color = "red";
        spanWrapper.appendChild(textElement);
        return spanWrapper;
    }

// Crear el botón para "Cargar etiquetas"
    const loadLabelsButton = document.createElement("button");
    loadLabelsButton.textContent = "Etiquetas";
    loadLabelsButton.style.marginTop = "10px"; // Espaciado
    loadLabelsButton.onclick = () => {
    // Obtener el valor seleccionado del select con id "visible-layers"
    const selectedLayer = document.getElementById("visible-layers").value;

    if (selectedLayer) {
        // Llamar a la función handleLoadLabels con la capa seleccionada
        handleLoadLabels(selectedLayer);
    } else {
        console.log("No se ha seleccionado ninguna capa.");
    }
};


// Agregar elementos al contenedor "card"
controlCard.appendChild(createTextElement("Borde:"));
controlCard.appendChild(borderColorInput);
controlCard.appendChild(createTextElement("Relleno:"));
controlCard.appendChild(fillColorInput);
controlCard.appendChild(createTextElement("Opacidad B:"));
controlCard.appendChild(borderOpacityInput);
controlCard.appendChild(createTextElement("Opacidad R:"));
controlCard.appendChild(fillOpacityInput);
controlCard.appendChild(loadLabelsButton); // Agregar el botón después del control de opacidad de relleno

    // Añadir la "card" al contenedor de controles
    layerControls.appendChild(controlCard);
}

function addOrderControls(layerName) {
    const layerControls = document.getElementById("layer-controls");

    const controlCard = document.createElement("div");
    controlCard.className = "control-card";

    const moveUpButton = document.createElement("button");
    moveUpButton.textContent = "Subir";
    moveUpButton.onclick = () => {
        map.removeLayer(capasGeoJSON[layerName]);
        capasGeoJSON[layerName].addTo(map);
        console.log(`Capa ${layerName} movida arriba.`);
    };

    const moveDownButton = document.createElement("button");
    moveDownButton.textContent = "Bajar";
    moveDownButton.onclick = () => {
        map.removeLayer(capasGeoJSON[layerName]);
        map.addLayer(capasGeoJSON[layerName]);
        console.log(`Capa ${layerName} movida abajo.`);
    };

    // Agregar botones al contenedor "card"
    controlCard.appendChild(moveUpButton);
    controlCard.appendChild(moveDownButton);

    // Añadir la "card" al contenedor de controles
    layerControls.appendChild(controlCard);
}
*/

/*
// Asegúrate de que 'map' ya esté definido en otro lugar de tu código.

var geoTiffLayer; // Variable para almacenar la capa GeoTIFF

// Función para cargar el archivo GeoTIFF
function loadGeoTIFF() {
    geoTiffLayer = new L.LeafletGeotiff("GeoJSON/A_URBANA.tif", {
        band: 0,  // Elige la banda que deseas usar
        opacity: 0.7,
        render: new L.LeafletGeotiff.Plotty({
            colorScale: 'viridis',  // Puedes cambiar esto por otro color si lo prefieres
            clampLow: true,
            clampHigh: true,
            displayMin: 0,
            displayMax: 255
        })
    });
    geoTiffLayer.addTo(map); // Agregar la capa al mapa
}

// Función para eliminar la capa GeoTIFF
function removeGeoTIFF() {
    if (geoTiffLayer) {
        map.removeLayer(geoTiffLayer); // Eliminar la capa del mapa
    }
}

// Función para manejar el checkbox de ortofoto
function toggleOrtofoto() {
    var checkbox = document.getElementById('ortoCheckbox');
    
    if (checkbox.checked) {
        loadGeoTIFF(); // Cargar la ortofoto si el checkbox está marcado
    } else {
        removeGeoTIFF(); // Eliminar la capa si el checkbox no está marcado
    }
}*/

var ortoLayer; // Variable global para la capa de la ortofoto

function toggleOrtofoto() {
    var checkbox = document.getElementById('ortoCheckbox');
    if (checkbox.checked) {
        // Llamamos a la función que carga la imagen con las coordenadas del archivo .pgw
        loadImageWithPGW();
    } else {
        // Si el checkbox se desmarca, eliminamos la capa del mapa
        if (ortoLayer) {
            map.removeLayer(ortoLayer);
        }
    }
}

function loadImageWithPGW() {
    // Carga el archivo .pgw de la carpeta GeoJSON
    fetch('GeoJSON/AreaEstudio.pgw')
        .then(response => response.text())
        .then(data => {
            var lines = data.split('\n').map(Number);
            
            var pixelSizeX = lines[0];
            var pixelSizeY = lines[3]; // Es negativo si la imagen no está invertida
            var topLeftX = lines[4];
            var topLeftY = lines[5];

            // Suponiendo que tienes el tamaño de la imagen en píxeles (ajusta estos valores)
            var imageWidth = 9298; // Reemplaza con el ancho real de la imagen
            var imageHeight = 12666; // Reemplaza con el alto real de la imagen

            var bottomRightX = topLeftX + (pixelSizeX * imageWidth);
            var bottomRightY = topLeftY + (pixelSizeY * imageHeight);

            var northWestCorner = [topLeftY, topLeftX];
            var southEastCorner = [bottomRightY, bottomRightX];

            // Crear la capa de la ortofoto
            ortoLayer = L.imageOverlay('GeoJSON/AreaEstudio.png', [northWestCorner, southEastCorner], {
                //opacity: 0.3 // Ajusta la opacidad si es necesario
            });
            ortoLayer.addTo(map);

            // Hacer zoom a la extensión de la imagen
            map.fitBounds([northWestCorner, southEastCorner]);
        })
        .catch(error => console.error('Error al cargar el archivo .pgw:', error));
}


// cambia los colores del .hamburger al hacer click
document.querySelector('.hamburger').addEventListener('click', function() {
    console.log('Botón clicado');
    this.classList.toggle('active');
    
    // Selecciona todos los elementos .cell
    const cells = document.querySelectorAll('.hamburger .cell');
    
    if (this.classList.contains('active')) {
      // Cambia a gris cuando se hace clic para activar
      cells.forEach(cell => {
        cell.style.setProperty('--cell-color', 'gray');
      });
    } else {
      // Restaura los colores iniciales definidos en las variables CSS
      cells.forEach((cell, index) => {
        if (index === 0 || index === 1 || index === 2 || index === 4) {
          cell.style.setProperty('--cell-color', '#008b17');
        } else {
          cell.style.setProperty('--cell-color', '#ff0000');
        }
      });
    }
  });
  

//CREAR LOS CONTROLES PARA LABELS

function handleLoadLabels(layerName) {
    const controlPanel = document.getElementById("control-panel");

    // Verificar si ya existe una "labelCard" previa y eliminarla para evitar duplicados
    const existingLabelCard = document.querySelector("#labelCard");
    if (existingLabelCard) {
        existingLabelCard.remove();
    }

    // Crear el nuevo contenedor para el menú estilizado
    const labelCard = document.createElement("div");
    labelCard.className = "label-card playing";
    labelCard.id = "labelCard";

    // Agregar elementos decorativos
    for (let i = 0; i < 3; i++) {
        const wave = document.createElement("div");
        wave.className = "wave-label";
        labelCard.appendChild(wave);
    }

    // Contenedor principal del panel
    const infotool = document.createElement("div");
    infotool.className = "infotool";

    // Título del panel
    const titleWrapper = document.createElement("div");
    titleWrapper.className = "lTitutlo";

    const title = document.createElement("label");
    title.id = "lbTitulo";
    title.textContent = "ETIQUETAS";
    titleWrapper.appendChild(title);
    infotool.appendChild(titleWrapper);

    // Encabezado con ícono y select para atributos
    const head = document.createElement("div");
    head.className = "head";

    const icon = document.createElement("img");
    icon.className = "icon";
    icon.src = "/images/labelConf.gif";
    icon.alt = "";

    const attributeSelect = document.createElement("select");
    attributeSelect.id = "atributo-layers";
    attributeSelect.innerHTML = `<option value="">Atributo</option>`; // Opción predeterminada

    // Obtener los atributos de la capa seleccionada
    const layer = capasGeoJSON[layerName];
    const firstFeature = layer?.getLayers()?.[0]?.feature;

    if (!firstFeature) {
        alert("No se encontraron atributos en esta capa.");
        return;
    }

    // Llenar el select con las opciones de atributos
    for (let key in firstFeature.properties) {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = key;
        attributeSelect.appendChild(option);
    }

    head.appendChild(icon);
    head.appendChild(attributeSelect);
    infotool.appendChild(head);

    // Controles de fuente
    const fontControls = document.createElement("div");
    fontControls.className = "control-font";
    fontControls.innerHTML = `
        <label for="font-family">Fuente</label>
        <select id="font-family">
            <option value="arial">Arial</option>
            <option value="verdana">Verdana</option>
            <option value="times new roman">Times New Roman</option>
            <option value="courier new">Courier New</option>
        </select>
        <select id="font-size">
            <option value="6">6px</option>
            <option value="8" selected>8px</option>
            <option value="10">10px</option>
            <option value="12">12px</option>
            <option value="14">14px</option>
            <option value="16">16px</option>
            <option value="18">18px</option>
            <option value="20">20px</option>
        </select>
        <input type="color" id="font-color">
        <label for="font-bold" style="font-weight: bold;">N</label>
        <input class="container3" type="checkbox" id="font-bold">
        <label for="font-italic" style="font-style: italic;">I</label>
        <input class="container3" type="checkbox" id="font-italic">
    `;
    infotool.appendChild(fontControls);

    // Otros controles
    const otherControls = document.createElement("div");
    otherControls.className = "other";
    otherControls.innerHTML = `
        <label for="shadow-color">Sombra</label>
        <input type="color" id="shadow-color">
        <label for="buffer-size">Sombra</label>
        <select id="buffer-size">
            <option value="0">0px</option>
            <option value="1" selected>1px</option>
            <option value="2">2px</option>
            <option value="3">3px</option>
            <option value="4">4px</option>
            <option value="5">5px</option>
            <option value="6">6px</option>
            <option value="7">7px</option>
        </select>
        <label for="label-position">Posición</label>
        <select id="label-position">
            <option value="centro">Centro</option>
            <option value="arriba">Arriba</option>
            <option value="abajo">Abajo</option>
            <option value="izquierda">Izquierda</option>
            <option value="derecha">Derecha</option>
        </select>
    `;
    infotool.appendChild(otherControls);

    // Botones de aplicar y cerrar
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-label";

    const applyButton = document.createElement("button");
    applyButton.className = "apli-button";
    applyButton.innerHTML = `<img src="/images/encender.png" alt="">`;
    applyButton.onclick = () => {
        const selectedLabel = document.getElementById("atributo-layers").value;
        if (selectedLabel) {
            updateAtributo(selectedLabel);
        } else {
            console.log("No se ha seleccionado ningún atributo.");
        }
    };

    const closeButton = document.createElement("button");
    closeButton.className = "close-button";
    closeButton.innerHTML = `<img src="/images/cancelar.png" alt="">`;
    closeButton.onclick = () => {
        labelCard.remove();
    };

    // Botón de limpiar etiquetas
    const clearButton = document.createElement("button");
    clearButton.className = "clear-button";
    clearButton.innerHTML = `<img src="/images/apagar.png" alt="">`; // Cambia el icono según tu diseño
    clearButton.onclick = () => {
        const selectedLayerName = document.getElementById("visible-layers").value;
        const layer = capasGeoJSON[selectedLayerName];
        if (layer) {
            // Recorrer la capa activa y desactivar tooltips
            layer.eachLayer(function (featureLayer) {
                featureLayer.unbindTooltip();
            });
            console.log("Etiquetas eliminadas de la capa activa.");
        } else {
            console.error("No hay una capa activa seleccionada.");
        }
    };

    buttonContainer.appendChild(applyButton);
    buttonContainer.appendChild(clearButton);
    buttonContainer.appendChild(closeButton);
   
    infotool.appendChild(buttonContainer);

    labelCard.appendChild(infotool);

    // Agregar el menú al panel de control
    controlPanel.appendChild(labelCard);
}

/*
  function handleLoadLabels(layerName) {
    const controlPanel = document.getElementById("control-panel");

    // Verificar si ya existe una "labelCard" previa y eliminarla para evitar duplicados
    const existingLabelCard = document.querySelector(".label-card");
    if (existingLabelCard) {
        existingLabelCard.remove();
    }

    // Crear un nuevo elemento para la configuración de etiquetas
    const labelCard = document.createElement("div");
    labelCard.className = "control-card label-card";

    // Título de la sección de etiquetas
    const title = document.createElement("h4");
    title.textContent = "Configuración de etiquetas";
    labelCard.appendChild(title);

    // Crear el select para elegir el atributo
    const attributeSelect = document.createElement("select");
    attributeSelect.id = "atributo-layers";
    attributeSelect.onchange = () => updateAtributo(attributeSelect.value);

    // Obtener los atributos de la capa seleccionada
    const layer = capasGeoJSON[layerName];
    const firstFeature = layer?.getLayers()?.[0]?.feature;

    if (!firstFeature) {
        alert("No se encontraron atributos en esta capa.");
        return;
    }

    // Llenar el select con las opciones de atributos
    const defaultOption = document.createElement("option");
    defaultOption.textContent = "Seleccione un atributo";
    defaultOption.value = "";
    attributeSelect.appendChild(defaultOption);

    // Agregar todos los atributos disponibles como opciones
    for (let key in firstFeature.properties) {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = key;
        attributeSelect.appendChild(option);
    }

    // Agregar el select al labelCard
    labelCard.appendChild(attributeSelect);

    // Crear controles adicionales (fuente, tamaño, etc.)
    // Aquí seguimos con la creación de los controles que ya tenías en el código
    // Crear controles adicionales
    const controls = [
        { label: "Fuente", type: "select", id: "font-family", options: ["Arial", "Verdana", "Times New Roman", "Courier New"] },
        { label: "Tamaño de fuente", type: "range", id: "font-size", min: 8, max: 40, step: 1, value: 12 },
        { label: "Color de fuente", type: "color", id: "font-color", value: "#000000" },
        { label: "Color de sombra", type: "color", id: "shadow-color", value: "#888888" },
        { label: "Negrita", type: "checkbox", id: "font-bold" },
        { label: "Itálica", type: "checkbox", id: "font-italic" },
        { label: "Buffer (px)", type: "range", id: "buffer-size", min: 0, max: 20, step: 1, value: 2 },
        { label: "Ubicación del label", type: "select", id: "label-position", options: ["Centro", "Arriba", "Abajo", "Izquierda", "Derecha"] },
    ];

    controls.forEach((control) => {
        const controlWrapper = document.createElement("div");
        controlWrapper.style.margin = "5px 0";

        const label = document.createElement("label");
        label.textContent = control.label;
        label.htmlFor = control.id;

        let input;
        if (control.type === "select") {
            input = document.createElement("select");
            control.options.forEach((opt) => {
                const option = document.createElement("option");
                option.value = opt.toLowerCase();
                option.textContent = opt;
                input.appendChild(option);
            });
        } else if (control.type === "range" || control.type === "color" || control.type === "checkbox") {
            input = document.createElement("input");
            input.type = control.type;
            if (control.min) input.min = control.min;
            if (control.max) input.max = control.max;
            if (control.step) input.step = control.step;
            if (control.value) input.value = control.value;
        }

        input.id = control.id;
        controlWrapper.appendChild(label);
        controlWrapper.appendChild(input);
        labelCard.appendChild(controlWrapper);
    });
    // ... (agregar controles de fuente, color, etc.)

    // Botón para aplicar los cambios
    const applyButton = document.createElement("button");
    applyButton.textContent = "Aplicar";
    applyButton.style.marginTop = "10px";
    applyButton.onclick = () =>  {
        // Obtener el valor seleccionado del select con id "tributo-layers"
        const selectedLabel = document.getElementById("atributo-layers").value;
    
        if (selectedLabel) {
            // Llamar a la función applyLabelToLayer con el label o etiqueta seleccionada
            updateAtributo(selectedLabel);
        } else {
            console.log("No se ha seleccionado ninguna capa.");
        }


    };

    labelCard.appendChild(applyButton);
    
       // Crear el botón de cerrar
       const closeButton = document.createElement("button");
       closeButton.textContent = "Cerrar"; // Icono de cerrar
       closeButton.className = "close-button"; // Clase para estilos
       closeButton.onclick = () => {
           labelCard.remove(); // Eliminar el card al hacer clic
       };
   
       // Añadir el botón de cerrar al labelCard
       labelCard.appendChild(closeButton);

    // Agregar la labelCard al panel de control
    controlPanel.appendChild(labelCard);
}
*/

/*
// CARGA ETIQUETAS POR DEFECTO
function updateAtributo(attribute) {
    // Obtener la capa seleccionada del select "visible-layers"
    const selectedLayerName = document.getElementById("visible-layers").value;
    const layer = capasGeoJSON[selectedLayerName]; // Acceder a la capa por su nombre

    if (layer && attribute) {
        // Obtener los valores seleccionados de los controles del nuevo panel
        const fontFamily = document.getElementById("font-family").value || "Arial";
        const fontSize = document.getElementById("font-size").value || "8px";
        const fontColor = document.getElementById("font-color").value || "#000000";
        const shadowColor = document.getElementById("shadow-color").value || "#888888";
        const isBold = document.getElementById("font-bold").checked;
        const isItalic = document.getElementById("font-italic").checked;
        const bufferSize = document.getElementById("buffer-size").value || "0px";
        const labelPosition = document.getElementById("label-position").value || "centro";

        // Crear el estilo CSS para las etiquetas
        const labelStyle = `
            font-family: ${fontFamily};
            font-size: ${fontSize};
            color: ${fontColor};
            font-weight: ${isBold ? "bold" : "normal"};
            font-style: ${isItalic ? "italic" : "normal"};
            text-shadow: ${bufferSize} ${bufferSize} ${shadowColor};
        `;

        // Recorrer las características de la capa y actualizar las etiquetas
        layer.eachLayer(function (featureLayer) {
            // Obtener el texto de la etiqueta según el atributo seleccionado
            const labelText = featureLayer.feature.properties[attribute];

            // Eliminar tooltip existente
            featureLayer.unbindTooltip();

            // Agregar tooltip con el estilo y posición
            featureLayer.bindTooltip(labelText, {
                permanent: true,
                direction: mapLabelPosition(labelPosition),
                className: "custom-tooltip", // Clase CSS personalizada para estilos adicionales
            }).openTooltip();
        });

        // Aplicar estilo global para tooltips (opcional, usando CSS en JavaScript)
        const styleTag = document.createElement("style");
        styleTag.id = "custom-tooltip-style";
        styleTag.textContent = `
            .custom-tooltip {
                ${labelStyle}
            }
        `;

        // Eliminar estilo anterior si existe
        const existingStyleTag = document.getElementById("custom-tooltip-style");
        if (existingStyleTag) {
            existingStyleTag.remove();
        }

        // Agregar nuevo estilo
        document.head.appendChild(styleTag);

        console.log("Etiquetas actualizadas con los estilos seleccionados.");
    } else {
        console.error("Capa o atributo no seleccionados.");
    }
}

// Función para mapear las posiciones de los labels al formato esperado por Leaflet
function mapLabelPosition(position) {
    switch (position) {
        case "centro":
            return "center";
        case "arriba":
            return "top";
        case "abajo":
            return "bottom";
        case "izquierda":
            return "left";
        case "derecha":
            return "right";
        default:
            return "center";
    }
}
*/




//MOSTRAR EL LABEL EN EL MAPA
//CARGA ETIQUETAS POR DEFECTO
function updateAtributo(attribute) {
    // Obtener la capa seleccionada del select "visible-layers"
    const selectedLayerName = document.getElementById("visible-layers").value;
    const layer = capasGeoJSON[selectedLayerName]; // Acceder a la capa por su nombre

    if (layer && attribute) {
        // Obtener los valores predeterminados de los controles de estilo
        const fontFamily = document.getElementById("font-family").value || "Arial";
        const fontSize = document.getElementById("font-size").value || "12";
        const fontColor = document.getElementById("font-color").value || "#000000";
        const shadowColor = document.getElementById("shadow-color").value || "#ff0000";
        const isBold = document.getElementById("font-bold").checked;
        const isItalic = document.getElementById("font-italic").checked;
        const bufferSize = document.getElementById("buffer-size").value || "0";
        const labelPosition = document.getElementById("label-position").value || "top";

        // Crear estilo predeterminado para las etiquetas
        const labelStyle = `
            font-family: ${fontFamily};
            font-size: ${fontSize}px;
            color: ${fontColor};
            font-weight: ${isBold ? "bold" : "normal"};
            font-style: ${isItalic ? "italic" : "normal"};
            text-shadow: ${bufferSize}px ${bufferSize}px ${shadowColor};
        `;

        // Recorrer las características de la capa y actualizar las etiquetas
        layer.eachLayer(function (featureLayer) {
            // Obtener el texto de la etiqueta según el atributo seleccionado
            const labelText = featureLayer.feature.properties[attribute];

            // Eliminar tooltip existente
            featureLayer.unbindTooltip();

            // Agregar tooltip con el estilo y posición
            featureLayer.bindTooltip(labelText, {
                permanent: true,
                direction: labelPosition,
                className: "custom-tooltip", // Clase CSS para estilos adicionales
            }).openTooltip();
        });

        // Aplicar estilo global para tooltips (opcional, usando CSS en JavaScript)
        const styleTag = document.createElement("style");
        styleTag.id = "custom-tooltip-style";
        styleTag.textContent = `
            .custom-tooltip {
                ${labelStyle}
            }
        `;
        // Eliminar estilo anterior si existe
        const existingStyleTag = document.getElementById("custom-tooltip-style");
        if (existingStyleTag) {
            existingStyleTag.remove();
        }
        // Agregar nuevo estilo
        document.head.appendChild(styleTag);

        console.log("Etiquetas actualizadas con los estilos predeterminados.");
    } else {
        console.error("Capa o atributo no seleccionados.");
    }
}

// FUNCIONES PARA EL MENU CAPAS
// Agregar evento para mostrar/ocultar el contenido al presionar el subtítulo
document.querySelector('.subtitulo[data-toggle="ortoFoto"]').addEventListener('click', function () {
    const content = document.getElementById('ortoFotoContent'); // Seleccionar el elemento con el ID correcto
    // Alterna entre mostrar y ocultar
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block'; // Muestra la lista
    } else {
        content.style.display = 'none'; // Oculta la lista
    }
  });
  
  document.querySelectorAll('.subtitulo').forEach(subtitulo => {
    subtitulo.addEventListener('click', () => {
      const targetClass = subtitulo.getAttribute('data-toggle'); // Obtener la clase objetivo
      const list = document.querySelector(`.list.${targetClass}`); // Buscar la lista correspondiente
  
      if (list) {
        // Alternar entre mostrar y ocultar
        if (list.style.display === 'none' || list.style.display === '') {
          list.style.display = 'block'; // Mostrar la lista
        } else {
          list.style.display = 'none'; // Ocultar la lista
        }
      }
    });
  });
  
  
  function toggleAllLists() {
    // Seleccionar todas las listas <ul>
    const lists = document.querySelectorAll('.list');
  
    // Verificar si alguna lista está oculta
    const anyHidden = Array.from(lists).some(list => list.style.display === 'none' || list.style.display === '');
  
    // Alternar entre mostrar y ocultar todas las listas
    lists.forEach(list => {
        list.style.display = anyHidden ? 'block' : 'none';
    });
  }
  // FIN DE FUNCIONES PARA EL MENU CAPAS
  