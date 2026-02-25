const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');

// --- RUTAS PÚBLICAS (Cualquiera puede ver) ---
// GET /api/cars -> Ver todos (o filtrar por ?type=SUV)
router.get('/', carController.getCars);

// GET /api/cars/:id -> Ver detalles de UNO solo
router.get('/:id', carController.getCarById);


// --- RUTAS DE ADMINISTRACIÓN (Gestión) ---
// POST /api/cars -> Crear auto (Soporta subida de archivos)
router.post('/', carController.uploadMiddleware, carController.createCar);

// PUT /api/cars/:id -> Editar auto
router.put('/:id', carController.uploadMiddleware, carController.updateCar);

// DELETE /api/cars/:id -> Borrar auto
router.delete('/:id', carController.deleteCar);

module.exports = router;