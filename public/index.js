const grid = document.getElementById('grid');
const categoryTitle = document.getElementById('categoryTitle');

// Cargar todos los autos al inicio
document.addEventListener('DOMContentLoaded', () => {
    loadFilteredCars('');
});

// Función principal para cargar autos
async function loadFilteredCars(type) {
    try {
        let url = '/api/cars';
        if (type) url += `?type=${encodeURIComponent(type)}`;

        const res = await fetch(url);
        const response = await res.json();
        
        // Actualizar título
        categoryTitle.innerText = type ? `${type} Inventory` : 'Inventario Completo';
        
        // Limpiar grid
        grid.innerHTML = '';

        // Generar tarjetas
        response.data.forEach(car => {
            const card = document.createElement('div');
            card.className = 'card';
            // Al hacer clic, llamamos a la función de detalles
            card.onclick = () => showCarDetails(car._id);

            // Imagen principal (o placeholder si no hay)
            const mainImage = car.images && car.images.length > 0 
                ? car.images[0] 
                : 'https://via.placeholder.com/400x300?text=No+Image';

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
        });

    } catch (error) {
        console.error('Error cargando autos:', error);
        grid.innerHTML = '<p style="color:red">Error de conexión con el servidor</p>';
    }
}

// Cargar por Marca (para los logos)
async function loadByBrand(brand) {
    // Nota: Esto asume que tu backend soporta filtrado por marca, 
    // si no, filtraremos en el cliente por ahora.
    const res = await fetch('/api/cars');
    const response = await res.json();
    const filtered = response.data.filter(c => c.make.toLowerCase().includes(brand.toLowerCase()));
    
    categoryTitle.innerText = `Resultados para: ${brand}`;
    grid.innerHTML = '';

    if(filtered.length === 0) {
        grid.innerHTML = '<p>No hay vehículos de esta marca disponibles.</p>';
        return;
    }

    filtered.forEach(car => {
        // Reutilizamos la lógica de creación de cartas (podrías hacer una función separada para esto)
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => showCarDetails(car._id); // <--- CLIC AQUÍ
        
        const mainImage = car.images[0] || 'https://via.placeholder.com/400x300';

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
    });
}

// --- MAGIA DEL MODAL (VENTANA EMERGENTE) ---
async function showCarDetails(id) {
    // 1. Obtener datos frescos del auto
    const res = await fetch(`/api/cars/${id}`);
    const car = await res.json();

    // 2. Crear el HTML del modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.9); z-index: 2000; display: flex;
        justify-content: center; align-items: center; backdrop-filter: blur(5px);
    `;

    // Generar galería de imágenes miniatura
    let thumbnails = '';
    if (car.images && car.images.length > 0) {
        car.images.forEach(img => {
            thumbnails += `<img src="${img}" style="width:60px; height:60px; object-fit:cover; border:1px solid #333; cursor:pointer; margin-right:5px;" onclick="document.getElementById('mainModalImg').src = this.src">`;
        });
    }

    modal.innerHTML = `
        <div style="background:#1c1c1e; width:90%; max-width:800px; max-height:90vh; overflow-y:auto; border-radius:12px; position:relative; display:flex; flex-wrap:wrap;">
            <button onclick="this.closest('div').parentElement.remove()" style="position:absolute; top:10px; right:10px; background:none; border:none; color:white; font-size:2rem; cursor:pointer;">&times;</button>
            
            <div style="flex:1; min-width:300px;">
                <img id="mainModalImg" src="${car.images ? car.images[0] : ''}" style="width:100%; height:100%; object-fit:cover; display:block;">
            </div>

            <div style="flex:1; padding:30px; min-width:300px; color:white;">
                <h2 style="color:var(--gold-accent); margin-top:0;">${car.make} ${car.model}</h2>
                <h3 style="font-weight:300;">$${Number(car.price).toLocaleString()} USD</h3>
                
                <div style="margin:20px 0; display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:0.9rem; color:#aaa;">
                    <div>📅 Año: <span style="color:white">${car.year}</span></div>
                    <div>🐎 HP: <span style="color:white">${car.horsepower || 'N/A'}</span></div>
                    <div>🚘 Tipo: <span style="color:white">${car.type || 'N/A'}</span></div>
                </div>

                <p style="line-height:1.6; color:#ccc;">${car.description || 'Sin descripción disponible.'}</p>
                
                <div style="margin-top:20px;">
                    ${thumbnails}
                </div>

                <button style="width:100%; background:var(--gold-accent); color:black; padding:15px; border:none; font-weight:bold; margin-top:20px; cursor:pointer; text-transform:uppercase;" onclick="alert('Contactando vendedor...')">
                    Interesado
                </button>
            </div>
        </div>
    `;

    // 3. Agregar al cuerpo
    document.body.appendChild(modal);

    // Cerrar si clic afuera
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    }
}