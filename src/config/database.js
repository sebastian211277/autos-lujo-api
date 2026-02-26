const mongoose = require('mongoose');

// Le agregamos "luxury-cars" antes del signo de interrogación
const URI = "mongodb://shyrio:Mongo4life77@cluster0autos.r6qhume.mongodb.net/luxury-cars?retryWrites=true&w=majority";

const connectDB = async () => {
try {
    await mongoose.connect(URI);
    console.log('✅ MongoDB Conectado exitosamente');
} catch (err) {
    console.error('❌ Error de conexión:', err.message);
    // No cerramos el proceso para que el servidor no se muera
}
};

module.exports = connectDB;