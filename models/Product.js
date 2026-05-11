const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, enum: ['phones', 'accessories', 'repair'], default: 'phones' },
    price: { type: Number, required: true },
    oldPrice: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    meta: { type: String, default: '' },
    image: { type: String, default: '' },
    brand: { type: String, default: '' },
    stock: { type: Number, default: 10 },
    views: { type: Number, default: 0 },
    sales: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);