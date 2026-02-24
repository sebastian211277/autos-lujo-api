require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // <--- 1. IMPORTANTE: Agregamos esto
const connectDB = require('./config/database');

// Inicializar la app
const app = express();

// Conectar DB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// 2. IMPORTANTE: Configuración BLINDADA de la carpeta pública 🛡️
// Le decimos: "Desde donde estoy (__dirname), sube un nivel (..) y busca 'public'"
app.use(express.static(path.join(__dirname, '../public')));

// Rutas API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cars', require('./routes/carRoutes'));

// Ruta Principal (Si entran a la raíz, enviamos el index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Definir Puerto
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});