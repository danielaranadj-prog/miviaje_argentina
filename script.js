// --- VARIABLES GLOBALES ---
let dolarBlueVenta = 1200; // Valor de respaldo por si falla internet
const TASA_MXN = 20.50;    // Valor estimado 1 USD = 20.50 MXN

// --- 1. CONEXIÓN API (Dólar Blue en Tiempo Real) ---
async function obtenerCotizacion() {
    const display = document.getElementById('dolar-value');
    
    try {
        // Consultamos la API pública de Argentina
        const response = await fetch('https://dolarapi.com/v1/dolares/blue');
        
        if (!response.ok) throw new Error('Error en API');
        
        const data = await response.json();
        
        // Actualizamos la variable global
        dolarBlueVenta = data.venta;
        
        // Actualizamos la pantalla "La Posta"
        if(display) {
            display.innerText = `$${dolarBlueVenta}`;
            display.style.color = "var(--green)"; // Verde si está vivo
            
            // Animación visual de actualización
            display.style.opacity = 0;
            setTimeout(() => display.style.opacity = 1, 200);
        }
        
        // Si el usuario ya escribió algo, recalculamos con el nuevo valor
        convertMoney(); 

    } catch (error) {
        console.log("Usando valor offline:", error);
        // Si falla (sin señal en la montaña), mostramos el valor estimado
        if(display) {
            display.innerText = `$${dolarBlueVenta}*`;
            display.style.color = "var(--text-secondary)";
        }
    }
}

// --- 2. CALCULADORA DINÁMICA ---
function convertMoney() {
    const inputArs = document.getElementById('input-ars');
    const outUsd = document.getElementById('output-usd');
    const outMxn = document.getElementById('output-mxn');
    
    // Obtenemos el valor que escribió el usuario
    let pesosArgentinos = parseFloat(inputArs.value);

    // Validamos que sea un número
    if(isNaN(pesosArgentinos) || pesosArgentinos === 0) {
        outUsd.innerText = "-";
        outMxn.innerText = "-";
        return;
    }

    // MATEMÁTICA: 
    // 1. Pesos Arg -> Dólares (Dividir por cotización Blue)
    let dolares = pesosArgentinos / dolarBlueVenta;
    
    // 2. Dólares -> Pesos MXN (Multiplicar por factor MXN)
    let pesosMexicanos = dolares * TASA_MXN;

    // Mostrar en pantalla (toFixed(2) limita a 2 decimales)
    outUsd.innerText = `$${dolares.toFixed(2)}`;
    outMxn.innerText = `$${pesosMexicanos.toFixed(0)}`; // Sin decimales para MXN
}

// --- 3. LÓGICA DE LANDING Y CONTADOR ---
function updateCountdown() {
    const targetDate = new Date('November 3, 2026 00:00:00').getTime();
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        const elDias = document.getElementById('dias');
        if(elDias) {
            document.getElementById('dias').innerText = days;
            document.getElementById('horas').innerText = hours;
            document.getElementById('mins').innerText = minutes;
        }
    }
}
setInterval(updateCountdown, 1000);

function enterApp() {
    const landing = document.getElementById('landing-page');
    const app = document.getElementById('app-content');
    const whatsapp = document.getElementById('whatsapp-float');
    
    landing.classList.add('hidden');
    setTimeout(() => {
        landing.style.display = 'none';
        app.classList.add('visible');
        whatsapp.classList.add('visible');
    }, 800);
}

// --- 4. NAVEGACIÓN Y TABS ---
function openTab(tabName, direction = 'fade') {
    var i, x, tablinks;
    x = document.getElementsByClassName("tab-content");
    for (i = 0; i < x.length; i++) { 
        x[i].style.display = "none"; 
        x[i].classList.remove("slide-in-right", "slide-in-left");
    }
    tablinks = document.getElementsByClassName("nav-btn");
    for (i = 0; i < tablinks.length; i++) { tablinks[i].classList.remove("active"); }
    
    const newTab = document.getElementById(tabName);
    if(newTab) {
        newTab.style.display = "block";
        if (direction === 'next') newTab.classList.add("slide-in-right");
        else if (direction === 'prev') newTab.classList.add("slide-in-left");
        else newTab.style.animation = "fadeIn 0.3s ease";
        
        let activeBtn = document.querySelector(`button[onclick*="'${tabName}'"]`);
        if(activeBtn) activeBtn.classList.add("active");
        
        localStorage.setItem('lastTab', tabName);
        if (navigator.vibrate) navigator.vibrate(10);
    }
}

// --- 5. GESTOS (SWIPE) PARA CAMBIAR PESTAÑAS ---
let touchStartX = 0;
let touchStartY = 0;
const tabOrder = ['itinerario', 'que-hacer', 'trayectos', 'hoteles', 'gps'];

document.addEventListener('touchstart', (e) => {
    if (window.innerWidth > 768) return;
    if (e.target.closest('.map-card') || e.target.closest('input')) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    // Detectar si fue un swipe horizontal (más movimiento X que Y)
    if (Math.abs(touchEndX - touchStartX) > 50 && Math.abs(touchEndY - touchStartY) < 100) {
        const activeContent = document.querySelector('.tab-content[style*="display: block"]');
        if (!activeContent) return;
        
        const currentIndex = tabOrder.indexOf(activeContent.id);
        
        // Swipe Izquierda (Siguiente)
        if (touchEndX < touchStartX && currentIndex < tabOrder.length - 1) {
            openTab(tabOrder[currentIndex + 1], 'next');
        }
        // Swipe Derecha (Anterior)
        if (touchEndX > touchStartX && currentIndex > 0) {
            openTab(tabOrder[currentIndex - 1], 'prev');
        }
    }
});

// --- 6. UTILIDADES (Mapa, Reloj, Checklist) ---
function calculateRoute() {
    var val = document.getElementById("dest-input").value;
    if(val) window.open("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(val), "_blank");
}

function quickNav(val) { 
    if (navigator.vibrate) navigator.vibrate(50);
    window.open("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(val), "_blank"); 
}

function toggleChecklist() {
    const content = document.getElementById('checklist-items');
    const arrow = document.getElementById('check-arrow');
    if (content.style.display === "block") {
        content.style.display = "none";
        arrow.style.transform = "rotate(0deg)";
    } else {
        content.style.display = "block";
        arrow.style.transform = "rotate(180deg)";
    }
}

function updateDualClock() {
    const now = new Date();
    // Hora CDMX
    const optionsMX = { timeZone: 'America/Mexico_City', hour: '2-digit', minute: '2-digit', hour12: false };
    const timeMX = new Intl.DateTimeFormat('es-MX', optionsMX).format(now);
    // Hora Buenos Aires
    const optionsAR = { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', hour12: false };
    const timeAR = new Intl.DateTimeFormat('es-AR', optionsAR).format(now);
    
    const elMX = document.getElementById('time-mx');
    const elAR = document.getElementById('time-ar');
    if(elMX) elMX.innerText = timeMX;
    if(elAR) elAR.innerText = timeAR;
}
setInterval(updateDualClock, 1000);

// --- 7. DICCIONARIO ARGENTO ---
const slangWords = [
    { word: "Boludo", def: "Amigo de confianza o tonto, depende el tono. ¡Usalo con cuidado!" },
    { word: "Quilombo", def: "Lío, desorden, problema o fiesta muy ruidosa." },
    { word: "Cheto", def: "Persona de clase alta, fresa, o algo muy elegante y caro." },
    { word: "Bondi", def: "El autobús colectivo. 'Tomamos el bondi al centro'." },
    { word: "Laburo", def: "Trabajo. 'Tengo mucho laburo hoy'." },
    { word: "Fiaca", def: "Pereza, flojera. 'Me da fiaca salir'." },
    { word: "Birra", def: "Cerveza. Fundamental en cualquier juntada." },
    { word: "Chamuyo", def: "Mentira elaborada o habilidad para coquetear hablando mucho." },
    { word: "Guita", def: "Dinero. 'No tengo un mango (no tengo guita)'." },
    { word: "Previa", def: "Juntarse a tomar algo antes de salir a bailar." }
];
function newSlang() {
    const randomIndex = Math.floor(Math.random() * slangWords.length);
    const item = slangWords[randomIndex];
    document.getElementById('slang-word').innerText = item.word;
    document.getElementById('slang-def').innerText = item.def;
    if(navigator.vibrate) navigator.vibrate(20);
}

// --- 8. INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', function() {
    // 1. Iniciar Relojes
    updateDualClock();
    updateCountdown();
    
    // 2. Traer Cotización Dólar
    obtenerCotizacion();

    // 3. Restaurar pestaña
    const lastTab = localStorage.getItem('lastTab');
    if (lastTab && document.getElementById(lastTab)) { 
        // Si estamos en la página principal y hay tab guardada
        const app = document.getElementById('app-content');
        const landing = document.getElementById('landing-page');
        if(app && landing) {
            // Ocultar landing si ya entró antes (opcional, aquí lo forzamos a ver landing siempre si recarga)
            // openTab(lastTab); 
            openTab('itinerario'); // Forzamos itinerario al inicio
        }
    } else {
        openTab('itinerario');
    }

    // 4. Lógica Checkbox (Memoria)
    const checkboxes = document.querySelectorAll('.checklist-content input[type="checkbox"]');
    checkboxes.forEach(box => {
        const savedState = localStorage.getItem(box.id);
        if (savedState === 'true') box.checked = true;
        box.addEventListener('change', function() {
            localStorage.setItem(this.id, this.checked);
            if(navigator.vibrate) navigator.vibrate(20); 
        });
    });
});

// Evitar menú contextual (Click derecho) para sensación App
document.addEventListener('contextmenu', function(e) { e.preventDefault(); });