require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// Conectar DB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ----------------------------------------------------
// 👇 ¡AQUÍ AGREGAS LA LÍNEA MÁGICA! 👇
app.use('/api/auth', require('./routes/authRoutes'));
// ----------------------------------------------------

// Ruta de prueba
//app.get('/', (req, res) => {
    //res.send('¡Servidor funcionando al 100%!');
//});

app.listen(PORT, () => {
    console.log(`📡 Servidor corriendo en http://localhost:${PORT}`);
});

app.use('/api/auth', require('./routes/authRoutes'));
// 👇 AGREGA ESTA LÍNEA NUEVA:
app.use('/api/cars', require('./routes/carRoutes'));

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});