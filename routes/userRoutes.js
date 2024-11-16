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

// Ruta para manejar el inicio de sesión
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Verificar si el usuario existe por email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Correo o contraseña incorrectos.' });
        }

        // Comparar la contraseña ingresada con la almacenada
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Correo o contraseña incorrectos.' });
        }

        // Responder con un mensaje de éxito si las credenciales son correctas
        res.status(200).json({ message: 'Inicio de sesión exitoso' });
    } catch (error) {
        console.error(error); // Mostrar el error en la consola
        res.status(500).json({ message: 'Error en el servidor.' }); // Respuesta de error
    }

});

router.post('/api/reset-password', async (req, res) => {
    const { email } = req.body;
  
    // Verifica si el correo está registrado
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('El correo no está registrado.');
    }
  
    
    const token = generateToken(user); // Implementa la función para generar un token
    await sendResetEmail(email, token); // Implementa la función para enviar el correo
  
    res.send('Se ha enviado un enlace para restablecer la contraseña a tu correo.');
  });


router.post('/api/update-password', async (req, res) => {
    const { token, newPassword } = req.body;
  
   
    const user = await verifyToken(token); 
    if (!user) {
      return res.status(400).send('Token inválido o expirado.');
    }
  
    // Actualizar la contraseña del usuario
    user.password = hashPassword(newPassword); // Implementa la función para hashear la contraseña
    await user.save();
  
    res.send('Contraseña actualizada con éxito.');
  });





module.exports = router;

