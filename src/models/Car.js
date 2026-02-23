const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
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
    horsepower: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Car', carSchema);