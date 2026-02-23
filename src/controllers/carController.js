const Car = require('../models/Car');
const axios = require('axios'); // <--- Importamos Axios

// Obtener todos los autos con paginación, filtros y CONVERSIÓN DE MONEDA 💱
exports.getCars = async (req, res) => {
    try {
        // 1. Paginación
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // 2. Obtener autos de la BD
        const cars = await Car.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Car.countDocuments();

        // 3. 🌐 CONSUMO DE API EXTERNA (Frankfurter API - Gratis y Pública)
        let exchangeRate = 20; // Valor por defecto por si falla la API
        try {
            const response = await axios.get('https://api.frankfurter.app/latest?from=USD&to=MXN');
            exchangeRate = response.data.rates.MXN;
            console.log(`💵 Tipo de cambio actual: 1 USD = ${exchangeRate} MXN`);
        } catch (apiError) {
            console.error("⚠️ Error consultando API de cambio:", apiError.message);
            // Si falla, seguimos usando el valor por defecto (20) para no romper la app
        }

        // 4. Transformar los datos para agregar el precio en MXN
        const carsWithMXN = cars.map(car => {
            // Convertimos el documento de Mongoose a un objeto normal de JS
            const carObj = car.toObject(); 
            // Calculamos y agregamos el precio en pesos
            carObj.priceMXN = Math.round(car.price * exchangeRate);
            carObj.exchangeRateUsed = exchangeRate;
            return carObj;
        });

        // 5. Enviar respuesta
        res.status(200).json({
            success: true,
            count: carsWithMXN.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: carsWithMXN // Enviamos la lista modificada
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

// Crear un nuevo auto
exports.createCar = async (req, res) => {
    try {
        const newCar = await Car.create(req.body);
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