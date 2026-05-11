// ========== YENİ TƏKMİLLƏŞDİRMƏLƏR ==========


// ========== GOOGLE SHEETS KONFİQURASİYASI ==========
const GOOGLE_SHEET_ID = "1kX9hHWexV8VCz_nhiv8Irc6QTeK7yMs3DGszkxBXT0s"; // Yuxarıda tapdığınız ID
const GOOGLE_CREDENTIALS = null; // JSON faylını oxumaq üçün

// Sifarişi Google Sheets-ə əlavə et
async function addOrderToGoogleSheets(order) {
    try {
        // Məhsulları mətnə çevir
        const productsText = order.items.map(item => `${item.name} (${item.quantity} əd)`).join(", ");
        
        // Google Apps Script URL (aşağıda yaradacağıq)
        const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx98_4BMGUeLiQMl_F5MsmDVXsqfolqHojsRDKWX-LGqeX4cvq1O3r0DgrXbvo0vvSWlw/exec";
        
        const response = await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sheetId: GOOGLE_SHEET_ID,
                orderId: order.id,
                date: new Date().toLocaleString('az-AZ'),
                customerName: order.userName || "Qeydiyyatsız",
                email: order.userEmail || "-",
                phone: order.shippingAddress?.phone || "-",
                address: order.shippingAddress?.address || "-",
                products: productsText,
                total: order.total,
                status: order.status
            })
        });
        
        console.log("✅ Google Sheets-ə yazıldı!");
    } catch(error) {
        console.error("❌ Google Sheets xətası:", error);
    }
}


// 1. Progress Bar
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    const progressBar = document.getElementById('progressBar');
    if (progressBar) progressBar.style.width = scrolled + '%';
});

// 2. Ripple Effect (Düymələrə basanda dalğalanma)
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = event.clientX - rect.left - size / 2 + 'px';
    ripple.style.top = event.clientY - rect.top - size / 2 + 'px';
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

// 3. Sticky Header + Scroll Effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (!header) return;
    const currentScroll = window.pageYOffset;
    if (currentScroll > lastScroll && currentScroll > 100) {
        header.classList.add('header-hidden');
    } else {
        header.classList.remove('header-hidden');
    }
    lastScroll = currentScroll;
});

// 4. Təxmini çatdırılma tarixi
function updateDeliveryEstimate() {
    const cartTotal = document.getElementById('cartTotal');
    const deliveryEstimate = document.getElementById('deliveryEstimate');
    if (!cartTotal || !deliveryEstimate) return;
    
    // Səbət cəmini tap
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
    });
    
    const today = new Date();
    let deliveryDate = new Date();
    
    if (total >= 100) {
        deliveryDate.setDate(today.getDate() + 1);
        deliveryEstimate.innerHTML = '🚚 Pulsuz çatdırılma | Təxmini çatdırılma: sabah';
    } else {
        deliveryDate.setDate(today.getDate() + 2);
        const fee = 5;
        deliveryEstimate.innerHTML = `🚚 Çatdırılma haqqı: ${fee} AZN | Təxmini çatdırılma: ${deliveryDate.toLocaleDateString('az-AZ')}`;
    }
}

// 5. Səs effekti (Səbətə əlavə edəndə)
function playAddToCartSound() {
    try {
        const audio = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3');
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Audio play edilə bilmədi'));
    } catch(e) {}
}

// 6. Push Notification üçün icazə
async function registerServiceWorker() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered');
            
            const permissionBtn = document.getElementById('pushPermissionBtn');
            if (permissionBtn) {
                permissionBtn.style.display = 'block';
                permissionBtn.addEventListener('click', async () => {
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                        showToast('Bildirişlər aktiv edildi! ✅', 'success');
                        permissionBtn.style.display = 'none';
                    }
                });
            }
        } catch (error) {
            console.error('Service Worker error:', error);
        }
    }
}

// 7. Sifariş statusu bildirişi
function checkOrderStatusAndNotify() {
    const orders = JSON.parse(localStorage.getItem('ismartOrders') || '[]');
    const lastOrder = orders[orders.length - 1];
    if (lastOrder && lastOrder.status === 'shipped' && !lastOrder.notificationSent) {
        if (Notification.permission === 'granted') {
            new Notification('Sifarişiniz yola çıxdı! 🚚', {
                body: `Sifariş #${lastOrder.orderNumber} çatdırılma prosesindədir.`,
                icon: '/images/logo.jpeg'
            });
            lastOrder.notificationSent = true;
            localStorage.setItem('ismartOrders', JSON.stringify(orders));
        }
    }
}

setInterval(checkOrderStatusAndNotify, 30000);

// ========== ƏSAS FUNKSİYALAR ==========
let cart = [];
let wishlist = JSON.parse(localStorage.getItem("ismartWishlist") || "[]");
let compareList = JSON.parse(localStorage.getItem("ismartCompare") || "[]");
let appliedCoupon = null;

// DEFAULT PRODUCTS (yalnız ilk dəfə yüklənəndə)
const DEFAULT_PRODUCTS = [
    { id: "1", category: "phones", name: "iPhone 15 Pro", price: 2499, discountedPrice: null, discount: 0, currency: "AZN", meta: "128 GB · Natural Titanium", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/IPhone_15_pro.png/300px-IPhone_15_pro.png", specs: "6.1 ekran, 48 MP, iOS", stock: "Stokda var", brand: "apple", condition: "yeni", quantity: 10, installment: "12 ay", installmentRate: "13%" },
    { id: "2", category: "phones", name: "Samsung Galaxy S24 Ultra", price: 2699, discountedPrice: null, discount: 0, currency: "AZN", meta: "256 GB · Titanium Gray", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Samsung_Galaxy_S24_Ultra_in_Titanium_Gray.png/300px-Samsung_Galaxy_S24_Ultra_in_Titanium_Gray.png", specs: "6.8 ekran, 200 MP, S Pen", stock: "Top model", brand: "samsung", condition: "yeni", quantity: 8, installment: "18 ay", installmentRate: "0%" },
    { id: "3", category: "phones", name: "Xiaomi 14 Pro", price: 1599, discountedPrice: null, discount: 0, currency: "AZN", meta: "512 GB · Black", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Xiaomi_14_Pro.jpg/300px-Xiaomi_14_Pro.jpg", specs: "AMOLED, Leica, 120W", stock: "Sərfəli", brand: "xiaomi", condition: "yeni", quantity: 15, installment: "12 ay", installmentRate: "13%" },
    { id: "10", category: "accessories", name: "AirPods Pro 2", price: 399, discountedPrice: null, discount: 0, currency: "AZN", meta: "USB-C · Aktiv səs izolyasiyası", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/AirPods_Pro_2nd_generation.png/300px-AirPods_Pro_2nd_generation.png", specs: "ANC, USB-C, Apple", stock: "Original", brand: "apple", condition: "yeni", quantity: 20, installment: "6 ay", installmentRate: "9%" },
    { id: "20", category: "repair", name: "Ekran dəyişimi", price: 199, discountedPrice: null, discount: 0, currency: "AZN", meta: "Modelə görə qiymət dəyişir", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Smartphone_cracked_screen.jpg/300px-Smartphone_cracked_screen.jpg", specs: "iPhone, Samsung, Xiaomi", stock: "Diaqnostika", brand: "repair", condition: "temirli", quantity: 999 }
];

// Məhsulları localStorage-dən oxu, yoxdursa default-ları yaz
// Firebase-dən mehsulları real-time al
let firebaseProducts = [];

function loadProductsFromFirebase() {
    database.ref('products').on('value', (snapshot) => {
        const products = snapshot.val();
        if (products) {
            firebaseProducts = Object.keys(products).map(key => ({
                id: key,
                ...products[key]
            }));
            // LocalStorage-i da yenile (offline üçün)
            localStorage.setItem("ismartProducts", JSON.stringify(firebaseProducts));
            // Sehifeni yenile
            renderProducts();
        }
    });
}

// getProducts funksiyasini deyişdir
function getProducts() {
    if (firebaseProducts.length > 0) {
        return firebaseProducts;
    }
    // Firebase bosdursa localStorage-dan oxu
    const saved = localStorage.getItem("ismartProducts");
    if (!saved || JSON.parse(saved).length === 0) {
        return DEFAULT_PRODUCTS;
    }
    return JSON.parse(saved);
}

// Sehife yuklenede Firebase-i baslat
document.addEventListener("DOMContentLoaded", () => {
    // ... diger kodlar
    
    // Firebase-den mehsullari yukle
    if (typeof database !== 'undefined') {
        loadProductsFromFirebase();
    }
});

// Sifarişi Firebase-e yaz
async function addOrderToFirebase(order) {
    try {
        await database.ref('orders').push(order);
        console.log("✅ Sifariş Firebase-ə yazıldı!");
    } catch(error) {
        console.error("❌ Firebase xətası:", error);
    }
}

// saveOrderToLocalStorage funksiyasinin içinde (sifariş yadda saxlanandan sonra)
await addOrderToFirebase(newOrder);

function saveProducts(products) {
    localStorage.setItem("ismartProducts", JSON.stringify(products));
}

function formatPrice(price, currency = "AZN") {
    const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "TRY" ? "₺" : "₼";
    return `${symbol}${Number(price).toLocaleString("az-AZ")}`;
}

function saveCart() { localStorage.setItem("ismartCart", JSON.stringify(cart)); }
function saveWishlist() { localStorage.setItem("ismartWishlist", JSON.stringify(wishlist)); }
function saveCompare() { localStorage.setItem("ismartCompare", JSON.stringify(compareList)); }

function updateCartUI() {
    const cartCount = document.getElementById("cartCount");
    const cartItemsContainer = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    if (!cartCount || !cartItemsContainer || !cartTotal) return;
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartItemsContainer.innerHTML = "";
    if (cart.length === 0) { cartItemsContainer.innerHTML = '<div class="empty-cart">Səbətiniz boşdur</div>'; cartTotal.textContent = "0 AZN"; updateDeliveryEstimate(); return; }
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
        cartItemsContainer.insertAdjacentHTML("beforeend", `<div class="cart-item"><div class="cart-item-info"><h4>${escapeHtml(item.name)}</h4><p>${formatPrice(item.price)} x ${item.quantity}</p></div><div class="cart-item-controls"><button class="quantity-btn decrease" data-id="${item.id}">-</button><span>${item.quantity}</span><button class="quantity-btn increase" data-id="${item.id}">+</button><button class="remove-item" data-id="${item.id}">Sil</button></div></div>`);
    });
    if (appliedCoupon) {
        const discountAmount = total * appliedCoupon.discount / 100;
        const discountedTotal = total - discountAmount;
        cartTotal.innerHTML = `<strong>Cəmi: <span style="text-decoration:line-through;color:#9ca3af;">${formatPrice(total)}</span> <span style="color:#10B981;">${formatPrice(discountedTotal)} (${appliedCoupon.discount}% endirim)</span></strong>`;
    } else {
        cartTotal.textContent = formatPrice(total);
    }
    updateDeliveryEstimate();
}

function loadCart() { const savedCart = localStorage.getItem("ismartCart"); cart = savedCart ? JSON.parse(savedCart) : []; updateCartUI(); }

function showToast(message, type = "success") {
    let toast = document.querySelector('.toast-notification');
    if (!toast) { toast = document.createElement('div'); toast.className = 'toast-notification'; document.body.appendChild(toast); }
    const bgColor = type === "success" ? "linear-gradient(135deg, #10B981, #059669)" : type === "error" ? "linear-gradient(135deg, #EF4444, #DC2626)" : "linear-gradient(135deg, #F59E0B, #D97706)";
    toast.style.background = bgColor;
    toast.innerHTML = `<i class="fa-regular fa-circle-check"></i> ${message}`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

function showToastWithSound(message, type = "success") {
    playAddToCartSound();
    showToast(message, type);
}

function addToCart(id, name, price) {
    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
        console.error("Invalid price:", price);
        showToast("Qiymət məlumatı səhvdir!", "error");
        return;
    }
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) { existingItem.quantity += 1; } 
    else { cart.push({ id, name, price: numericPrice, quantity: 1 }); }
    saveCart();
    updateCartUI();
    showToastWithSound(`${name} səbətə əlavə edildi!`, "success");
    animateCartCount();
}

function animateCartCount() {
    const cartCountSpan = document.getElementById("cartCount");
    if (cartCountSpan) { cartCountSpan.style.transform = "scale(1.3)"; setTimeout(() => { cartCountSpan.style.transform = "scale(1)"; }, 200); }
}

function toggleWishlist(productId, productName, productPrice, productImage) {
    const exists = wishlist.find(item => item.id === productId);
    if (exists) { wishlist = wishlist.filter(item => item.id !== productId); showToast(`${productName} arzulardan çıxarıldı`, "info"); }
    else { wishlist.push({ id: productId, name: productName, price: productPrice, image: productImage }); showToast(`${productName} arzulara əlavə edildi`, "success"); }
    saveWishlist(); updateWishlistUI();
}

function updateWishlistUI() {
    const container = document.getElementById("wishlistItems");
    if (!container) return;
    if (wishlist.length === 0) { container.innerHTML = '<div class="empty-wishlist">Arzular siyahınız boşdur</div>'; return; }
    container.innerHTML = wishlist.map(item => `<div class="wishlist-item"><img src="${item.image}" width="50"><div><h4>${escapeHtml(item.name)}</h4><p>${formatPrice(item.price)}</p></div><button class="remove-wishlist" data-id="${item.id}">Sil</button><button class="add-to-cart-wishlist" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">Səbətə at</button></div>`).join("");
    document.querySelectorAll(".remove-wishlist").forEach(btn => btn.addEventListener("click", () => toggleWishlist(btn.dataset.id)));
    document.querySelectorAll(".add-to-cart-wishlist").forEach(btn => btn.addEventListener("click", () => addToCart(btn.dataset.id, btn.dataset.name, btn.dataset.price)));
}

function toggleCompare(product) {
    const exists = compareList.find(item => item.id === product.id);
    if (exists) { compareList = compareList.filter(item => item.id !== product.id); showToast(`${product.name} müqayisədən çıxarıldı`, "info"); }
    else if (compareList.length >= 3) { showToast("Maksimum 3 məhsul müqayisə edilə bilər", "error"); return; }
    else { compareList.push(product); showToast(`${product.name} müqayisəyə əlavə edildi`, "success"); }
    saveCompare(); updateCompareUI();
}

function updateCompareUI() {
    const container = document.getElementById("compareItems");
    if (!container) return;
    if (compareList.length === 0) { container.innerHTML = '<div class="empty-compare">Müqayisə üçün məhsul seçilməyib</div>'; return; }
    container.innerHTML = `<div class="compare-table"><thead><tr><th>Xüsusiyyət</th>${compareList.map(item => `<th>${escapeHtml(item.name)}</th>`).join("")}</tr></thead>
        <tbody>
            ${[{ label: "Qiymət", key: "price" }, { label: "Kateqoriya", key: "category" }, { label: "Yaddaş", key: "storage" }, { label: "Rəng", key: "color" }, { label: "Zəmanət", key: "warranty" }, { label: "Kredit", key: "installment" }].map(row => `<tr><td>${row.label}</td>${compareList.map(item => `<td>${row.key === "price" ? formatPrice(item.discountedPrice || item.price) + (item.discount > 0 ? `<span class="old-price">${formatPrice(item.price)}</span><span class="discount-badge">-${item.discount}%</span>` : "") : item[row.key] || "-"}</td>`).join("")}</tr>`).join("")}
            <tr><td></td>${compareList.map(item => `<td><button class="btn add-to-cart" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">Səbətə at</button></td>`).join("")}</tr>
        </tbody></div>`;
    document.querySelectorAll(".add-to-cart").forEach(btn => btn.addEventListener("click", () => addToCart(btn.dataset.id, btn.dataset.name, btn.dataset.price)));
}

function applyCoupon(code) {
    const coupons = JSON.parse(localStorage.getItem("ismartCoupons") || "[]");
    const coupon = coupons.find(c => c.code === code.toUpperCase() && c.active === "active");
    if (!coupon) { showToast("Endirim kodu tapılmadı", "error"); return false; }
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (total < coupon.minAmount) { showToast(`Minimum sifariş məbləği ${coupon.minAmount} AZN`, "error"); return false; }
    if (coupon.expiry && new Date(coupon.expiry) < new Date()) { showToast("Endirim kodunun müddəti bitib", "error"); return false; }
    appliedCoupon = coupon;
    showToast(`${coupon.discount}% endirim tətbiq edildi!`, "success");
    updateCartUI();
    return true;
}

function initDarkMode() {
    const darkModeBtn = document.getElementById("darkModeBtn");
    const isDark = localStorage.getItem("darkMode") === "true";
    if (isDark) document.body.classList.add("dark-mode");
    if (darkModeBtn) {
        darkModeBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        darkModeBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            const dark = document.body.classList.contains("dark-mode");
            localStorage.setItem("darkMode", dark);
            darkModeBtn.innerHTML = dark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        });
    }
}

let currentUser = JSON.parse(localStorage.getItem("ismartCurrentUser") || "null");

function updateUserUI() {
    const profileLink = document.getElementById("profileLink");
    const logoutLink = document.getElementById("logoutLink");
    const loginLink = document.getElementById("loginLink");
    const registerLink = document.getElementById("registerLink");
    if (currentUser) {
        if (loginLink) loginLink.style.display = "none";
        if (registerLink) registerLink.style.display = "none";
        if (profileLink) { 
            profileLink.style.display = "block"; 
            const profileName = document.getElementById("profileName");
            const profileEmail = document.getElementById("profileEmail");
            const profilePoints = document.getElementById("profilePoints");
            const profileTier = document.getElementById("profileTier");
            if (profileName) profileName.textContent = currentUser.name;
            if (profileEmail) profileEmail.textContent = currentUser.email;
            if (profilePoints) profilePoints.textContent = currentUser.points || 0;
            if (profileTier) profileTier.textContent = currentUser.tier || "Bronze";
        }
        if (logoutLink) logoutLink.style.display = "block";
    } else {
        if (loginLink) loginLink.style.display = "block";
        if (registerLink) registerLink.style.display = "block";
        if (profileLink) profileLink.style.display = "none";
        if (logoutLink) logoutLink.style.display = "none";
    }
}

function registerUser(name, email, password) {
    const users = JSON.parse(localStorage.getItem("ismartUsers") || "[]");
    if (users.find(u => u.email === email)) { showToast("Bu e-poçt artıq qeydiyyatdan keçib", "error"); return false; }
    const newUser = { id: Date.now().toString(), name, email, password, points: 0, tier: "Bronze", totalSpent: 0, orderCount: 0, orders: [], createdAt: new Date().toISOString() };
    users.push(newUser);
    localStorage.setItem("ismartUsers", JSON.stringify(users));
    currentUser = newUser;
    localStorage.setItem("ismartCurrentUser", JSON.stringify(newUser));
    showToast("Qeydiyyat uğurludur!", "success");
    updateUserUI();
    return true;
}

function loginUser(email, password) {
    const users = JSON.parse(localStorage.getItem("ismartUsers") || "[]");
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) { showToast("E-poçt və ya şifrə yanlışdır", "error"); return false; }
    currentUser = user;
    localStorage.setItem("ismartCurrentUser", JSON.stringify(user));
    showToast(`Xoş gəldin, ${user.name}!`, "success");
    updateUserUI();
    return true;
}

function logoutUser() {
    currentUser = null;
    localStorage.removeItem("ismartCurrentUser");
    showToast("Çıxış edildi", "info");
    updateUserUI();
}

function escapeHtml(str) { if (!str) return ""; return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'); }

function productCard(product) {
    const specs = String(product.specs || "").split(",").map(item => item.trim()).filter(Boolean);
    const finalPrice = product.discountedPrice || product.price;
    const priceText = formatPrice(finalPrice, product.currency || "AZN");
    const isInWishlist = wishlist.some(item => item.id === product.id);
    const isInCompare = compareList.some(item => item.id === product.id);
    const stockRemaining = product.quantity || 10;
    
    let conditionClass = "", conditionText = "";
    if (product.condition === "yeni") { conditionClass = "badge-new"; conditionText = "✨ Yeni"; }
    else if (product.condition === "ikinci") { conditionClass = "badge-used"; conditionText = "🔄 İkinci əl"; }
    else if (product.condition === "temirli") { conditionClass = "badge-repaired"; conditionText = "🔧 Təmirli"; }
    
    let discountHtml = "";
    if (product.discount > 0) {
        discountHtml = `<span class="discount-badge-product">-${product.discount}%</span><span class="old-price-product">${formatPrice(product.price, product.currency || "AZN")}</span>`;
    }
    
    let stockHtml = "";
    let stockStatus = (product.stock === "Sətindən çıxıb" || product.quantity === 0);
    if (stockStatus) {
        stockHtml = `<span class="stock-badge out-of-stock"><i class="fa-regular fa-circle-xmark"></i> Sətindən çıxıb</span>`;
    } else {
        stockHtml = `<span class="stock-badge"><i class="fa-regular fa-circle-check"></i> Stokda var</span>`;
    }
    
    let stockRemainingHtml = "";
    if (!stockStatus && stockRemaining <= 5 && stockRemaining > 0) {
        stockRemainingHtml = `<div class="stock-remaining">⚠️ Son ${stockRemaining} ədəd!</div>`;
    }
    
    let installmentHtml = "";
    if (product.installment && product.installment !== "0 ay") {
        installmentHtml = `<div class="installment-info"><i class="fa-regular fa-credit-card"></i> ${product.installment} | ${product.installmentRate || "0%"} faiz</div>`;
    }
    
    return `<article class="product-card" data-category="${product.category}" data-id="${product.id}" data-name="${escapeHtml(product.name)}" data-price="${finalPrice}" data-currency="${product.currency || "AZN"}" data-brand="${product.brand || ""}">
        <div class="product-card-header">
            <div class="product-status-left">
                <span class="condition-badge ${conditionClass}">${conditionText}</span>
                ${stockHtml}
            </div>
            <div class="product-actions-right">
                <button class="wishlist-btn ${isInWishlist ? 'active' : ''}" data-id="${product.id}" data-name="${escapeHtml(product.name)}" data-price="${finalPrice}" data-image="${product.image}"><i class="fa-${isInWishlist ? 'solid' : 'regular'} fa-heart"></i></button>
                <button class="compare-btn ${isInCompare ? 'active' : ''}" data-id="${product.id}"><i class="fa-${isInCompare ? 'solid' : 'regular'} fa-chart-simple"></i></button>
                <button class="share-btn" data-id="${product.id}" data-name="${escapeHtml(product.name)}"><i class="fa-solid fa-share-alt"></i></button>
            </div>
        </div>
        <div class="product-image">
            <img src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy" onerror="this.src='https://placehold.co/200x200?text=No+Image'">
            <div class="product-image-overlay">
                <button class="quick-view-btn" data-id="${product.id}">👁️ Tez bax</button>
            </div>
        </div>
        <h3>${escapeHtml(product.name)}</h3>
        <p class="product-meta">${escapeHtml(product.meta) || ""}</p>
        <div class="product-specs">${specs.map(spec => `<span>${escapeHtml(spec)}</span>`).join("")}</div>
        ${stockRemainingHtml}
        <div class="price-wrapper">${discountHtml}<span class="price">${priceText}</span></div>
        ${installmentHtml}
        ${!stockStatus ? `<button class="btn add-to-cart" data-id="${product.id}" data-name="${escapeHtml(product.name)}" data-price="${finalPrice}" data-currency="${product.currency || "AZN"}"><i class="fa-solid fa-cart-shopping"></i> Səbətə at</button>` : `<button class="notify-stock-btn" data-id="${product.id}" data-name="${escapeHtml(product.name)}"><i class="fa-regular fa-bell"></i> Stoka düşəndə xəbər et</button>`}
    </article>`;
}

// Quick View funksiyası
const quickViewModal = document.getElementById('quickViewModal');
const closeQuickViewBtn = document.getElementById('closeQuickViewBtn');

function openQuickView(productId) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const quickViewBody = document.getElementById('quickViewBody');
    if (quickViewBody && quickViewModal) {
        quickViewBody.innerHTML = `
            <div class="quick-view-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="quick-view-info">
                <h3>${escapeHtml(product.name)}</h3>
                <p class="product-meta">${escapeHtml(product.meta || '')}</p>
                <div class="price-wrapper">
                    <span class="price">${formatPrice(product.discountedPrice || product.price)}</span>
                    ${product.discount > 0 ? `<span class="old-price-product">${formatPrice(product.price)}</span><span class="discount-badge-product">-${product.discount}%</span>` : ''}
                </div>
                <p class="product-specs-full">${escapeHtml(product.specs || 'Məlumat yoxdur')}</p>
                <div class="quick-view-actions">
                    <button class="btn primary-btn add-to-cart-quick" data-id="${product.id}" data-name="${escapeHtml(product.name)}" data-price="${product.discountedPrice || product.price}">Səbətə at</button>
                    <button class="btn ghost-btn wishlist-quick" data-id="${product.id}">Arzulara əlavə et</button>
                </div>
            </div>
        `;
        
        quickViewModal.style.display = 'flex';
        
        document.querySelector('.add-to-cart-quick')?.addEventListener('click', (e) => {
            addToCart(e.currentTarget.dataset.id, e.currentTarget.dataset.name, e.currentTarget.dataset.price);
            quickViewModal.style.display = 'none';
        });
        
        document.querySelector('.wishlist-quick')?.addEventListener('click', (e) => {
            const prod = products.find(p => p.id === e.currentTarget.dataset.id);
            if (prod) toggleWishlist(e.currentTarget.dataset.id, prod.name, prod.price, prod.image);
            quickViewModal.style.display = 'none';
        });
    }
}

if (closeQuickViewBtn) {
    closeQuickViewBtn.addEventListener('click', () => {
        if (quickViewModal) quickViewModal.style.display = 'none';
    });
}

function attachProductEvents() {
    document.querySelectorAll(".add-to-cart").forEach(btn => { btn.removeEventListener("click", handleAddToCart); btn.addEventListener("click", handleAddToCart); });
    document.querySelectorAll(".wishlist-btn").forEach(btn => { btn.removeEventListener("click", handleWishlist); btn.addEventListener("click", handleWishlist); });
    document.querySelectorAll(".compare-btn").forEach(btn => { btn.removeEventListener("click", handleCompare); btn.addEventListener("click", handleCompare); });
    document.querySelectorAll(".share-btn").forEach(btn => { btn.removeEventListener("click", handleShare); btn.addEventListener("click", handleShare); });
    document.querySelectorAll(".notify-stock-btn").forEach(btn => { btn.removeEventListener("click", handleNotifyStock); btn.addEventListener("click", handleNotifyStock); });
    document.querySelectorAll(".quick-view-btn").forEach(btn => { btn.removeEventListener("click", handleQuickView); btn.addEventListener("click", handleQuickView); });
}

function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();
    const btn = e.currentTarget;
    addToCart(btn.dataset.id, btn.dataset.name, parseFloat(btn.dataset.price));
}

function handleWishlist(e) {
    e.preventDefault();
    e.stopPropagation();
    const btn = e.currentTarget;
    const card = btn.closest(".product-card");
    toggleWishlist(btn.dataset.id, btn.dataset.name, btn.dataset.price, btn.dataset.image || card?.querySelector(".product-image img")?.src);
}

function handleCompare(e) {
    e.preventDefault();
    e.stopPropagation();
    const product = getProducts().find(p => p.id === e.currentTarget.dataset.id);
    if (product) toggleCompare(product);
    updateCompareUI();
}

function handleShare(e) {
    e.preventDefault();
    e.stopPropagation();
    const product = getProducts().find(p => p.id === e.currentTarget.dataset.id);
    if (product) shareProductWithQR(product);
}

function handleNotifyStock(e) {
    e.preventDefault();
    e.stopPropagation();
    const btn = e.currentTarget;
    if (currentUser) {
        const notifications = JSON.parse(localStorage.getItem("stockNotifications") || "[]");
        if (!notifications.find(n => n.productId === btn.dataset.id && n.userId === currentUser.id)) {
            notifications.push({ productId: btn.dataset.id, productName: btn.dataset.name, userId: currentUser.id, date: new Date().toISOString() });
            localStorage.setItem("stockNotifications", JSON.stringify(notifications));
            showToast(`${btn.dataset.name} stoka düşəndə bildiriş göndəriləcək`, "success");
        } else { showToast("Bu məhsul üçün artıq bildiriş aktivdir", "info"); }
    } else {
        showToast("Zəhmət olmasa əvvəlcə daxil olun", "error");
        document.getElementById("authModal")?.classList.add("active");
    }
}

function handleQuickView(e) {
    e.preventDefault();
    e.stopPropagation();
    const productId = e.currentTarget.dataset.id;
    openQuickView(productId);
}

function shareProductWithQR(product) {
    const modal = document.getElementById("paymentModal");
    const qrContainer = document.getElementById("qrCode");
    if (qrContainer) {
        qrContainer.innerHTML = "";
        const url = `${window.location.origin}/product.html?id=${product.id}`;
        new QRCode(qrContainer, { text: url, width: 200, height: 200 });
        document.getElementById("qrPayment").style.display = "block";
        document.getElementById("cardForm").style.display = "none";
        modal.classList.add("active");
    }
}

function processPayment(method, amount) {
    if (method === "cash") {
        showToast(`Sifariş qəbul olundu! ${formatPrice(amount)} nağd ödənişlə`, "success");
        return true;
    } else if (method === "card") {
        const cardNumber = document.getElementById("cardNumber")?.value;
        const cardExpiry = document.getElementById("cardExpiry")?.value;
        const cardCvv = document.getElementById("cardCvv")?.value;
        if (!cardNumber || !cardExpiry || !cardCvv) {
            showToast("Kart məlumatlarını doldurun!", "error");
            return false;
        }
        showToast(`Ödəniş uğurlu! ${formatPrice(amount)} kartdan çıxarıldı`, "success");
        return true;
    }
    return false;
}

// Sifarişi yadda saxla
function saveOrderToLocalStorage(finalTotal) {
    if (!currentUser) {
        showToast("Zəhmət olmasa əvvəlcə daxil olun!", "error");
        return;
    }
    
    const newOrder = { 
        id: "ORD" + Date.now().toString(), 
        userId: currentUser?.id, 
        userName: currentUser?.name,
        userEmail: currentUser?.email,
        items: [...cart], 
        total: finalTotal, 
        date: new Date().toISOString(),
        status: "pending",
        paymentMethod: "cash"
    };
    
    let existingOrders = [];
    const savedOrders = localStorage.getItem("ismartOrders");
    if (savedOrders) {
        try {
            existingOrders = JSON.parse(savedOrders);
            if (!Array.isArray(existingOrders)) existingOrders = [];
        } catch(e) {
            existingOrders = [];
        }
    }
    
    existingOrders.push(newOrder);
    localStorage.setItem("ismartOrders", JSON.stringify(existingOrders));
    
    cart = [];
    saveCart();
    updateCartUI();
    appliedCoupon = null;
    
    showToast(`✅ Sifarişiniz qeydə alındı! Sifariş №: ${newOrder.id}`, "success");
    
    // Ünvan sahələrini təmizlə
    const shippingFullName = document.getElementById("shippingFullName");
    const shippingPhone = document.getElementById("shippingPhone");
    const shippingAddress = document.getElementById("shippingAddress");
    const shippingNotes = document.getElementById("shippingNotes");
    if (shippingFullName) shippingFullName.value = "";
    if (shippingPhone) shippingPhone.value = "";
    if (shippingAddress) shippingAddress.value = "";
    if (shippingNotes) shippingNotes.value = "";
}

// ========== SLİDER VƏ MƏHSUL GÖSTERİMİ ==========
function loadCampaignsToSlider() {
    const campaigns = JSON.parse(localStorage.getItem("ismartCampaigns") || "[]");
    const activeCampaigns = campaigns.filter(c => c.status === "active").sort((a, b) => a.order - b.order);
    const sliderWrapper = document.getElementById("campaignSlider");
    if (!sliderWrapper) return;
    const themes = ["blue", "orange", "purple", "green", "red"];
    let campaignsToShow = activeCampaigns.length ? activeCampaigns : [{ id: "default1", title: "0% Faiz 12 Ay", description: "Bütün telefonlarda 12 ay 0% faiz", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/IPhone_15_pro.png/200px-IPhone_15_pro.png", link: "telefonlar.html" }];
    sliderWrapper.innerHTML = campaignsToShow.map((c, idx) => `<div class="swiper-slide"><div class="slide-content" data-theme="${themes[idx % themes.length]}"><div class="slide-text"><span class="slide-badge"><i class="fa-solid fa-gift"></i> Kampaniya</span><h2>${escapeHtml(c.title)}</h2><p>${escapeHtml(c.description)}</p><a href="${c.link}" class="btn primary-btn"><i class="fa-solid fa-arrow-right"></i> Ətraflı bax</a></div><div class="slide-image"><div class="image-wrapper"><img src="${c.image}" alt="${escapeHtml(c.title)}"></div></div></div></div>`).join("");
    setTimeout(initHeroSlider, 100);
}

function initHeroSlider() {
    const swiperEl = document.querySelector('.heroSwiper');
    if (!swiperEl) return;
    if (swiperEl.swiper) swiperEl.swiper.destroy(true, true);
    const slides = document.querySelectorAll('#campaignSlider .swiper-slide');
    new Swiper('.heroSwiper', { loop: slides.length >= 2, autoplay: slides.length >= 2 ? { delay: 5000, disableOnInteraction: false } : false, pagination: { el: '.swiper-pagination', clickable: true }, navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }, effect: 'slide', speed: 1000, parallax: true });
}

function initDiscountSwiper() {
    const swiperEl = document.querySelector('.discountSwiper');
    if (!swiperEl) return;
    if (swiperEl.swiper) swiperEl.swiper.destroy(true, true);
    const slides = document.querySelectorAll('#discountProductsWrapper .swiper-slide');
    const shouldLoop = slides.length >= 5;
    new Swiper(swiperEl, { slidesPerView: 1, spaceBetween: 20, loop: shouldLoop, autoplay: slides.length >= 2 ? { delay: 4000, disableOnInteraction: false } : false, pagination: { el: '.discount-pagination', clickable: true }, navigation: { nextEl: '.discount-next', prevEl: '.discount-prev' }, breakpoints: { 640: { slidesPerView: Math.min(2, slides.length) }, 768: { slidesPerView: Math.min(3, slides.length) }, 1024: { slidesPerView: Math.min(4, slides.length) } } });
}

function initProductSwipers() {
    document.querySelectorAll('.productSwiper').forEach(swiperEl => {
        if (swiperEl.swiper) swiperEl.swiper.destroy(true, true);
        const slides = swiperEl.querySelectorAll('.swiper-slide');
        const shouldLoop = slides.length >= 5;
        new Swiper(swiperEl, { slidesPerView: 1, spaceBetween: 20, loop: shouldLoop, autoplay: slides.length >= 2 ? { delay: 5000, disableOnInteraction: false } : false, pagination: { el: '.swiper-pagination', clickable: true }, navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }, breakpoints: { 640: { slidesPerView: Math.min(2, slides.length) }, 768: { slidesPerView: Math.min(3, slides.length) }, 1024: { slidesPerView: Math.min(4, slides.length) } } });
    });
}

function currentPageCategory() {
    const page = location.pathname.toLowerCase();
    if (page.includes("telefonlar")) return "phones";
    if (page.includes("aksesuarlar")) return "accessories";
    if (page.includes("temir")) return "repair";
    return "home";
}

// ƏSAS RENDER FUNKSİYASI - BÜTÜN MƏHSUL SƏHİFƏLƏRİ ÜÇÜN
function renderProducts() {
    const productGrid = document.getElementById("productsGrid") || document.querySelector(".product-grid");
    if (!productGrid) return;
    
    const pageCategory = currentPageCategory();
    const products = getProducts(); // BÜTÜN məhsullar (default + admin əlavələri)
    
    let visibleProducts = [];
    
    if (pageCategory === "home") {
        // Ana səhifədə populyar məhsullar (telefonlar)
        visibleProducts = products.filter(item => item.category === "phones").slice(0, 6);
        const popularContainer = document.getElementById("popularProducts");
        if (popularContainer) {
            popularContainer.innerHTML = visibleProducts.map(productCard).join("");
        }
        // Digər bölmələr üçün ayrıca render olunacaq
        renderFeaturedProducts();
    } else {
        // Telefonlar, aksesuarlar, təmir səhifələri
        visibleProducts = products.filter(item => item.category === pageCategory);
        productGrid.innerHTML = visibleProducts.map(productCard).join("");
        
        const resultCount = document.getElementById("resultCount");
        if (resultCount) resultCount.textContent = `${visibleProducts.length} məhsul göstərilir`;
    }
    
    attachProductEvents();
    loadCampaignsToSlider();
}

function renderFeaturedProducts() {
    const products = getProducts();
    
    // Endirimli məhsullar
    let discountProducts = products.filter(p => p.discount > 0);
    if (discountProducts.length === 0) discountProducts = products.filter(p => p.category === "phones").slice(0, 4);
    discountProducts = discountProducts.slice(0, 8);
    
    // Yeni məhsullar
    let newProducts = products.filter(p => p.condition === "yeni" && p.category === "phones");
    if (newProducts.length < 4) newProducts = products.filter(p => p.category === "phones").slice(0, 8);
    newProducts = newProducts.slice(0, 8);
    
    // İkinci əl məhsullar
    let usedProducts = products.filter(p => p.condition === "ikinci" && p.category === "phones");
    usedProducts = usedProducts.slice(0, 8);
    
    const discountWrapper = document.getElementById("discountProductsWrapper");
    const newWrapper = document.getElementById("newProductsWrapper");
    const usedWrapper = document.getElementById("usedProductsWrapper");
    
    if (discountWrapper) discountWrapper.innerHTML = discountProducts.map(p => `<div class="swiper-slide">${productCard(p)}</div>`).join("");
    if (newWrapper) newWrapper.innerHTML = newProducts.map(p => `<div class="swiper-slide">${productCard(p)}</div>`).join("");
    if (usedWrapper) usedWrapper.innerHTML = usedProducts.map(p => `<div class="swiper-slide">${productCard(p)}</div>`).join("");
    
    setTimeout(() => { 
        initDiscountSwiper(); 
        initProductSwipers(); 
        attachProductEvents(); 
    }, 150);
}

// Ripple effektini bütün düymələrə əlavə et
function initRippleEffect() {
    document.querySelectorAll('.btn, .add-to-cart, .checkout-btn, .catalog-btn, .cart-btn, .primary-btn, .ghost-btn').forEach(btn => {
        btn.addEventListener('click', createRipple);
    });
}

// Typing Animation (Hero bölməsində)
function initTypingAnimation() {
    const heroH1 = document.querySelector('.page-hero h1');
    if (heroH1 && !heroH1.querySelector('.typed-text')) {
        const originalText = heroH1.innerHTML;
        heroH1.innerHTML = originalText + ' <span class="typed-text" id="heroTyped"></span>';
        
        const heroWords = ['iPhone', 'Samsung', 'Xiaomi', 'AirPods'];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        const heroTyped = document.getElementById('heroTyped');
        
        if (heroTyped) {
            function typeEffect() {
                const currentWord = heroWords[wordIndex];
                let displayText = '';
                
                if (isDeleting) {
                    displayText = currentWord.substring(0, charIndex - 1);
                    charIndex--;
                } else {
                    displayText = currentWord.substring(0, charIndex + 1);
                    charIndex++;
                }
                
                heroTyped.textContent = displayText;
                
                if (!isDeleting && charIndex === currentWord.length) {
                    isDeleting = true;
                    setTimeout(typeEffect, 2000);
                } else if (isDeleting && charIndex === 0) {
                    isDeleting = false;
                    wordIndex = (wordIndex + 1) % heroWords.length;
                    setTimeout(typeEffect, 500);
                } else {
                    setTimeout(typeEffect, isDeleting ? 50 : 100);
                }
            }
            setTimeout(typeEffect, 500);
        }
    }
}

// ========== DOMContentLoaded ==========
document.addEventListener("DOMContentLoaded", function () {
    // Əsas funksiyalar
    initDarkMode();
    loadCart();
    renderProducts();
    updateUserUI();
    initRippleEffect();
    initTypingAnimation();
    registerServiceWorker();
    
    // Səbət modalı
    const cartModal = document.getElementById("cartModal");
    const closeCart = document.getElementById("closeCart");
    const cartBtn = document.getElementById("cartBtn");
    const mobileCartBtn = document.getElementById("mobileCartBtn");
    
    if (cartBtn) cartBtn.addEventListener("click", () => cartModal?.classList.add("active"));
    if (mobileCartBtn) mobileCartBtn.addEventListener("click", () => cartModal?.classList.add("active"));
    if (closeCart) closeCart.addEventListener("click", () => cartModal?.classList.remove("active"));
    if (cartModal) {
        cartModal.addEventListener("click", e => { if (e.target === cartModal) cartModal.classList.remove("active"); });
    }
    
    // Auth modalı
    const authModal = document.getElementById("authModal");
    const closeAuthBtn = document.getElementById("closeAuthBtn");
    const userBtn = document.getElementById("userBtn");
    const mobileUserBtn = document.getElementById("mobileUserBtn");
    
    if (userBtn) userBtn.addEventListener("click", () => authModal?.classList.add("active"));
    if (mobileUserBtn) mobileUserBtn.addEventListener("click", () => authModal?.classList.add("active"));
    if (closeAuthBtn) closeAuthBtn.addEventListener("click", () => authModal?.classList.remove("active"));
    
    // Login/Register
    const loginFormModal = document.getElementById("loginFormModal");
    const registerFormModal = document.getElementById("registerFormModal");
    const switchToRegister = document.getElementById("switchToRegister");
    const switchToLogin = document.getElementById("switchToLogin");
    const authTitle = document.getElementById("authTitle");
    
    if (switchToRegister) {
        switchToRegister.addEventListener("click", (e) => {
            e.preventDefault();
            if (loginFormModal) loginFormModal.style.display = "none";
            if (registerFormModal) registerFormModal.style.display = "block";
            if (authTitle) authTitle.textContent = "Qeydiyyat";
            if (switchToLogin) switchToLogin.style.display = "block";
            if (switchToRegister) switchToRegister.style.display = "none";
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener("click", (e) => {
            e.preventDefault();
            if (loginFormModal) loginFormModal.style.display = "block";
            if (registerFormModal) registerFormModal.style.display = "none";
            if (authTitle) authTitle.textContent = "Daxil ol";
            if (switchToRegister) switchToRegister.style.display = "block";
            if (switchToLogin) switchToLogin.style.display = "none";
        });
    }
    
    if (loginFormModal) {
        loginFormModal.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("loginEmail")?.value;
            const password = document.getElementById("loginPassword")?.value;
            if (loginUser(email, password)) authModal?.classList.remove("active");
        });
    }
    
    if (registerFormModal) {
        registerFormModal.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("regName")?.value;
            const email = document.getElementById("regEmail")?.value;
            const password = document.getElementById("regPassword")?.value;
            const confirm = document.getElementById("regConfirmPassword")?.value;
            if (password !== confirm) {
                showToast("Şifrələr uyğun gəlmir", "error");
                return;
            }
            if (registerUser(name, email, password)) authModal?.classList.remove("active");
        });
    }
    
    // Logout
    const logoutLink = document.getElementById("logoutLink");
    if (logoutLink) {
        logoutLink.addEventListener("click", (e) => {
            e.preventDefault();
            logoutUser();
        });
    }
    
    // Profile modal
    const profileLink = document.getElementById("profileLink");
    const profileModal = document.getElementById("profileModal");
    const closeProfileBtn = document.getElementById("closeProfileBtn");
    
    if (profileLink) {
        profileLink.addEventListener("click", (e) => {
            e.preventDefault();
            profileModal?.classList.add("active");
        });
    }
    if (closeProfileBtn) closeProfileBtn.addEventListener("click", () => profileModal?.classList.remove("active"));
    
    // Apply coupon
    const applyCouponBtn = document.getElementById("applyCouponBtn");
    const couponCodeInput = document.getElementById("couponCode");
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener("click", () => {
            if (couponCodeInput?.value && applyCoupon(couponCodeInput.value)) {
                couponCodeInput.value = "";
            }
        });
    }
    
    // Səbət daxilində artır/azalt/sil
    const cartItemsContainer = document.getElementById("cartItems");
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener("click", e => {
            const id = e.target.dataset?.id;
            if (!id) return;
            const item = cart.find(i => i.id === id);
            if (e.target.classList.contains("decrease") && item) {
                if (item.quantity > 1) {
                    item.quantity--;
                } else {
                    cart = cart.filter(i => i.id !== id);
                }
                saveCart();
                updateCartUI();
            }
            if (e.target.classList.contains("increase") && item) {
                item.quantity++;
                saveCart();
                updateCartUI();
            }
            if (e.target.classList.contains("remove-item")) {
                cart = cart.filter(i => i.id !== id);
                saveCart();
                updateCartUI();
            }
        });
    }
    
    // Ödəniş metodları
    document.querySelectorAll(".payment-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const method = btn.dataset.method;
            const paymentModal = document.getElementById("paymentModal");
            const orderSummary = document.getElementById("paymentOrderSummary");
            const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const finalTotal = appliedCoupon ? total - (total * appliedCoupon.discount / 100) : total;
            
            if (orderSummary) {
                orderSummary.innerHTML = `<h3>Sifariş cəmi: ${formatPrice(finalTotal)}</h3>${appliedCoupon ? `<p>Endirim kodu: ${appliedCoupon.code} (-${appliedCoupon.discount}%)</p>` : ""}`;
            }
            
            if (method === "cash") {
                if (processPayment("cash", finalTotal)) {
                    saveOrderToLocalStorage(finalTotal);
                    paymentModal?.classList.remove("active");
                    cartModal?.classList.remove("active");
                }
            } else if (method === "card") {
                document.getElementById("qrPayment").style.display = "none";
                document.getElementById("cardForm").style.display = "block";
                paymentModal?.classList.add("active");
            }
        });
    });
    
    // Kartla ödəniş
    const processPaymentBtn = document.getElementById("processPaymentBtn");
    if (processPaymentBtn) {
        processPaymentBtn.addEventListener("click", () => {
            const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const finalTotal = appliedCoupon ? total - (total * appliedCoupon.discount / 100) : total;
            if (processPayment("card", finalTotal)) {
                saveOrderToLocalStorage(finalTotal);
                document.getElementById("paymentModal")?.classList.remove("active");
                cartModal?.classList.remove("active");
            }
        });
    }
    
    const closePaymentBtn = document.getElementById("closePaymentBtn");
    if (closePaymentBtn) closePaymentBtn.addEventListener("click", () => document.getElementById("paymentModal")?.classList.remove("active"));
    
    // CHECKOUT BUTTON - Sifarişi təsdiqlə
    const checkoutBtn = document.querySelector(".checkout-btn");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            if (cart.length === 0) {
                showToast("Səbətiniz boşdur!", "error");
                return;
            }
            
            const fullName = document.getElementById("shippingFullName")?.value.trim();
            const phone = document.getElementById("shippingPhone")?.value.trim();
            const address = document.getElementById("shippingAddress")?.value.trim();
            
            if (!fullName || !phone || !address) {
                showToast("Zəhmət olmasa çatdırılma ünvanını doldurun!", "error");
                return;
            }
            
            if (!currentUser) {
                showToast("Zəhmət olmasa əvvəlcə daxil olun!", "error");
                authModal?.classList.add("active");
                return;
            }
            
            const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const finalTotal = appliedCoupon ? total - (total * appliedCoupon.discount / 100) : total;
            
            const newOrder = { 
                id: "ORD" + Date.now().toString(), 
                userId: currentUser?.id, 
                userName: currentUser?.name,
                userEmail: currentUser?.email,
                items: [...cart], 
                total: finalTotal, 
                date: new Date().toISOString(),
                status: "pending",
                paymentMethod: "cash",
                shippingAddress: {
                    fullName: fullName,
                    phone: phone,
                    address: address,
                    notes: document.getElementById("shippingNotes")?.value || ""
                }
            };
            
            let existingOrders = [];
            const savedOrders = localStorage.getItem("ismartOrders");
            if (savedOrders) {
                try {
                    existingOrders = JSON.parse(savedOrders);
                    if (!Array.isArray(existingOrders)) existingOrders = [];
                } catch(e) {
                    existingOrders = [];
                }
            }
            
            existingOrders.push(newOrder);
            localStorage.setItem("ismartOrders", JSON.stringify(existingOrders));
            
            cart = [];
            saveCart();
            updateCartUI();
            appliedCoupon = null;
            
            if (document.getElementById("shippingFullName")) document.getElementById("shippingFullName").value = "";
            if (document.getElementById("shippingPhone")) document.getElementById("shippingPhone").value = "";
            if (document.getElementById("shippingAddress")) document.getElementById("shippingAddress").value = "";
            if (document.getElementById("shippingNotes")) document.getElementById("shippingNotes").value = "";
            
            showToast(`✅ Sifarişiniz qeydə alındı! Sifariş №: ${newOrder.id}`, "success");
            cartModal?.classList.remove("active");
        });
    }
    
    // Axtarış
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            const searchTerm = searchInput?.value.trim().toLowerCase();
            const products = getProducts();
            const productGrid = document.getElementById("productsGrid");
            if (productGrid && searchTerm) {
                const filtered = products.filter(p => 
                    p.name.toLowerCase().includes(searchTerm) || 
                    (p.meta && p.meta.toLowerCase().includes(searchTerm))
                );
                productGrid.innerHTML = filtered.map(productCard).join("");
                attachProductEvents();
                const resultCount = document.getElementById("resultCount");
                if (resultCount) resultCount.textContent = `${filtered.length} məhsul tapıldı`;
            } else if (productGrid) {
                renderProducts();
            }
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") searchBtn?.click();
        });
    }
    
    // Kataloq düyməsi
    const catalogBtn = document.getElementById("catalogBtn");
    if (catalogBtn) {
        catalogBtn.addEventListener("click", () => {
            document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" });
        });
    }
    
    // Mobile catalog
    const mobileCatalogBtn = document.getElementById("mobileCatalogBtn");
    const mobileCatalogDropdown = document.getElementById("mobileCatalogDropdown");
    if (mobileCatalogBtn && mobileCatalogDropdown) {
        mobileCatalogBtn.addEventListener("click", () => {
            mobileCatalogDropdown.style.display = mobileCatalogDropdown.style.display === "flex" ? "none" : "flex";
        });
        document.addEventListener("click", (e) => {
            if (!mobileCatalogBtn.contains(e.target) && !mobileCatalogDropdown.contains(e.target)) {
                mobileCatalogDropdown.style.display = "none";
            }
        });
    }
    
    // Compare və Wishlist düymələri
    const compareBtn = document.querySelector(".compare-btn:not(.product-card .compare-btn)");
    const wishlistBtn = document.querySelector(".wishlist-btn:not(.product-card .wishlist-btn)");
    const compareModal = document.getElementById("compareModal");
    const wishlistModal = document.getElementById("wishlistModal");
    const closeCompareBtn = document.getElementById("closeCompareBtn");
    const closeWishlistBtn = document.getElementById("closeWishlistBtn");
    
    if (compareBtn && compareModal) compareBtn.addEventListener("click", () => { updateCompareUI(); compareModal.classList.add("active"); });
    if (wishlistBtn && wishlistModal) wishlistBtn.addEventListener("click", () => { updateWishlistUI(); wishlistModal.classList.add("active"); });
    if (closeCompareBtn) closeCompareBtn.addEventListener("click", () => compareModal?.classList.remove("active"));
    if (closeWishlistBtn) closeWishlistBtn.addEventListener("click", () => wishlistModal?.classList.remove("active"));
});