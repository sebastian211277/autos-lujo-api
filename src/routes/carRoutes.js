const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const auth = require('../middleware/authMiddleware');

// api/cars

// GET: Cualquiera puede ver el catálogo
router.get('/', carController.getCars);

// POST: Solo usuarios logueados pueden agregar autos
router.post('/', auth, carController.createCar);

// PUT: Actualizar auto (requiere ID y Login)
router.put('/:id', auth, carController.updateCar);

// DELETE: Borrar auto (requiere ID y Login)
router.delete('/:id', auth, carController.deleteCar);

module.exports = router;