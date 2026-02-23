const Car = require('../models/Car');

// Obtener todos los autos con paginación y filtros
exports.getCars = async (req, res) => {
    try {
        // 1. Extraer parámetros de consulta (Query Params)
        // Ejemplo: /api/cars?page=1&limit=5
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        // 2. Calcular el salto (skip)
        const skip = (page - 1) * limit;

        // 3. Consultar la base de datos
        const cars = await Car.find()
            .sort({ createdAt: -1 }) // Ordenar por más recientes
            .skip(skip)
            .limit(limit);

        // 4. Contar total de documentos para la paginación
        const total = await Car.countDocuments();

        // 5. Enviar respuesta
        res.status(200).json({
            success: true,
            count: cars.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: cars
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

// Crear un nuevo auto (Para que puedas probar agregar datos)
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