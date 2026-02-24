const Car = require('../models/Car');
const axios = require('axios');

// 1. OBTENER AUTOS (Con paginación y conversión a MXN)
exports.getCars = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const cars = await Car.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Car.countDocuments();

        // Obtener tipo de cambio
        let exchangeRate = 20;
        try {
            const response = await axios.get('https://api.frankfurter.app/latest?from=USD&to=MXN');
            exchangeRate = response.data.rates.MXN;
        } catch (apiError) {
            console.error("⚠️ Error API Divisas:", apiError.message);
        }

        // Agregar precio en MXN a cada auto
        const carsWithMXN = cars.map(car => {
            const carObj = car.toObject();
            carObj.priceMXN = Math.round(car.price * exchangeRate);
            return carObj;
        });

        res.status(200).json({
            success: true,
            count: carsWithMXN.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: carsWithMXN
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los autos',
            error: error.message
        });
    }
};

// 2. CREAR AUTO (Con soporte para múltiples imágenes)
exports.createCar = async (req, res) => {
    try {
        const { make, model, year, price, horsepower, description, images } = req.body;

        // Procesar imágenes: Convertir texto o array en un Array limpio de strings
        let processedImages = [];
        if (typeof images === 'string') {
            // Si viene como texto (del textarea), separamos por comas o saltos de línea
            processedImages = images.split(/[\n,]+/).map(url => url.trim()).filter(url => url !== '');
        } else if (Array.isArray(images)) {
            processedImages = images;
        }

        const newCar = await Car.create({
            make, 
            model, 
            year, 
            price, 
            horsepower, 
            description,
            images: processedImages // Guardamos el array procesado
        });

        res.status(201).json({
            success: true,
            data: newCar
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el auto',
            error: error.message
        });
    }
};