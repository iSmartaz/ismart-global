// API Service - Backend ilə əlaqə
const API_URL = 'http://localhost:5000/api';

let authToken = localStorage.getItem('token');

const api = {
    // Headers
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        };
    },
    
    // Auth
    async register(userData) {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            authToken = data.token;
        }
        return data;
    },
    
    async login(credentials) {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        const data = await response.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            authToken = data.token;
        }
        return data;
    },
    
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        authToken = null;
        window.location.href = '/';
    },
    
    // Products
    async getProducts(filters = {}) {
        const params = new URLSearchParams(filters);
        const response = await fetch(`${API_URL}/products?${params}`);
        return response.json();
    },
    
    async getProduct(id) {
        const response = await fetch(`${API_URL}/products/${id}`);
        return response.json();
    },
    
    async createProduct(productData) {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(productData)
        });
        return response.json();
    },
    
    async updateProduct(id, productData) {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(productData)
        });
        return response.json();
    },
    
    async deleteProduct(id) {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return response.json();
    },
    
    // Orders
    async createOrder(orderData) {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(orderData)
        });
        return response.json();
    },
    
    async getMyOrders() {
        const response = await fetch(`${API_URL}/orders/my-orders`, {
            headers: this.getHeaders()
        });
        return response.json();
    },
    
    async getOrder(id) {
        const response = await fetch(`${API_URL}/orders/${id}`, {
            headers: this.getHeaders()
        });
        return response.json();
    },
    
    // Reviews
    async createReview(reviewData) {
        const response = await fetch(`${API_URL}/products/reviews`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(reviewData)
        });
        return response.json();
    },
    
    async markReviewHelpful(reviewId) {
        const response = await fetch(`${API_URL}/products/reviews/${reviewId}/helpful`, {
            method: 'POST',
            headers: this.getHeaders()
        });
        return response.json();
    },
    
    // Coupons
    async validateCoupon(code, subtotal) {
        const response = await fetch(`${API_URL}/products/coupons/validate`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ code, subtotal })
        });
        return response.json();
    },
    
    // Payment
    async createMillionPayment(orderId, amount, description) {
        const response = await fetch(`${API_URL}/payment/create-million`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ orderId, amount, description })
        });
        return response.json();
    },
    
    async checkPaymentStatus(paymentId) {
        const response = await fetch(`${API_URL}/payment/check/${paymentId}`, {
            headers: this.getHeaders()
        });
        return response.json();
    },
    
    // User
    async updateProfile(userData) {
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(userData)
        });
        return response.json();
    },
    
    async addToFavorites(productId) {
        const response = await fetch(`${API_URL}/users/favorites`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ productId })
        });
        return response.json();
    },
    
    async getFavorites() {
        const response = await fetch(`${API_URL}/users/favorites`, {
            headers: this.getHeaders()
        });
        return response.json();
    },
    
    // Analytics (Admin only)
    async getDashboardStats() {
        const response = await fetch(`${API_URL}/analytics/dashboard`, {
            headers: this.getHeaders()
        });
        return response.json();
    },
    
    async exportReport(type, startDate, endDate) {
        const params = new URLSearchParams({ type, startDate, endDate });
        window.open(`${API_URL}/analytics/export/excel?${params}`, '_blank');
    }
};

// Socket.IO for real-time
let socket = null;

function initSocket() {
    socket = io('http://localhost:5000');
    
    socket.on('connect', () => {
        console.log('Socket connected');
        if (authToken) {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            socket.emit('join-user', user.id);
        }
    });
    
    socket.on('order-status', (data) => {
        // Show notification
        if (Notification.permission === 'granted') {
            new Notification(`Sifariş #${data.orderNumber}`, {
                body: `Status: ${data.status}`,
                icon: '/images/logo.jpeg'
            });
        }
    });
    
    return socket;
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission();
    }
}