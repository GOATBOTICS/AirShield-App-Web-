document.addEventListener('DOMContentLoaded', () => {
    // --- CHEQUEO INICIAL ---
    // const savedLat = localStorage.getItem('user_latitude');
    // const savedLon = localStorage.getItem('user_longitude');
    // if (savedLat && savedLon) {
    //     window.location.href = 'dashboard.html';
    //     return;
    // }

    // --- ELEMENTOS DEL DOM ---
    const stateSelect = document.getElementById('state-select');
    const citySelect = document.getElementById('city-select');
    const locationForm = document.getElementById('location-form');
    const geolocateBtn = document.getElementById('geolocate-btn');

    // --- RUTAS Y DATOS ---
    const statesURL = 'static/json/states.json';
    const citiesURL = 'static/json/cities.json';
    let mexicoStates = [];
    let allCities = [];

    async function initializeLocationData() {
        try {
            const [statesRes, citiesRes] = await Promise.all([
                fetch(statesURL),
                fetch(citiesURL)
            ]);
            mexicoStates = await statesRes.json();
            allCities = await citiesRes.json();
            mexicoStates.sort((a, b) => a.name.localeCompare(b.name));
            populateStates();
        } catch (error) {
            console.error('Error al cargar datos locales:', error);
            stateSelect.innerHTML = '<option>Error al cargar datos</option>';
        }
    }
    
    function populateStates() {
        stateSelect.innerHTML = '<option value="" disabled selected>Selecciona un estado</option>';
        mexicoStates.forEach(state => {
            const option = document.createElement('option');
            option.value = state.id;
            option.textContent = state.name;
            stateSelect.appendChild(option);
        });
    }

    function loadCities(stateId) {
        // ... (función sin cambios)
        citySelect.innerHTML = '<option value="" disabled selected>Cargando municipios...</option>';
        citySelect.disabled = true;
        const stateCities = allCities.filter(city => city.state_id == stateId);
        stateCities.sort((a, b) => a.name.localeCompare(b.name));
        citySelect.innerHTML = '<option value="" disabled selected>Selecciona un municipio</option>';
        stateCities.forEach(city => {
            const option = document.createElement('option');
            option.value = `${city.latitude},${city.longitude}`;
            option.textContent = city.name;
            citySelect.appendChild(option);
        });
        citySelect.disabled = false;
    }

    function handleGeolocate() {
        if (!navigator.geolocation) {
            alert('La geolocalización no es soportada por tu navegador.');
            return;
        }

        geolocateBtn.disabled = true;
        geolocateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Localizando...';

        navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError);
    }

    function geolocationSuccess(position) {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        const closestCity = findClosestCity(userLat, userLon);

        if (closestCity) {
            localStorage.setItem('user_latitude', userLat);
            localStorage.setItem('user_longitude', userLon);
            
            const state = mexicoStates.find(s => s.id === closestCity.state_id);
            alert(`Ubicación encontrada: ${closestCity.name}, ${state.name}. Redirigiendo...`);
            window.location.href = 'dashboard.html';
        } else {
            alert('No se pudo encontrar una ciudad cercana en nuestra base de datos.');
            resetGeolocateButton();
        }
    }

    function geolocationError(error) {
        alert(`Error al obtener la ubicación: ${error.message}`);
        resetGeolocateButton();
    }
    
    function getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function findClosestCity(userLat, userLon) {
        let closest = null;
        let minDistance = Infinity;

        allCities.forEach(city => {
            const distance = getDistance(userLat, userLon, city.latitude, city.longitude);
            if (distance < minDistance) {
                minDistance = distance;
                closest = city;
            }
        });
        return closest;
    }

    function resetGeolocateButton() {
        geolocateBtn.disabled = false;
        geolocateBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Usar mi ubicación actual';
    }


    // --- EVENT LISTENERS ---
    stateSelect.addEventListener('change', () => loadCities(stateSelect.value));
    geolocateBtn.addEventListener('click', handleGeolocate);

    locationForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const selectedCityCoords = citySelect.value;
        if (!selectedCityCoords || !stateSelect.value) {
            alert("Por favor, selecciona un estado y un municipio.");
            return;
        }
        const [latitude, longitude] = selectedCityCoords.split(',');
        localStorage.setItem('user_latitude', latitude);
        localStorage.setItem('user_longitude', longitude);
        window.location.href = 'dashboard.html';
    });

    // --- INICIO ---
    initializeLocationData();
});