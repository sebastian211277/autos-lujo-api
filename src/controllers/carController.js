const Car = require('../models/Car');
const axios = require('axios');

// 1. OBTENER AUTOS (GET) - Con precio en MXN y paginación
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
        res.status(500).json({ success: false, message: 'Error al obtener autos', error: error.message });
    }
};

// 2. CREAR AUTO (POST) - Con soporte para imágenes múltiples
exports.createCar = async (req, res) => {
    try {
        const { make, model, year, price, horsepower, description, images } = req.body;

        let processedImages = [];
        if (typeof images === 'string') {
            processedImages = images.split(/[\n,]+/).map(url => url.trim()).filter(url => url !== '');
        } else if (Array.isArray(images)) {
            processedImages = images;
        }

        const newCar = await Car.create({
            make, model, year, price, horsepower, description,
            images: processedImages
        });

        res.status(201).json({ success: true, data: newCar });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error al crear auto', error: error.message });
    }
};

// 3. ACTUALIZAR AUTO (PUT)
exports.updateCar = async (req, res) => {
    try {
        let dataToUpdate = req.body;

        // Si envían imágenes nuevas, las procesamos
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
        res.status(400).json({ success: false, message: 'Error al actualizar', error: error.message });
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
        res.status(500).json({ success: false, message: 'Error al eliminar', error: error.message });
    }
};