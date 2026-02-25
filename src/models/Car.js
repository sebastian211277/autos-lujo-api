const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
    make: { 
        type: String, 
        required: true,
        trim: true 
    },
    model: { 
        type: String, 
        required: true,
        trim: true 
    },
    year: { 
        type: Number, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    type: { 
        type: String, 
        required: true,
        enum: ['Cars', 'SUV', 'Pickups', 'Hybrid & Electric'] // Categorías estrictas
    },
    description: { 
        type: String, 
        required: false 
    },
    images: [{ 
        type: String // Guardaremos rutas como "/uploads/ferrari-1.jpg"
    }],
    isFeatured: {
        type: Boolean,
        default: false // Por defecto, no sale en el carrusel principal
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Car', CarSchema);