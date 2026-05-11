const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// API endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server işləyir', time: new Date().toISOString() });
});

// Bütün digər sorğular üçün index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server ${PORT} portunda işləyir`);
    console.log(`📍 http://localhost:${PORT}`);
});