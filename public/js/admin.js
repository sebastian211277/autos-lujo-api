let allCars = [];
let editId = null; // Variable clave: null = CREAR, ID = EDITAR.

const carForm = document.getElementById('carForm');
const btnSubmit = document.getElementById('btnSubmit');
const btnCancel = document.getElementById('btnCancel');

// 1. CARGAR AUTOS EN LA TABLA
async function fetchCars() {
    try {
        const res = await fetch('/api/cars');
        if (!res.ok) throw new Error('Error al conectar con el servidor');
        
        const response = await res.json();
        // Validamos que venga la estructura nueva { data: [...] }
        allCars = response.data || []; 
        renderTable(allCars);
    } catch (error) {
        console.error("Error cargando autos:", error);
        document.querySelector('#carsTable tbody').innerHTML = '<tr><td colspan="5">Error al cargar inventario. Revisa la consola.</td></tr>';
    }
}

// 2. RENDERIZAR TABLA CON BOTONES
function renderTable(cars) {
    const tbody = document.querySelector('#carsTable tbody');
    tbody.innerHTML = '';

    if (cars.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay autos registrados aún.</td></tr>';
        return;
    }

    cars.forEach(car => {
        const tr = document.createElement('tr');
        // Usamos una imagen por defecto si no tiene
        const imgUrl = (car.images && car.images.length > 0) ? car.images[0] : 'https://via.placeholder.com/50';

        tr.innerHTML = `
            <td><img src="${imgUrl}" width="60" style="border-radius:4px; object-fit:cover;"></td>
            <td>
                <strong>${car.make} ${car.model}</strong><br>
                <small style="color:#888">${car.type}</small>
            </td>
            <td>${car.year}</td>
            <td>$${Number(car.price).toLocaleString()}</td>
            <td>
                <button onclick="cargarParaEditar('${car._id}')" style="background: #f1c40f; color: black; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px; font-weight:bold;">
                    ✏️
                </button>
                
                <button onclick="deleteCar('${car._id}')" style="background: #e74c3c; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px; margin-left: 5px;">
                    🗑️
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 3. FUNCIÓN PARA LLENAR EL FORMULARIO (Modo Edición)
// La hacemos global con window para que el HTML la encuentre
window.cargarParaEditar = function(id) {
    const car = allCars.find(c => c._id === id);
    if (!car) return;

    // Llenamos inputs
    document.getElementById('make').value = car.make;
    document.getElementById('model').value = car.model;
    document.getElementById('year').value = car.year;
    document.getElementById('price').value = car.price;
    document.getElementById('type').value = car.type;
    document.getElementById('description').value = car.description || '';
    
    // Checkbox
    const featuredCheck = document.getElementById('isFeatured');
    if(featuredCheck) featuredCheck.checked = car.isFeatured;

    // CAMBIAMOS ESTADO VISUAL
    editId = id; 
    btnSubmit.innerText = "Actualizar Auto";
    btnSubmit.style.background = "#f1c40f"; 
    btnSubmit.style.color = "black";
    
    // Mostrar botón cancelar
    btnCancel.style.display = "inline-block"; 

    // Scroll al formulario
    document.getElementById('carForm').scrollIntoView({ behavior: 'smooth' });
};

// 4. CANCELAR EDICIÓN
window.resetForm = function() {
    carForm.reset();
    editId = null;
    
    // Restaurar botones
    btnSubmit.innerText = "Guardar Auto";
    btnSubmit.style.background = ""; // Vuelve al estilo CSS original
    btnSubmit.style.color = "";
    btnCancel.style.display = "none";
};

// 5. FUNCIÓN ELIMINAR (¡ESTA ES LA QUE FALTABA!)
window.deleteCar = async function(id) {
    if(!confirm('¿Estás seguro de que deseas eliminar este vehículo? Esta acción no se puede deshacer.')) return;

    try {
        const res = await fetch(`/api/cars/${id}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            alert('Vehículo eliminado correctamente');
            fetchCars(); // Recargar tabla
            
            // Si estábamos editando justo el que borramos, limpiar form
            if (editId === id) resetForm();
        } else {
            alert('Error al eliminar el vehículo');
        }
    } catch (error) {
        console.error("Error eliminando:", error);
        alert('Error de conexión');
    }
};

// 6. MANEJO DEL ENVÍO (POST vs PUT)
carForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(carForm);
    // Asegurar booleano para backend
    formData.set('isFeatured', document.getElementById('isFeatured').checked);

    try {
        let url = '/api/cars';
        let method = 'POST';

        // LÓGICA DE EDICIÓN
        if (editId) {
            url = `/api/cars/${editId}`;
            method = 'PUT';
        }

        const res = await fetch(url, {
            method: method,
            body: formData
        });

        if (res.ok) {
            alert(editId ? '¡Auto actualizado con éxito!' : '¡Auto creado con éxito!');
            resetForm(); 
            fetchCars(); 
        } else {
            const errorData = await res.json();
            alert('Error al guardar: ' + (errorData.msg || 'Desconocido'));
        }
    } catch (error) {
        console.error(error);
        alert('Error de conexión al guardar');
    }
});

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', fetchCars);