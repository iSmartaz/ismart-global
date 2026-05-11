// backend/utils/telegramService.js
const axios = require('axios');

const TELEGRAM_BOT_TOKEN = '8710401368:AAHSmbqdshl9Q7onq-aOrcvzBStRy9nBQjA'; // @BotFather-dan alın
const TELEGRAM_CHAT_ID = '8703267970'; // @userinfobot-dan alın

const sendTelegramMessage = async (message, chatId = TELEGRAM_CHAT_ID) => {
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
        });
        return { success: true };
    } catch (error) {
        console.error('Telegram error:', error.message);
        return { success: false };
    }
};

const sendOrderNotification = async (order) => {
    const message = `
🛒 <b>YENİ SİFARİŞ!</b>
📦 Sifariş №: ${order.orderNumber}
💰 Məbləğ: ${order.total} ₼
👤 Müştəri: ${order.user?.name || 'Qeydiyyatsız'}
📞 Telefon: ${order.deliveryAddress?.phone || '-'}
📍 Ünvan: ${order.deliveryAddress?.address || '-'}
    `;
    return await sendTelegramMessage(message);
};

const sendStockAlertTelegram = async (productName) => {
    const message = `
📢 <b>STOKA DÜŞDÜ!</b>
${productName} yenidən stokda var!
🌐 ismart.az
    `;
    return await sendTelegramMessage(message);
};

module.exports = { sendTelegramMessage, sendOrderNotification, sendStockAlertTelegram };