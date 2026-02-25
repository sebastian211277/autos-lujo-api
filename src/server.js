require('dotenv').config();
const express = require('express');
const connectDB = require('./src/config/database');
const cors = require('cors');
const path = require('path');

// Inicializar App
const app = express();

// Conectar Base de Datos
connectDB();

// Middleware (Configuración de seguridad y datos)
app.use(cors());
app.use(express.json({ extended: false })); // Para recibir JSON

// IMPORTANTE: Servir archivos estáticos (Frontend y Fotos)
// 1. La carpeta 'public' contiene el HTML, CSS y JS
app.use(express.static('public'));
// 2. La carpeta 'uploads' contiene las fotos de los autos
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Definir Rutas de la API (Las crearemos en el siguiente paso)
app.use('/api/cars', require('./src/routes/carRoutes'));

// Puerto de salida
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Servidor Luxury Garage corriendo en el puerto ${PORT}`));