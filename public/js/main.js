let allCars = [];
let featuredCars = [];
let currentHeroIndex = 0;
let heroInterval;

// ELEMENTOS DOM
const grid = document.getElementById('grid');
const heroBg = document.getElementById('heroBg');
// const heroTitle = document.getElementById('heroTitle'); // Ya no se usa directamente, se inyecta
// const heroPrice = document.getElementById('heroPrice'); // Ya no se usa directamente, se inyecta
// const heroDesc = document.getElementById('heroDesc');   // Ya no se usa directamente, se inyecta
const heroContent = document.getElementById('heroContent'); 

// INICIAR
document.addEventListener('DOMContentLoaded', async () => {
    await fetchCars();
});

// 1. OBTENER AUTOS DE LA API
async function fetchCars() {
    try {
        const res = await fetch('/api/cars');
        if (!res.ok) throw new Error('Error en la respuesta del servidor'); 
        
        const response = await res.json();
        
        // Validación de seguridad de datos
        // Si la respuesta no tiene .data (formato viejo), intentamos usar response directo si es array
        if (response.data && Array.isArray(response.data)) {
            allCars = response.data;
        } else if (Array.isArray(response)) {
            console.warn("Recibiendo formato antiguo (array directo). Se recomienda actualizar backend.");
            allCars = response;
        } else {
            allCars = [];
        }
        
        // Filtramos destacados para el carrusel
        featuredCars = allCars.filter(car => car.isFeatured === true);

        // Si no hay destacados, usamos los primeros 3 para que el carrusel no esté vacío
        if (featuredCars.length === 0 && allCars.length > 0) {
            featuredCars = allCars.slice(0, 3);
        }

        // Renderizamos la página
        renderGrid(allCars);
        startHeroSlider(); 

    } catch (error) {
        console.error("❌ Error al cargar autos:", error);
        allCars = [];
        if(grid) grid.innerHTML = '<p class="text-center" style="color: white;">Hubo un error al cargar el inventario. Intenta refrescar la página.</p>';
    }
}

// 2. RENDERIZAR GRID (Tarjetas de abajo)
function renderGrid(cars) {
    if(!grid) return; // Protección si grid no existe
    grid.innerHTML = '';
    
    if (!cars || cars.length === 0) {
        grid.innerHTML = '<p style="color:#aaa; text-align:center; width:100%;">No hay vehículos disponibles con estos filtros.</p>';
        return;
    }

    cars.forEach(car => {
        const card = document.createElement('div');
        card.className = 'card';
        
        // --- AQUÍ CONECTAMOS EL CLIC DE LA TARJETA AL MODAL ---
        card.onclick = () => showCarDetails(car._id); 

        const img = (car.images && car.images.length > 0) ? car.images[0] : 'https://via.placeholder.com/400x300?text=Sin+Foto';

        card.innerHTML = `
            <img src="${img}" class="card-img" alt="${car.model}" loading="lazy">
            <div class="card-body">
                <h3 class="card-title">${car.make} ${car.model}</h3>
                <div class="card-meta">
                    <span>${car.year}</span>
                    <span class="card-price">$${Number(car.price).toLocaleString()}</span>
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

    // Si solo hay un auto destacado, no rotamos
    if (featuredCars.length === 1) return;

    // Limpiar intervalo anterior si existe (evita aceleración si se llama varias veces)
    if (heroInterval) clearInterval(heroInterval);

    // Cambiar cada 5 segundos
    heroInterval = setInterval(() => {
        currentHeroIndex++;
        if (currentHeroIndex >= featuredCars.length) currentHeroIndex = 0;
        updateHero(featuredCars[currentHeroIndex]);
    }, 5000);
}

function updateHero(car) {
    if (!car || !heroContent) return;

    // Animación de salida (Fade Out)
    heroContent.style.opacity = '0';
    
    setTimeout(() => {
        // 1. Actualizar Imagen de Fondo
        if(car.images && car.images.length > 0) {
            if(heroBg) heroBg.style.backgroundImage = `url('${car.images[0]}')`;
        }
        
        // 2. Inyectar HTML con los datos Y EL BOTÓN CONECTADO
        heroContent.innerHTML = `
            <h1 id="heroTitle" style="font-family: 'Playfair Display', serif; font-size: clamp(2rem, 5vw, 3.5rem); margin-bottom: 10px; line-height: 1.2;">
                ${car.make} ${car.model}
            </h1>
            <p id="heroPrice" style="font-size: clamp(1.5rem, 3vw, 2rem); color: var(--gold); margin-bottom: 20px;">
                $${Number(car.price).toLocaleString()}
            </p>
            <p id="heroDesc" style="font-size: 1.1rem; color: #ccc; max-width: 600px; margin: 0 auto 30px auto; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                ${car.description ? car.description : 'Experiencia de lujo.'}
            </p>
            
            <button class="btn-primary" style="padding: 15px 30px; font-size: 1rem; cursor: pointer; background: var(--gold); color: black; border: none; font-weight: bold; border-radius: 4px; transition: transform 0.2s;" 
                onmouseover="this.style.transform='scale(1.05)'" 
                onmouseout="this.style.transform='scale(1)'"
                onclick="showCarDetails('${car._id}')">
                VER DETALLES
            </button>
        `;

        // Animación de entrada (Fade In)
        heroContent.style.opacity = '1';
        heroContent.style.transition = 'opacity 0.5s ease-in-out';
    }, 500);
}

// 4. FILTRADO POR MARCA (LOGOS)
function filterByMake(make) {
    const gridTitle = document.getElementById('gridTitle');
    
    // Si seleccionan "TODAS" o "all"
    if (!make || make === 'all') {
        renderGrid(allCars);
        if(gridTitle) gridTitle.innerText = 'Inventario Completo';
        return;
    }

    // Filtramos
    const filtered = allCars.filter(car => car.make && car.make.toLowerCase() === make.toLowerCase());
    
    renderGrid(filtered);
    
    if(gridTitle) gridTitle.innerText = `Colección ${make}`;
    
    // Scroll suave hacia el grid para ver resultados
    if(grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 5. FILTROS DEL MENÚ
function filterCars(type) {
    const gridTitle = document.getElementById('gridTitle');
    
    if (!type) {
        renderGrid(allCars);
        if(gridTitle) gridTitle.innerText = 'Inventario Completo';
    } else {
        const filtered = allCars.filter(car => car.type === type);
        renderGrid(filtered);
        if(gridTitle) gridTitle.innerText = `Categoría: ${type}`;
    }
    
    // Cerrar menú móvil si estuviera abierto (lógica opcional)
    // Scroll suave hacia el grid
    if(grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 6. VENTANA MODAL (DETALLES)
async function showCarDetails(id) {
    try {
        // Buscamos primero en local para respuesta instantánea
        let car = allCars.find(c => c._id === id);
        
        // Si no está (raro), o queremos datos frescos, pedimos a la API
        if(!car) {
            const res = await fetch(`/api/cars/${id}`);
            car = await res.json();
        }

        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.95); z-index: 2000; display: flex;
            justify-content: center; align-items: center; backdrop-filter: blur(5px);
            opacity: 0; transition: opacity 0.3s ease;
        `;

        // Miniaturas
        let thumbnails = '';
        if (car.images && car.images.length > 0) {
            car.images.forEach(img => {
                thumbnails += `<img src="${img}" style="width:60px; height:60px; object-fit:cover; border:1px solid #555; cursor:pointer; margin-right:8px; border-radius:4px;" onclick="document.getElementById('mainModalImg').src = this.src">`;
            });
        }

        modal.innerHTML = `
            <div class="modal-content" style="background:#1c1c1e; width:95%; max-width:1000px; max-height:90vh; display:flex; flex-direction: column; border-radius:12px; border:1px solid #333; overflow:hidden; position:relative; box-shadow:0 0 50px rgba(0,0,0,0.8);">
                
                <button onclick="this.closest('.modal-content').parentElement.remove()" style="position:absolute; top:15px; right:15px; background:rgba(0,0,0,0.5); border:none; color:white; font-size:2rem; cursor:pointer; z-index:10; width:40px; height:40px; border-radius:50%; line-height:40px;">&times;</button>
                
                <div class="modal-body" style="display: flex; flex-direction: row; height: 100%; overflow: hidden;">
                    <div style="flex:1.5; background:#000; display:flex; align-items:center; justify-content:center; padding: 10px;">
                        <img id="mainModalImg" src="${car.images ? car.images[0] : ''}" style="max-width:100%; max-height:100%; object-fit:contain;">
                    </div>

                    <div style="flex:1; padding:30px; overflow-y:auto; color:white; border-left: 1px solid #333;">
                        <small style="color:var(--gold); text-transform:uppercase; letter-spacing:2px; font-weight:bold;">${car.type}</small>
                        <h2 style="font-family:'Playfair Display', serif; font-size:2rem; margin:10px 0;">${car.make} ${car.model}</h2>
                        <h3 style="font-weight:300; font-size:1.8rem; color:#fff;">$${Number(car.price).toLocaleString()}</h3>
                        
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin:20px 0; border-top:1px solid #333; border-bottom:1px solid #333; padding:15px 0;">
                            <div>
                                <span style="display:block; color:#888; font-size:0.8rem;">AÑO</span>
                                <span style="font-size:1.1rem;">${car.year}</span>
                            </div>
                            <div>
                                <span style="display:block; color:#888; font-size:0.8rem;">ID REFERENCIA</span>
                                <span style="font-size:1.1rem; font-family:monospace;">#${car._id.substring(car._id.length - 6).toUpperCase()}</span>
                            </div>
                        </div>

                        <p style="line-height:1.6; color:#ccc; margin-bottom:20px; font-size: 0.95rem;">${car.description || 'Sin descripción disponible.'}</p>
                        
                        <h4 style="color:#888; font-size:0.8rem; margin-bottom:10px;">GALERÍA</h4>
                        <div style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:30px;">
                            ${thumbnails}
                        </div>

                        <button style="width:100%; background:var(--gold); color:black; padding:15px; border:none; font-weight:bold; font-size:1rem; cursor:pointer; text-transform:uppercase; letter-spacing:1px; transition:0.3s; border-radius: 4px;" onclick="alert('Gracias por su interés. Un asesor le contactará pronto.')">
                            Solicitar Información
                        </button>
                    </div>
                </div>
            </div>
            <style>
                @media (max-width: 768px) {
                    .modal-body { flex-direction: column !important; overflow-y: auto !important; }
                    .modal-body > div { border-left: none !important; border-top: 1px solid #333; }
                }
            </style>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.style.opacity = '1', 10);

        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        }

    } catch (error) {
        console.error("Error modal:", error);
    }
}

// 7. EXPORTAR FUNCIONES AL ÁMBITO GLOBAL (Para que funcionen los onclick del HTML)
window.filterByMake = filterByMake;
window.filterCars = filterCars;
window.showCarDetails = showCarDetails;