document.addEventListener('DOMContentLoaded', () => {

    const apiKey = ''; 
    const lat = 25.53; // Latitud para Ramos Arizpe
    const lon = -100.95; // Longitud para Ramos Arizpe

    function getWeatherData() {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        fetch(weatherUrl)
            .then(response => response.json())
            .then(data => {
                console.log("Datos del Clima:", data); 
            })
            .catch(error => console.error('Error al obtener datos del clima:', error));
    }

  
    function getAirQualityData() {
        const airQualityUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

        fetch(airQualityUrl)
            .then(response => response.json())
            .then(data => {
                console.log("Datos de Calidad del Aire:", data); 
            })
            .catch(error => console.error('Error al obtener datos de calidad del aire:', error));
    }

    getWeatherData();
    getAirQualityData();

});