const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');
const ExcelJS = require('exceljs');

const router = express.Router();

// Get dashboard stats
router.get('/dashboard', protect, admin, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        // Today's stats
        const todayOrders = await Order.find({ createdAt: { $gte: today } });
        const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
        
        // Week stats
        const weekOrders = await Order.find({ createdAt: { $gte: weekAgo } });
        const weekRevenue = weekOrders.reduce((sum, o) => sum + o.total, 0);
        
        // Month stats
        const monthOrders = await Order.find({ createdAt: { $gte: monthAgo } });
        const monthRevenue = monthOrders.reduce((sum, o) => sum + o.total, 0);
        
        // Total stats
        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        
        // Best selling products
        const bestSellers = await Product.find().sort('-sales').limit(10);
        
        // Most viewed products
        const mostViewed = await Product.find().sort('-views').limit(10);
        
        // Daily sales for chart
        const dailySales = await Order.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    total: { $sum: '$total' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 30 }
        ]);
        
        // Orders by status
        const ordersByStatus = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        
        // User tier distribution
        const usersByTier = await User.aggregate([
            { $group: { _id: '$tier', count: { $sum: 1 } } }
        ]);
        
        res.json({
            success: true,
            today: { revenue: todayRevenue, orders: todayOrders.length },
            week: { revenue: weekRevenue, orders: weekOrders.length },
            month: { revenue: monthRevenue, orders: monthOrders.length },
            total: {
                revenue: totalRevenue[0]?.total || 0,
                orders: totalOrders,
                users: totalUsers,
                products: totalProducts
            },
            bestSellers,
            mostViewed,
            dailySales,
            ordersByStatus,
            usersByTier
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Export report to Excel
router.get('/export/excel', protect, admin, async (req, res) => {
    try {
        const { startDate, endDate, type = 'orders' } = req.query;
        
        const query = {};
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        const workbook = new ExcelJS.Workbook();
        
        if (type === 'orders') {
            const orders = await Order.find(query)
                .populate('user', 'name email')
                .sort('-createdAt');
            
            const worksheet = workbook.addWorksheet('Sifarişlər');
            
            worksheet.columns = [
                { header: 'Sifariş №', key: 'orderNumber', width: 20 },
                { header: 'Müştəri', key: 'customer', width: 20 },
                { header: 'Email', key: 'email', width: 30 },
                { header: 'Məbləğ', key: 'total', width: 15 },
                { header: 'Status', key: 'status', width: 15 },
                { header: 'Tarix', key: 'date', width: 20 }
            ];
            
            orders.forEach(order => {
                worksheet.addRow({
                    orderNumber: order.orderNumber,
                    customer: order.user?.name || 'Guest',
                    email: order.user?.email || '-',
                    total: `${order.total} ₼`,
                    status: order.status,
                    date: order.createdAt.toLocaleDateString('az-AZ')
                });
            });
        } else if (type === 'products') {
            const products = await Product.find().sort('-sales');
            
            const worksheet = workbook.addWorksheet('Məhsullar');
            
            worksheet.columns = [
                { header: 'Ad', key: 'name', width: 30 },
                { header: 'Kateqoriya', key: 'category', width: 15 },
                { header: 'Qiymət', key: 'price', width: 15 },
                { header: 'Satış sayı', key: 'sales', width: 15 },
                { header: 'Baxış', key: 'views', width: 15 },
                { header: 'Stok', key: 'stock', width: 15 }
            ];
            
            products.forEach(product => {
                worksheet.addRow({
                    name: product.name,
                    category: product.category,
                    price: `${product.price} ₼`,
                    sales: product.sales,
                    views: product.views,
                    stock: product.stock
                });
            });
        } else if (type === 'users') {
            const users = await User.find().sort('-totalSpent');
            
            const worksheet = workbook.addWorksheet('İstifadəçilər');
            
            worksheet.columns = [
                { header: 'Ad', key: 'name', width: 20 },
                { header: 'Email', key: 'email', width: 30 },
                { header: 'Sifariş sayı', key: 'orders', width: 15 },
                { header: 'Xərcləmə', key: 'spent', width: 15 },
                { header: 'Səviyyə', key: 'tier', width: 15 },
                { header: 'Bal', key: 'points', width: 12 },
                { header: 'Qeydiyyat', key: 'date', width: 20 }
            ];
            
            users.forEach(user => {
                worksheet.addRow({
                    name: user.name,
                    email: user.email,
                    orders: user.orderCount,
                    spent: `${user.totalSpent} ₼`,
                    tier: user.tier,
                    points: user.points,
                    date: user.createdAt.toLocaleDateString('az-AZ')
                });
            });
        }
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=ismart_report_${Date.now()}.xlsx`);
        
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Track product view
router.post('/track-view', async (req, res) => {
    try {
        const { productId } = req.body;
        await Product.findByIdAndUpdate(productId, { $inc: { views: 1 } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Track banner click
router.post('/track-banner-click', async (req, res) => {
    try {
        const { bannerId } = req.body;
        const Banner = require('../models/Banner');
        await Banner.findByIdAndUpdate(bannerId, { $inc: { clicks: 1 } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;