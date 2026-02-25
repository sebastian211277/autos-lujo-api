const form = document.getElementById('carForm');
const inventoryList = document.getElementById('inventoryList');

// 1. CARGAR INVENTARIO AL INICIAR
document.addEventListener('DOMContentLoaded', loadInventory);

// 2. FUNCIÓN PARA ENVIAR EL FORMULARIO (NUEVA LÓGICA DE FOTOS)
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Usamos FormData para empaquetar texto + archivos
    const formData = new FormData();
    formData.append('make', document.getElementById('make').value);
    formData.append('model', document.getElementById('model').value);
    formData.append('year', document.getElementById('year').value);
    formData.append('price', document.getElementById('price').value);
    formData.append('type', document.getElementById('type').value);
    formData.append('description', document.getElementById('description').value);
    
    // El checkbox envía "true" o "false"
    formData.append('isFeatured', document.getElementById('isFeatured').checked);

    // Adjuntar las imágenes (pueden ser varias)
    const fileInput = document.getElementById('images');
    for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('images', fileInput.files[i]);
    }

    try {
        const res = await fetch('/api/cars', {
            method: 'POST',
            body: formData // NOTA: No llevamos Header JSON aquí, el navegador lo pone solo
        });

        if (res.ok) {
            alert('¡Vehículo guardado exitosamente!');
            form.reset(); // Limpiar formulario
            loadInventory(); // Recargar la lista
        } else {
            const error = await res.text();
            alert('Error al guardar: ' + error);
        }
    } catch (err) {
        console.error(err);
        alert('Falla de conexión con el servidor');
    }
});

// 3. FUNCIÓN PARA CARGAR Y MOSTRAR LA LISTA
async function loadInventory() {
    inventoryList.innerHTML = '<p style="color:#aaa">Actualizando...</p>';
    
    try {
        const res = await fetch('/api/cars'); // Pide todos los autos
        const response = await res.json();
        const cars = response.data;

        inventoryList.innerHTML = ''; // Limpiar lista

        if (cars.length === 0) {
            inventoryList.innerHTML = '<p>Inventario vacío.</p>';
            return;
        }

        cars.forEach(car => {
            // Elegir foto principal o una por defecto
            const thumb = (car.images && car.images.length > 0) 
                ? car.images[0] 
                : 'https://via.placeholder.com/100';

            const item = document.createElement('div');
            // Si es destacado, le ponemos la clase 'featured' para el borde dorado
            item.className = `inventory-item ${car.isFeatured ? 'featured' : ''}`;
            
            item.innerHTML = `
                <div class="item-info">
                    <img src="${thumb}" class="item-thumb">
                    <div>
                        <div style="font-weight:bold; color:white;">${car.make} ${car.model}</div>
                        <div style="font-size:0.8rem; color:#aaa;">$${car.price.toLocaleString()} | ${car.year}</div>
                        ${car.isFeatured ? '<span style="color:#d4af37; font-size:0.7rem;">★ PORTADA</span>' : ''}
                    </div>
                </div>
                <button class="btn-delete" onclick="deleteCar('${car._id}')">🗑️</button>
            `;
            inventoryList.appendChild(item);
        });

    } catch (err) {
        console.error(err);
        inventoryList.innerHTML = '<p style="color:red">Error cargando inventario</p>';
    }
}

// 4. FUNCIÓN PARA BORRAR
async function deleteCar(id) {
    if(!confirm('¿Estás seguro de borrar este auto?')) return;

    try {
        const res = await fetch(`/api/cars/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadInventory(); // Recargar lista
        } else {
            alert('No se pudo borrar');
        }
    } catch (err) {
        console.error(err);
    }
}