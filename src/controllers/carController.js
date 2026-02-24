// ... (código anterior de createCar)

// 3. ACTUALIZAR AUTO (PUT)
exports.updateCar = async (req, res) => {
    try {
        let dataToUpdate = req.body;

        // Si envían imágenes nuevas, las procesamos. Si no, dejamos las que ya tenía.
        if (dataToUpdate.images) {
             let processedImages = [];
            if (typeof dataToUpdate.images === 'string') {
                processedImages = dataToUpdate.images.split(/[\n,]+/).map(url => url.trim()).filter(url => url !== '');
            } else if (Array.isArray(dataToUpdate.images)) {
                processedImages = dataToUpdate.images;
            }
            dataToUpdate.images = processedImages;
        }

        const updatedCar = await Car.findByIdAndUpdate(req.params.id, dataToUpdate, {
            new: true, // Devuelve el auto ya actualizado
            runValidators: true
        });

        if (!updatedCar) {
            return res.status(404).json({ success: false, message: 'Auto no encontrado' });
        }

        res.status(200).json({
            success: true,
            data: updatedCar
        });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error al actualizar', error: error.message });
    }
};

// 4. ELIMINAR AUTO (DELETE) - ¡Bonus necesario!
exports.deleteCar = async (req, res) => {
    try {
        const car = await Car.findByIdAndDelete(req.params.id);
        if (!car) {
            return res.status(404).json({ success: false, message: 'Auto no encontrado' });
        }
        res.status(200).json({ success: true, message: 'Auto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al eliminar', error: error.message });
    }
};