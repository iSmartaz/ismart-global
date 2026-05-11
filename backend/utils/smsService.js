const axios = require('axios');

// Birsms.az - Azərbaycan SMS Provider
const sendSMS = async (phone, message) => {
    try {
        const response = await axios.post('https://api.birsms.az/api/v1/sms/send', {
            key: process.env.SMS_API_KEY,
            sender: process.env.SMS_SENDER,
            number: phone.replace('+', ''),
            message: message,
            type: '0' // Normal SMS
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        return response.data;
    } catch (error) {
        console.error('SMS Error:', error.message);
        return { success: false, error: error.message };
    }
};

// Order Confirmation SMS
const sendOrderConfirmationSMS = async (phone, orderNumber) => {
    const message = `iSmart.az: Sifarişiniz qəbul edildi! Sifariş nömrəsi: ${orderNumber}. Təşəkkür edirik!`;
    return await sendSMS(phone, message);
};

// Order Shipped SMS
const sendOrderShippedSMS = async (phone, orderNumber, trackingNumber) => {
    const message = `iSmart.az: Sifarişiniz (#${orderNumber}) yola çıxdı! Tracking nömrəsi: ${trackingNumber}.`;
    return await sendSMS(phone, message);
};

// Order Delivered SMS
const sendOrderDeliveredSMS = async (phone, orderNumber) => {
    const message = `iSmart.az: Sifarişiniz (#${orderNumber}) çatdırıldı! Bizi dəyərləndirməyi unutmayın. ⭐`;
    return await sendSMS(phone, message);
};

// Stock Alert SMS
const sendStockAlertSMS = async (phone, productName) => {
    const message = `iSmart.az: ${productName} yenidən stokda var! Tez alış-veriş etmək üçün linkə daxil olun: ismart.az`;
    return await sendSMS(phone, message);
};

// Birthday Discount SMS
const sendBirthdayDiscountSMS = async (phone, discountCode) => {
    const message = `iSmart.az: Ad günün mübarək! ${discountCode} kodu ilə 20% endirim qazan! 🎂`;
    return await sendSMS(phone, message);
};

module.exports = {
    sendSMS,
    sendOrderConfirmationSMS,
    sendOrderShippedSMS,
    sendOrderDeliveredSMS,
    sendStockAlertSMS,
    sendBirthdayDiscountSMS
};