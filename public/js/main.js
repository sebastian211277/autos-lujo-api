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
// Agregamos una referencia al contenedor de acciones del Hero (si existe) o al content
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
        allCars = Array.isArray(response.data) ? response.data : [];
        
        // Filtramos destacados para el carrusel
        featuredCars = allCars.filter(car => car.isFeatured === true);

        // Renderizamos la página
        renderGrid(allCars);
        startHeroSlider(); // <--- IMPORTANTE: Iniciamos el carrusel aquí

    } catch (error) {
        console.error("❌ Error al cargar autos:", error);
        allCars = [];
        grid.innerHTML = '<p class="text-center">Hubo un error al cargar el inventario.</p>';
    }
}

// 2. RENDERIZAR GRID (Tarjetas de abajo)
function renderGrid(cars) {
    grid.innerHTML = '';
    
    if (!cars || cars.length === 0) {
        grid.innerHTML = '<p style="color:#aaa; text-align:center;">No hay vehículos disponibles.</p>';
        return;
    }

    cars.forEach(car => {
        const card = document.createElement('div');
        card.className = 'card';
        
        // --- AQUÍ CONECTAMOS EL CLIC DE LA TARJETA AL MODAL ---
        card.onclick = () => showCarDetails(car._id); 

        const img = (car.images && car.images.length > 0) ? car.images[0] : 'https://via.placeholder.com/400';

        card.innerHTML = `
            <img src="${img}" class="card-img" alt="${car.model}">
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

// 3. LÓGICA DEL CARRUSEL (HERO) - Aquí agregamos el botón dinámico
function startHeroSlider() {
    if (featuredCars.length === 0) return;

    // Mostrar el primero inmediatamente
    updateHero(featuredCars[0]);

    // Si solo hay un auto destacado, no rotamos
    if (featuredCars.length === 1) return;

    // Cambiar cada 5 segundos
    heroInterval = setInterval(() => {
        currentHeroIndex++;
        if (currentHeroIndex >= featuredCars.length) currentHeroIndex = 0;
        updateHero(featuredCars[currentHeroIndex]);
    }, 5000);
}

function updateHero(car) {
    if (!car) return;

    // Animación de salida (Fade Out)
    // Asumimos que heroContent es el contenedor del texto
    heroContent.style.opacity = '0';
    
    setTimeout(() => {
        // 1. Actualizar Imagen de Fondo
        if(car.images && car.images.length > 0) {
            heroBg.style.backgroundImage = `url('${car.images[0]}')`;
        }
        
        // 2. Inyectar HTML con los datos Y EL BOTÓN CONECTADO
        // Nota: Usamos innerHTML para reescribir título, precio, descripción y botón a la vez
        heroContent.innerHTML = `
            <h1 id="heroTitle" style="font-family: 'Playfair Display', serif; font-size: 3.5rem; margin-bottom: 10px;">
                ${car.make} ${car.model}
            </h1>
            <p id="heroPrice" style="font-size: 2rem; color: var(--gold); margin-bottom: 20px;">
                $${Number(car.price).toLocaleString()}
            </p>
            <p id="heroDesc" style="font-size: 1.1rem; color: #ccc; max-width: 600px; margin: 0 auto 30px auto;">
                ${car.description ? car.description.substring(0, 100) + '...' : 'Experiencia de lujo.'}
            </p>
            
            <button class="btn-primary" style="padding: 15px 30px; font-size: 1rem; cursor: pointer; background: var(--gold); border: none; font-weight: bold;" 
                onclick="showCarDetails('${car._id}')">
                VER DETALLES
            </button>
        `;

        // Animación de entrada (Fade In)
        heroContent.style.opacity = '1';
        heroContent.style.transition = 'opacity 0.5s ease-in-out';
    }, 500);
}

// 6. FILTRADO POR MARCA (LOGOS)
function filterByMake(make) {
    const gridTitle = document.getElementById('gridTitle'); // Asegúrate de tener este ID en tu HTML (h2 del inventario)
    
    // Si seleccionan "TODAS" o "all"
    if (make === 'all') {
        renderGrid(allCars);
        if(gridTitle) gridTitle.innerText = 'Inventario Completo';
        return;
    }

    // Filtramos usando .filter()
    // Convertimos a minúsculas para evitar errores (Ferrari vs ferrari)
    const filtered = allCars.filter(car => car.make.toLowerCase() === make.toLowerCase());
    
    // Renderizamos los resultados
    renderGrid(filtered);
    
    // Actualizamos el título para dar feedback al usuario
    if(gridTitle) gridTitle.innerText = `Colección ${make}`;
}

// Hacemos la función global si usas módulos
window.filterByMake = filterByMake;

// 4. VENTANA MODAL (DETALLES) - Funciona para Grid y Carrusel
async function showCarDetails(id) {
    try {
        // Pedimos los detalles completos al servidor
        const res = await fetch(`/api/cars/${id}`);
        const car = await res.json();

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
            <div style="background:#1c1c1e; width:95%; max-width:1000px; height:85vh; display:flex; border-radius:12px; border:1px solid #333; overflow:hidden; position:relative; box-shadow:0 0 50px rgba(0,0,0,0.8);">
                
                <button onclick="this.closest('div').parentElement.remove()" style="position:absolute; top:15px; right:15px; background:rgba(0,0,0,0.5); border:none; color:white; font-size:2rem; cursor:pointer; z-index:10; width:40px; height:40px; border-radius:50%; line-height:40px;">&times;</button>
                
                <div style="flex:1.5; background:#000; display:flex; align-items:center; justify-content:center;">
                    <img id="mainModalImg" src="${car.images ? car.images[0] : ''}" style="width:100%; height:100%; object-fit:contain;">
                </div>

                <div style="flex:1; padding:40px; overflow-y:auto; color:white;">
                    <small style="color:var(--gold); text-transform:uppercase; letter-spacing:2px; font-weight:bold;">${car.type}</small>
                    <h2 style="font-family:'Playfair Display', serif; font-size:2.5rem; margin:10px 0;">${car.make} ${car.model}</h2>
                    <h3 style="font-weight:300; font-size:2rem; color:#fff;">$${Number(car.price).toLocaleString()}</h3>
                    
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin:30px 0; border-top:1px solid #333; border-bottom:1px solid #333; padding:20px 0;">
                        <div>
                            <span style="display:block; color:#888; font-size:0.8rem;">AÑO</span>
                            <span style="font-size:1.2rem;">${car.year}</span>
                        </div>
                        <div>
                            <span style="display:block; color:#888; font-size:0.8rem;">ID REFERENCIA</span>
                            <span style="font-size:1.2rem; font-family:monospace;">#${car._id.substring(car._id.length - 6).toUpperCase()}</span>
                        </div>
                    </div>

                    <p style="line-height:1.8; color:#ccc; margin-bottom:30px;">${car.description || 'Sin descripción disponible.'}</p>
                    
                    <h4 style="color:#888; font-size:0.8rem; margin-bottom:10px;">GALERÍA</h4>
                    <div style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:30px;">
                        ${thumbnails}
                    </div>

                    <button style="width:100%; background:var(--gold); color:black; padding:18px; border:none; font-weight:bold; font-size:1rem; cursor:pointer; text-transform:uppercase; letter-spacing:1px; transition:0.3s;" onclick="alert('Contactando ventas...')">
                        Solicitar Información
                    </button>
                </div>
            </div>
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

// 5. FILTROS DEL MENÚ (Opcional, si tienes botones de filtro en HTML)
function filterCars(type) {
    const titleElement = document.getElementById('gridTitle');
    if(titleElement) titleElement.innerText = type ? `${type} Inventory` : 'Inventario Completo';
    
    if (!type) {
        renderGrid(allCars);
    } else {
        const filtered = allCars.filter(car => car.type === type);
        renderGrid(filtered);
    }
}