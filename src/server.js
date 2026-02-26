require('dotenv').config(); // Carga las variables
const express = require('express');
const path = require('path');
const connectDB = require('./src/config/database'); // Verifica que esta ruta sea correcta

const app = express();

// Conectar a la base de datos
connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Rutas
app.use('/api/cars', require('./src/routes/carRoutes'));

// EL PUERTO: Si el .env falla, usamos el 3000 a la fuerza para Nginx
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 SERVIDOR ACTIVO EN PUERTO: ${PORT}`);
});