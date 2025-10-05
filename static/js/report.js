document.addEventListener('DOMContentLoaded', () => {
    const apiKey = "856e83dea4256d22540d2148df99b880"; 
    const lat = localStorage.getItem('user_latitude');
    const lon = localStorage.getItem('user_longitude');
    const locationName = localStorage.getItem('user_location_name');
    if (!lat || !lon || !locationName) {
        document.body.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <h1>Error</h1>
                <p>No se encontraron datos de ubicación. Por favor, selecciona una ubicación primero.</p>
                <a href="location.html">Volver a la selección</a>
            </div>`;
        return;
    }

    function populateStaticData() {
        document.getElementById('report-date').innerText = new Date().toLocaleDateString('es-ES');
        const [city, state, country] = locationName.split(', ');
        document.getElementById('report-city').innerText = city || 'N/A';
        document.getElementById('report-state').innerText = state || 'N/A';
        document.getElementById('report-country').innerText = country || 'N/A';
    }

    async function getWeatherData() {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            document.getElementById('report-temp').innerText = `${Math.round(data.main.temp)} °C`;
            document.getElementById('report-humidity').innerText = `${data.main.humidity}%`;
            document.getElementById('report-pressure').innerText = `${data.main.pressure} hPa`;
            document.getElementById('report-wind').innerText = `${data.wind.speed.toFixed(1)} km/h`;
        } catch (error) {
            console.error("Error al obtener datos del clima:", error);
        }
    }

    async function getAirQualityData() {
        const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.list && data.list.length > 0) {
                const aqiData = data.list[0];
                const components = aqiData.components;

                const pollutantIds = {
                    'report-co': components.co, 'report-no': components.no,
                    'report-no2': components.no2, 'report-o3': components.o3,
                    'report-so2': components.so2, 'report-pm25': components.pm2_5,
                    'report-pm10': components.pm10, 'report-nh3': components.nh3,
                };

                for (const [id, value] of Object.entries(pollutantIds)) {
                    const el = document.getElementById(id);
                    if (el && value !== undefined) {
                        el.innerText = value.toFixed(2);
                    }
                }

                document.getElementById('report-aqi').innerText = aqiData.main.aqi;
                populateSuggestion(aqiData.main.aqi);
            }
        } catch (error) {
            console.error("Error al obtener datos de calidad del aire:", error);
        }
    }
    function populateSuggestion(aqi) {
        const suggestionEl = document.getElementById('report-suggestion');
        if (!suggestionEl) return;

        let suggestionText = "";
        switch(aqi) {
            case 1: case 2:
                suggestionText = "Air quality is considered satisfactory, and air pollution poses little or no risk.";
                break;
            case 3:
                suggestionText = "Sensitive groups should reduce prolonged or heavy exertion outdoors.";
                break;
            case 4:
                suggestionText = "Everyone should reduce heavy exertion outdoors. Sensitive groups should avoid all outdoor activity.";
                break;
            case 5:
                suggestionText = "Health alert: everyone should avoid all outdoor exertion. Remain indoors.";
                break;
            default:
                suggestionText = "No specific recommendations available for this AQI level.";
        }
        suggestionEl.innerText = suggestionText;
    }
    async function generateReport() {
        populateStaticData();
        await Promise.all([
            getWeatherData(),
            getAirQualityData()
        ]);
        console.log("Reporte generado exitosamente.");
    }

    generateReport();
});