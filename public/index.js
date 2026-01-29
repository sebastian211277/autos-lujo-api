// public/script.js

// Variables globales
let token = localStorage.getItem('token');
let allCars = []; 
let isRegisterMode = false; 

// Elementos DOM
const welcomeScreen = document.getElementById('welcome-screen');
const loginSection = document.getElementById('login-section');
const adminPanel = document.getElementById('admin-panel');
const filtersSection = document.getElementById('filters-section'); // Nuevo
const gallerySection = document.getElementById('gallery-section');
const navbar = document.getElementById('navbar');
const userDisplay = document.getElementById('user-display');
const modal = document.getElementById('car-modal'); // Nuevo

// Elementos Formulario
const carIdInput = document.getElementById('car-id');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');

// --- INICIO ---
if(token) enterAsAdmin();

// --- NAVEGACIÓN ---
function showWelcome() { hideAll(); welcomeScreen.classList.remove('hidden'); }

function showLogin() { 
    hideAll(); 
    loginSection.classList.remove('hidden');
    isRegisterMode = true; toggleAuthMode(); 
}

function enterAsGuest() {
    hideAll();
    token = null;
    navbar.classList.remove('hidden');
    filtersSection.classList.remove('hidden'); // Mostrar filtros
    gallerySection.classList.remove('hidden');
    userDisplay.innerText = "👀 Invitado";
    loadCars(); 
}

function enterAsAdmin() {
    hideAll();
    navbar.classList.remove('hidden');
    adminPanel.classList.remove('hidden');
    filtersSection.classList.remove('hidden'); // Mostrar filtros
    gallerySection.classList.remove('hidden');
    userDisplay.innerText = "👨‍💻 Admin";
    loadCars(); 
}

function hideAll() {
    welcomeScreen.classList.add('hidden');
    loginSection.classList.add('hidden');
    adminPanel.classList.add('hidden');
    filtersSection.classList.add('hidden');
    gallerySection.classList.add('hidden');
    navbar.classList.add('hidden');
}

function logout() {
    localStorage.removeItem('token');
    token = null;
    location.reload(); 
}

// --- AUTENTICACIÓN (Igual que antes, resumido) ---
function toggleAuthMode() {
    isRegisterMode = !isRegisterMode;
    const title = document.getElementById('auth-title');
    const btn = document.getElementById('auth-btn');
    const toggle = document.getElementById('toggle-auth');
    const user = document.getElementById('username');
    
    if(isRegisterMode) {
        title.innerText = "📝 Registro"; btn.innerText = "Registrarse"; toggle.innerText = "Ir al Login"; user.classList.remove('hidden');
    } else {
        title.innerText = "🔒 Login"; btn.innerText = "Entrar"; toggle.innerText = "Ir al Registro"; user.classList.add('hidden');
    }
}

async function submitAuth() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const username = document.getElementById('username').value;
    const url = isRegisterMode ? '/api/auth/register' : '/api/auth/login';
    const body = isRegisterMode ? {username, email, password} : {email, password};

    try {
        const res = await fetch(url, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
        const data = await res.json();
        if(res.ok && isRegisterMode) { alert("¡Registrado!"); toggleAuthMode(); }
        else if(data.token) { token = data.token; localStorage.setItem('token', token); enterAsAdmin(); }
        else { alert(data.msg || "Error"); }
    } catch(e) { console.error(e); }
}

// --- LOGICA DE CARGA Y FILTRADO (¡NUEVO!) ---

async function loadCars() {
    const res = await fetch('/api/cars');
    allCars = await res.json();
    applyFilters(); // Llamamos al filtro en vez de renderizar directo
}

function applyFilters() {
    const searchText = document.getElementById('search-input').value.toLowerCase();
    const category = document.getElementById('filter-category').value;
    const sortType = document.getElementById('filter-sort').value;

    // 1. Filtrar
    let filtered = allCars.filter(car => {
        const matchText = car.brand.toLowerCase().includes(searchText) || car.model.toLowerCase().includes(searchText);
        const matchCat = category === 'all' || car.category === category;
        return matchText && matchCat;
    });

    // 2. Ordenar
    if(sortType === 'price-asc') filtered.sort((a,b) => a.price - b.price);
    if(sortType === 'price-desc') filtered.sort((a,b) => b.price - a.price);
    if(sortType === 'hp-desc') filtered.sort((a,b) => b.horsepower - a.horsepower);
    if(sortType === 'newest') filtered.sort((a,b) => b.year - a.year);

    renderCars(filtered);
}

function renderCars(carsToRender) {
    const container = document.getElementById('cars-container');
    container.innerHTML = '';

    if(carsToRender.length === 0) {
        container.innerHTML = '<p style="color: gray;">No se encontraron autos 🤷‍♂️</p>';
        return;
    }

    carsToRender.forEach(car => {
        let adminButtons = '';
        if (token) {
            // Nota el stopPropagation: evita que se abra el modal al dar click en editar/borrar
            adminButtons = `
                <div style="margin-top: 10px; display: flex; gap: 5px;">
                    <button onclick="event.stopPropagation(); startEdit('${car._id}')" style="background: #f39c12; font-size: 0.8em; padding: 5px;">✏️</button>
                    <button onclick="event.stopPropagation(); deleteCar('${car._id}')" style="background: #c0392b; font-size: 0.8em; padding: 5px;">🗑️</button>
                </div>
            `;
        }

        // Agregamos onclick al div card para abrir el modal
        container.innerHTML += `
            <div class="card" onclick="openModal('${car._id}')" style="cursor: pointer;">
                <img src="${car.imageUrl}" alt="${car.brand}" onerror="this.src='https://via.placeholder.com/400'">
                <h3>${car.brand} ${car.model}</h3>
                <p style="color: #aaa; font-size: 0.8em;">${car.category || 'Superauto'}</p>
                <p>🐎 ${car.horsepower} HP | 📅 ${car.year}</p>
                <p class="price">$${car.price.toLocaleString()}</p>
                ${adminButtons} 
            </div>
        `;
    });
}

// --- MODAL (¡NUEVO!) ---
function openModal(id) {
    const car = allCars.find(c => c._id === id);
    if(!car) return;

    document.getElementById('modal-img').src = car.imageUrl;
    document.getElementById('modal-title').innerText = `${car.brand} ${car.model}`;
    document.getElementById('modal-category').innerText = car.category || 'Categoría no especificada';
    document.getElementById('modal-desc').innerText = car.description || 'Este vehículo no tiene una descripción detallada aún. Contacte al vendedor para más información.';
    document.getElementById('modal-year').innerText = car.year;
    document.getElementById('modal-hp').innerText = car.horsepower;
    document.getElementById('modal-price').innerText = car.price.toLocaleString();

    modal.classList.remove('hidden');
}

function closeModal(event, force = false) {
    // Cerrar solo si se da click en la X o en el fondo oscuro (no en el contenido)
    if (force || event.target === modal) {
        modal.classList.add('hidden');
    }
}

// --- GUARDAR / EDITAR / ELIMINAR ---
async function saveCar() {
    const id = carIdInput.value;
    const carData = {
        brand: document.getElementById('brand').value,
        model: document.getElementById('model').value,
        category: document.getElementById('category').value, // Nuevo
        description: document.getElementById('description').value, // Nuevo
        year: document.getElementById('year').value,
        price: document.getElementById('price').value,
        horsepower: document.getElementById('hp').value,
        imageUrl: document.getElementById('image').value || 'https://via.placeholder.com/400'
    };

    const url = id ? `/api/cars/${id}` : '/api/cars';
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(carData)
    });

    if(res.ok) { resetForm(); loadCars(); }
    else { alert('Error al guardar'); }
}

function startEdit(id) {
    const car = allCars.find(c => c._id === id);
    if(!car) return;

    document.getElementById('brand').value = car.brand;
    document.getElementById('model').value = car.model;
    document.getElementById('category').value = car.category || 'Coupe'; // Nuevo
    document.getElementById('description').value = car.description || ''; // Nuevo
    document.getElementById('year').value = car.year;
    document.getElementById('price').value = car.price;
    document.getElementById('hp').value = car.horsepower;
    document.getElementById('image').value = car.imageUrl;
    
    carIdInput.value = car._id;
    formTitle.innerText = "✏️ Editando Auto";
    submitBtn.innerText = "Actualizar";
    submitBtn.style.background = "#f39c12"; 
    cancelBtn.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
    document.getElementById('brand').value = '';
    document.getElementById('model').value = '';
    document.getElementById('description').value = '';
    document.getElementById('year').value = '';
    document.getElementById('price').value = '';
    document.getElementById('hp').value = '';
    document.getElementById('image').value = '';
    carIdInput.value = '';
    formTitle.innerText = "➕ Agregar Nuevo Auto";
    submitBtn.innerText = "Guardar Auto";
    submitBtn.style.background = "#e74c3c"; 
    cancelBtn.classList.add('hidden');
}

async function deleteCar(id) {
    if(!confirm('¿Eliminar auto?')) return;
    const res = await fetch(`/api/cars/${id}`, { method: 'DELETE', headers: { 'x-auth-token': token } });
    if(res.ok) loadCars();
}