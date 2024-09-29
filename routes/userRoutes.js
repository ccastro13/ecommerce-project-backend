const express = require('express');
const User = require('../models/user');
const router = express.Router();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer'); 

// Configuración del transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // O el servicio que estés utilizando
    auth: {
        user: 'tucorreo@gmail.com', // Cambia esto por tu dirección de correo
        pass: 'tu_contraseña' // Cambia esto por tu contraseña de correo
    }
});

// Ruta para registrar un nuevo usuario
router.post('/register', async (req, res) => {
    const { email, password, fullName, city, phoneNumber, documentNumber } = req.body;

    try {
        // Verifica si el usuario ya existe
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
            fullName,
            email,
            city,
            phoneNumber,
            documentNumber,
            password: hashedPassword
        });
        
        
        await newUser.save();
        res.status(201).json({ message: 'Usuario registrado con éxito' }); // Solo mensaje de éxito
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al registrar el usuario', error: err.message }); 
    }
});


module.exports = router;

