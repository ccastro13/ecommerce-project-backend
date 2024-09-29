const mongoose = require('mongoose');

// Definir el esquema del producto
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    category: { type: String },
    stock: { type: Number, default: 0 },
    imageUrl: { type: String }
});

// Crear el modelo a partir del esquema
const Product = mongoose.model('Product', productSchema);

// Exportar el modelo
module.exports = Product;
