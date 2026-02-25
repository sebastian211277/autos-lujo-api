let allCars = [];
let featuredCars = [];
let currentHeroIndex = 0;
let heroInterval;

// ELEMENTOS DOM
const grid = document.getElementById('grid');
const heroBg = document.getElementById('heroBg');
const heroTitle = document.getElementById('heroTitle');
const heroPrice = document.getElementById('heroPrice');
const heroDesc = document.getElementById('heroDesc');
const heroContent = document.getElementById('heroContent');

// INICIAR
document.addEventListener('DOMContentLoaded', async () => {
    await fetchCars();
    startHeroSlider();
});

// 1. OBTENER AUTOS DE LA API
async function fetchCars() {
    try {
        const res = await fetch('/api/cars');
        const response = await res.json();
        allCars = response.data;

        // Separar los destacados para el carrusel
        featuredCars = allCars.filter(car => car.isFeatured === true);
        
        // Si no hay destacados, usamos los primeros 3 autos normales como fallback
        if (featuredCars.length === 0) {
            featuredCars = allCars.slice(0, 3);
        }

        renderGrid(allCars);
    } catch (error) {
        console.error("Error conectando:", error);
    }
}

// 2. RENDERIZAR GRID (Tarjetas)
function renderGrid(cars) {
    grid.innerHTML = '';
    
    if (cars.length === 0) {
        grid.innerHTML = '<p style="color:#aaa; text-align:center;">No hay vehículos disponibles en esta categoría.</p>';
        return;
    }

    cars.forEach(car => {
        const card = document.createElement('div');
        card.className = 'card';
        // Al hacer clic, podrías abrir el modal (que haremos luego si quieres)
        card.onclick = () => window.location.href = `/api/cars/${car._id}`; // Temporal: ver JSON

        const img = (car.images && car.images.length > 0) ? car.images[0] : 'https://via.placeholder.com/400';

        card.innerHTML = `
            <img src="${img}" class="card-img" alt="${car.model}">
            <div class="card-body">
                <h3 class="card-title">${car.make} ${car.model}</h3>
                <div class="card-meta">
                    <span>${car.year}</span>
                    <span class="card-price">$${car.price.toLocaleString()}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// 3. LÓGICA DEL CARRUSEL (HERO)
function startHeroSlider() {
    if (featuredCars.length === 0) return;

    // Mostrar el primero inmediatamente
    updateHero(featuredCars[0]);

    // Cambiar cada 4 segundos
    heroInterval = setInterval(() => {
        currentHeroIndex++;
        if (currentHeroIndex >= featuredCars.length) currentHeroIndex = 0;
        updateHero(featuredCars[currentHeroIndex]);
    }, 4000);
}

function updateHero(car) {
    // 1. Ocultar texto (Fade Out)
    heroContent.classList.remove('active');

    setTimeout(() => {
        // 2. Cambiar datos
        if(car.images.length > 0) {
            heroBg.style.backgroundImage = `url('${car.images[0]}')`;
        }
        heroTitle.innerText = `${car.make} ${car.model}`;
        heroPrice.innerText = `$${car.price.toLocaleString()}`;
        heroDesc.innerText = car.description ? car.description.substring(0, 100) + '...' : '';

        // 3. Mostrar texto (Fade In)
        heroContent.classList.add('active');
    }, 500); // Esperar medio segundo para el efecto
}

// 4. FILTROS DEL MENÚ
function filterCars(type) {
    document.getElementById('gridTitle').innerText = type ? `${type} Inventory` : 'Inventario Completo';
    
    if (!type) {
        renderGrid(allCars);
    } else {
        const filtered = allCars.filter(car => car.type === type);
        renderGrid(filtered);
    }
}