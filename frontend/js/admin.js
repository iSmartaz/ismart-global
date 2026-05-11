// Firebase konfiqurasiyası
const firebaseConfigAdmin = {
    apiKey: "AIzaSyAOI9XZkJvcxtm3VBHSRBv3PW6WxaI35Tw",
    authDomain: "ismart-shop-3b29c.firebaseapp.com",
    databaseURL: "https://ismart-shop-3b29c-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "ismart-shop-3b29c",
    storageBucket: "ismart-shop-3b29c.firebasestorage.app",
    messagingSenderId: "824646870381",
    appId: "1:824646870381:web:0160c2c5993adcc762e664"
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfigAdmin);
}
const database = firebase.database();

// ADMIN GİRİŞ MƏLUMATLARI
const ADMIN_USER = "admin";
const ADMIN_PASS = "ismart2026";

// ========== GİRİŞ SİSTEMİ ==========
function checkAdminLogin() {
    return sessionStorage.getItem('admin') === 'true';
}

function showAdminPanel() {
    const loginPanel = document.getElementById('loginPanel');
    const adminPanel = document.getElementById('adminPanel');
    if (loginPanel) loginPanel.style.display = 'none';
    if (adminPanel) adminPanel.style.display = 'block';
    loadAllData();
}

function showLoginPanel() {
    const loginPanel = document.getElementById('loginPanel');
    const adminPanel = document.getElementById('adminPanel');
    if (loginPanel) loginPanel.style.display = 'flex';
    if (adminPanel) adminPanel.style.display = 'none';
}

// Login düyməsi
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
    loginBtn.onclick = () => {
        const user = document.getElementById('adminUser').value;
        const pass = document.getElementById('adminPass').value;
        if (user === ADMIN_USER && pass === ADMIN_PASS) {
            sessionStorage.setItem('admin', 'true');
            showAdminPanel();
        } else {
            const errorEl = document.getElementById('loginError');
            if (errorEl) errorEl.innerText = '❌ İstifadəçi adı və ya şifrə yanlış!';
        }
    };
}

// Logout düyməsi
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.onclick = () => {
        sessionStorage.removeItem('admin');
        showLoginPanel();
    };
}

// Session varsa admin paneli göstər
if (checkAdminLogin()) {
    showAdminPanel();
}

// ========== TAB KEÇİD ==========
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.onclick = () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            const tabId = document.getElementById(`tab-${btn.dataset.tab}`);
            if (tabId) tabId.classList.add('active');
        };
    });
}

// ========== MƏHSUL FUNKSİYALARI ==========
function loadProducts() {
    database.ref('products').on('value', (snapshot) => {
        const data = snapshot.val();
        const products = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
        
        const statProducts = document.getElementById('statProducts');
        if (statProducts) statProducts.innerText = products.length;
        
        const container = document.getElementById('productsList');
        if (!container) return;
        
        if (products.length === 0) {
            container.innerHTML = '<p>Hələ məhsul yoxdur</p>';
            return;
        }
        
        container.innerHTML = products.map(p => `
            <div class="item-card">
                <div style="display:flex; align-items:center; gap:15px;">
                    <img src="${p.image || 'https://placehold.co/50x50'}" onerror="this.src='https://placehold.co/50x50'">
                    <div><strong>${escapeHtml(p.name)}</strong><br>${p.price} AZN | ${p.category || '-'}</div>
                </div>
                <button class="btn-danger" onclick="deleteProduct('${p.id}')">🗑️ Sil</button>
            </div>
        `).join('');
    });
}

window.deleteProduct = (id) => {
    if (confirm('Bu məhsulu silmək istədiyinizə əminsiniz?')) {
        database.ref('products/' + id).remove();
        alert('Məhsul silindi!');
    }
};

const saveProductBtn = document.getElementById('saveProductBtn');
if (saveProductBtn) {
    saveProductBtn.onclick = () => {
        const name = document.getElementById('productName').value.trim();
        const price = parseFloat(document.getElementById('productPrice').value);
        const discount = parseInt(document.getElementById('productDiscount').value) || 0;
        const category = document.getElementById('productCategory').value;
        const brand = document.getElementById('productBrand').value;
        const meta = document.getElementById('productMeta').value.trim();
        const image = document.getElementById('productImage').value.trim();
        
        if (!name || !price) {
            alert('Məhsul adı və qiymət mütləqdir!');
            return;
        }
        
        const finalPrice = discount > 0 ? price - (price * discount / 100) : price;
        
        const product = {
            name: name,
            price: finalPrice,
            oldPrice: price,
            discount: discount,
            category: category,
            brand: brand,
            meta: meta,
            image: image || 'https://placehold.co/200x200',
            createdAt: new Date().toISOString()
        };
        
        database.ref('products').push(product).then(() => {
            alert('✅ Məhsul əlavə edildi!');
            document.getElementById('productName').value = '';
            document.getElementById('productPrice').value = '';
            document.getElementById('productDiscount').value = '0';
            document.getElementById('productMeta').value = '';
            document.getElementById('productImage').value = '';
        }).catch(err => alert('Xəta: ' + err.message));
    };
}

// ========== KAMPANİYA FUNKSİYALARI ==========
function loadCampaigns() {
    database.ref('campaigns').on('value', (snapshot) => {
        const data = snapshot.val();
        const campaigns = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
        
        const statCampaigns = document.getElementById('statCampaigns');
        if (statCampaigns) statCampaigns.innerText = campaigns.length;
        
        const container = document.getElementById('campaignsList');
        if (!container) return;
        
        if (campaigns.length === 0) {
            container.innerHTML = '<p>Hələ kampaniya yoxdur</p>';
            return;
        }
        
        container.innerHTML = campaigns.map(c => `
            <div class="item-card">
                <div><strong>${escapeHtml(c.title)}</strong><br>${c.description || ''}</div>
                <button class="btn-danger" onclick="deleteCampaign('${c.id}')">🗑️ Sil</button>
            </div>
        `).join('');
    });
}

window.deleteCampaign = (id) => {
    if (confirm('Bu kampaniyanı silmək istədiyinizə əminsiniz?')) {
        database.ref('campaigns/' + id).remove();
        alert('Kampaniya silindi!');
    }
};

const saveCampaignBtn = document.getElementById('saveCampaignBtn');
if (saveCampaignBtn) {
    saveCampaignBtn.onclick = () => {
        const title = document.getElementById('campaignTitle').value.trim();
        const description = document.getElementById('campaignDesc').value.trim();
        const image = document.getElementById('campaignImage').value.trim();
        const theme = document.getElementById('campaignTheme').value;
        const link = document.getElementById('campaignLink').value.trim();
        const status = document.getElementById('campaignStatus').value;
        
        if (!title) {
            alert('Kampaniya başlığı mütləqdir!');
            return;
        }
        
        const campaign = {
            title: title,
            description: description,
            image: image || 'https://placehold.co/600x300',
            theme: theme,
            link: link || 'telefonlar.html',
            status: status,
            createdAt: new Date().toISOString()
        };
        
        database.ref('campaigns').push(campaign).then(() => {
            alert('✅ Kampaniya əlavə edildi!');
            document.getElementById('campaignTitle').value = '';
            document.getElementById('campaignDesc').value = '';
            document.getElementById('campaignImage').value = '';
        }).catch(err => alert('Xəta: ' + err.message));
    };
}

// ========== ENDİRİM KODLARI ==========
function loadCoupons() {
    database.ref('coupons').on('value', (snapshot) => {
        const data = snapshot.val();
        const coupons = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
        
        const statCoupons = document.getElementById('statCoupons');
        if (statCoupons) statCoupons.innerText = coupons.length;
        
        const container = document.getElementById('couponsList');
        if (!container) return;
        
        if (coupons.length === 0) {
            container.innerHTML = '<p>Hələ endirim kodu yoxdur</p>';
            return;
        }
        
        container.innerHTML = coupons.map(c => `
            <div class="item-card">
                <div><strong>${escapeHtml(c.code)}</strong><br>${c.discount}% endirim</div>
                <button class="btn-danger" onclick="deleteCoupon('${c.id}')">🗑️ Sil</button>
            </div>
        `).join('');
    });
}

window.deleteCoupon = (id) => {
    if (confirm('Bu endirim kodunu silmək istədiyinizə əminsiniz?')) {
        database.ref('coupons/' + id).remove();
        alert('Kod silindi!');
    }
};

const saveCouponBtn = document.getElementById('saveCouponBtn');
if (saveCouponBtn) {
    saveCouponBtn.onclick = () => {
        const code = document.getElementById('couponCode').value.trim().toUpperCase();
        const discount = parseInt(document.getElementById('couponDiscount').value);
        const minAmount = parseInt(document.getElementById('couponMinAmount').value) || 0;
        const expiry = document.getElementById('couponExpiry').value;
        const active = document.getElementById('couponActive').value;
        
        if (!code || !discount) {
            alert('Kod və endirim faizi mütləqdir!');
            return;
        }
        
        const coupon = {
            code: code,
            discount: discount,
            minAmount: minAmount,
            expiry: expiry,
            active: active,
            createdAt: new Date().toISOString()
        };
        
        database.ref('coupons').push(coupon).then(() => {
            alert('✅ Endirim kodu əlavə edildi!');
            document.getElementById('couponCode').value = '';
            document.getElementById('couponDiscount').value = '10';
            document.getElementById('couponMinAmount').value = '0';
            document.getElementById('couponExpiry').value = '';
        }).catch(err => alert('Xəta: ' + err.message));
    };
}

// ========== SİFARİŞ SAYI ==========
function loadOrdersCount() {
    database.ref('orders').on('value', (snapshot) => {
        const data = snapshot.val();
        const count = data ? Object.keys(data).length : 0;
        const statOrders = document.getElementById('statOrders');
        if (statOrders) statOrders.innerText = count;
    });
}

// ========== KÖMƏKÇİ ==========
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

function loadAllData() {
    initTabs();
    loadProducts();
    loadCampaigns();
    loadCoupons();
    loadOrdersCount();
}