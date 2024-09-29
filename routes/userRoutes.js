const express = require('express');
const User = require('../models/user');
const router = express.Router();
const bcrypt = require('bcrypt');

// Ruta para registrar un nuevo usuario
router.post('/register', async (req, res) => {
    const { email, password, fullName, city, phoneNumber, documentNumber } = req.body;

    // Verifica si el usuario ya existe por su correo o documento
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'El correo ya está registrado.' });
    }

    const existingDocument = await User.findOne({ documentNumber });
    if (existingDocument) {
        return res.status(400).json({ message: 'El número de documento ya está registrado.' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
        email,
        password: hashedPassword,
        fullName,
        city,
        phoneNumber,
        documentNumber
    });
    
    try {
        await newUser.save();
        res.status(201).json({ message: 'Usuario registrado con éxito' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Exportar las rutas
module.exports = router;

