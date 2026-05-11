const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String },
    image: { type: String, required: true },
    link: { type: String },
    buttonText: { type: String, default: 'Ətraflı' },
    theme: { type: String, enum: ['blue', 'orange', 'purple', 'green', 'red'], default: 'blue' },
    position: { type: String, enum: ['hero', 'top', 'bottom', 'sidebar'], default: 'hero' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    order: { type: Number, default: 0 },
    
    // Date range
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    
    // Device targeting
    devices: [{ type: String, enum: ['desktop', 'tablet', 'mobile'] }],
    
    // Click tracking
    clicks: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Banner', bannerSchema);