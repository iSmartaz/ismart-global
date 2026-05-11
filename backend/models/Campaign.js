const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    image: { type: String, required: true },
    link: { type: String, default: 'telefonlar.html' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    order: { type: Number, default: 0 },
    
    // Date range
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    
    // Priority
    priority: { type: Number, default: 0 },
    
    // Click tracking
    clicks: { type: Number, default: 0 },
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Campaign', campaignSchema);