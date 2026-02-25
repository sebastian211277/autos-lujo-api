const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');

// --- RUTAS PÚBLICAS ---
router.get('/', carController.getCars);

router.get('/:id', carController.getCarById); 

// --- RUTAS DE ADMIN (Ya sin auth) ---
router.post('/', carController.createCar);
router.put('/:id', carController.updateCar);
router.delete('/:id', carController.deleteCar);

module.exports = router;