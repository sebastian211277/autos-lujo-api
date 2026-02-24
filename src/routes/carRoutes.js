const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const auth = require('../middleware/authMiddleware');

router.get('/', carController.getCars);


router.post('/', auth, carController.createCar);
router.put('/:id', auth, carController.updateCar);
router.delete('/:id', auth, carController.deleteCar);

module.exports = router;