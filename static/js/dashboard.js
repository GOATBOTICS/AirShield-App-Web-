document.addEventListener('DOMContentLoaded', () => {
    const apiKey = "856e83dea4256d22540d2148df99b880";
    const lat = localStorage.getItem('user_latitude');
    const lon = localStorage.getItem('user_longitude');
    const locationName = localStorage.getItem('user_location_name');
    const pantallaDeCarga = document.getElementById('pantalla-carga');
    const contenidoPrincipal = document.querySelector('.dashboard-content');
    const infoIcon = document.getElementById('info-icon');
    const infoModal = document.getElementById('info-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const refreshButton = document.getElementById('refresh-btn');
    const changeLocationButton = document.getElementById('change-location-btn');
    const satelliteButton = document.getElementById('view-satellite-btn');
    const locationNameEl = document.getElementById('location-name');
    if (!lat || !lon) {
    alert('No se ha seleccionado una ubicación. Por favor, elige una primero.');
    window.location.href = 'location.html';
    return;
    }
    if (locationNameEl && locationName) {
        locationNameEl.innerText = locationName;
    } else if (locationNameEl) {
        locationNameEl.innerText = 'Location not set';
    }
    if (contenidoPrincipal) contenidoPrincipal.style.display = 'none';
    if (pantallaDeCarga && contenidoPrincipal) {
        setTimeout(() => {
            pantallaDeCarga.style.display = 'none';
            contenidoPrincipal.style.display = 'block';
        }, 700);
    }
    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            location.reload();
        });
    }
    if (changeLocationButton) {
        changeLocationButton.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres cambiar tu ubicación? Se borrará la actual.')) {
                localStorage.removeItem('user_latitude');
                localStorage.removeItem('user_longitude');
                localStorage.removeItem('user_location_name');
                window.location.href = 'location.html';
            }
        });
    }
    if (satelliteButton) {
        satelliteButton.addEventListener('click', () => {
            window.location.href = 'satellite-view.html';
        });
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
                lastUpdateTimestamp = aqiData.dt;
                updateLastUpdatedStatus();
            }
        } catch (error) {
            console.error("Error al obtener datos de calidad del aire:", error);
        }
    }

    function updateAqiStatus(aqi) {
        const statusEl = document.getElementById('aqi-status');
        const aqiValueEl = document.getElementById('aqi-value');
        const statusMap = {
            1: { text: "Excellent", class: "status-good" },
            2: { text: "Good", class: "status-fair" },
            3: { text: "Moderate", class: "status-moderate" },
            4: { text: "Bad", class: "status-poor" },
            5: { text: "Caution", class: "status-very-poor" }
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
            "co-value": components.co,
            "no-value": components.no,
            "no2-value": components.no2,
            "o3-value": components.o3,
            "so2-value": components.so2,
            "pm25-value": components.pm2_5,
            "pm10-value": components.pm10,
            "nh3-value": components.nh3
        };
        for (const [id, value] of Object.entries(pollutants)) {
            const el = document.getElementById(id);
            if (el && value !== undefined) {
                el.innerText = value.toFixed(2);
            }
        }
    }

    function updateHealthRecommendations(aqi) {
    const container = document.getElementById("recommendations-body");
    // If the container element doesn't exist, the function stops.
    if (!container) return;

    let html = "";
    
    // A switch statement is used to handle each possible AQI value.
    switch(aqi) {
        case 1:
        case 2:
            html = `
                <div class="recommendation-item good">
                    <i class="fa-solid fa-circle-check"></i>
                    <div class="recommendation-text">
                        <h4>Ideal Air Quality</h4>
                        <p>It's an excellent day to enjoy outdoor activities.</p>
                    </div>
                </div>`;
            break;

        case 3:
            html = `
                <div class="recommendation-item warning">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <div class="recommendation-text">
                        <h4>Caution for Sensitive Groups</h4>
                        <p>People with asthma or allergies should limit prolonged outdoor exertion.</p>
                    </div>
                </div>`;
            break;

        case 4:
            html = `
                <div class="recommendation-item bad">
                    <i class="fa-solid fa-mask-face"></i>
                    <div class="recommendation-text">
                        <h4>Poor Air Quality</h4>
                        <p>The general public is advised to reduce intense physical activity outdoors.</p>
                    </div>
                </div>`;
            break;

        case 5:
             html = `
                <div class="recommendation-item very-bad">
                    <i class="fa-solid fa-house-chimney-medical"></i>
                    <div class="recommendation-text">
                        <h4>High-Risk Air Quality</h4>
                        <p>Avoid all outdoor activities. Keep doors and windows closed.</p>
                    </div>
                </div>`;
            break;

        default: 
            html = `<p>No recommendations available.</p>`;
    }
    
    container.innerHTML = html;
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

    function updateLastUpdatedStatus() {
        if (!lastUpdateTimestamp) return;
        const lastUpdatedElement = document.getElementById('last-updated-value');
        if (!lastUpdatedElement) return;
        const minutesAgo = Math.round((Date.now() / 1000 - lastUpdateTimestamp) / 60);
        
        const timeString = formatUnixTime(lastUpdateTimestamp);

        if (minutesAgo <= 1) {
            lastUpdatedElement.innerText = `${timeString} (Just now)`;
        } else {
            lastUpdatedElement.innerText = `${timeString} (${minutesAgo} min ago)`;
        }
        if (!lat || !lon) {
            alert('No se ha seleccionado una ubicación. Por favor, elige una primero.');
            window.location.href = 'location.html';
            return;
        }
    }

    updateAllData(); 
    setInterval(updateAllData, 300000); // Actualiza cada 5 minutos
});