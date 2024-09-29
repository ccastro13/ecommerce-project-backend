const express = require('express');
const User = require('../models/user');
const router = express.Router();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'Hotmail',
    auth: {
        user: 'tucorreo@gmail.com', // Cambia esto a tu correo
        pass: 'tucontraseña', // Cambia esto a tu contraseña o clave de app
    },
});

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

        // Configuración del correo de confirmación
        const mailOptions = {
            from: 'tucorreo@gmail.com', // Cambia esto por tu dirección de correo
            to: email, // Correo del usuario registrado
            subject: 'Confirmación de registro',
            text: `Hola ${fullName}, gracias por registrarte en nuestra aplicación. Tu registro ha sido exitoso.`,
        };

        // Enviar correo
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error al enviar el correo:', error);
                return res.status(500).json({ message: 'Error al enviar el correo de confirmación.' });
            }
            console.log('Correo enviado:', info.response);
        });

        res.status(201).json({ message: 'Usuario registrado con éxito. Correo de confirmación enviado.' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
