const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTRO DE USUARIO
exports.register = async (req, res) => {
    try {
        // 1. Extraer datos (incluyendo el rol)
        const { username, email, password, role } = req.body;

        // 2. Verificar si el usuario ya existe
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'El usuario ya existe 🚫' });
        }

        // 3. Crear el nuevo usuario
        // Si no envían rol, se asigna 'user' por defecto
        user = new User({
            username,
            email,
            password,
            role: role || 'user' 
        });

        // 4. Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // 5. Guardar en BD
        await user.save();

        // 6. Crear y firmar el JWT (Para que al registrarse ya quede logueado)
        const payload = {
            user: {
                id: user.id,
                role: user.role // Guardamos el rol en el token
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secreto_temporal', // Usa la variable de entorno
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ token, role: user.role, msg: 'Usuario registrado exitosamente 🏁' });
            }
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al registrar usuario', error: error.message });
    }
};

// LOGIN DE USUARIO (¡Esta es la que te faltaba! 🔑)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Verificar si el usuario existe
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Credenciales inválidas (Email no encontrado) 🚫' });
        }

        // 2. Verificar la contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Credenciales inválidas (Contraseña incorrecta) 🚫' });
        }

        // 3. Crear y firmar el JWT
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secreto_temporal',
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, role: user.role, msg: 'Inicio de sesión exitoso 🔓' });
            }
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor al iniciar sesión' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Buscar usuario
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

        // 2. Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Contraseña incorrecta' });

        // 3. Generar Token (JWT)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: { id: user._id, username: user.username } });
    } catch (error) {
        res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    }
};