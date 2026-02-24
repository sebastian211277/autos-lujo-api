const Car = require('../models/Car');
const axios = require('axios');

// 1. OBTENER AUTOS (GET) - Ahora con FILTROS, MXN y Paginación
exports.getCars = async (req, res) => {
    try {
        // Extraemos filtros de la URL (Query Params)
        const { type, make } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Construimos el objeto de búsqueda dinámico
        let query = {};
        
        // Si el usuario filtró por Categoría (Cars, SUV, etc.)
        if (type) {
            query.type = type;
        }

        // Si el usuario filtró por Marca (Porsche, Ferrari, etc.)
        // Usamos regex para que sea flexible (no importa mayúsculas/minúsculas)
        if (make) {
            query.make = { $regex: make, $options: 'i' };
        }

        // Ejecutamos la búsqueda con el filtro aplicado
        const cars = await Car.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Importante: Contar documentos basándonos en el filtro para que la paginación no mienta
        const total = await Car.countDocuments(query);

        // Obtener tipo de cambio dinámico
        let exchangeRate = 20;
        try {
            const response = await axios.get('https://api.frankfurter.app/latest?from=USD&to=MXN');
            exchangeRate = response.data.rates.MXN;
        } catch (apiError) {
            console.error("⚠️ Error API Divisas, usando valor por defecto:", apiError.message);
        }

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
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener autos', 
            error: error.message 
        });
    }
};

// 2. CREAR AUTO (POST) - Ahora incluye el campo "type"
exports.createCar = async (req, res) => {
    try {
        // Agregamos "type" a la desestructuración del cuerpo
        const { make, model, year, price, horsepower, type, description, images } = req.body;

        let processedImages = [];
        if (typeof images === 'string') {
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
            type, // Guardamos la categoría (Cars, SUV, etc.)
            description,
            images: processedImages
        });

        res.status(201).json({ success: true, data: newCar });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: 'Error al crear auto', 
            error: error.message 
        });
    }
};

// 3. ACTUALIZAR AUTO (PUT)
exports.updateCar = async (req, res) => {
    try {
        let dataToUpdate = req.body;

        if (dataToUpdate.images) {
            let processedImages = [];
            if (typeof dataToUpdate.images === 'string') {
                processedImages = dataToUpdate.images.split(/[\n,]+/).map(url => url.trim()).filter(url => url !== '');
            } else if (Array.isArray(dataToUpdate.images)) {
                processedImages = dataToUpdate.images;
            }
            dataToUpdate.images = processedImages;
        }

        const updatedCar = await Car.findByIdAndUpdate(req.params.id, dataToUpdate, {
            new: true,
            runValidators: true
        });

        if (!updatedCar) {
            return res.status(404).json({ success: false, message: 'Auto no encontrado' });
        }

        res.status(200).json({ success: true, data: updatedCar });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: 'Error al actualizar', 
            error: error.message 
        });
    }
};

// 4. ELIMINAR AUTO (DELETE)
exports.deleteCar = async (req, res) => {
    try {
        const car = await Car.findByIdAndDelete(req.params.id);
        if (!car) {
            return res.status(404).json({ success: false, message: 'Auto no encontrado' });
        }
        res.status(200).json({ success: true, message: 'Auto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al eliminar', 
            error: error.message 
        });
    }
};