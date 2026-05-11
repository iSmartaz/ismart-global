const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ismart');
        console.log(`✅ MongoDB bağlandı: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB xətası: ${error.message}`);
        // Xəta olsa belə server dayanmasın
        return null;
    }
};

module.exports = connectDB;