window.onload = function () {
    const pantallaDeCarga = document.getElementById('pantalla-carga');
    const contenidoPrincipal = document.querySelector('.dashboard-content');
    pantallaDeCarga.classList.add('oculto');
    setTimeout(() => {
        pantallaDeCarga.style.display = 'none';
        contenidoPrincipal.style.display = 'block';
    }, 700);
};
document.addEventListener('DOMContentLoaded', () => {
    const apiKey = "856e83dea4256d22540d2148df99b880";
    const lat = localStorage.getItem('user_latitude');
    const lon = localStorage.getItem('user_longitude');
    if (!lat || !lon) {
        alert('No se ha seleccionado una ubicación. Por favor, elige una primero.');
        window.location.href = 'location.html';
        return;
    }
    const pantallaDeCarga = document.getElementById('pantalla-carga');
    const contenidoPrincipal = document.querySelector('.dashboard-content');
    const infoIcon = document.getElementById('info-icon');
    const infoModal = document.getElementById('info-modal');
    const closeModalBtn = document.getElementById('close-modal');
    // Elementos del Modal de Detalles Avanzados (NASA)
    const cardTriggers = document.querySelectorAll('#temp-card, #humidity-card, #pressure-card, #wind-card');
    const advancedModal = document.getElementById('advanced-details-modal');
    const closeAdvancedModalBtn = document.getElementById('close-advanced-modal');
    const modalTitle = advancedModal.querySelector('h2');
    const modalContent = document.getElementById('modal-map-content');


    if (contenidoPrincipal) {
        contenidoPrincipal.style.display = 'none';
    }
    if (pantallaDeCarga && contenidoPrincipal) {
        setTimeout(() => {
            pantallaDeCarga.style.display = 'none';
            contenidoPrincipal.style.display = 'block';
        }, 700);
    }
    if (infoIcon && infoModal && closeModalBtn) {
        infoIcon.addEventListener('click', () => { infoModal.style.display = 'flex'; });
        closeModalBtn.addEventListener('click', () => { infoModal.style.display = 'none'; });
        window.addEventListener('click', (event) => {
            if (event.target == infoModal) {
                infoModal.style.display = 'none';
            }
        });
    }

    async function getWeatherData() {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            console.log("Datos del Clima:", data);

            document.getElementById('temp-value').innerText = `${Math.round(data.main.temp)}°C`;
            document.getElementById('humidity-value').innerText = `${data.main.humidity}%`;
            document.getElementById('pressure-value').innerText = `${data.main.pressure} hPa`;
            document.getElementById('wind-value').innerText = data.wind.speed.toFixed(1);
        } catch (error) {
            console.error("Error al obtener datos del clima:", error);
        }
    }
    async function getAirQualityData() {
        const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            console.log("Datos de Calidad del Aire:", data);

            if (data.list && data.list.length > 0) {
                const aqiData = data.list[0];
                updateAqiStatus(aqiData.main.aqi);
                updatePollutantDetails(aqiData.components);
                updateHealthRecommendations(aqiData.main.aqi);
                document.getElementById("last-updated").innerText = formatUnixTime(aqiData.dt);
            }
        } catch (error) {
            console.error("Error al obtener datos de calidad del aire:", error);
        }
    }
    function updateAqiStatus(aqi) {
        const statusEl = document.getElementById('aqi-status');
        const aqiValueEl = document.getElementById('aqi-value');
        const statusMap = {
            1: { text: "Good", class: "status-good" },
            2: { text: "Fair", class: "status-fair" },
            3: { text: "Moderate", class: "status-moderate" },
            4: { text: "Poor", class: "status-poor" },
            5: { text: "Very Poor", class: "status-very-poor" }
        };
        const status = statusMap[aqi] || { text: "Unknown", class: "status-unknown" };
        
        if (aqiValueEl) aqiValueEl.innerText = aqi;
        if (statusEl) {
            statusEl.innerText = status.text;
            statusEl.className = `aqi-status ${status.class}`;
        }
    }
    function updatePollutantDetails(components) {
        const pollutants = {
            "pm25-value": components.pm2_5, "pm10-value": components.pm10,
            "no2-value": components.no2, "o3-value": components.o3
        };
        for (const [id, value] of Object.entries(pollutants)) {
            const el = document.getElementById(id);
            if (el) el.innerText = value.toFixed(2);
        }
    }
    function updateHealthRecommendations(aqi) {
        const container = document.getElementById("recommendations-body");
        let html = "";
        switch (aqi) {
            case 1:
            case 2:
                html = `<div class="recommendation-item good"><i class="fa-solid fa-circle-check"></i><div class="recommendation-text"><h4>Air quality is good</h4><p>Safe for all outdoor activities.</p></div></div>`;
                break;
            case 3:
                html = `<div class="recommendation-item warning"><i class="fa-solid fa-triangle-exclamation"></i><div class="recommendation-text"><h4>Sensitive groups should be cautious</h4><p>Consider limiting prolonged outdoor exertion.</p></div></div>`;
                break;
            case 4:
                html = `<div class="recommendation-item bad"><i class="fa-solid fa-mask-face"></i><div class="recommendation-text"><h4>Unhealthy air quality</h4><p>Everyone should reduce intense outdoor activity.</p></div></div>`;
                break;
            case 5:
                html = `<div class="recommendation-item very-bad"><i class="fa-solid fa-house-chimney-medical"></i><div class="recommendation-text"><h4>Very unhealthy air quality</h4><p>Stay indoors and keep windows closed.</p></div></div>`;
                break;
            default:
                html = `<p>No recommendations available.</p>`;
        }
        if (container) container.innerHTML = html;
    }
    function formatUnixTime(unix) {
        const date = new Date(unix * 1000);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    function updateAllData() {
        console.log("Actualizando datos...");
        getWeatherData();
        getAirQualityData();
    }
    if (advancedModal && closeModalBtn && cardTriggers.length > 0) {
        
        async function openAdvancedModal(title) {
            modalTitle.innerText = title;
            modalContent.innerHTML = "<p>Calling local Python server for NASA data...</p>";
            advancedModal.style.display = 'flex';

            try {
                const response = await fetch('http://127.0.0.1:5000/api/get-nasa-data');
                
                if (!response.ok) throw new Error('Server responded with an error!');

                const data = await response.json();
                
                // ✨ LÓGICA NUEVA: Comprobar si recibimos una URL de imagen
                if (data.imageUrl) {
                    // Si la recibimos, la mostramos en una etiqueta <img>
                    modalContent.innerHTML = `<img src="${data.imageUrl}" alt="NASA Satellite Data">`;
                } else {
                    // Si no, mostramos el error que envió el servidor
                    modalContent.innerHTML = `<p>Error: ${data.error || 'Image URL not found.'}</p>`;
                }

            } catch (error) {
                console.error("Error al obtener datos desde el servidor Python:", error);
                modalContent.innerHTML = "<p>Error: Could not load data from the server. Is the Python server running?</p>";
            }
        }

        cardTriggers.forEach(card => {
            card.addEventListener('click', () => {
                const parameter = card.getAttribute('data-param');
                const dynamicTitle = `Advanced Details: ${parameter}`;
                openAdvancedModal(dynamicTitle);
            });
        });

        const closeAdvancedModal = () => { advancedModal.style.display = 'none'; };
        closeAdvancedModalBtn.addEventListener('click', closeAdvancedModal);
        window.addEventListener('click', (event) => {
            if (event.target == advancedModal) closeAdvancedModal();
        });
    }
    updateAllData();

    setInterval(updateAllData, 300000);
});