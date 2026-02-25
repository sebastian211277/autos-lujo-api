const grid = document.getElementById('grid');
const categoryTitle = document.getElementById('categoryTitle');

// Elementos del Hero (Banner Principal)
const heroImg = document.getElementById('heroImg');
const heroTitle = document.getElementById('heroTitle');
const heroPrice = document.getElementById('heroPrice');
const heroDesc = document.getElementById('heroDesc');

// Inicialización: Cargar todo al abrir la página
document.addEventListener('DOMContentLoaded', () => {
    loadFilteredCars('');
});

// --- FUNCIÓN PRINCIPAL: CARGAR AUTOS ---
async function loadFilteredCars(type) {
    try {
        let url = '/api/cars';
        if (type) url += `?type=${encodeURIComponent(type)}`;

        const res = await fetch(url);
        const response = await res.json();
        
        // Actualizar título de la sección
        categoryTitle.innerText = type ? `${type} Inventory` : 'Inventario Completo';
        
        // Limpiar la rejilla actual
        grid.innerHTML = '';

        if (!response.data || response.data.length === 0) {
            grid.innerHTML = '<p style="color:#aaa;">No se encontraron vehículos en esta categoría.</p>';
            return;
        }

        // Si es la carga inicial (sin filtro), actualizamos el Hero con el primer auto
        if (!type && response.data.length > 0) {
            updateHero(response.data[0]);
        }

        // Generar tarjetas (Cards)
        response.data.forEach(car => createCarCard(car));

    } catch (error) {
        console.error('Error cargando autos:', error);
        grid.innerHTML = '<p style="color:red">Error de conexión con el servidor</p>';
    }
}

// --- FILTRAR POR MARCA (LOGOS) ---
async function loadByBrand(brand) {
    try {
        const res = await fetch('/api/cars');
        const response = await res.json();
        
        // Filtro manual en el cliente (case insensitive)
        const filtered = response.data.filter(c => c.make.toLowerCase().includes(brand.toLowerCase()));
        
        categoryTitle.innerText = `Resultados para: ${brand}`;
        grid.innerHTML = '';

        if(filtered.length === 0) {
            grid.innerHTML = `<p style="color:#aaa;">No tenemos ${brand} en stock por el momento.</p>`;
            return;
        }

        filtered.forEach(car => createCarCard(car));

    } catch (error) {
        console.error('Error filtrando marca:', error);
    }
}

// --- HELPER: CREAR TARJETA HTML ---
function createCarCard(car) {
    const card = document.createElement('div');
    card.className = 'card';
    
    // Al hacer clic, abrimos el modal
    card.onclick = () => showCarDetails(car._id);

    // Imagen principal o placeholder
    const mainImage = (car.images && car.images.length > 0) 
        ? car.images[0] 
        : 'https://via.placeholder.com/400x300?text=Sin+Imagen';

    card.innerHTML = `
        <img src="${mainImage}" style="width:100%; height:200px; object-fit:cover;">
        <div style="padding:15px;">
            <h4 style="margin:0 0 10px; color:#fff;">${car.make} ${car.model}</h4>
            <div style="display:flex; justify-content:space-between; color:var(--text-gray); font-size:0.9rem;">
                <span>${car.year}</span>
                <span style="color:var(--gold-accent); font-weight:bold;">$${Number(car.price).toLocaleString()}</span>
            </div>
        </div>
    `;
    grid.appendChild(card);
}

// --- ACTUALIZAR EL BANNER PRINCIPAL (HERO) ---
function updateHero(car) {
    if (!car) return;
    if (car.images && car.images.length > 0) heroImg.src = car.images[0];
    heroTitle.innerText = `${car.make} ${car.model}`;
    heroPrice.innerText = `US $${Number(car.price).toLocaleString()}`;
    heroDesc.innerText = car.description ? (car.description.substring(0, 80) + "...") : "Experience pure performance.";
}

// --- VENTANA MODAL (DETALLES) ---
async function showCarDetails(id) {
    try {
        const res = await fetch(`/api/cars/${id}`);
        const car = await res.json();

        // Crear el fondo oscuro
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); z-index: 2000; display: flex;
            justify-content: center; align-items: center; backdrop-filter: blur(8px);
        `;

        // Generar miniaturas
        let thumbnails = '';
        if (car.images && car.images.length > 0) {
            car.images.forEach(img => {
                thumbnails += `<img src="${img}" style="width:60px; height:60px; object-fit:cover; border:1px solid #444; cursor:pointer; margin-right:8px; border-radius:4px;" onclick="document.getElementById('mainModalImg').src = this.src">`;
            });
        }

        // HTML Interno del Modal
        modal.innerHTML = `
            <div style="background:#1c1c1e; width:95%; max-width:900px; max-height:90vh; overflow-y:auto; border-radius:12px; position:relative; display:flex; flex-wrap:wrap; box-shadow: 0 20px 50px rgba(0,0,0,0.5); border:1px solid #333;">
                
                <button onclick="this.closest('div').parentElement.remove()" style="position:absolute; top:15px; right:15px; background:rgba(0,0,0,0.5); border:none; color:white; font-size:1.5rem; cursor:pointer; width:40px; height:40px; border-radius:50%; z-index:10;">&times;</button>
                
                <div style="flex:1.5; min-width:300px; background:#000;">
                    <img id="mainModalImg" src="${car.images ? car.images[0] : ''}" style="width:100%; height:100%; object-fit:contain; display:block; min-height:300px;">
                </div>

                <div style="flex:1; padding:30px; min-width:300px; color:white;">
                    <small style="color:var(--gold-accent); text-transform:uppercase; letter-spacing:1px;">${car.type || 'Luxury Car'}</small>
                    <h2 style="margin-top:5px; font-size:2rem;">${car.make} ${car.model}</h2>
                    <h3 style="font-weight:300; font-size:1.8rem;">$${Number(car.price).toLocaleString()} USD</h3>
                    
                    <div style="margin:20px 0; display:grid; grid-template-columns:1fr 1fr; gap:15px; font-size:0.9rem; color:#ccc; border-top:1px solid #333; border-bottom:1px solid #333; padding:15px 0;">
                        <div>📅 Año: <b style="color:white">${car.year}</b></div>
                        <div>🐎 Potencia: <b style="color:white">${car.horsepower || 'N/A'} HP</b></div>
                    </div>

                    <p style="line-height:1.6; color:#aaa; font-size:0.95rem;">${car.description || 'Sin descripción detallada.'}</p>
                    
                    <div style="margin-top:20px; display:flex; overflow-x:auto; padding-bottom:10px;">
                        ${thumbnails}
                    </div>

                    <button style="width:100%; background:var(--gold-accent); color:black; padding:15px; border:none; font-weight:bold; margin-top:20px; cursor:pointer; text-transform:uppercase; letter-spacing:1px; border-radius:4px; transition:0.3s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'" onclick="alert('Contactando a ventas por: ' + '${car.model}')">
                        Estoy Interesado
                    </button>
                </div>
            </div>
        `;

        // Agregar al body
        document.body.appendChild(modal);

        // Cerrar si clic afuera del contenido
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        }

    } catch (error) {
        console.error("Error abriendo modal:", error);
        alert("No se pudieron cargar los detalles del auto.");
    }
}