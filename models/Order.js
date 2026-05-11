const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    items: [{
        id: String,
        name: String,
        price: Number,
        quantity: Number
    }],
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cash', 'card'], default: 'cash' },
    status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

orderSchema.pre('save', function(next) {
    if (!this.orderNumber) {
        this.orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);