window.onload = function() {
    const pantallaDeCarga = document.getElementById('pantalla-carga');
    const contenidoPrincipal = document.getElementById('contenido-principal');
    pantallaDeCarga.classList.add('oculto');
    setTimeout(() => {
        pantallaDeCarga.style.display = 'none';
        contenidoPrincipal.style.display = 'block';
    }, 700);
};