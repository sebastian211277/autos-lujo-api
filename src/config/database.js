const mongoose = require('mongoose');

// No definimos la URI aquí, la traemos del archivo .env
const connectDB = async () => {
    try {
        // process.env.MONGO_URI lee el valor que pusiste en tu archivo .env
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Conectado exitosamente');
    } catch (err) {
        console.error('❌ Error de conexión a MongoDB:', err.message);
        // Si no hay base de datos, el servidor no debería seguir intentando
        process.exit(1); 
    }
};

module.exports = connectDB;