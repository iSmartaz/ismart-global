const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    address: {
        street: { type: String, default: '' },
        city: { type: String, default: 'Bakı' },
        district: { type: String, default: '' },
        zipCode: { type: String, default: '' },
        fullAddress: { type: String, default: '' }
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    
    // Loyalty System
    points: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    orderCount: { type: Number, default: 0 },
    tier: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' },
    
    // Referral System
    referralCode: { type: String, unique: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    referralCount: { type: Number, default: 0 },
    referralPoints: { type: Number, default: 0 },
    
    // Birthday
    birthday: { type: Date },
    birthdayDiscountUsed: { type: Boolean, default: false },
    
    // Favorites
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    
    // Notifications
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: true },
    
    // Cart (session independent)
    savedCart: { type: Array, default: [] },
    
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date }
});

// Hash password before save
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Generate referral code
userSchema.pre('save', async function(next) {
    if (!this.referralCode) {
        this.referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    }
    next();
});

// Update tier based on total spent
userSchema.methods.updateTier = function() {
    if (this.totalSpent >= 5000) this.tier = 'Platinum';
    else if (this.totalSpent >= 2000) this.tier = 'Gold';
    else if (this.totalSpent >= 500) this.tier = 'Silver';
    else this.tier = 'Bronze';
    return this.tier;
};

// Get tier discount
userSchema.methods.getTierDiscount = function() {
    const discounts = { Bronze: 0, Silver: 5, Gold: 10, Platinum: 15 };
    return discounts[this.tier];
};

// Compare password
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);