const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    comment: { type: String, required: true },
    images: [{ type: String }],
    helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    notHelpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

// Virtual for helpful count
reviewSchema.virtual('helpfulCount').get(function() {
    return this.helpful.length;
});

// Virtual for not helpful count
reviewSchema.virtual('notHelpfulCount').get(function() {
    return this.notHelpful.length;
});

module.exports = mongoose.model('Review', reviewSchema);