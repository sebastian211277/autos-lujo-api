require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Inicializar la app
const app = express();

// 1. Conectar a Base de Datos
connectDB();

// 2. Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 3. Rutas
app.use('/api/auth', require('./routes/authRoutes'));

// Si ya tienes la ruta de autos creada, descomenta la siguiente línea:
// app.use('/api/cars', require('./routes/carRoutes')); 

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡API de Autos de Lujo funcionando! 🏎️');
});

// 4. DEFINIR EL PUERTO (Esto debe ir ANTES del listen)
const PORT = process.env.PORT || 10000;

// 5. ENCENDER EL SERVIDOR (Al final de todo)
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});