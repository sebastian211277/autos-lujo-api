require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// 1. Conectar a Base de Datos
connectDB();

// 2. Middlewares (Configuraciones)
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 3. Rutas (Aquí definimos las URLs de tu API)
app.use('/api/auth', require('./routes/authRoutes'));

// NOTA: Solo descomenta la siguiente línea si YA tienes el archivo carRoutes.js creado.
// Si no lo tienes, mantenla comentada con // al principio para que no falle.
// app.use('/api/cars', require('./routes/carRoutes')); 

// Ruta de prueba simple para ver si vive
app.get('/', (req, res) => {
    res.send('¡API de Autos de Lujo funcionando! 🏎️');
});

// 4. Definir el Puerto (¡Importante que esté antes del listen!)
const PORT = process.env.PORT || 10000;

// 5. Encender el Servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});