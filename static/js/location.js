document.addEventListener('DOMContentLoaded', () => {
    const stateSelect = document.getElementById('state-select');
    const citySelect = document.getElementById('city-select');
    const locationForm = document.getElementById('location-form');

    const countriesURL = 'static/json/countries.json';
    const statesURL = 'static/json/states.json';
    const citiesURL = 'static/json/cities.json';

    let mexicoStates = [];
    let allCities = [];
    async function initializeLocationData() {
        try {
            const [countriesRes, statesRes, citiesRes] = await Promise.all([
                fetch(countriesURL),
                fetch(statesURL),
                fetch(citiesURL)
            ]);

            const countries = await countriesRes.json();
            const states = await statesRes.json();
            allCities = await citiesRes.json();

            const mexico = countries.find(country => country.iso2 === 'MX');
            if (!mexico) {
                console.error("No se encontró a México en countries.json");
                stateSelect.innerHTML = '<option>Error: País no encontrado</option>';
                return;
            }
            mexicoStates = states.filter(state => state.country_id === mexico.id);
            mexicoStates.sort((a, b) => a.name.localeCompare(b.name));
            populateStates();

        } catch (error) {
            console.error('Error al cargar o procesar los archivos JSON:', error);
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
        citySelect.innerHTML = '<option value="" disabled selected>Cargando municipios...</option>';
        citySelect.disabled = true;

        const stateCities = allCities.filter(city => city.state_id == stateId);
        
        if (stateCities.length === 0) {
            citySelect.innerHTML = '<option value="">No hay municipios</option>';
            return;
        }
        
        // Ordenar municipios alfabéticamente
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

    // --- EVENTOS ---

    stateSelect.addEventListener('change', () => {
        const selectedStateId = stateSelect.value;
        if (selectedStateId) {
            loadCities(selectedStateId);
        }
    });

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

        alert(`Ubicación guardada: ${stateSelect.options[stateSelect.selectedIndex].text}, ${citySelect.options[citySelect.selectedIndex].text}`);

    });

    // --- INICIO ---
    initializeLocationData();
});