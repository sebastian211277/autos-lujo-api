// Crear un nuevo auto
exports.createCar = async (req, res) => {
    try {
        // Obtenemos los datos
        const { make, model, year, price, horsepower, description, images } = req.body;

        // Validar que images sea un array, si viene como string (por seguridad) lo convertimos
        let processedImages = [];
        if (typeof images === 'string') {
            // Si el usuario separó por comas o saltos de línea, lo convertimos a lista
            processedImages = images.split(/[\n,]+/).map(url => url.trim()).filter(url => url !== '');
        } else if (Array.isArray(images)) {
            processedImages = images;
        }

        const newCar = await Car.create({
            make, model, year, price, horsepower, description,
            images: processedImages
        });

        res.status(201).json({
            success: true,
            data: newCar
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el auto',
            error: error.message
        });
    }
};