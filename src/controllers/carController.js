const Car = require('../models/Car');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- CONFIGURACIÓN DE MULTER (Subida de Imágenes) ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Usamos una ruta absoluta directa para evitar confusiones de carpetas
        const dest = '/home/shyrio/autos-lujo-api/public/uploads/';
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('¡Solo se permiten archivos de imagen!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB por foto
});

// --- FUNCIONES DEL CONTROLADOR ---

// 1. OBTENER TODOS LOS AUTOS (Con filtros)
exports.getCars = async (req, res) => {
    try {
        const { type, featured } = req.query;
        let query = {};

        if (type) query.type = type;
        // IMPORTANTE: Asegúrate de que esta comparación sea segura
        if (featured === 'true') query.isFeatured = true;

        const cars = await Car.find(query).sort({ createdAt: -1 });
res.json({ data: cars }); // Verifica que envíes un objeto con 'data'
    } catch (err) {
        console.error("❌ Error en getCars:", err);
        res.status(500).json({ msg: 'Error al obtener los autos' });
    }
};

// 2. OBTENER UN AUTO POR ID
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

// 3. CREAR UN AUTO (Con fotos)
exports.createCar = async (req, res) => {
    // Multer ya procesó las fotos antes de llegar aquí
    try {
        // Las rutas de las imágenes que guardó Multer
        const imagePaths = req.files.map(file => `/uploads/${file.filename}`);

        const newCar = new Car({
            make: req.body.make,
            model: req.body.model,
            year: req.body.year,
            price: req.body.price,
            type: req.body.type,
            description: req.body.description,
            images: imagePaths, // Guardamos el array de rutas
            isFeatured: req.body.isFeatured === 'true' // Convertir string a boolean
        });

        const car = await newCar.save();
        res.json(car);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al guardar el auto');
    }
};

// 4. ACTUALIZAR AUTO
exports.updateCar = async (req, res) => {
    try {
        let car = await Car.findById(req.params.id);
        if (!car) return res.status(404).json({ msg: 'Auto no encontrado' });

        // Datos a actualizar
        const { make, model, year, price, type, description, isFeatured } = req.body;
        
        // Si subieron fotos nuevas, las agregamos al array existente
        let newImages = car.images;
        if (req.files && req.files.length > 0) {
            const uploadedPaths = req.files.map(file => `/uploads/${file.filename}`);
            newImages = newImages.concat(uploadedPaths);
        }

        // Objeto con los campos actualizados
        const carFields = {
            make, model, year, price, type, description,
            isFeatured: isFeatured === 'true',
            images: newImages
        };

        car = await Car.findByIdAndUpdate(req.params.id, { $set: carFields }, { new: true });
        res.json(car);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al actualizar');
    }
};

// 5. BORRAR AUTO (Y sus fotos)
exports.deleteCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) return res.status(404).json({ msg: 'Auto no encontrado' });

        // (Opcional) Aquí podríamos borrar los archivos físicos de 'uploads' para ahorrar espacio
        // car.images.forEach(imgPath => { ... borrar con fs.unlink ... })

        await car.deleteOne();
        res.json({ msg: 'Auto eliminado correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al eliminar');
    }
};

// Exportamos el middleware de subida para usarlo en las rutas
exports.uploadMiddleware = upload.array('images', 10); // Acepta hasta 10 fotos campo 'images'