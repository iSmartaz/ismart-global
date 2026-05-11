// iSmart.az - API Service (Backend ilə əlaqə üçün)

const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://ismart-backend.onrender.com/api';

const api = {
    // Health check
    async health() {
        try {
            const response = await fetch(`${API_URL}/health`);
            return await response.json();
        } catch (error) {
            console.error('API sağlamlıq xətası:', error);
            return { status: 'offline' };
        }
    },
    
    // Məhsullar
    async getProducts() {
        try {
            const response = await fetch(`${API_URL}/products`);
            return await response.json();
        } catch (error) {
            console.error('Məhsulları yükləmək xətası:', error);
            return [];
        }
    },
    
    // Sifariş yarat
    async createOrder(orderData) {
        try {
            const response = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            return await response.json();
        } catch (error) {
            console.error('Sifariş xətası:', error);
            return { success: false, error: error.message };
        }
    }
};

// Backend varsa istifadə et, yoxdursa Firebase davam etsin
console.log('API Service hazırdır. Backend URL:', API_URL);