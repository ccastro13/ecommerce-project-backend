const express = require('express');
const User = require('../models/user');
const router = express.Router();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer'); 

// Configuración del transporter
const transporter = nodemailer.createTransport({
    service: 'outlook', // O el servicio que estés utilizando
    auth: {
        user: 'ccastroca@uninpahu.edu.co', // Cambia esto por tu dirección de correo
        pass: '0713Piipeypao' // Cambia esto por tu contraseña de correo
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

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Verificar si el usuario existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'El correo no está registrado.' });
        }

        // Generar un token único
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiration = Date.now() + 3600000; // 1 hora

        // Guardar el token y la expiración en la base de datos
        user.resetToken = resetToken;
        user.resetTokenExpiration = tokenExpiration;
        await user.save();

        // Crear el enlace de restablecimiento
        const resetLink = `http://localhost:4200/reset-password/${resetToken}`;

        // Configurar y enviar el correo
        const transporter = nodemailer.createTransport({
            service: 'outlook', // Cambia según tu proveedor
            auth: {
                user: 'ccastroca@uninpahu.edu.co',
                pass: '0713Piipeypao',
            },
        });

        const mailOptions = {
            from: 'tucorreo@gmail.com',
            to: email,
            subject: 'Restablecer contraseña',
            html: `
                <p>Hola,</p>
                <p>Has solicitado restablecer tu contraseña. Haz clic en el enlace de abajo para continuar:</p>
                <a href="${resetLink}">${resetLink}</a>
                <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Correo de restablecimiento enviado con éxito.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al procesar la solicitud.' });
    }
});

router.get('/reset-password/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() }, // Verificar que el token no haya expirado
        });

        if (!user) {
            return res.status(400).json({ message: 'Token inválido o expirado.' });
        }

        res.status(200).json({ message: 'Token válido', email: user.email });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al verificar el token.' });
    }
});

router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() }, // Verificar token válido
        });

        if (!user) {
            return res.status(400).json({ message: 'Token inválido o expirado.' });
        }

        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar la contraseña y eliminar el token
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;

        await user.save();

        res.status(200).json({ message: 'Contraseña actualizada con éxito.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al actualizar la contraseña.' });
    }
});





module.exports = router;

