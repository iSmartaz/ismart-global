const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        quantity: Number,
        image: String
    }],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    couponDiscount: { type: Number, default: 0 },
    pointsUsed: { type: Number, default: 0 },
    pointsEarned: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    
    // Delivery Info
    deliveryAddress: {
        fullName: String,
        phone: String,
        address: String,
        city: String,
        district: String,
        notes: String
    },
    deliveryDate: { type: Date },
    deliveryTimeSlot: { type: String },
    
    // Payment
    paymentMethod: { type: String, enum: ['cash', 'card', 'million'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    paymentId: { type: String },
    
    // Order Status
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending'
    },
    statusHistory: [{
        status: String,
        date: { type: Date, default: Date.now },
        note: String
    }],
    
    // Tracking
    trackingNumber: { type: String },
    courierName: { type: String },
    estimatedDelivery: { type: Date },
    
    // Notifications
    smsSent: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },
    
    createdAt: { type: Date, default: Date.now }
});

// Generate order number before save
orderSchema.pre('save', function(next) {
    if (!this.orderNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.orderNumber = `ISMART-${year}${month}${day}-${random}`;
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);