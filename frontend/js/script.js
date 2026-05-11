// ========== FIREBASE KONFİQURASİYASI ==========
const firebaseConfigGlobal = {
    apiKey: "AIzaSyAOI9XZkJvcxtm3VBHSRBv3PW6WxaI35Tw",
    authDomain: "ismart-shop-3b29c.firebaseapp.com",
    databaseURL: "https://ismart-shop-3b29c-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "ismart-shop-3b29c",
    storageBucket: "ismart-shop-3b29c.firebasestorage.app",
    messagingSenderId: "824646870381",
    appId: "1:824646870381:web:0160c2c5993adcc762e664"
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfigGlobal);
}
const database = firebase.database();

// ========== QLOBAL DƏYİŞƏNLƏR ==========
let allProducts = [];
let currentBrand = 'all';
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

// ========== KÖMƏKÇİ FUNKSİYALAR ==========
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

function showToast(message, type = 'success') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.style.background = type === 'success' ? '#10b981' : '#ef4444';
    toast.innerText = message;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

// ========== SƏBƏT FUNKSİYALARI ==========
function updateCartCount() {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElem = document.getElementById('cartCount');
    if (cartCountElem) cartCountElem.innerText = total;
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(id, name, price, image) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ id, name, price, quantity: 1, image });
    }
    updateCartCount();
    showToast(`${name} səbətə əlavə edildi! ✅`);
}

// ========== SİFARİŞ FUNKSİYALARI ==========
function submitOrder() {
    if (cart.length === 0) {
        showToast('Səbətiniz boşdur!', 'error');
        return;
    }

    const customerName = prompt('Adınız və Soyadınız:');
    if (!customerName) return;
    
    const phone = prompt('Telefon nömrəniz (+994XXXXXXXXX):');
    if (!phone) return;
    
    const address = prompt('Çatdırılma ünvanınız:');
    if (!address) return;
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const order = {
        orderNumber: 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
        customerName: customerName,
        phone: phone,
        address: address,
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        })),
        total: total,
        paymentMethod: 'cash',
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    database.ref('orders').push(order).then(() => {
        showToast(`✅ Sifarişiniz qəbul edildi!\nSifariş №: ${order.orderNumber}\nÜmumi: ${total} AZN`);
        cart = [];
        updateCartCount();
    }).catch(err => {
        showToast('Xəta: ' + err.message, 'error');
    });
}

// ========== KAMPANİYA SLAYDERİ ==========
function loadCampaigns() {
    const sliderWrapper = document.getElementById('campaignSlider');
    if (!sliderWrapper) return;
    
    database.ref('campaigns').once('value', (snapshot) => {
        const data = snapshot.val();
        let campaigns = [];
        if (data) {
            campaigns = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        }
        const activeCampaigns = campaigns.filter(c => c.status === 'active');
        
        if (activeCampaigns.length === 0) {
            sliderWrapper.innerHTML = `
                <div class="swiper-slide">
                    <div class="slide-content" style="background: linear-gradient(135deg, #2563eb, #1d4ed8);">
                        <div class="slide-text">
                            <span class="slide-badge">🎯 Xoş gəldiniz</span>
                            <h2>iSmart.az</h2>
                            <p>Ən yeni telefonlar, aksesuarlar və təmir xidmətləri</p>
                            <a href="telefonlar.html" class="btn">Kataloqa bax →</a>
                        </div>
                        <div class="slide-image">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/IPhone_15_pro.png/200px-IPhone_15_pro.png" alt="iPhone">
                        </div>
                    </div>
                </div>
            `;
        } else {
            sliderWrapper.innerHTML = activeCampaigns.map(c => `
                <div class="swiper-slide">
                    <div class="slide-content" style="background: linear-gradient(135deg, ${c.theme === 'orange' ? '#f59e0b' : c.theme === 'purple' ? '#8b5cf6' : '#2563eb'}, ${c.theme === 'orange' ? '#d97706' : c.theme === 'purple' ? '#7c3aed' : '#1d4ed8'});">
                        <div class="slide-text">
                            <span class="slide-badge">🎯 Kampaniya</span>
                            <h2>${escapeHtml(c.title)}</h2>
                            <p>${escapeHtml(c.description || '')}</p>
                            <a href="${c.link || 'telefonlar.html'}" class="btn">Ətraflı bax →</a>
                        </div>
                        <div class="slide-image">
                            <img src="${c.image || 'https://placehold.co/300x200'}" onerror="this.src='https://placehold.co/300x200'">
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        setTimeout(() => {
            if (window.heroSwiper) window.heroSwiper.destroy(true, true);
            window.heroSwiper = new Swiper('.heroSwiper', {
                loop: activeCampaigns.length >= 2,
                autoplay: activeCampaigns.length >= 1 ? { delay: 5000, disableOnInteraction: false } : false,
                pagination: { el: '.swiper-pagination', clickable: true },
                navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }
            });
        }, 100);
    });
}

// ========== MƏHSUL GÖSTERİMİ ==========
function renderProducts() {
    let filtered = [...allProducts];
    
    if (currentBrand !== 'all') {
        filtered = filtered.filter(p => p.brand === currentBrand);
    }
    
    const resultCount = document.getElementById('resultCount');
    if (resultCount) resultCount.innerText = filtered.length + ' məhsul';
    
    const container = document.getElementById('productsGrid');
    if (!container) return;
    
    if (filtered.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:40px;">🔍 Heç bir məhsul tapılmadı</p>';
        return;
    }
    
    container.innerHTML = filtered.map(p => `
        <div class="product-card">
            <img src="${p.image || 'https://placehold.co/200x200'}" onerror="this.src='https://placehold.co/200x200'">
            <h3>${escapeHtml(p.name)}</h3>
            <p class="product-meta">${escapeHtml(p.meta || '')}</p>
            <div>
                <span class="price">${p.price} AZN</span>
                ${p.discount ? `<span class="old-price">${p.oldPrice} AZN</span><span class="discount-badge">-${p.discount}%</span>` : ''}
            </div>
            <button class="add-to-cart" onclick="addToCart('${p.id}', '${escapeHtml(p.name)}', ${p.price}, '${p.image}')">🛒 Səbətə at</button>
        </div>
    `).join('');
}

// ========== FIREBASEDƏN MƏHSUL YÜKLƏ ==========
function loadProducts() {
    database.ref('products').on('value', (snapshot) => {
        const data = snapshot.val();
        allProducts = [];
        if (data) {
            allProducts = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        }
        renderProducts();
    });
}

// ========== FİLTR ==========
function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-chip');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentBrand = btn.dataset.brand;
            renderProducts();
        });
    });
}

// ========== SƏBƏT DÜYMƏSİ ==========
function initCartButton() {
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.onclick = () => {
            if (cart.length === 0) {
                showToast('Səbətiniz boşdur!', 'error');
                return;
            }
            
            let msg = '🛒 Səbətiniz:\n\n';
            let total = 0;
            cart.forEach(item => {
                msg += `${item.name} x ${item.quantity} = ${item.price * item.quantity} AZN\n`;
                total += item.price * item.quantity;
            });
            msg += `\n━━━━━━━━━━━━━━━━━━━━\n💰 ÜMUMİ: ${total} AZN\n\n`;
            msg += 'Sifarişi təsdiqləmək istəyirsiniz?';
            
            if (confirm(msg)) {
                submitOrder();
            }
        };
    }
}

// ========== MƏHSUL YÜKLƏ (KATEQORİYA ÜÇÜN) ==========
function loadProductsByCategory(category) {
    database.ref('products').orderByChild('category').equalTo(category).on('value', (snapshot) => {
        const data = snapshot.val();
        const products = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
        const container = document.getElementById('productsGrid');
        if (!container) return;
        
        if (products.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding:40px;">📭 Hələ məhsul yoxdur</p>';
            return;
        }
        
        container.innerHTML = products.map(p => `
            <div class="product-card">
                <img src="${p.image || 'https://placehold.co/200x200'}" onerror="this.src='https://placehold.co/200x200'">
                <h3>${escapeHtml(p.name)}</h3>
                <p class="product-meta">${escapeHtml(p.meta || '')}</p>
                <div class="price">${p.price} AZN</div>
                <button class="add-to-cart" onclick="addToCart('${p.id}', '${escapeHtml(p.name)}', ${p.price}, '${p.image}')">🛒 Səbətə at</button>
            </div>
        `).join('');
    });
}

// ========== BAŞLAT ==========
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCampaigns();
    initFilters();
    initCartButton();
    updateCartCount();
});