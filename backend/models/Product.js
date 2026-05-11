const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, enum: ['phones', 'accessories', 'repair'], required: true },
    price: { type: Number, required: true },
    discountedPrice: { type: Number, default: null },
    discount: { type: Number, default: 0 },
    currency: { type: String, default: 'AZN' },
    meta: { type: String, default: '' },
    image: { type: String, required: true },
    images: [{ type: String }],
    specs: { type: String, default: '' },
    stock: { type: String, default: 'Stokda var' },
    quantity: { type: Number, default: 10 },
    condition: { type: String, enum: ['yeni', 'ikinci', 'temirli'], default: 'yeni' },
    
    // Phone specific
    brand: { type: String },
    model: { type: String },
    storage: { type: String },
    color: { type: String },
    installment: { type: String, default: '12 ay' },
    installmentRate: { type: String, default: '13%' },
    warranty: { type: String, default: '2 il' },
    
    // Accessory specific
    accessoryType: { type: String },
    
    // Repair specific
    repairType: { type: String },
    
    // SEO
    slug: { type: String, unique: true },
    description: { type: String },
    
    // Statistics
    views: { type: Number, default: 0 },
    sales: { type: Number, default: 0 },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Generate slug before save
productSchema.pre('save', function(next) {
    if (!this.slug) {
        this.slug = this.name.toLowerCase().replace(/[^\w]+/g, '-');
    }
    next();
});

module.exports = mongoose.model('Product', productSchema);