const express = require('express');
const { protect } = require('../middleware/auth');
const { MilliOnPayment, CashOnDelivery } = require('../utils/paymentService');
const Order = require('../models/Order');

const router = express.Router();
const millionPayment = new MilliOnPayment();

// Create MilliOn payment
router.post('/create-million', protect, async (req, res) => {
    try {
        const { orderId, amount, description } = req.body;
        
        const successUrl = `https://ismart.az/payment/success?orderId=${orderId}`;
        const cancelUrl = `https://ismart.az/payment/cancel?orderId=${orderId}`;
        
        const result = await millionPayment.createPayment(
            orderId,
            amount,
            description,
            successUrl,
            cancelUrl
        );
        
        if (result.success) {
            // Save payment ID to order
            await Order.findByIdAndUpdate(orderId, {
                paymentId: result.paymentId,
                paymentMethod: 'million'
            });
            
            res.json({
                success: true,
                paymentUrl: result.paymentUrl,
                paymentId: result.paymentId
            });
        } else {
            res.status(400).json({ success: false, message: result.error });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Check payment status
router.get('/check/:paymentId', protect, async (req, res) => {
    try {
        const result = await millionPayment.checkPayment(req.params.paymentId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// MilliOn Webhook (for payment confirmation)
router.post('/webhook/million', async (req, res) => {
    try {
        const signature = req.headers['x-signature'];
        
        if (!millionPayment.verifyWebhookSignature(req.body, signature)) {
            return res.status(401).json({ message: 'Invalid signature' });
        }
        
        const { payment_id, status, order_id } = req.body;
        
        if (status === 'success') {
            await Order.findByIdAndUpdate(order_id, {
                paymentStatus: 'paid',
                status: 'confirmed'
            });
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Cash on Delivery
router.post('/cod', protect, async (req, res) => {
    try {
        const { orderId } = req.body;
        const cod = new CashOnDelivery();
        const result = cod.processPayment(orderId, 0);
        
        await Order.findByIdAndUpdate(orderId, {
            paymentStatus: 'pending',
            paymentMethod: 'cash'
        });
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;