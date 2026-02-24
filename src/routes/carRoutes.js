const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');

// Definición de las 4 rutas
router.get('/', carController.getCars);       // GET /api/cars
router.post('/', carController.createCar);    // POST /api/cars
router.put('/:id', carController.updateCar);  // PUT /api/cars/:id
router.delete('/:id', carController.deleteCar); // DELETE /api/cars/:id

module.exports = router;