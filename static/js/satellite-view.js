document.addEventListener('DOMContentLoaded', () => {
    const mapDisplay = document.getElementById('map-display');
    const backButton = document.getElementById('back-to-dashboard-btn');
    const mapSelectors = document.querySelectorAll('.location-selector[data-product]');
    const refreshButton = document.getElementById('refresh-map-btn');
    const infoCardTitle = document.getElementById('info-card-title');
    const infoCardDescription = document.getElementById('info-card-description');
    const datePicker = document.getElementById('history-date-picker');
    const changeDateBtn = document.getElementById('change-date-btn');
    const dateDisplay = document.getElementById('selected-date-display');
    const hourlyList = document.getElementById('hourly-data-list');
    
    let currentProduct = '';

    const productInfo = {
        NO2: {
            title: "Dióxido de Nitrógeno (NO₂)",
            description: "El satélite TEMPO mide la cantidad de NO₂ en la atmósfera. Este gas proviene de la quema de combustibles fósiles, el tráfico y procesos industriales. El mapa muestra las zonas con mayores y menores concentraciones."
        },
        CLD04: {
            title: "Datos de Nubes (CLD04)",
            description: "Se muestra la información de las nubes, incluyendo su cobertura y densidad. El mapa de TEMPO indica visualmente las zonas con cielo despejado y dónde hay mayor cobertura nubosa, un factor clave en la calidad del aire."
        },
        HCHO: {
            title: "Formaldehído (HCHO)",
            description: "TEMPO mide la concentración de formaldehído (HCHO), un gas formado por la descomposición de compuestos orgánicos y emisiones humanas. El mapa muestra los niveles de HCHO, que es un precursor del ozono."
        }
    };

    // =======================================================
    // ========= LÓGICA ORIGINAL PARA EL MAPA (INTACTA) ========
    // =======================================================

    function updateInfoCard(productName) {
        const info = productInfo[productName];
        if (info && infoCardTitle && infoCardDescription) {
            infoCardTitle.innerText = info.title;
            infoCardDescription.innerText = info.description;
        }
    }

    async function fetchAndDisplayMap(productName) {
    currentProduct = productName;
    updateInfoCard(productName);

    mapDisplay.style.backgroundImage = 'none';
    mapDisplay.innerHTML = `<p>Buscando mapa para ${productName}...</p>`;

    const lat = localStorage.getItem('user_latitude');
    const lon = localStorage.getItem('user_longitude');

    if (!lat || !lon) {
        mapDisplay.innerHTML = `<p>Error: Ubicación no encontrada. Por favor, selecciona una ubicación en la página principal.</p>`;
        console.error("No se encontraron coordenadas en localStorage.");
        return;
    }

    try {
const backendUrl = "https://z5n12b4q-5000.usw3.devtunnels.ms";
const response = await fetch(`${backendUrl}/api/get-nasa-map/${productName}?lat=${lat}&lon=${lon}`);        
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'El servidor respondió con un error.');
        }

        const imageUrl = data.imageUrl;
        mapDisplay.style.backgroundImage = `url('${imageUrl}')`;
        mapDisplay.innerHTML = '';

    } catch (error) {
        console.error(`Error al cargar el mapa para ${productName}:`, error);
        mapDisplay.style.backgroundImage = 'none';
        mapDisplay.innerHTML = `<p>Error: No se pudo cargar el mapa. ${error.message}</p>`;
    }
}

    // ========================================================
    // ========= LÓGICA DEL HISTORIAL ACTUALIZADA =========
    // ========================================================
    
    const formatDateForAPI = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    };

    async function fetchHistoricalData(date) {
        if (!date || !hourlyList) return;
        
        hourlyList.innerHTML = '<li>Cargando datos históricos...</li>';
        
        const lat = localStorage.getItem('user_latitude');
        const lon = localStorage.getItem('user_longitude');

        if (!lat || !lon) {
            hourlyList.innerHTML = '<li>Error: No se encontró la ubicación.</li>';
            return;
        }

        const apiDate = formatDateForAPI(date);
        const backendUrl = "https://z5n12b4q-5000.usw3.devtunnels.ms";
        const apiUrl = `${backendUrl}/api/get-historical-data?lat=${lat}&lon=${lon}&date=${apiDate}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `El servidor respondió con error: ${response.status}`);
            }
            
            const data = await response.json();
            const tempData = data.properties.parameter.T2M;
            hourlyList.innerHTML = '';

            for (let i = 0; i < 24; i++) {
                const hour = String(i).padStart(2, '0');
                const key = `${apiDate}${hour}`;
                const temp = tempData[key];
                const listItem = document.createElement('li');
                
                if (temp !== undefined && temp > -900) { 
                    listItem.innerHTML = `<span class="time">${hour}:00</span> <span class="value">${temp.toFixed(2)} °C</span>`;
                } else {
                    listItem.innerHTML = `<span class="time">${hour}:00</span> <span class="value">Indefinido</span>`;
                }
                hourlyList.appendChild(listItem);
            }
        } catch (error) {
            console.error("Error al obtener datos históricos:", error);
            hourlyList.innerHTML = `<li>Error al cargar los datos: ${error.message}</li>`;
        }
    }

    function initializeHistoryCard() {
    // Si los elementos no existen, no hagas nada.
    if (!changeDateBtn || !dateDisplay) return;

    const today = new Date();

    // Función para actualizar la fecha y llamar a la API
    const updateDateAndFetch = (selectedDate) => {
        // Muestra la fecha seleccionada en formato local (ej. 5/10/2025)
        dateDisplay.textContent = selectedDate.toLocaleDateString('es-ES');
        // Llama a la API con la fecha seleccionada
        fetchHistoricalData(selectedDate);
    };

    // ✨ INICIALIZACIÓN DE FLATPCIKR ✨
    const fp = flatpickr(changeDateBtn, {
        maxDate: "today", // No permite seleccionar fechas futuras
        dateFormat: "Y-m-d", // Formato interno
        defaultDate: today,  // Fecha por defecto
        
        // Se ejecuta cuando el usuario selecciona una fecha
        onChange: function(selectedDates) {
            if (selectedDates.length > 0) {
                updateDateAndFetch(selectedDates[0]);
            }
        },
    })};

    // ========================================================
    // ========= INICIALIZACIÓN Y EVENTOS DE LA PÁGINA ========
    // ========================================================

    mapSelectors.forEach(selector => {
        selector.addEventListener('click', () => {
            mapSelectors.forEach(s => s.classList.remove('active'));
            selector.classList.add('active');
            const productName = selector.getAttribute('data-product');
            fetchAndDisplayMap(productName);
        });
    });

    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }

    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            if (currentProduct) {
                console.log(`Refrescando mapa para: ${currentProduct}`);
                fetchAndDisplayMap(currentProduct);
            }
        });
    }

    const defaultSelector = document.querySelector('.location-selector[data-product="NO2"]');
    if (defaultSelector) {
        defaultSelector.classList.add('active');
        fetchAndDisplayMap('NO2');
    }
    
    initializeHistoryCard()
});