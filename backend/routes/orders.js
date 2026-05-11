const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { protect, admin } = require('../middleware/auth');
const { sendOrderConfirmation, sendOrderConfirmationSMS } = require('../utils/emailService');
const { sendOrderShippedSMS, sendOrderDeliveredSMS } = require('../utils/smsService');

const router = express.Router();

// Calculate delivery fee
const calculateDeliveryFee = (subtotal, address) => {
    let fee = 0;
    
    // Free delivery over 100 AZN
    if (subtotal >= 100) return 0;
    
    // Base fee
    fee = 5;
    
    // Distance based (Bakı daxili)
    const districts = {
        'Nəsimi': 3, 'Nizami': 3, 'Yasamal': 3,
        'Xətai': 4, 'Qaradağ': 6, 'Binəqədi': 5,
        'Suraxanı': 7, 'Səbail': 3, 'Pirallahı': 10
    };
    
    if (address.district && districts[address.district]) {
        fee += districts[address.district];
    }
    
    return Math.min(fee, 15); // Max 15 AZN
};

// Calculate delivery date
const calculateDeliveryDate = () => {
    const date = new Date();
    const hour = date.getHours();
    
    // Same day delivery if order before 14:00
    if (hour < 14) {
        return new Date(date.setHours(20, 0, 0, 0));
    }
    // Next day delivery
    return new Date(date.setDate(date.getDate() + 1));
};

// Create order
router.post('/', protect, async (req, res) => {
    try {
        const { items, deliveryAddress, paymentMethod, couponCode, usePoints } = req.body;
        
        let subtotal = 0;
        const orderItems = [];
        
        // Calculate subtotal
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Məhsul tapılmadı: ${item.productId}` });
            }
            
            const price = product.discountedPrice || product.price;
            subtotal += price * item.quantity;
            
            orderItems.push({
                product: product._id,
                name: product.name,
                price: price,
                quantity: item.quantity,
                image: product.image
            });
        }
        
        let discount = 0;
        let couponDiscount = 0;
        let pointsUsed = 0;
        
        // Apply coupon
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
            if (coupon && coupon.isValid(req.user._id)) {
                if (subtotal >= coupon.minAmount) {
                    if (coupon.type === 'percentage') {
                        couponDiscount = (subtotal * coupon.discount) / 100;
                        if (coupon.maxDiscount && couponDiscount > coupon.maxDiscount) {
                            couponDiscount = coupon.maxDiscount;
                        }
                    } else {
                        couponDiscount = coupon.discount;
                    }
                    discount += couponDiscount;
                    coupon.usedCount += 1;
                    await coupon.save();
                }
            }
        }
        
        // Use points
        if (usePoints && req.user.points > 0) {
            const maxPointsToUse = Math.min(req.user.points, subtotal * 0.3);
            pointsUsed = maxPointsToUse;
            discount += pointsUsed;
        }
        
        // Calculate delivery fee
        const deliveryFee = calculateDeliveryFee(subtotal - discount, deliveryAddress);
        const total = subtotal - discount + deliveryFee;
        
        // Calculate points to earn (1 point per 10 AZN)
        const pointsEarned = Math.floor(total / 10);
        
        // Calculate delivery date
        const deliveryDate = calculateDeliveryDate();
        
        // Create order
        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            subtotal,
            discount,
            couponCode,
            couponDiscount,
            pointsUsed,
            pointsEarned,
            deliveryFee,
            total,
            deliveryAddress,
            deliveryDate,
            paymentMethod
        });
        
        // Update user points
        req.user.points -= pointsUsed;
        req.user.points += pointsEarned;
        req.user.totalSpent += total;
        req.user.orderCount += 1;
        req.user.updateTier();
        await req.user.save();
        
        // Update product sales
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.product, { $inc: { sales: item.quantity } });
        }
        
        // Send notifications
        await sendOrderConfirmation(req.user.email, req.user.name, order);
        if (req.user.phone) {
            await sendOrderConfirmationSMS(req.user.phone, order.orderNumber);
        }
        
        res.status(201).json({
            success: true,
            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                total: order.total,
                status: order.status,
                deliveryDate: order.deliveryDate,
                pointsEarned: pointsEarned
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user orders
router.get('/my-orders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort('-createdAt')
            .limit(50);
        
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get order by ID
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email phone');
        
        if (!order) {
            return res.status(404).json({ message: 'Sifariş tapılmadı' });
        }
        
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bu sifarişə baxmaq icazəniz yoxdur' });
        }
        
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update order status (Admin only)
router.put('/:id/status', protect, admin, async (req, res) => {
    try {
        const { status, note } = req.body;
        const order = await Order.findById(req.params.id).populate('user', 'email phone name');
        
        if (!order) {
            return res.status(404).json({ message: 'Sifariş tapılmadı' });
        }
        
        order.status = status;
        order.statusHistory.push({ status, note });
        await order.save();
        
        // Send notifications based on status
        if (status === 'shipped' && order.trackingNumber) {
            if (order.user.phone) {
                await sendOrderShippedSMS(order.user.phone, order.orderNumber, order.trackingNumber);
            }
        }
        
        if (status === 'delivered') {
            if (order.user.phone) {
                await sendOrderDeliveredSMS(order.user.phone, order.orderNumber);
            }
        }
        
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update tracking info (Admin only)
router.put('/:id/tracking', protect, admin, async (req, res) => {
    try {
        const { trackingNumber, courierName } = req.body;
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Sifariş tapılmadı' });
        }
        
        order.trackingNumber = trackingNumber;
        order.courierName = courierName;
        await order.save();
        
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: Get all orders
router.get('/admin/all', protect, admin, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = status ? { status } : {};
        
        const orders = await Order.find(query)
            .populate('user', 'name email phone')
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        
        const total = await Order.countDocuments(query);
        
        res.json({
            success: true,
            orders,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;