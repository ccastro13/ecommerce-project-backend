const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const productRoutes = require('./routes/productRoutes'); 
const app = express();
const userRoutes = require('./routes/userRoutes');

// Middleware 
app.use(cors());
app.use(bodyParser.json());

app.use('/api/products', productRoutes);
app.use(express.json());
app.use('/api/users', userRoutes);


app.get('/test', (req, res) => {
  res.send('El servidor está funcionando correctamente');
});


// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/ecommerce-db')
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error al conectar a MongoDB:', err));

// Ruta básica de prueba
app.get('/', (req, res) => {
  res.send('Bienvenido a la API de eCommerce');
});

// Definir el puerto donde correrá el servidor
const PORT = process.env.PORT || 5000;

// Iniciar el servidor en el puerto definido
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
