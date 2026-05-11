const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    discount: { type: Number, required: true, min: 0, max: 100 },
    type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    minAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    
    // Usage limits
    usageLimit: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    
    // User specific (referral, birthday)
    userSpecific: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isReferral: { type: Boolean, default: false },
    isBirthday: { type: Boolean, default: false },
    
    // Date range
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    
    active: { type: String, enum: ['active', 'inactive'], default: 'active' },
    
    createdAt: { type: Date, default: Date.now }
});

// Check if valid
couponSchema.methods.isValid = function(userId) {
    if (this.active !== 'active') return false;
    if (this.endDate && new Date() > this.endDate) return false;
    if (this.startDate && new Date() < this.startDate) return false;
    if (this.usageLimit && this.usedCount >= this.usageLimit) return false;
    if (this.userSpecific && this.userSpecific.toString() !== userId) return false;
    return true;
};

module.exports = mongoose.model('Coupon', couponSchema);