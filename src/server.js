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
// Ruta de Autenticación
app.use('/api/auth', require('./routes/authRoutes'));

// Ruta de Autos (¡Ya descomentada y funcionando!) 🏎️
app.use('/api/cars', require('./routes/carRoutes')); 

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡API de Autos de Lujo funcionando y paginada! 🏎️');
});

// 4. Definir Puerto
const PORT = process.env.PORT || 10000;

// 5. Encender Servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});