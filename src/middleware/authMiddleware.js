const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // 1. Leer el token del header
    const token = req.header('x-auth-token');

    // 2. Revisar si no hay token
    if (!token) {
        return res.status(401).json({ msg: 'No hay token, permiso denegado 🚫' });
    }

    // 3. Verificar el token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next(); // ¡Pase usted!
    } catch (err) {
        res.status(401).json({ msg: 'Token no es válido' });
    }
};