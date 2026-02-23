// controllers/carController.js

// Obtener autos con paginación
exports.getCars = async (req, res) => {
try {
    // 1. Recibimos parámetros de la URL (query strings)
    // Ejemplo: /api/cars?page=1&limit=5
    const { page = 1, limit = 10 } = req.query;

    // 2. Convertimos a números enteros
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // 3. Calculamos cuántos registros saltar (skip)
    // Si estoy en pág 1: (1-1)*10 = 0 saltos.
    // Si estoy en pág 2: (2-1)*10 = 10 saltos (muestro del 11 al 20).
    const skip = (pageNumber - 1) * limitNumber;

    // 4. Ejecutamos la consulta a la BD
    // .find() busca los autos
    // .skip() salta los anteriores
    // .limit() limita cuántos trae
    const cars = await Car.find()
    .skip(skip)
    .limit(limitNumber);

    // 5. Contamos el total de documentos para saber cuántas páginas hay
    const totalCars = await Car.countDocuments();

    // 6. Enviamos respuesta con metadatos de paginación
    res.json({
    total: totalCars,
    currentPage: pageNumber,
    totalPages: Math.ceil(totalCars / limitNumber),
    data: cars
    });

} catch (error) {
    res.status(500).json({ message: "Error al obtener autos", error });
}
};