require('dotenv').config();
const express = require('express');
const connectDB = require('./src/config/database');
const cors = require('cors');
const path = require('path');

const app = express();

// 1. CONECTAR A LA BASE DE DATOS
connectDB();

// 2. MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. CARPETAS ESTÁTICAS (Muy importante para las imágenes)
// Esto hace que 'public' sea la raíz de tu web
app.use(express.static(path.join(__dirname, 'public')));
// Esto permite acceder a las fotos subidas como /uploads/nombre.jpg
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// 4. RUTAS DE LA API
// Solo dejamos las de autos por ahora para limpiar el camino
app.use('/api/cars', require('./src/routes/carRoutes'));

// 5. RUTA PARA EL FRONTEND (SPA fallback)
// Si alguien entra a la raíz, sirve el index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 6. ARRANCAR SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor de lujo corriendo en el puerto ${PORT}`);
    console.log(`📂 Archivos estáticos servidos desde: ${path.join(__dirname, 'public')}`);
});