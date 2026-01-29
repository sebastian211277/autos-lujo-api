const Car = require('../models/Car');

// OBTENER TODOS LOS AUTOS (Público)
exports.getCars = async (req, res) => {
    try {
        const cars = await Car.find();
        res.json(cars);
    } catch (error) {
        res.status(500).send('Error en el servidor');
    }
};

// CREAR UN AUTO (Privado)
exports.createCar = async (req, res) => {
    try {
        // Crear nuevo auto con los datos que envían
        const newCar = new Car(req.body);
        const car = await newCar.save();
        res.json(car);
    } catch (error) {
        res.status(500).send('Error al guardar el auto');
    }
};

// ACTUALIZAR UN AUTO (Privado)
exports.updateCar = async (req, res) => {
    try {
        const { brand, model, price, horsepower } = req.body;
        let car = await Car.findById(req.params.id);

        if (!car) return res.status(404).json({ msg: 'Auto no encontrado' });

        // Actualizar campos
        car = await Car.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(car);
    } catch (error) {
        res.status(500).send('Error en el servidor');
    }
};

// ELIMINAR UN AUTO (Privado)
exports.deleteCar = async (req, res) => {
    try {
        let car = await Car.findById(req.params.id);
        if (!car) return res.status(404).json({ msg: 'Auto no encontrado' });

        await Car.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Auto eliminado correctamente 🗑️' });
    } catch (error) {
        res.status(500).send('Error en el servidor');
    }
};