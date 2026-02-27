const Car = require('../models/Car');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- 1. CONFIGURACIÓN DE MULTER (MEJORADA) ---
// Usamos rutas dinámicas para que funcione en cualquier carpeta o computadora
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // __dirname es la carpeta actual (controllers)
        // subimos dos niveles (../..) para llegar a la raíz y entramos a public/uploads
        const dest = path.join(__dirname, '../../public/uploads');
        
        // Aseguramos que la carpeta exista, si no, la crea (opcional, buena práctica)
        if (!fs.existsSync(dest)){
            fs.mkdirSync(dest, { recursive: true });
        }
        
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        // Nombre único para evitar sobrescribir fotos con el mismo nombre
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'auto-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('¡Solo se permiten archivos de imagen!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter
});

// Exportamos el middleware para usarlo en carRoutes.js
exports.uploadMiddleware = upload.array('images', 10);


// --- 2. FUNCIONES DEL CONTROLADOR ---

// A. OBTENER TODOS (CRÍTICO: FORMATO DATA)
exports.getCars = async (req, res) => {
    try {
        const { type, featured } = req.query;
        let query = {};

        if (type && type !== 'all') query.type = type;
        if (featured === 'true') query.isFeatured = true;

        const cars = await Car.find(query).sort({ createdAt: -1 });

        // ¡ESTO ES LO QUE ARREGLA TU FRONTEND!
        // Enviamos un objeto con la propiedad 'data'
        res.json({
            success: true,
            count: cars.length,
            data: cars 
        });

    } catch (err) {
        console.error("❌ Error en getCars:", err.message);
        res.status(500).json({ msg: 'Error del Servidor' });
    }
};

// B. OBTENER UNO POR ID
exports.getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) return res.status(404).json({ msg: 'Auto no encontrado' });
        res.json(car);
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'ID no válido' });
        res.status(500).send('Error del servidor');
    }
};

// C. CREAR AUTO
exports.createCar = async (req, res) => {
    try {
        // Validación: Si no hay archivos, inicializamos array vacío para evitar error
        const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        const newCar = new Car({
            make: req.body.make,
            model: req.body.model,
            year: req.body.year,
            price: req.body.price,
            type: req.body.type,
            description: req.body.description,
            images: imagePaths,
            isFeatured: req.body.isFeatured === 'true' // Convertir string "true" a boolean true
        });

        const car = await newCar.save();
        res.json(car);
    } catch (err) {
        console.error("Error al crear:", err);
        res.status(500).send('Error al guardar el auto');
    }
};

// D. ACTUALIZAR AUTO
exports.updateCar = async (req, res) => {
    try {
        let car = await Car.findById(req.params.id);
        if (!car) return res.status(404).json({ msg: 'Auto no encontrado' });

        // Construimos el objeto de actualización dinámicamente
        const { make, model, year, price, type, description, isFeatured } = req.body;
        
        let carFields = {};
        if (make) carFields.make = make;
        if (model) carFields.model = model;
        if (year) carFields.year = year;
        if (price) carFields.price = price;
        if (type) carFields.type = type;
        if (description) carFields.description = description;
        // Solo actualizamos isFeatured si viene en el request
        if (typeof isFeatured !== 'undefined') {
            carFields.isFeatured = isFeatured === 'true';
        }

        // Manejo de Imágenes: Si suben nuevas, las agregamos a las existentes
        if (req.files && req.files.length > 0) {
            const uploadedPaths = req.files.map(file => `/uploads/${file.filename}`);
            carFields.images = car.images.concat(uploadedPaths);
        }

        // Actualizamos y devolvemos el nuevo documento
        car = await Car.findByIdAndUpdate(
            req.params.id, 
            { $set: carFields }, 
            { new: true }
        );
        
        res.json(car);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al actualizar');
    }
};

// E. ELIMINAR AUTO
exports.deleteCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) return res.status(404).json({ msg: 'Auto no encontrado' });

        // OPCIONAL: Borrar archivos físicos del disco para no llenar la memoria SD
        if (car.images && car.images.length > 0) {
            car.images.forEach(imgPath => {
                // imgPath viene como "/uploads/foto.jpg", hay que convertirlo a ruta física
                const filePath = path.join(__dirname, '../../public', imgPath);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath); // Borra el archivo
                }
            });
        }

        await car.deleteOne();
        res.json({ msg: 'Auto eliminado correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al eliminar');
    }
};