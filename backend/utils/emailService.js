const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send Welcome Email
const sendWelcomeEmail = async (email, name) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px; text-align: center; border-radius: 20px 20px 0 0;">
                <h1 style="color: white; margin: 0;">✨ iSmart.az</h1>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 20px 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <h2>Xoş gəldin, ${name}! 🎉</h2>
                <p>iSmart.az ailəsinə üzv olduğunuz üçün təşəkkür edirik!</p>
                <p>İlk alış-verişinizdə <strong style="color: #2563eb; font-size: 20px;">10% ENDİRİM</strong> qazanın!</p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 10px; text-align: center; margin: 20px 0;">
                    <code style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">WELCOME10</code>
                </div>
                <a href="https://ismart.az" style="display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 30px; margin-top: 20px;">Alış-verişə başla</a>
            </div>
        </div>
    `;
    
    await transporter.sendMail({
        from: `"iSmart.az" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Xoş gəldiniz! 🎉 iSmart.az',
        html
    });
};

// Send Order Confirmation
const sendOrderConfirmation = async (email, name, order) => {
    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">${item.price} ₼</td>
        </tr>
    `).join('');
    
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 20px 20px 0 0;">
                <h1 style="color: white;">✅ Sifariş Təsdiqi</h1>
                <p style="color: white;">Sifariş #${order.orderNumber}</p>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 20px 20px;">
                <h2>Salam, ${name}!</h2>
                <p>Sifarişiniz qəbul edildi və işlənir.</p>
                
                <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f3f4f6;">
                            <th style="padding: 10px; text-align: left;">Məhsul</th>
                            <th style="padding: 10px; text-align: center;">Say</th>
                            <th style="padding: 10px; text-align: right;">Qiymət</th>
                        </tr>
                    </thead>
                    <tbody>${itemsHtml}</tbody>
                </table>
                
                <div style="border-top: 2px solid #e2e8f0; padding-top: 20px; text-align: right;">
                    <p><strong>Cəmi:</strong> ${order.total} ₼</p>
                    ${order.deliveryDate ? `<p><strong>Çatdırılma tarixi:</strong> ${new Date(order.deliveryDate).toLocaleDateString('az-AZ')}</p>` : ''}
                </div>
                
                <div style="background: #f3f4f6; padding: 15px; border-radius: 10px; margin-top: 20px;">
                    <p><strong>📦 Sifariş statusunuz:</strong> ${order.status === 'pending' ? 'Gözləmədə' : order.status === 'confirmed' ? 'Təsdiqləndi' : order.status === 'shipped' ? 'Yola çıxdı' : 'Çatdırıldı'}</p>
                </div>
                
                <a href="https://ismart.az/account/orders" style="display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 30px; margin-top: 20px;">Sifarişimi izlə</a>
            </div>
        </div>
    `;
    
    await transporter.sendMail({
        from: `"iSmart.az" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `✅ Sifariş təsdiqi #${order.orderNumber}`,
        html
    });
};

// Send Stock Alert
const sendStockAlert = async (email, name, productName) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center; border-radius: 20px 20px 0 0;">
                <h1 style="color: white;">📢 Stoka düşdü!</h1>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 20px 20px;">
                <h2>Salam, ${name}!</h2>
                <p>Sizi gözlədiyiniz məhsul haqqında məlumatlandırmaq istəyirik:</p>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                    <strong style="font-size: 18px;">${productName}</strong>
                    <p style="margin-top: 10px;">✅ Yenidən stokda var!</p>
                </div>
                <a href="https://ismart.az/products" style="display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 30px;">Məhsula bax</a>
            </div>
        </div>
    `;
    
    await transporter.sendMail({
        from: `"iSmart.az" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '📢 Stoka düşdü!',
        html
    });
};

// Send Birthday Discount
const sendBirthdayDiscount = async (email, name, discountCode) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ec4899, #db2777); padding: 30px; text-align: center; border-radius: 20px 20px 0 0;">
                <h1 style="color: white;">🎂 Ad günün mübarək!</h1>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 20px 20px;">
                <h2>Salam, ${name}!</h2>
                <p>Ad günün mübarək! Sizin üçün xüsusi endirim hazırlamışıq.</p>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                    <code style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${discountCode}</code>
                    <p style="margin-top: 10px;"><strong>20% ENDİRİM</strong> - 7 gün ərzində keçərlidir!</p>
                </div>
                <a href="https://ismart.az" style="display: inline-block; background: #ec4899; color: white; padding: 12px 30px; text-decoration: none; border-radius: 30px;">Hədiyyəni götür</a>
            </div>
        </div>
    `;
    
    await transporter.sendMail({
        from: `"iSmart.az" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🎂 Ad günün mübarək! Xüsusi endirim sizi gözləyir',
        html
    });
};

module.exports = { sendWelcomeEmail, sendOrderConfirmation, sendStockAlert, sendBirthdayDiscount };