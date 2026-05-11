const axios = require('axios');
const crypto = require('crypto');

// MilliÖn Payment Integration
class MilliOnPayment {
    constructor() {
        this.apiKey = process.env.MILLION_API_KEY;
        this.merchantId = process.env.MILLION_MERCHANT_ID;
        this.baseUrl = 'https://api.million.az/v1';
    }
    
    // Create payment
    async createPayment(orderId, amount, description, successUrl, cancelUrl) {
        try {
            const response = await axios.post(`${this.baseUrl}/payments`, {
                merchant_id: this.merchantId,
                amount: amount,
                currency: 'AZN',
                order_id: orderId,
                description: description,
                success_url: successUrl,
                cancel_url: cancelUrl,
                language: 'az'
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return {
                success: true,
                paymentUrl: response.data.payment_url,
                paymentId: response.data.payment_id
            };
        } catch (error) {
            console.error('MilliOn Error:', error.response?.data || error.message);
            return { success: false, error: error.message };
        }
    }
    
    // Check payment status
    async checkPayment(paymentId) {
        try {
            const response = await axios.get(`${this.baseUrl}/payments/${paymentId}`, {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });
            
            return {
                success: true,
                status: response.data.status,
                amount: response.data.amount
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Verify webhook signature
    verifyWebhookSignature(payload, signature) {
        const expected = crypto
            .createHmac('sha256', this.apiKey)
            .update(JSON.stringify(payload))
            .digest('hex');
        
        return signature === expected;
    }
}

// Alternative: Cash on Delivery
class CashOnDelivery {
    processPayment(orderId, amount) {
        return {
            success: true,
            method: 'cash',
            message: 'Ödəniş çatdırılmada nağd şəkildə ediləcək'
        };
    }
}

module.exports = { MilliOnPayment, CashOnDelivery };