let allCars = [];
let editId = null; // Variable clave: Si es null, estamos CREANDO. Si tiene ID, estamos EDITANDO.

const carForm = document.getElementById('carForm');
const btnSubmit = document.getElementById('btnSubmit');
const btnCancel = document.getElementById('btnCancel');

// 1. CARGAR AUTOS EN LA TABLA
async function fetchCars() {
    const res = await fetch('/api/cars');
    const response = await res.json();
    allCars = response.data || []; 
    renderTable(allCars);
}

// 2. RENDERIZAR TABLA CON BOTÓN DE EDITAR
function renderTable(cars) {
    const tbody = document.querySelector('#carsTable tbody'); // Asegúrate que tu tabla tenga este ID
    tbody.innerHTML = '';

    cars.forEach(car => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${car.images[0] || ''}" width="50"></td>
            <td>${car.make} ${car.model}</td>
            <td>${car.year}</td>
            <td>$${car.price}</td>
            <td>
                <button onclick="cargarParaEditar('${car._id}')" style="background: #f1c40f; color: black; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px;">
                    ✏️ Editar
                </button>
                
                <button onclick="deleteCar('${car._id}')" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px; margin-left: 5px;">
                    🗑️ Eliminar
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 3. FUNCIÓN PARA LLENAR EL FORMULARIO (Modo Edición)
window.cargarParaEditar = function(id) {
    const car = allCars.find(c => c._id === id);
    if (!car) return;

    // Llenamos los inputs con los datos actuales
    document.getElementById('make').value = car.make;
    document.getElementById('model').value = car.model;
    document.getElementById('year').value = car.year;
    document.getElementById('price').value = car.price;
    document.getElementById('type').value = car.type;
    document.getElementById('description').value = car.description || '';
    
    // Checkbox de destacado
    const featuredCheck = document.getElementById('isFeatured');
    if(featuredCheck) featuredCheck.checked = car.isFeatured;

    // CAMBIAMOS EL ESTADO VISUAL
    editId = id; // Guardamos el ID que estamos editando
    btnSubmit.innerText = "Actualizar Auto";
    btnSubmit.style.background = "#f1c40f"; // Color amarillo para indicar edición
    btnSubmit.style.color = "black";
    btnCancel.style.display = "inline-block"; // Mostramos botón cancelar

    // Scroll hacia arriba para ver el formulario
    document.getElementById('carForm').scrollIntoView({ behavior: 'smooth' });
};

// 4. FUNCIÓN PARA CANCELAR EDICIÓN
window.resetForm = function() {
    carForm.reset();
    editId = null;
    btnSubmit.innerText = "Guardar Auto";
    btnSubmit.style.background = ""; // Regresa al color original (CSS)
    btnSubmit.style.color = "";
    btnCancel.style.display = "none";
};

// 5. MANEJO DEL ENVÍO (POST vs PUT)
carForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(carForm);
    
    // Convertir el checkbox a true/false manualmente si es necesario
    const isFeatured = document.getElementById('isFeatured').checked;
    formData.set('isFeatured', isFeatured);

    try {
        let url = '/api/cars';
        let method = 'POST';

        // SI ESTAMOS EN MODO EDICIÓN:
        if (editId) {
            url = `/api/cars/${editId}`;
            method = 'PUT';
        }

        const res = await fetch(url, {
            method: method,
            body: formData
        });

        if (res.ok) {
            alert(editId ? '¡Auto actualizado!' : '¡Auto creado!');
            resetForm(); // Limpia y resetea el modo
            fetchCars(); // Recarga la tabla
        } else {
            alert('Error al guardar');
        }
    } catch (error) {
        console.error(error);
        alert('Error de conexión');
    }
});

// Inicializar
document.addEventListener('DOMContentLoaded', fetchCars);