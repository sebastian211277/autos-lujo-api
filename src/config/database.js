const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI); // Sin opciones obsoletas, Mongoose 6+ ya las maneja
        console.log('✅ MongoDB Conectado: Base de datos lista para operar.');
    } catch (err) {
        console.error('❌ Error de conexión a MongoDB:', err.message);
        process.exit(1); // Detener el servidor si no hay base de datos
    }
};

module.exports = connectDB;