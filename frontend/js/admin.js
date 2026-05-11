const ADMIN_USER = "admin";
const ADMIN_PASS = "iSmart2026";
const currencySymbols = { AZN: "₼", USD: "$", EUR: "€", TRY: "₺" };

let loginAttempts = 0;
let lockUntil = null;
let currentLockLevel = 0;
let countdownInterval = null;
const MAX_ATTEMPTS = 5;

const LOCK_TIMES = { 1: 59 * 1000, 2: 5 * 60 * 1000, 3: 15 * 60 * 1000 };
let sessionTimer = null;

let revenueChart = null;

function saveLockData() {
    localStorage.setItem("adminLockData", JSON.stringify({ lockUntil: lockUntil ? lockUntil.getTime() : null, currentLockLevel, loginAttempts }));
}

function loadLockData() {
    const saved = localStorage.getItem("adminLockData");
    if (saved) {
        try {
            const lockData = JSON.parse(saved);
            if (lockData.lockUntil) {
                lockUntil = new Date(lockData.lockUntil);
                currentLockLevel = lockData.currentLockLevel || 0;
                loginAttempts = lockData.loginAttempts || 0;
                if (lockUntil && new Date() >= lockUntil) clearLockData();
                else if (lockUntil && new Date() < lockUntil) { startCountdown(); updateCountdown(); }
            }
        } catch(e) { console.error(e); }
    }
}

function clearLockData() {
    localStorage.removeItem("adminLockData");
    lockUntil = null; currentLockLevel = 0; loginAttempts = 0;
    if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
}

const modelsByBrand = {
    "Apple": ["iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16", "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15"],
    "Samsung": ["Galaxy S24 Ultra", "Galaxy S24+", "Galaxy S24", "Galaxy A55", "Galaxy Z Fold 6"],
    "Xiaomi": ["Xiaomi 14 Pro", "Xiaomi 14", "Redmi Note 13 Pro+", "POCO F6 Pro"]
};

const phoneSpecs = {
    "iPhone 16 Pro Max": { storage: ["256GB", "512GB", "1TB"], colors: ["Black", "White", "Natural"] },
    "iPhone 16 Pro": { storage: ["128GB", "256GB", "512GB", "1TB"], colors: ["Black", "White", "Natural"] },
    "iPhone 16": { storage: ["128GB", "256GB", "512GB"], colors: ["Black", "White", "Blue", "Pink"] },
    "iPhone 15 Pro Max": { storage: ["256GB", "512GB", "1TB"], colors: ["Black", "White", "Blue"] },
    "iPhone 15 Pro": { storage: ["128GB", "256GB", "512GB", "1TB"], colors: ["Black", "White", "Blue"] },
    "iPhone 15": { storage: ["128GB", "256GB", "512GB"], colors: ["Black", "White", "Blue", "Green", "Yellow"] },
    "Samsung Galaxy S24 Ultra": { storage: ["256GB", "512GB", "1TB"], colors: ["Titanium Gray", "Titanium Black", "Titanium Violet"] }
};

const DEFAULT_PRODUCTS = [
    { id: "1", category: "phones", name: "iPhone 15 Pro", price: 2499, discountedPrice: null, discount: 0, currency: "AZN", meta: "128GB · Natural", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/IPhone_15_pro.png/300px-IPhone_15_pro.png", specs: "6.1 ekran, 48 MP", stock: "Stokda var", brand: "Apple", model: "iPhone 15 Pro", storage: "128GB", color: "Natural", condition: "yeni", quantity: 10 },
    { id: "2", category: "phones", name: "Samsung Galaxy S24 Ultra", price: 2699, discountedPrice: null, discount: 0, currency: "AZN", meta: "256GB · Titanium Gray", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Samsung_Galaxy_S24_Ultra_in_Titanium_Gray.png/300px-Samsung_Galaxy_S24_Ultra_in_Titanium_Gray.png", specs: "6.8 ekran, 200 MP", stock: "Stokda var", brand: "Samsung", model: "Galaxy S24 Ultra", storage: "256GB", color: "Titanium Gray", condition: "yeni", quantity: 8 },
    { id: "3", category: "phones", name: "Xiaomi 14 Pro", price: 1599, discountedPrice: null, discount: 0, currency: "AZN", meta: "512GB · Black", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Xiaomi_14_Pro.jpg/300px-Xiaomi_14_Pro.jpg", specs: "AMOLED, 120W", stock: "Stokda var", brand: "Xiaomi", model: "14 Pro", storage: "512GB", color: "Black", condition: "yeni", quantity: 15 },
    { id: "4", category: "accessories", name: "AirPods Pro 2", price: 399, discountedPrice: null, discount: 0, currency: "AZN", meta: "USB-C", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/AirPods_Pro_2nd_generation.png/300px-AirPods_Pro_2nd_generation.png", specs: "ANC, Apple", stock: "Stokda var", brand: "Apple", condition: "yeni", quantity: 20 },
    { id: "5", category: "repair", name: "Ekran dəyişimi", price: 199, discountedPrice: null, discount: 0, currency: "AZN", meta: "Modelə görə", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Smartphone_cracked_screen.jpg/300px-Smartphone_cracked_screen.jpg", specs: "iPhone, Samsung", stock: "Stokda var", brand: "Repair", condition: "temirli", quantity: 999 }
];

const DEFAULT_CAMPAIGNS = [
    { id: "1", title: "0% Faiz 12 Ay", description: "Bütün telefonlarda 12 ay 0% faiz", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/IPhone_15_pro.png/150px-IPhone_15_pro.png", link: "telefonlar.html", status: "active", order: 1 }
];

const DEFAULT_COUPONS = [
    { id: "1", code: "SAVE10", discount: 10, minAmount: 100, expiry: "2026-12-31", active: "active" }
];

// DOM elementləri
const loginPanel = document.getElementById("loginPanel");
const adminDashboard = document.getElementById("adminDashboard");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const productForm = document.getElementById("productForm");
const productList = document.getElementById("adminProducts");
const imageInput = document.getElementById("productImage");
const imageFileInput = document.getElementById("productImageFile");
const imagePreview = document.getElementById("imagePreview");
let selectedImageData = "";

const categorySelect = document.getElementById("productCategory");
const phoneFields = document.getElementById("phoneFields");
const accessoryFields = document.getElementById("accessoryFields");
const repairFields = document.getElementById("repairFields");
const autoNameGroup = document.getElementById("autoNameGroup");
const productNameInput = document.getElementById("productName");
const productPrice = document.getElementById("productPrice");
const productDiscount = document.getElementById("productDiscount");
const productDiscountedPrice = document.getElementById("productDiscountedPrice");
const productMeta = document.getElementById("productMeta");
const productSpecs = document.getElementById("productSpecs");
const productStock = document.getElementById("productStock");
const productCondition = document.getElementById("productCondition");
const phoneBrand = document.getElementById("phoneBrand");
const phoneModel = document.getElementById("phoneModel");
const phoneStorage = document.getElementById("phoneStorage");
const phoneColor = document.getElementById("phoneColor");
const phoneInstallment = document.getElementById("phoneInstallment");
const phoneWarranty = document.getElementById("phoneWarranty");
const accessoryType = document.getElementById("accessoryType");
const accessoryInstallment = document.getElementById("accessoryInstallment");
const repairType = document.getElementById("repairType");

let selectedCurrency = "AZN";

// Valyuta seçimi
document.querySelectorAll('input[name="currency"]').forEach(radio => {
    radio.addEventListener("change", function() { if (this.checked) selectedCurrency = this.value; });
});

// ========== LOCK FUNKSİYALARI ==========
function updateCountdown() {
    const lockStatus = isLocked();
    const submitBtn = loginForm?.querySelector('button[type="submit"]');
    const usernameInput = document.getElementById("adminUser");
    const passwordInput = document.getElementById("adminPass");
    if (lockStatus.locked) {
        if (usernameInput) usernameInput.disabled = true;
        if (passwordInput) passwordInput.disabled = true;
        if (submitBtn) submitBtn.disabled = true;
        let timeText = lockStatus.level === 1 ? `${lockStatus.remaining} saniyə` : `${Math.floor(lockStatus.remaining / 60)} dəqiqə ${lockStatus.remaining % 60} saniyə`;
        loginError.innerHTML = `<i class="fa-solid fa-hourglass-half"></i> Hesab bloklanmışdır! ${timeText} gözləyin...`;
        if (submitBtn) submitBtn.textContent = `Bloklanmış (${timeText})`;
    } else {
        if (usernameInput) usernameInput.disabled = false;
        if (passwordInput) passwordInput.disabled = false;
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Daxil ol"; }
        if (loginError.innerHTML.includes("Bloklanmış")) {
            loginError.innerHTML = "✅ Bloklanma bitdi! İndi daxil ola bilərsiniz.";
            setTimeout(() => { if (loginError.innerHTML === "✅ Bloklanma bitdi! İndi daxil ola bilərsiniz.") loginError.innerHTML = ""; }, 3000);
            clearLockData();
        }
    }
}

function isLocked() {
    if (lockUntil && new Date() < lockUntil) return { locked: true, remaining: Math.ceil((lockUntil - new Date()) / 1000), level: currentLockLevel };
    return { locked: false, remaining: 0, level: 0 };
}

function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        updateCountdown();
        if (!isLocked().locked) { clearInterval(countdownInterval); countdownInterval = null; clearLockData(); }
        else saveLockData();
    }, 1000);
}

function applyLock() {
    currentLockLevel = Math.min(currentLockLevel + 1, 3);
    lockUntil = new Date(Date.now() + LOCK_TIMES[currentLockLevel]);
    saveLockData();
    startCountdown();
    updateCountdown();
    return { level: currentLockLevel };
}

function handleFailedLogin(errorType) {
    loginAttempts++;
    saveLockData();
    if (loginAttempts >= MAX_ATTEMPTS) {
        const lockInfo = applyLock();
        loginAttempts = 0;
        let message = lockInfo.level === 1 ? "🔒 5 səhv cəhd! Hesab 59 saniyəlik bloklanmışdır!" : lockInfo.level === 2 ? "🔒 5 səhv cəhd! Hesab 5 dəqiqəlik bloklanmışdır!" : "🔒 5 səhv cəhd! Hesab 15 dəqiqəlik bloklanmışdır!";
        loginError.innerHTML = `<i class="fa-solid fa-lock"></i> ${message}`;
        return false;
    }
    const remainingAttempts = MAX_ATTEMPTS - loginAttempts;
    loginError.innerHTML = errorType === "username" ? `❌ İstifadəçi adı yanlışdır! ${remainingAttempts} cəhd qaldı.` : `❌ Şifrə yanlışdır! ${remainingAttempts} cəhd qaldı.`;
    document.getElementById("adminPass").value = "";
    return false;
}

function handleSuccessfulLogin() {
    loginAttempts = 0; currentLockLevel = 0; lockUntil = null;
    clearLockData();
    if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
    sessionStorage.setItem("ismartAdmin", "true");
    sessionStorage.setItem("adminLoginTime", Date.now().toString());
    loginPanel.style.display = "none";
    adminDashboard.style.display = "block";
    renderProducts(); renderCampaigns(); renderCoupons(); renderUsers(); updateStats();
    initAdminChart();
    startSessionTimer();
}

function startSessionTimer() {
    if (sessionTimer) clearTimeout(sessionTimer);
    sessionTimer = setTimeout(() => logoutUser(), 30 * 60 * 1000);
}

function resetSessionTimer() { if (sessionTimer) { clearTimeout(sessionTimer); startSessionTimer(); } }

function logoutUser() {
    sessionStorage.removeItem("ismartAdmin"); sessionStorage.removeItem("adminLoginTime");
    adminDashboard.style.display = "none"; loginPanel.style.display = "flex";
    const lockStatus = isLocked();
    const usernameInput = document.getElementById("adminUser");
    const passwordInput = document.getElementById("adminPass");
    const submitBtn = loginForm?.querySelector('button[type="submit"]');
    if (usernameInput) { usernameInput.value = ""; usernameInput.disabled = lockStatus.locked; }
    if (passwordInput) { passwordInput.value = ""; passwordInput.disabled = lockStatus.locked; }
    if (submitBtn) { submitBtn.disabled = lockStatus.locked; if (!lockStatus.locked) submitBtn.textContent = "Daxil ol"; }
    if (lockStatus.locked) updateCountdown(); else loginError.innerHTML = "";
}

// Event listener-lər
document.addEventListener("click", () => { if (adminDashboard?.style.display === "block") resetSessionTimer(); });
document.addEventListener("keypress", () => { if (adminDashboard?.style.display === "block") resetSessionTimer(); });
document.addEventListener("mousemove", () => { if (adminDashboard?.style.display === "block") resetSessionTimer(); });

function checkSessionTimeout() {
    const loginTime = sessionStorage.getItem("adminLoginTime");
    if (loginTime && Date.now() - parseInt(loginTime) > 30 * 60 * 1000) { logoutUser(); return false; }
    return true;
}

// ========== LOGIN FORM ==========
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    loginError.innerHTML = "";
    const lockStatus = isLocked();
    if (lockStatus.locked) {
        let timeText = lockStatus.level === 1 ? `${lockStatus.remaining} saniyə` : `${Math.floor(lockStatus.remaining / 60)} dəqiqə ${lockStatus.remaining % 60} saniyə`;
        loginError.innerHTML = `<i class="fa-solid fa-hourglass-half"></i> Hesab bloklanmışdır! ${timeText} gözləyin...`;
        return;
    }
    const username = document.getElementById("adminUser").value.trim();
    const password = document.getElementById("adminPass").value;
    if (!username) { loginError.innerHTML = "⚠️ İstifadəçi adını daxil edin!"; return; }
    if (!password) { loginError.innerHTML = "⚠️ Şifrəni daxil edin!"; return; }
    if (username !== ADMIN_USER) { handleFailedLogin("username"); return; }
    if (password !== ADMIN_PASS) { handleFailedLogin("password"); return; }
    loginError.innerHTML = "✅ Giriş uğurludur! Yönləndirilir...";
    setTimeout(() => handleSuccessfulLogin(), 500);
});

document.getElementById("logoutBtn")?.addEventListener("click", () => logoutUser());

// ========== QRAFİK ==========
async function initAdminChart() {
    const ctx = document.getElementById('revenueChart')?.getContext('2d');
    if (!ctx) return;
    
    const orders = JSON.parse(localStorage.getItem("ismartOrders") || "[]");
    const dailyData = {};
    
    orders.forEach(order => {
        const date = new Date(order.date).toLocaleDateString();
        dailyData[date] = (dailyData[date] || 0) + (order.total || 0);
    });
    
    const labels = Object.keys(dailyData).slice(-30);
    const data = labels.map(label => dailyData[label]);
    
    if (revenueChart) revenueChart.destroy();
    
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Gündəlik gəlir (AZN)',
                data: data,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#2563eb',
                pointBorderColor: '#fff',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'AZN' } },
                x: { title: { display: true, text: 'Tarix' } }
            }
        }
    });
}

// ========== HESABAT İXRACI ==========
function exportReport(type) {
    const orders = JSON.parse(localStorage.getItem("ismartOrders") || "[]");
    const products = getProducts();
    const users = getUsers();
    
    let data = [];
    let filename = "";
    
    if (type === 'orders') {
        data = orders.map(o => ({
            'Sifariş №': o.id,
            'Müştəri': o.userName || '-',
            'Email': o.userEmail || '-',
            'Məbləğ': o.total,
            'Status': o.status,
            'Tarix': new Date(o.date).toLocaleDateString('az-AZ')
        }));
        filename = 'sifarisler.csv';
    } else if (type === 'products') {
        data = products.map(p => ({
            'Ad': p.name,
            'Kateqoriya': p.category,
            'Qiymət': p.price,
            'Satış': p.sales || 0,
            'Stok': p.quantity || 0
        }));
        filename = 'mehsullar.csv';
    } else if (type === 'users') {
        data = users.map(u => ({
            'Ad': u.name,
            'Email': u.email,
            'Sifariş sayı': u.orderCount || 0,
            'Xərcləmə': u.totalSpent || 0,
            'Səviyyə': u.tier || 'Bronze',
            'Qeydiyyat': new Date(u.createdAt).toLocaleDateString('az-AZ')
        }));
        filename = 'istifadeciler.csv';
    }
    
    const headers = Object.keys(data[0] || {});
    const csvRows = [];
    csvRows.push(headers.join(','));
    for (const row of data) {
        const values = headers.map(header => {
            const val = row[header];
            return `"${String(val).replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast(`✅ ${filename} ixrac edildi!`, "success");
}

function addExportButtons() {
    const statsGrid = document.querySelector('.stats-grid');
    if (statsGrid && !document.getElementById('exportOrdersBtn')) {
        const exportDiv = document.createElement('div');
        exportDiv.className = 'stat-card';
        exportDiv.innerHTML = `
            <div class="stat-number"><i class="fa-solid fa-download"></i></div>
            <div class="stat-label">Hesabat ixrac</div>
            <div style="display: flex; gap: 8px; margin-top: 12px;">
                <button class="export-btn" data-type="orders" style="background: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 20px; cursor: pointer;">📊 Sifarişlər</button>
                <button class="export-btn" data-type="products" style="background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 20px; cursor: pointer;">📦 Məhsullar</button>
                <button class="export-btn" data-type="users" style="background: #f59e0b; color: white; border: none; padding: 6px 12px; border-radius: 20px; cursor: pointer;">👥 İstifadəçilər</button>
            </div>
        `;
        statsGrid.appendChild(exportDiv);
        
        document.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', () => exportReport(btn.dataset.type));
        });
    }
}

// ========== SİFARİŞ GÖSTERİMİ ==========
function renderAdminOrders() {
    const orders = JSON.parse(localStorage.getItem("ismartOrders") || "[]");
    const container = document.getElementById("adminOrdersList");
    
    if (!container) {
        const adminUsersDiv = document.querySelector('.admin-users');
        if (adminUsersDiv) {
            const ordersDiv = document.createElement('div');
            ordersDiv.className = 'admin-campaigns';
            ordersDiv.innerHTML = `
                <div class="admin-list-head">
                    <h2><i class="fa-solid fa-truck"></i> Son Sifarişlər</h2>
                    <a href="orders.html" class="btn ghost-btn" target="_blank">Bütün sifarişlərə bax →</a>
                </div>
                <div id="adminOrdersList"></div>
            `;
            adminUsersDiv.parentNode.insertBefore(ordersDiv, adminUsersDiv);
        }
        return;
    }
    
    if (orders.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">📭 Heç bir sifariş yoxdur</div>';
        return;
    }
    
    const recentOrders = orders.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
    
    container.innerHTML = recentOrders.map(order => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #e2e8f0; background:#f8fafc; border-radius:15px; margin-bottom:10px;">
            <div>
                <strong>${order.id}</strong><br>
                <small>${new Date(order.date).toLocaleString('az-AZ')}</small>
            </div>
            <div>
                ${order.userName || '-'}<br>
                ${order.shippingAddress?.phone || order.userPhone || '-'}
            </div>
            <div>
                <strong>${order.total} ₼</strong>
            </div>
            <div>
                <span style="padding:4px 12px; border-radius:20px; font-size:12px; background:${order.status === 'pending' ? '#fef3c7' : '#d1fae5'}; color:${order.status === 'pending' ? '#d97706' : '#059669'}">
                    ${order.status === 'pending' ? '⏳ Gözləmədə' : order.status === 'confirmed' ? '✅ Təsdiqlənmiş' : order.status === 'shipped' ? '🚚 Yolda' : '📦 Çatdırılmış'}
                </span>
            </div>
            <div>
                <button onclick="viewOrderDetails('${order.id}')" style="background:#2563eb; color:white; border:none; padding:5px 15px; border-radius:20px; cursor:pointer;">📋 Bax</button>
            </div>
        </div>
    `).join("");
}

window.viewOrderDetails = function(orderId) {
    const orders = JSON.parse(localStorage.getItem("ismartOrders") || "[]");
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    alert(`
Sifariş №: ${order.id}
Tarix: ${new Date(order.date).toLocaleString()}
Müştəri: ${order.userName || '-'}
Email: ${order.userEmail || '-'}
Telefon: ${order.shippingAddress?.phone || '-'}
Ünvan: ${order.shippingAddress?.address || '-'}
Məhsullar: ${order.items?.map(i => `${i.name} x ${i.quantity}`).join(', ') || '-'}
Cəmi: ${order.total} ₼
Status: ${order.status === 'pending' ? 'Gözləmədə' : order.status === 'confirmed' ? 'Təsdiqlənmiş' : order.status === 'shipped' ? 'Yolda' : 'Çatdırılmış'}
    `);
};

// ========== KÖMƏKÇİ FUNKSİYALAR ==========
function escapeHtml(s) { if (!s) return ""; return s.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'); }

function getUsers() {
    const saved = localStorage.getItem("ismartUsers");
    if (!saved) { 
        const defaultUsers = [{ id: "1", name: "Test İstifadəçi", email: "test@ismart.az", password: "123456", orders: [], createdAt: new Date().toISOString() }];
        localStorage.setItem("ismartUsers", JSON.stringify(defaultUsers)); 
        return defaultUsers; 
    }
    return JSON.parse(saved);
}

function saveUsers(users) { localStorage.setItem("ismartUsers", JSON.stringify(users)); }

function renderUsers() {
    const container = document.getElementById("adminUsersList");
    if (!container) return;
    const users = getUsers();
    container.innerHTML = users.map(user => `
        <div class="user-row" style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #e2e8f0;">
            <div class="user-avatar" style="width:50px; height:50px; background:linear-gradient(135deg, #2563eb, #1d4ed8); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white;"><i class="fa-regular fa-circle-user"></i></div>
            <div class="user-info" style="flex:1; margin-left:15px;">
                <h4>${escapeHtml(user.name)}</h4>
                <p>${escapeHtml(user.email)}</p>
                <small>Qeydiyyat: ${new Date(user.createdAt).toLocaleDateString('az-AZ')}</small>
            </div>
            <div class="user-actions">
                <button class="delete-user-btn" data-id="${user.id}" style="background:#ef4444; color:white; border:none; padding:5px 15px; border-radius:20px; cursor:pointer;">Sil</button>
            </div>
        </div>
    `).join("");
    
    document.querySelectorAll(".delete-user-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            if (confirm("Bu istifadəçini silmək istədiyinizə əminsiniz?")) {
                let users = getUsers().filter(u => u.id !== btn.dataset.id);
                saveUsers(users);
                renderUsers();
                updateStats();
                showToast("✅ İstifadəçi silindi!", "success");
            }
        });
    });
}

function getOrdersCount() {
    const saved = localStorage.getItem("ismartOrders");
    if (!saved) return 0;
    return JSON.parse(saved).length;
}

function getTotalRevenue() {
    const saved = localStorage.getItem("ismartOrders");
    if (!saved) return 0;
    return JSON.parse(saved).reduce((sum, o) => sum + (o.total || 0), 0);
}

function calculateDiscountedPrice() {
    const originalPrice = parseFloat(productPrice.value) || 0;
    const discountPercent = parseFloat(productDiscount.value) || 0;
    if (productDiscountedPrice) {
        productDiscountedPrice.value = discountPercent > 0 ? (originalPrice - (originalPrice * discountPercent / 100)).toFixed(2) : "";
    }
}

if (productPrice) productPrice.addEventListener("input", calculateDiscountedPrice);
if (productDiscount) productDiscount.addEventListener("input", calculateDiscountedPrice);

function getProducts() {
    const saved = localStorage.getItem("ismartProducts");
    if (!saved) { 
        localStorage.setItem("ismartProducts", JSON.stringify(DEFAULT_PRODUCTS)); 
        return DEFAULT_PRODUCTS; 
    }
    return JSON.parse(saved);
}

function saveProducts(products) { 
    localStorage.setItem("ismartProducts", JSON.stringify(products)); 
}

function renderProducts() {
    const products = getProducts();
    if (!productList) return;
    productList.innerHTML = products.map(p => `
        <div class="admin-product-row" style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #ddd;">
            <img src="${p.image}" onerror="this.src='https://placehold.co/60x60'" style="width:50px; height:50px; object-fit:cover; border-radius:10px;">
            <div style="flex:1; margin-left:15px;"><strong>${escapeHtml(p.name)}</strong><br><span>${p.category} · ${currencySymbols[p.currency] || "₼"}${p.price}</span></div>
            <div>
                <button class="edit-product" data-id="${p.id}" style="background:#2563eb; color:white; border:none; padding:5px 15px; border-radius:20px; cursor:pointer;">✏️ Redaktə</button>
                <button class="delete-product" data-id="${p.id}" style="background:#ef4444; color:white; border:none; padding:5px 15px; border-radius:20px; cursor:pointer; margin-left:5px;">🗑️ Sil</button>
            </div>
        </div>
    `).join("");
    
    document.querySelectorAll(".edit-product").forEach(btn => {
        btn.addEventListener("click", () => {
            const product = getProducts().find(p => p.id === btn.dataset.id);
            if (product) fillForm(product);
        });
    });
    
    document.querySelectorAll(".delete-product").forEach(btn => {
        btn.addEventListener("click", () => {
            if (confirm("Bu məhsulu silmək istədiyinizə əminsiniz?")) {
                const products = getProducts().filter(p => p.id !== btn.dataset.id);
                saveProducts(products);
                renderProducts();
                updateStats();
                showToast("✅ Məhsul silindi!", "success");
            }
        });
    });
}

function updateModelsByBrand() {
    const brand = phoneBrand.value;
    phoneModel.innerHTML = '<option value="">Seçin...</option>';
    if (brand && modelsByBrand[brand]) { 
        modelsByBrand[brand].forEach(m => { 
            let opt = document.createElement("option"); 
            opt.value = m; 
            opt.textContent = m; 
            phoneModel.appendChild(opt); 
        }); 
        phoneModel.disabled = false; 
    }
    else phoneModel.disabled = true;
}

function updateStorageAndColor() {
    const model = phoneModel.value;
    phoneStorage.innerHTML = '<option value="">Seçin...</option>';
    phoneColor.innerHTML = '<option value="">Seçin...</option>';
    if (model && phoneSpecs[model]) {
        if (phoneSpecs[model].storage) {
            phoneSpecs[model].storage.forEach(s => { 
                let opt = document.createElement("option"); 
                opt.value = s; 
                opt.textContent = s; 
                phoneStorage.appendChild(opt); 
            });
        }
        if (phoneSpecs[model].colors) {
            phoneSpecs[model].colors.forEach(c => { 
                let opt = document.createElement("option"); 
                opt.value = c; 
                opt.textContent = c; 
                phoneColor.appendChild(opt); 
            });
        }
        phoneStorage.disabled = false; 
        phoneColor.disabled = false;
    } else { 
        phoneStorage.disabled = true; 
        phoneColor.disabled = true; 
    }
    updatePhoneName();
}

function updatePhoneName() {
    const brand = phoneBrand.value, model = phoneModel.value, storage = phoneStorage.value, color = phoneColor.value;
    if (brand && model && storage && color && productNameInput) { 
        productNameInput.value = `${model} ${storage} ${color}`; 
        if (productMeta) productMeta.value = `${storage} · ${color}`;
    }
}

function updateAccessoryName() { if (accessoryType && accessoryType.value && productNameInput) productNameInput.value = accessoryType.value; }
function updateRepairName() { if (repairType && repairType.value && productNameInput) productNameInput.value = repairType.value; }

function toggleCategoryFields() {
    let cat = categorySelect.value;
    if (phoneFields) phoneFields.style.display = "none";
    if (accessoryFields) accessoryFields.style.display = "none";
    if (repairFields) repairFields.style.display = "none";
    if (autoNameGroup) autoNameGroup.style.display = "none";
    
    if (cat === "phones") { 
        if (phoneFields) phoneFields.style.display = "block"; 
        if (autoNameGroup) autoNameGroup.style.display = "block"; 
        if (phoneBrand) phoneBrand.onchange = () => { updateModelsByBrand(); updatePhoneName(); }; 
        if (phoneModel) phoneModel.onchange = updateStorageAndColor; 
        if (phoneStorage) phoneStorage.onchange = updatePhoneName; 
        if (phoneColor) phoneColor.onchange = updatePhoneName; 
        updateModelsByBrand(); 
    }
    else if (cat === "accessories") { 
        if (accessoryFields) accessoryFields.style.display = "block"; 
        if (autoNameGroup) autoNameGroup.style.display = "block"; 
        if (accessoryType) accessoryType.onchange = updateAccessoryName; 
    }
    else if (cat === "repair") { 
        if (repairFields) repairFields.style.display = "block"; 
        if (autoNameGroup) autoNameGroup.style.display = "block"; 
        if (repairType) repairType.onchange = updateRepairName; 
    }
}

function fillForm(p) {
    const productIdField = document.getElementById("productId");
    if (productIdField) productIdField.value = p.id;
    if (categorySelect) categorySelect.value = p.category;
    selectedCurrency = p.currency || "AZN";
    let cr = document.querySelector(`input[name="currency"][value="${selectedCurrency}"]`);
    if (cr) cr.checked = true;
    if (productCondition) productCondition.value = p.condition || "yeni";
    if (productDiscount) productDiscount.value = p.discount || 0;
    if (productPrice) productPrice.value = p.price;
    calculateDiscountedPrice();
    toggleCategoryFields();
    if (p.category === "phones") {
        if (phoneBrand) phoneBrand.value = p.brand || "";
        setTimeout(() => { 
            if (p.model && phoneModel) phoneModel.value = p.model; 
            updateStorageAndColor(); 
            setTimeout(() => { 
                if (phoneStorage) phoneStorage.value = p.storage || ""; 
                if (phoneColor) phoneColor.value = p.color || ""; 
                updatePhoneName(); 
            }, 50); 
        }, 50);
    } else if (p.category === "accessories") { 
        if (accessoryType) accessoryType.value = p.accessoryType || ""; 
        updateAccessoryName(); 
    } else if (p.category === "repair") { 
        if (repairType) repairType.value = p.repairType || ""; 
        updateRepairName(); 
    }
    if (productMeta) productMeta.value = p.meta || "";
    if (productSpecs) productSpecs.value = p.specs || "";
    if (productStock) productStock.value = p.stock || "";
    if (imageInput) imageInput.value = p.image || "";
    selectedImageData = p.image || "";
    renderImagePreview(selectedImageData);
}

function clearForm() {
    if (productForm) productForm.reset();
    const productIdField = document.getElementById("productId");
    if (productIdField) productIdField.value = "";
    selectedImageData = "";
    renderImagePreview("");
    const aznRadio = document.querySelector('input[name="currency"][value="AZN"]');
    if (aznRadio) aznRadio.checked = true;
    selectedCurrency = "AZN";
    if (productCondition) productCondition.value = "yeni";
    if (productDiscount) productDiscount.value = 0;
    if (productPrice) productPrice.value = "";
    calculateDiscountedPrice();
}

function renderImagePreview(src) {
    if (!imagePreview) return;
    if (!src) { 
        imagePreview.innerHTML = '<i class="fa-regular fa-image"></i> Şəkil önizləməsi'; 
        imagePreview.classList.remove("has-image"); 
        return; 
    }
    imagePreview.innerHTML = `<img src="${src}" style="max-width:100%; max-height:140px;">`; 
    imagePreview.classList.add("has-image");
}

async function readSelectedFile() {
    let f = imageFileInput?.files?.[0];
    if (!f) return "";
    return new Promise((resolve, reject) => { 
        let r = new FileReader(); 
        r.onload = () => resolve(r.result); 
        r.onerror = reject; 
        r.readAsDataURL(f); 
    });
}

function showToast(message, type = "success") {
    let toast = document.querySelector('.admin-toast');
    if (!toast) { 
        toast = document.createElement('div'); 
        toast.className = 'admin-toast'; 
        toast.style.cssText = "position:fixed; bottom:30px; right:30px; background:#10b981; color:white; padding:14px 28px; border-radius:60px; z-index:9999; transform:translateX(200%); transition:transform 0.3s; font-weight:600;";
        document.body.appendChild(toast); 
    }
    toast.textContent = message; 
    toast.style.background = type === "success" ? "#10b981" : "#ef4444"; 
    toast.classList.add('show');
    toast.style.transform = "translateX(0)";
    setTimeout(() => { 
        toast.classList.remove('show');
        toast.style.transform = "translateX(200%)";
    }, 3000);
}

if (categorySelect) categorySelect.addEventListener("change", toggleCategoryFields);
if (imageInput) {
    imageInput.addEventListener("input", () => { 
        selectedImageData = imageInput.value.trim(); 
        renderImagePreview(selectedImageData); 
        if (imageInput.value.trim() && imageFileInput) imageFileInput.value = ""; 
    });
}
if (imageFileInput) {
    imageFileInput.addEventListener("change", async () => { 
        let fd = await readSelectedFile(); 
        if (fd) { 
            selectedImageData = fd; 
            if (imageInput) imageInput.value = ""; 
            renderImagePreview(fd); 
        } 
    });
}

if (productForm) {
    productForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        let products = getProducts();
        let id = document.getElementById("productId")?.value || String(Date.now());
        let category = categorySelect?.value;
        let fd = await readSelectedFile();
        let img = fd || imageInput?.value.trim() || selectedImageData;
        if (!img) { alert("Şəkil əlavə edin!"); return; }
        let originalPrice = parseFloat(productPrice?.value) || 0;
        let discountPercent = parseFloat(productDiscount?.value) || 0;
        let product = { 
            id, 
            category, 
            name: productNameInput?.value || "Məhsul", 
            price: originalPrice, 
            discountedPrice: discountPercent > 0 ? originalPrice - (originalPrice * discountPercent / 100) : null, 
            discount: discountPercent, 
            currency: selectedCurrency, 
            meta: productMeta?.value.trim() || "", 
            image: img, 
            specs: productSpecs?.value.trim() || "", 
            stock: productStock?.value.trim() || "Stokda var", 
            condition: productCondition?.value || "yeni", 
            quantity: parseInt(productStock?.value) || 10 
        };
        
        if (category === "phones") { 
            product.brand = phoneBrand?.value; 
            product.model = phoneModel?.value; 
            product.storage = phoneStorage?.value; 
            product.color = phoneColor?.value; 
            let parts = (phoneInstallment?.value || "12 ay,13%").split(","); 
            product.installment = parts[0]; 
            product.installmentRate = parts[1] || "0%"; 
            product.warranty = phoneWarranty?.value; 
        }
        else if (category === "accessories") { 
            product.accessoryType = accessoryType?.value; 
            let parts = (accessoryInstallment?.value || "6 ay,9%").split(","); 
            product.installment = parts[0]; 
            product.installmentRate = parts[1] || "0%"; 
        }
        else if (category === "repair") { 
            product.repairType = repairType?.value; 
        }
        
        let idx = products.findIndex(i => i.id === id);
        if (idx >= 0) products[idx] = product;
        else products.push(product);
        
        saveProducts(products);
        clearForm();
        renderProducts();
        updateStats();
        alert("✅ Məhsul yadda saxlanıldı!");
    });
}

// Kampaniya funksiyaları
function getCampaigns() {
    const saved = localStorage.getItem("ismartCampaigns");
    if (!saved) { localStorage.setItem("ismartCampaigns", JSON.stringify(DEFAULT_CAMPAIGNS)); return DEFAULT_CAMPAIGNS; }
    return JSON.parse(saved);
}
function saveCampaigns(data) { localStorage.setItem("ismartCampaigns", JSON.stringify(data)); }

function renderCampaigns() {
    const campaigns = getCampaigns();
    const container = document.getElementById("adminCampaigns");
    if (!container) return;
    container.innerHTML = campaigns.sort((a,b) => a.order - b.order).map(c => `
        <div class="campaign-row" style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #ddd;">
            <img src="${c.image}" onerror="this.src='https://placehold.co/80x80'" style="width:60px; height:60px; object-fit:cover; border-radius:10px;">
            <div class="campaign-info" style="flex:1; margin-left:15px;">
                <h4>${escapeHtml(c.title)}</h4>
                <p>${escapeHtml(c.description)}</p>
                <span class="campaign-badge ${c.status}" style="padding:2px 8px; border-radius:20px; font-size:11px; background:${c.status === 'active' ? '#10b981' : '#ef4444'}; color:white;">${c.status === "active" ? "✅ Aktiv" : "❌ Deaktiv"}</span>
            </div>
            <div class="campaign-actions">
                <button class="edit-campaign" data-id="${c.id}" style="background:#2563eb; color:white; border:none; padding:5px 15px; border-radius:20px; cursor:pointer;">✏️ Redaktə</button>
                <button class="delete-campaign" data-id="${c.id}" style="background:#ef4444; color:white; border:none; padding:5px 15px; border-radius:20px; cursor:pointer; margin-left:5px;">🗑️ Sil</button>
            </div>
        </div>
    `).join("");
    
    document.querySelectorAll(".edit-campaign").forEach(btn => btn.addEventListener("click", () => editCampaign(btn.dataset.id)));
    document.querySelectorAll(".delete-campaign").forEach(btn => btn.addEventListener("click", () => { if (confirm("Sil?")) { saveCampaigns(getCampaigns().filter(c => c.id !== btn.dataset.id)); renderCampaigns(); } }));
}

let selectedCampaignImage = "";
function editCampaign(id) {
    let c = getCampaigns().find(c => c.id === id);
    if (!c) return;
    const campaignIdField = document.getElementById("campaignId");
    const campaignTitle = document.getElementById("campaignTitle");
    const campaignDesc = document.getElementById("campaignDesc");
    const campaignImage = document.getElementById("campaignImage");
    const campaignLink = document.getElementById("campaignLink");
    const campaignStatus = document.getElementById("campaignStatus");
    const campaignOrder = document.getElementById("campaignOrder");
    const campaignModalTitle = document.getElementById("campaignModalTitle");
    
    if (campaignIdField) campaignIdField.value = c.id;
    if (campaignTitle) campaignTitle.value = c.title;
    if (campaignDesc) campaignDesc.value = c.description;
    if (campaignImage) campaignImage.value = c.image;
    if (campaignLink) campaignLink.value = c.link;
    if (campaignStatus) campaignStatus.value = c.status;
    if (campaignOrder) campaignOrder.value = c.order;
    if (campaignModalTitle) campaignModalTitle.textContent = "Kampaniya redaktə et";
    
    const campaignModal = document.getElementById("campaignModal");
    if (campaignModal) campaignModal.classList.add("active");
    renderCampaignPreview(c.image);
}
function renderCampaignPreview(src) { 
    let preview = document.getElementById("campaignPreview"); 
    if (!preview) return;
    if (!src) { preview.innerHTML = "Şəkil önizləməsi"; return; } 
    preview.innerHTML = `<img src="${src}" style="max-width:100%; max-height:100px;">`; 
}

const addCampaignBtn = document.getElementById("addCampaignBtn");
if (addCampaignBtn) {
    addCampaignBtn.addEventListener("click", () => {
        const campaignIdField = document.getElementById("campaignId");
        const campaignTitle = document.getElementById("campaignTitle");
        const campaignDesc = document.getElementById("campaignDesc");
        const campaignImage = document.getElementById("campaignImage");
        const campaignLink = document.getElementById("campaignLink");
        const campaignStatus = document.getElementById("campaignStatus");
        const campaignOrder = document.getElementById("campaignOrder");
        const campaignModalTitle = document.getElementById("campaignModalTitle");
        
        if (campaignIdField) campaignIdField.value = "";
        if (campaignTitle) campaignTitle.value = "";
        if (campaignDesc) campaignDesc.value = "";
        if (campaignImage) campaignImage.value = "";
        if (campaignLink) campaignLink.value = "telefonlar.html";
        if (campaignStatus) campaignStatus.value = "active";
        if (campaignOrder) campaignOrder.value = "0";
        if (campaignModalTitle) campaignModalTitle.textContent = "Yeni kampaniya";
        
        const campaignModal = document.getElementById("campaignModal");
        if (campaignModal) campaignModal.classList.add("active");
        
        const campaignPreview = document.getElementById("campaignPreview");
        if (campaignPreview) campaignPreview.innerHTML = "Şəkil önizləməsi";
        selectedCampaignImage = "";
    });
}

const closeCampaignModalBtn = document.getElementById("closeCampaignModalBtn");
if (closeCampaignModalBtn) {
    closeCampaignModalBtn.addEventListener("click", () => {
        const campaignModal = document.getElementById("campaignModal");
        if (campaignModal) campaignModal.classList.remove("active");
    });
}

const campaignImage = document.getElementById("campaignImage");
if (campaignImage) {
    campaignImage.addEventListener("input", (e) => { 
        selectedCampaignImage = e.target.value; 
        renderCampaignPreview(selectedCampaignImage); 
    });
}

const campaignImageFile = document.getElementById("campaignImageFile");
if (campaignImageFile) {
    campaignImageFile.addEventListener("change", async (e) => { 
        let file = e.target.files[0]; 
        if (file) { 
            let reader = new FileReader(); 
            reader.onload = (ev) => { 
                selectedCampaignImage = ev.target.result; 
                renderCampaignPreview(selectedCampaignImage); 
                if (campaignImage) campaignImage.value = ""; 
            }; 
            reader.readAsDataURL(file); 
        } 
    });
}

const saveCampaignBtn = document.getElementById("saveCampaignBtn");
if (saveCampaignBtn) {
    saveCampaignBtn.addEventListener("click", () => {
        let id = document.getElementById("campaignId")?.value || String(Date.now());
        let title = document.getElementById("campaignTitle")?.value.trim();
        let desc = document.getElementById("campaignDesc")?.value.trim();
        let image = selectedCampaignImage || document.getElementById("campaignImage")?.value.trim();
        let link = document.getElementById("campaignLink")?.value;
        let status = document.getElementById("campaignStatus")?.value;
        let order = parseInt(document.getElementById("campaignOrder")?.value) || 0;
        if (!title || !image) { alert("Başlıq və şəkil tələb olunur!"); return; }
        let campaigns = getCampaigns();
        let idx = campaigns.findIndex(c => c.id === id);
        if (idx >= 0) campaigns[idx] = { id, title, description: desc, image, link, status, order };
        else campaigns.push({ id, title, description: desc, image, link, status, order });
        saveCampaigns(campaigns); 
        renderCampaigns(); 
        const campaignModal = document.getElementById("campaignModal");
        if (campaignModal) campaignModal.classList.remove("active"); 
        alert("Kampaniya yadda saxlanıldı!");
    });
}

// Kupon funksiyaları
function getCoupons() {
    const saved = localStorage.getItem("ismartCoupons");
    if (!saved) { localStorage.setItem("ismartCoupons", JSON.stringify(DEFAULT_COUPONS)); return DEFAULT_COUPONS; }
    return JSON.parse(saved);
}
function saveCoupons(data) { localStorage.setItem("ismartCoupons", JSON.stringify(data)); }

function renderCoupons() {
    const coupons = getCoupons();
    const container = document.getElementById("adminCoupons");
    if (!container) return;
    container.innerHTML = coupons.map(c => `
        <div class="coupon-row" style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #ddd;">
            <div class="campaign-info" style="flex:1;">
                <h4>${escapeHtml(c.code)}</h4>
                <p>${c.discount}% endirim | Min: ${c.minAmount} AZN | Bitir: ${c.expiry || 'sonsuz'}</p>
                <span class="campaign-badge ${c.active}" style="padding:2px 8px; border-radius:20px; font-size:11px; background:${c.active === 'active' ? '#10b981' : '#ef4444'}; color:white;">${c.active === "active" ? "✅ Aktiv" : "❌ Deaktiv"}</span>
            </div>
            <div class="campaign-actions">
                <button class="edit-coupon" data-id="${c.id}" style="background:#2563eb; color:white; border:none; padding:5px 15px; border-radius:20px; cursor:pointer;">✏️ Redaktə</button>
                <button class="delete-coupon" data-id="${c.id}" style="background:#ef4444; color:white; border:none; padding:5px 15px; border-radius:20px; cursor:pointer; margin-left:5px;">🗑️ Sil</button>
            </div>
        </div>
    `).join("");
    
    document.querySelectorAll(".edit-coupon").forEach(btn => btn.addEventListener("click", () => editCoupon(btn.dataset.id)));
    document.querySelectorAll(".delete-coupon").forEach(btn => btn.addEventListener("click", () => { if (confirm("Sil?")) { saveCoupons(getCoupons().filter(c => c.id !== btn.dataset.id)); renderCoupons(); } }));
}

function editCoupon(id) {
    let c = getCoupons().find(c => c.id === id);
    if (!c) return;
    const couponIdField = document.getElementById("couponId");
    const couponCodeInput = document.getElementById("couponCodeInput");
    const couponDiscount = document.getElementById("couponDiscount");
    const couponMinAmount = document.getElementById("couponMinAmount");
    const couponExpiry = document.getElementById("couponExpiry");
    const couponActive = document.getElementById("couponActive");
    
    if (couponIdField) couponIdField.value = c.id;
    if (couponCodeInput) couponCodeInput.value = c.code;
    if (couponDiscount) couponDiscount.value = c.discount;
    if (couponMinAmount) couponMinAmount.value = c.minAmount;
    if (couponExpiry) couponExpiry.value = c.expiry || "";
    if (couponActive) couponActive.value = c.active;
    
    const couponModal = document.getElementById("couponModal");
    if (couponModal) couponModal.classList.add("active");
}

const addCouponBtn = document.getElementById("addCouponBtn");
if (addCouponBtn) {
    addCouponBtn.addEventListener("click", () => {
        const couponIdField = document.getElementById("couponId");
        const couponCodeInput = document.getElementById("couponCodeInput");
        const couponDiscount = document.getElementById("couponDiscount");
        const couponMinAmount = document.getElementById("couponMinAmount");
        const couponExpiry = document.getElementById("couponExpiry");
        const couponActive = document.getElementById("couponActive");
        
        if (couponIdField) couponIdField.value = "";
        if (couponCodeInput) couponCodeInput.value = "";
        if (couponDiscount) couponDiscount.value = "10";
        if (couponMinAmount) couponMinAmount.value = "0";
        if (couponExpiry) couponExpiry.value = "";
        if (couponActive) couponActive.value = "active";
        
        const couponModal = document.getElementById("couponModal");
        if (couponModal) couponModal.classList.add("active");
    });
}

const closeCouponModalBtn = document.getElementById("closeCouponModalBtn");
if (closeCouponModalBtn) {
    closeCouponModalBtn.addEventListener("click", () => {
        const couponModal = document.getElementById("couponModal");
        if (couponModal) couponModal.classList.remove("active");
    });
}

const saveCouponBtn = document.getElementById("saveCouponBtn");
if (saveCouponBtn) {
    saveCouponBtn.addEventListener("click", () => {
        let id = document.getElementById("couponId")?.value || String(Date.now());
        let code = document.getElementById("couponCodeInput")?.value.trim().toUpperCase();
        let discount = parseInt(document.getElementById("couponDiscount")?.value) || 0;
        let minAmount = parseInt(document.getElementById("couponMinAmount")?.value) || 0;
        let expiry = document.getElementById("couponExpiry")?.value;
        let active = document.getElementById("couponActive")?.value;
        if (!code || !discount) { alert("Kod və endirim faizi tələb olunur!"); return; }
        let coupons = getCoupons();
        let idx = coupons.findIndex(c => c.id === id);
        if (idx >= 0) coupons[idx] = { id, code, discount, minAmount, expiry, active };
        else coupons.push({ id, code, discount, minAmount, expiry, active });
        saveCoupons(coupons); 
        renderCoupons(); 
        const couponModal = document.getElementById("couponModal");
        if (couponModal) couponModal.classList.remove("active"); 
        alert("Endirim kodu yadda saxlanıldı!");
    });
}

function updateStats() {
    const statProducts = document.getElementById("statProducts");
    const statUsers = document.getElementById("statUsers");
    const statOrders = document.getElementById("statOrders");
    const statRevenue = document.getElementById("statRevenue");
    
    if (statProducts) statProducts.textContent = getProducts().length;
    if (statUsers) statUsers.textContent = getUsers().length;
    if (statOrders) statOrders.textContent = getOrdersCount();
    if (statRevenue) statRevenue.textContent = getTotalRevenue().toLocaleString();
}

function addChartContainer() {
    const adminGrid = document.querySelector('.admin-grid');
    if (adminGrid && !document.getElementById('revenueChart')) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'admin-campaigns';
        chartContainer.innerHTML = `
            <div class="admin-list-head">
                <h2><i class="fa-solid fa-chart-line"></i> Gəlir qrafiki (Son 30 gün)</h2>
                <button class="btn ghost-btn" id="refreshChartBtn"><i class="fa-solid fa-rotate-right"></i> Yenilə</button>
            </div>
            <div class="chart-container" style="height: 300px;">
                <canvas id="revenueChart"></canvas>
            </div>
        `;
        adminGrid.insertBefore(chartContainer, adminGrid.firstChild);
        const refreshBtn = document.getElementById('refreshChartBtn');
        if (refreshBtn) refreshBtn.addEventListener('click', () => initAdminChart());
    }
}

// ========== İNİTİALİZASİYA ==========
if (loginPanel) loginPanel.style.display = "flex";
if (adminDashboard) adminDashboard.style.display = "none";
loadLockData();
addChartContainer();
addExportButtons();
setInterval(() => { renderAdminOrders(); updateStats(); if (revenueChart && typeof initAdminChart === 'function') initAdminChart(); }, 30000);
if (sessionStorage.getItem("ismartAdmin") === "true" && checkSessionTimeout()) handleSuccessfulLogin();

// Hər dəqiqə sifarişləri yenilə
setInterval(() => {
    if (adminDashboard && adminDashboard.style.display === "block") {
        renderAdminOrders();
        updateStats();
    }
}, 10000);