const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');

// Ruta para obtener todos los autos (GET /api/cars)
router.get('/', carController.getCars);

// Ruta para crear un auto (POST /api/cars)
router.post('/', carController.createCar);

module.exports = router;