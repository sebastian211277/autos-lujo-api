const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');

// Estas son las líneas que fallaban porque carController.getCars no existía
router.get('/', carController.getCars); 
router.post('/', carController.createCar);

module.exports = router;