const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const { sendWelcomeEmail, sendBirthdayDiscount } = require('../utils/emailService');
const { sendBirthdayDiscountSMS } = require('../utils/smsService');

const router = express.Router();

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// Register
router.post('/register', [
    body('name').notEmpty().withMessage('Ad tələb olunur'),
    body('email').isEmail().withMessage('Düzgün email daxil edin'),
    body('password').isLength({ min: 6 }).withMessage('Şifrə minimum 6 simvol olmalıdır'),
    body('referralCode').optional()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { name, email, password, phone, referralCode } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Bu email artıq qeydiyyatdan keçib' });
        }
        
        // Create user
        const user = await User.create({ name, email, password, phone });
        
        // Handle referral
        if (referralCode) {
            const referrer = await User.findOne({ referralCode });
            if (referrer) {
                user.referredBy = referrer._id;
                await user.save();
                
                // Give points to referrer
                referrer.referralCount += 1;
                referrer.referralPoints += 50;
                referrer.points += 50;
                await referrer.save();
                
                // Give discount to new user
                await Coupon.create({
                    code: `REF${user.referralCode}`,
                    discount: 10,
                    userSpecific: user._id,
                    isReferral: true,
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                });
            }
        }
        
        // Create welcome coupon
        await Coupon.create({
            code: `WELCOME${user.referralCode}`,
            discount: 10,
            minAmount: 50,
            userSpecific: user._id,
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
        
        // Send welcome email
        await sendWelcomeEmail(email, name);
        
        // Generate token
        const token = generateToken(user._id);
        
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                points: user.points,
                tier: user.tier,
                referralCode: user.referralCode
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login
router.post('/login', [
    body('email').isEmail(),
    body('password').notEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Email və ya şifrə yanlışdır' });
        }
        
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        
        // Check birthday today
        const today = new Date();
        if (user.birthday) {
            const birthday = new Date(user.birthday);
            if (birthday.getDate() === today.getDate() && 
                birthday.getMonth() === today.getMonth() && 
                !user.birthdayDiscountUsed) {
                
                // Send birthday discount
                const discountCode = `BDAY${user.referralCode}`;
                await Coupon.create({
                    code: discountCode,
                    discount: 20,
                    userSpecific: user._id,
                    isBirthday: true,
                    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                });
                
                await sendBirthdayDiscount(email, user.name, discountCode);
                if (user.phone) {
                    await sendBirthdayDiscountSMS(user.phone, discountCode);
                }
                
                user.birthdayDiscountUsed = true;
                await user.save();
            }
        }
        
        const token = generateToken(user._id);
        
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                points: user.points,
                tier: user.tier,
                referralCode: user.referralCode,
                referralPoints: user.referralPoints
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;