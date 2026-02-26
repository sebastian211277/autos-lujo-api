const mongoose = require('mongoose');

const URI = "mongodb+srv://shyrio:Password123@cluster0.xxxxx.mongodb.net/luxury-cars?retryWrites=true&w=majority";

const connectDB = async () => {
try {
    await mongoose.connect(URI);
    console.log('✅ MongoDB Conectado exitosamente');
} catch (err) {
    console.error('❌ Error de conexión:', err.message);
    process.exit(1);
}
};

module.exports = connectDB;