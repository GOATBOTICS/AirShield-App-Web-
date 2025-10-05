// static/js/satellite-view.js

document.addEventListener('DOMContentLoaded', () => {
    const mapDisplay = document.getElementById('map-display');
    const backButton = document.getElementById('back-to-dashboard-btn');
    const mapSelectors = document.querySelectorAll('.location-selector[data-product]');
    const refreshButton = document.getElementById('refresh-map-btn');

    let currentProduct = ''; 

    // --- FUNCIÓN PRINCIPAL ACTUALIZADA ---
    async function fetchAndDisplayMap(productName) {
        currentProduct = productName; 
        
        mapDisplay.style.backgroundImage = 'none';
        mapDisplay.innerHTML = `<p>Buscando mapa para ${productName}...</p>`;

        try {
            // 1. Hacemos la petición a NUESTRO servidor Python
            const response = await fetch(`http://127.0.0.1:5000/api/get-nasa-map/${productName}`);
            
            // 2. Leemos la respuesta como un objeto JSON
            const data = await response.json();

            if (!response.ok) {
                // Si el servidor devolvió un error (ej. 404), lo mostramos
                throw new Error(data.error || 'El servidor respondió con un error.');
            }

            // 3. CAMBIO CLAVE: Extraemos la URL de la imagen del JSON
            const imageUrl = data.imageUrl;

            // 4. Usamos esa URL directamente como fondo del mapa
            mapDisplay.style.backgroundImage = `url('${imageUrl}')`;
            mapDisplay.innerHTML = ''; // Limpiamos el texto de "Cargando..."

        } catch (error) {
            console.error(`Error al cargar el mapa para ${productName}:`, error);
            mapDisplay.style.backgroundImage = 'none'; // Quitamos cualquier fondo anterior
            mapDisplay.innerHTML = `<p>Error: No se pudo cargar el mapa. ${error.message}</p>`;
        }
    }

    // --- Lógica de los botones (con la mejora de la clase 'active') ---
    mapSelectors.forEach(selector => {
        selector.addEventListener('click', () => {
            // Quita la clase 'active' de todos los botones
            mapSelectors.forEach(s => s.classList.remove('active'));
            // Añade 'active' solo al que se hizo clic
            selector.classList.add('active');

            const productName = selector.getAttribute('data-product');
            fetchAndDisplayMap(productName);
        });
    });

    if (backButton) {
        backButton.addEventListener('click', () => {
            // Cambia 'dashboard.html' por la página a la que quieras volver
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

    // Cargar el mapa de NO2 por defecto al iniciar y marcarlo como activo
    const defaultSelector = document.querySelector('.location-selector[data-product="NO2"]');
    if (defaultSelector) {
        defaultSelector.classList.add('active');
        fetchAndDisplayMap('NO2');
    }
});
