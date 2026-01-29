const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    price: { type: Number, required: true },
    horsepower: { type: Number, required: true },
    imageUrl: { type: String },
    // 👇 NUEVOS CAMPOS:
    category: { type: String, default: 'Superauto' }, // Ej: SUV, Sedan, Coupe
    description: { type: String, default: 'Sin descripción disponible.' }
});

module.exports = mongoose.model('Car', CarSchema);