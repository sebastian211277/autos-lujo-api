const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    make: { 
        type: String, 
        required: [true, 'La marca es obligatoria'], 
        trim: true,
        maxlength: [50, 'La marca no puede exceder los 50 caracteres']
    },
    model: { 
        type: String, 
        required: [true, 'El modelo es obligatorio'], 
        trim: true,
        maxlength: [50, 'El modelo no puede exceder los 50 caracteres']
    },
    year: { 
        type: Number, 
        required: [true, 'El año es obligatorio'],
        min: [1886, 'El año no puede ser anterior a la invención del auto'], // Primer auto de Benz
        max: [2027, 'No puedes registrar autos de un futuro tan lejano'] // Estamos en 2026
    },
    price: { 
        type: Number, 
        required: [true, 'El precio es obligatorio'],
        min: [0, 'El precio no puede ser negativo']
    },
    horsepower: { 
        type: Number, 
        required: [true, 'Los caballos de fuerza son obligatorios'],
        min: [0, 'Un auto no puede tener potencia negativa'],
        max: [2500, 'Esa potencia parece irreal para un auto de producción']
    },
    images: { 
        type: [String], 
        validate: {
            validator: function(v) {
                return v.length <= 10; // Límite de 10 fotos por auto
            },
            message: 'No puedes subir más de 10 imágenes por vehículo'
        }
    },

    // ... dentro de carSchema
    type: { 
        type: String, 
        required: [true, 'El tipo de vehículo es obligatorio'],
        enum: ['Cars', 'Pickups', 'SUV', 'Hybrid & Electric'] // Solo permite estos valores
    },
// ...

    // ... dentro de carSchema
    type: { 
        type: String, 
        required: [true, 'El tipo de vehículo es obligatorio'],
        enum: ['Cars', 'Pickups', 'SUV', 'Hybrid & Electric'] // Solo permite estos valores
    },
// ...

    description: { 
        type: String, 
        trim: true,
        maxlength: [2000, 'La descripción es demasiado larga']
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Car', carSchema);