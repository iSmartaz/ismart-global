/* ======================================== */
/* 1. SƏBƏT DƏYİŞƏNİ (CART ARRAY)         */
/* ======================================== */
let cart = [];  // Səbətdəki məhsulları saxlayan array

/* ======================================== */
/* 2. DEFAULT MƏHSULLAR (İLKİN MƏLUMATLAR) */
/* ======================================== */
/* Bu array sayt ilk dəfə açılanda localStorage-da heç məhsul yoxdursa istifadə olunur */
const DEFAULT_PRODUCTS = [
    /* Telefonlar */
    { id: "1", category: "phones", name: "iPhone 15 Pro", price: 2499, priceText: "2 499 AZN", meta: "128 GB · Natural Titanium", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/IPhone_15_pro.png/300px-IPhone_15_pro.png", specs: "6.1 ekran, 48 MP, iOS", badge: "0% 12 ay", stock: "Stokda var" },
    { id: "2", category: "phones", name: "Samsung Galaxy S24 Ultra", price: 2699, priceText: "2 699 AZN", meta: "256 GB · Titanium Gray", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Samsung_Galaxy_S24_Ultra_in_Titanium_Gray.png/300px-Samsung_Galaxy_S24_Ultra_in_Titanium_Gray.png", specs: "6.8 ekran, 200 MP, S Pen", badge: "0% 18 ay", stock: "Top model" },
    { id: "3", category: "phones", name: "Xiaomi 14 Pro", price: 1599, priceText: "1 599 AZN", meta: "512 GB · Black", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Xiaomi_14_Pro.jpg/300px-Xiaomi_14_Pro.jpg", specs: "AMOLED, Leica, 120W", badge: "0% 12 ay", stock: "Sərfəli" },
    { id: "4", category: "phones", name: "iPhone 14 Pro Max", price: 2199, priceText: "2 199 AZN", meta: "256 GB · Deep Purple", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/IPhone_14_Pro_Max.png/300px-IPhone_14_Pro_Max.png", specs: "6.7 ekran, Face ID, 5G", badge: "0% 12 ay", stock: "Populyar" },
    /* Aksesuarlar */
    { id: "10", category: "accessories", name: "AirPods Pro 2", price: 399, priceText: "399 AZN", meta: "USB-C · Aktiv səs izolyasiyası", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/AirPods_Pro_2nd_generation.png/300px-AirPods_Pro_2nd_generation.png", specs: "ANC, USB-C, Apple", badge: "0% 6 ay", stock: "Original" },
    { id: "11", category: "accessories", name: "Samsung Galaxy Buds 2 Pro", price: 349, priceText: "349 AZN", meta: "Graphite · Wireless", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Samsung_Galaxy_Buds_2_Pro.png/300px-Samsung_Galaxy_Buds_2_Pro.png", specs: "ANC, Hi-Fi, Samsung", badge: "0% 6 ay", stock: "Bluetooth" },
    { id: "12", category: "accessories", name: "MagSafe şarj cihazı", price: 149, priceText: "149 AZN", meta: "Wireless · iPhone üçün", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/MagSafe_charger.png/300px-MagSafe_charger.png", specs: "15W, USB-C, MagSafe", badge: "0% 3 ay", stock: "15W" },
    { id: "13", category: "accessories", name: "Apple 20W USB-C Adapter", price: 69, priceText: "69 AZN", meta: "Sürətli şarj · USB-C", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Apple_USB-C_Power_Adapter_20W.png/300px-Apple_USB-C_Power_Adapter_20W.png", specs: "20W, USB-C, Adapter", badge: "Aksesuar", stock: "Yeni" },
    /* Təmir xidmətləri */
    { id: "20", category: "repair", name: "Ekran dəyişimi", price: 199, priceText: "199 AZN-dən", meta: "Modelə görə qiymət dəyişir", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Smartphone_cracked_screen.jpg/300px-Smartphone_cracked_screen.jpg", specs: "iPhone, Samsung, Xiaomi", badge: "Təmir", stock: "Diaqnostika" },
    { id: "21", category: "repair", name: "Batareya dəyişimi", price: 99, priceText: "99 AZN-dən", meta: "Batareya zəifləməsi və şişməsi", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Cell_Phone_Repair.jpg/300px-Cell_Phone_Repair.jpg", specs: "Test, Servis, Zəmanət", badge: "Təmir", stock: "Sürətli" },
    { id: "22", category: "repair", name: "Kamera təmiri", price: 149, priceText: "149 AZN-dən", meta: "Ön və arxa kamera xidməti", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Cell_Phone_Repair.jpg/300px-Cell_Phone_Repair.jpg", specs: "Kamera, Şüşə, Test", badge: "Təmir", stock: "Servis" },
    { id: "23", category: "repair", name: "Proqram təminatı və diaqnostika", price: 29, priceText: "29 AZN-dən", meta: "Yavaşlama, yaddaş və sistem yoxlanışı", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Cell_Phone_Repair.jpg/300px-Cell_Phone_Repair.jpg", specs: "Android, iOS, Backup", badge: "Servis", stock: "Tez baxış" }
];

/* ======================================== */
/* 3. MƏHSUL MƏLUMATLARINI YÜKLƏ (localStorage-dan) */
/* ======================================== */
/* getProducts(): localStorage-da saxlanmış məhsulları qaytarır */
/* Əgər yoxdursa, DEFAULT_PRODUCTS-i yadda saxlayır və onu qaytarır */
function getProducts() {
    const saved = localStorage.getItem("ismartProducts");
    if (!saved) {
        localStorage.setItem("ismartProducts", JSON.stringify(DEFAULT_PRODUCTS));
        return DEFAULT_PRODUCTS;
    }
    try {
        return JSON.parse(saved);
    } catch {
        localStorage.setItem("ismartProducts", JSON.stringify(DEFAULT_PRODUCTS));
        return DEFAULT_PRODUCTS;
    }
}

/* ======================================== */
/* 4. QİYMƏT FORMATLA (AZN ilə)            */
/* ======================================== */
/* formatPrice(price): rəqəmi AZN formatında göstərir (məs: 2 499 AZN) */
function formatPrice(price) {
    return `${Number(price).toLocaleString("az-AZ")} AZN`;
}

/* ======================================== */
/* 5. SƏBƏT FUNKSİYALARI                   */
/* ======================================== */
/* saveCart(): səbəti localStorage-da saxlayır */
function saveCart() {
    localStorage.setItem("ismartCart", JSON.stringify(cart));
}

/* updateCartUI(): səbət modalının içini yeniləyir (məhsulları göstərir, cəmi hesablayır) */
function updateCartUI() {
    const cartCount = document.getElementById("cartCount");
    const cartItemsContainer = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    if (!cartCount || !cartItemsContainer || !cartTotal) return;
    
    /* Səbətdəki məhsulların sayını hesablayır */
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartItemsContainer.innerHTML = "";
    
    /* Səbət boşdursa */
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">Səbətiniz boşdur</div>';
        cartTotal.textContent = "0 AZN";
        return;
    }
    
    /* Hər bir məhsul üçün səbət sırası yaradır */
    let total = 0;
    cart.forEach(function (item) {
        total += item.price * item.quantity;
        cartItemsContainer.insertAdjacentHTML("beforeend", `
            <div class="cart-item">
                <div class="cart-item-info"><h4>${escapeHtml(item.name)}</h4><p>${formatPrice(item.price)} x ${item.quantity}</p></div>
                <div class="cart-item-controls">
                    <button class="quantity-btn decrease" data-id="${item.id}" type="button">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn increase" data-id="${item.id}" type="button">+</button>
                    <button class="remove-item" data-id="${item.id}" type="button">Sil</button>
                </div>
            </div>
        `);
    });
    cartTotal.textContent = formatPrice(total);
}

/* loadCart(): localStorage-dan səbəti yükləyir və UI-ni yeniləyir */
function loadCart() {
    const savedCart = localStorage.getItem("ismartCart");
    cart = savedCart ? JSON.parse(savedCart) : [];
    updateCartUI();
}

/* ======================================== */
/* 6. TOAST BİLDİRİŞİ (pop-up mesaj)       */
/* ======================================== */
/* showToast(): səbətə məhsul əlavə edəndə aşağıda çıxan bildiriş */
function showToast(message) {
    let toast = document.querySelector('.toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast-notification';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-regular fa-circle-check"></i> ${message}`;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

/* ======================================== */
/* 7. SƏBƏTƏ MƏHSUL ƏLAVƏ ET                */
/* ======================================== */
/* addToCart(): məhsulu səbətə əlavə edir, əgər varsa sayını artırır */
function addToCart(id, name, price) {
    const numericPrice = Number(price);
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price: numericPrice, quantity: 1 });
    }
    saveCart();
    updateCartUI();
    showToast(`${name} səbətə əlavə edildi!`);
    const cartModal = document.getElementById("cartModal");
    if (cartModal) {
        cartModal.classList.add("active");
        cartModal.setAttribute("aria-hidden", "false");
    }
}

/* ======================================== */
/* 8. WHATSAPP MESAJI YARAT                 */
/* ======================================== */
/* buildWhatsappMessage(): səbətdəki məhsulları WhatsApp mesajına çevirir */
function buildWhatsappMessage() {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const lines = cart.map(item => `▸ ${item.name} – ${item.quantity} ədəd × ${formatPrice(item.price)} = ${formatPrice(item.price * item.quantity)}`);
    return `🛒 *iSmart.az sifarişim*%0A%0A${lines.join("%0A")}%0A%0A💰 *Cəmi:* ${formatPrice(total)}%0A%0A📦 Çatdırılma məlumatı üçün gözləyirəm.`;
}

/* ======================================== */
/* 9. HTML-İ TƏHLÜKƏSİZDƏN TƏMİZLƏ (XSS qorunması) */
/* ======================================== */
/* escapeHtml(): mətnin içindəki <, >, & işarələrini təhlükəsiz formata çevirir */
function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

/* ======================================== */
/* 10. MƏHSUL KARTI YARADAN FUNKSİYA        */
/* ======================================== */
/* productCard(): hər bir məhsul üçün HTML kart yaradır */
/* - Məhsul şəkli, adı, metası, spesifikasiyaları, qiyməti, condition badge (yeni/ikinci əl/təmirli) */
/* - Kredit ayı və faiz varsa aşağıda göstərir */
function productCard(product) {
    const specs = String(product.specs || "").split(",").map(item => item.trim()).filter(Boolean);
    const serviceClass = product.category === "repair" ? " service-card" : "";
    const currencySymbol = product.currency === "USD" ? "$" : product.currency === "EUR" ? "€" : product.currency === "TRY" ? "₺" : "₼";
    const priceText = product.priceText ? product.priceText : `${currencySymbol}${product.price.toLocaleString("az-AZ")}`;
    
    /* Condition badge (Yeni / İkinci əl / Təmirli) */
    let conditionClass = "", conditionText = "";
    if (product.condition === "yeni") { conditionClass = "badge-new"; conditionText = "✨ Yeni"; }
    else if (product.condition === "ikinci") { conditionClass = "badge-used"; conditionText = "🔄 İkinci əl"; }
    else if (product.condition === "temirli") { conditionClass = "badge-repaired"; conditionText = "🔧 Təmirli"; }
    
    /* Kredit məlumatı (əgər varsa) */
    let installmentHtml = "";
    if (product.installment && product.installment !== "0 ay") {
        installmentHtml = `<div class="installment-info">${product.installment} | ${product.installmentRate} faiz</div>`;
    }
    
    return `
        <article class="product-card${serviceClass}" data-category="${product.category}" data-id="${product.id}" data-name="${escapeHtml(product.name)}" data-price="${product.price}">
            <div class="product-top">
                <span class="condition-badge ${conditionClass}">${conditionText}</span>
                <span class="stock">${escapeHtml(product.stock) || "Stokda var"}</span>
            </div>
            <div class="product-image"><img src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy"></div>
            <h3>${escapeHtml(product.name)}</h3>
            <p class="product-meta">${escapeHtml(product.meta) || ""}</p>
            <div class="product-specs">${specs.map(spec => `<span>${escapeHtml(spec)}</span>`).join("")}</div>
            <p class="price">${priceText}</p>
            ${installmentHtml}
            <button class="btn add-to-cart" type="button">Səbətə at</button>
        </article>
    `;
}

/* ======================================== */
/* 11. SƏHİFƏ YÜKLƏNDİKDƏ İŞLƏYƏN ƏSAS FUNKSİYA */
/* ======================================== */
document.addEventListener("DOMContentLoaded", function () {
    const productGrid = document.querySelector(".product-grid");
    const resultCount = document.getElementById("resultCount");
    let productCards = [];
    let activeCategory = "all";      /* Aktiv kateqoriya (bütün, telefon, aksesuar, təmir) */
    let activeSearch = "";           /* Aktiv axtarış sözü */

    /* Cari səhifənin kateqoriyasını təyin edir (telefonlar.html -> phones, index.html -> home) */
    function currentPageCategory() {
        const page = location.pathname.toLowerCase();
        if (page.includes("telefonlar")) return "phones";
        if (page.includes("aksesuarlar")) return "accessories";
        if (page.includes("temir")) return "repair";
        return "home";
    }

    /* Məhsulları səhifəyə yerləşdirir */
    function renderProducts() {
        if (!productGrid) return;
        const pageCategory = currentPageCategory();
        const products = getProducts();
        let visibleProducts = products;
        
        /* Ana səhifədə (index.html) yalnız 3 məhsul göstərir (hər kateqoriyadan bir) */
        if (pageCategory === "home") {
            visibleProducts = [
                products.find(item => item.category === "phones"),
                products.find(item => item.category === "accessories"),
                products.find(item => item.category === "repair")
            ].filter(Boolean);
        } else {
            visibleProducts = products.filter(item => item.category === pageCategory);
            activeCategory = pageCategory;
        }
        
        productGrid.innerHTML = visibleProducts.map(productCard).join("");
        productCards = Array.from(document.querySelectorAll(".product-card"));
        if (resultCount) {
            resultCount.textContent = `${visibleProducts.length} məhsul göstərilir`;
        }
        
        renderFeaturedProducts();  /* Yeni və İkinci əl məhsulları karousel üçün göstərir */
        loadCampaignsToSlider();   /* Kampaniyaları sliderda göstərir */
    }

    /* ======================================== */
    /* 12. YENİ VƏ İKİNCİ ƏL MƏHSULLARI GÖSTƏR (Karousel üçün) */
    /* ======================================== */
    function renderFeaturedProducts() {
        const products = getProducts();
        const newProducts = products.filter(p => p.condition === "yeni" && p.category === "phones").slice(0, 8);
        const usedProducts = products.filter(p => p.condition === "ikinci" && p.category === "phones").slice(0, 8);
        
        const newWrapper = document.getElementById("newProductsWrapper");
        const usedWrapper = document.getElementById("usedProductsWrapper");
        
        if (newWrapper) {
            newWrapper.innerHTML = newProducts.map(p => `<div class="swiper-slide">${productCard(p)}</div>`).join("");
        }
        if (usedWrapper) {
            usedWrapper.innerHTML = usedProducts.map(p => `<div class="swiper-slide">${productCard(p)}</div>`).join("");
        }
        
        /* Populyar məhsullar (ana səhifənin alt hissəsi) */
        const popularContainer = document.getElementById("popularProducts");
        if (popularContainer) {
            const popular = products.filter(p => p.category === "phones").slice(0, 3);
            popularContainer.innerHTML = popular.map(p => productCard(p)).join("");
        }
        
        setTimeout(initProductSwipers, 100);
    }

    /* Kampaniya sliderında istifadə olunan rənglər */
    const themes = ["blue", "orange", "purple", "green", "red"];

    /* ======================================== */
    /* 13. KAMPANİYALARI SLİDERDA GÖSTƏR       */
    /* ======================================== */
    function loadCampaignsToSlider() {
        const campaigns = JSON.parse(localStorage.getItem("ismartCampaigns") || "[]");
        const activeCampaigns = campaigns.filter(c => c.status === "active").sort((a,b) => a.order - b.order);
        const sliderWrapper = document.getElementById("campaignSlider");
        
        if (!sliderWrapper) return;
        
        let campaignsToShow = activeCampaigns;
        /* Əgər heç bir kampaniya yoxdursa, default kampaniyaları göstər */
        if (activeCampaigns.length === 0) {
            campaignsToShow = [
                { id: "default1", title: "0% Faiz 12 Ay", description: "Bütün telefonlarda 12 ay ərzində 0% faiz imkanı", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/IPhone_15_pro.png/200px-IPhone_15_pro.png", link: "telefonlar.html" },
                { id: "default2", title: "Yeni iPhone 17 Pro", description: "Ən yeni Titanium dizayn, A19 Bionic çip", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/IPhone_15_pro.png/200px-IPhone_15_pro.png", link: "telefonlar.html" },
                { id: "default3", title: "AirPods Pro 2", description: "Aktiv səs izolyasiyası, USB-C şarj", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/AirPods_Pro_2nd_generation.png/200px-AirPods_Pro_2nd_generation.png", link: "aksesuarlar.html" }
            ];
        }
        
        sliderWrapper.innerHTML = campaignsToShow.map((c, idx) => {
            const theme = themes[idx % themes.length];
            return `
                <div class="swiper-slide">
                    <div class="slide-content" data-theme="${theme}">
                        <div class="slide-text">
                            <span class="slide-badge"><i class="fa-solid fa-gift"></i> Kampaniya</span>
                            <h2>${escapeHtml(c.title)}</h2>
                            <p>${escapeHtml(c.description)}</p>
                            <a href="${c.link}" class="btn primary-btn"><i class="fa-solid fa-arrow-right"></i> Ətraflı bax</a>
                        </div>
                        <div class="slide-image">
                            <div class="image-wrapper">
                                <img src="${c.image}" alt="${escapeHtml(c.title)}">
                                <div class="image-glow"></div>
                                <div class="image-ring"></div>
                                <div class="image-shadow"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
        
        setTimeout(initHeroSlider, 100);
    }

    /* ======================================== */
    /* 14. SLİDER (HƏRƏKƏTLİ BANNER) BAŞLAT   */
    /* ======================================== */
    function initHeroSlider() {
        if (document.querySelector('.heroSwiper')) {
            if (window.heroSwiper) window.heroSwiper.destroy(true, true);
            window.heroSwiper = new Swiper('.heroSwiper', {
                loop: true,
                autoplay: { delay: 5000, disableOnInteraction: false },
                pagination: { el: '.swiper-pagination', clickable: true },
                navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
                effect: 'slide',
                speed: 1000,
                parallax: true
            });
        }
    }

    /* ======================================== */
    /* 15. MƏHSULLAR KAROUSELİ BAŞLAT          */
    /* ======================================== */
    function initProductSwipers() {
        const productSwipers = document.querySelectorAll('.productSwiper');
        productSwipers.forEach(swiperEl => {
            if (swiperEl.swiper) swiperEl.swiper.destroy(true, true);
            new Swiper(swiperEl, {
                slidesPerView: 1,
                spaceBetween: 20,
                loop: true,
                autoplay: { delay: 5000, disableOnInteraction: false },
                pagination: { el: '.swiper-pagination', clickable: true },
                navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
                breakpoints: {
                    640: { slidesPerView: 2, spaceBetween: 20 },
                    768: { slidesPerView: 3, spaceBetween: 25 },
                    1024: { slidesPerView: 4, spaceBetween: 30 },
                }
            });
        });
    }

    /* ======================================== */
    /* 16. DOM ELEMENTLERİNİ SEÇ               */
    /* ======================================== */
    const navLinks = document.querySelectorAll(".nav-link");
    const cartBtn = document.getElementById("cartBtn");
    const closeCart = document.getElementById("closeCart");
    const cartModal = document.getElementById("cartModal");
    const cartItemsContainer = document.getElementById("cartItems");
    const checkoutBtn = document.querySelector(".checkout-btn");
    const categoryTabs = document.querySelectorAll(".category-card");
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    const catalogBtn = document.getElementById("catalogBtn");
    const productDetailModal = document.createElement("div");

    /* ======================================== */
    /* 17. MƏHSUL FİLTRƏLƏMƏ (Axtarış + Kateqoriya) */
    /* ======================================== */
    function applyProductFilters() {
        if (productCards.length === 0) return;
        let visibleCount = 0;
        const searchTerm = activeSearch.toLowerCase();
        
        productCards.forEach(function (card) {
            const category = card.getAttribute("data-category");
            const name = card.getAttribute("data-name").toLowerCase();
            const meta = card.querySelector(".product-meta")?.textContent.toLowerCase() || "";
            const specs = card.querySelector(".product-specs")?.innerText.toLowerCase() || "";
            const price = card.querySelector(".price")?.innerText.toLowerCase() || "";
            
            /* Axtarış - ad, meta, specs, price içində axtar */
            const matchesSearch = !activeSearch || 
                name.includes(searchTerm) || 
                meta.includes(searchTerm) || 
                specs.includes(searchTerm) || 
                price.includes(searchTerm);
            
            const matchesCategory = activeCategory === "all" || category === activeCategory;
            const shouldShow = matchesCategory && matchesSearch;
            
            card.hidden = !shouldShow;
            if (shouldShow) visibleCount += 1;
        });
        
        if (resultCount) {
            resultCount.textContent = visibleCount > 0 ? `${visibleCount} məhsul göstərilir` : "Uyğun məhsul tapılmadı";
        }
    }

    /* ======================================== */
    /* 18. MƏHSUL DETAİL MODALI (ƏTRAFLI BAX)  */
    /* ======================================== */
    function setupProductDetails() {
        if (productCards.length === 0) return;
        productDetailModal.className = "product-detail-modal";
        productDetailModal.setAttribute("aria-hidden", "true");
        productDetailModal.innerHTML = `
            <div class="product-detail-content" role="dialog" aria-modal="true" aria-label="Məhsul məlumatı">
                <button class="product-detail-close" type="button" aria-label="Bağla">&times;</button>
                <div class="product-detail-image"></div>
                <div class="product-detail-info">
                    <span class="product-detail-badge">iSmart.az</span>
                    <h2></h2>
                    <p class="product-detail-meta"></p>
                    <div class="product-detail-specs"></div>
                    <strong class="product-detail-price"></strong>
                    <div class="product-detail-actions">
                        <button class="btn primary-btn product-detail-cart" type="button">Səbətə at</button>
                        <a class="btn ghost-btn product-detail-whatsapp" target="_blank" rel="noopener">WhatsApp-la soruş</a>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(productDetailModal);
        
        productCards.forEach(function (card) {
            const action = document.createElement("button");
            action.className = "details-btn";
            action.type = "button";
            action.textContent = "Ətraflı bax";
            card.appendChild(action);
            action.addEventListener("click", () => openProductDetail(card));
            card.querySelector(".product-image")?.addEventListener("click", () => openProductDetail(card));
        });
        
        productDetailModal.addEventListener("click", function (event) {
            if (event.target === productDetailModal || event.target.classList.contains("product-detail-close")) closeProductDetail();
        });
    }

    /* Məhsul detal modalını açır */
    function openProductDetail(card) {
        const id = card.getAttribute("data-id");
        const name = card.getAttribute("data-name");
        const price = Number(card.getAttribute("data-price"));
        const image = card.querySelector(".product-image img")?.cloneNode(true);
        const imageBox = productDetailModal.querySelector(".product-detail-image");
        imageBox.innerHTML = "";
        if (image) imageBox.appendChild(image);
        
        productDetailModal.querySelector("h2").textContent = name;
        productDetailModal.querySelector(".product-detail-meta").textContent = card.querySelector(".product-meta")?.textContent || "";
        productDetailModal.querySelector(".product-detail-price").textContent = card.querySelector(".price")?.textContent || formatPrice(price);
        productDetailModal.querySelector(".product-detail-specs").innerHTML = Array.from(card.querySelectorAll(".product-specs span")).map(spec => `<span>${spec.textContent}</span>`).join("");
        
        productDetailModal.querySelector(".product-detail-cart").onclick = function () {
            addToCart(id, name, price);
            closeProductDetail();
        };
        productDetailModal.querySelector(".product-detail-whatsapp").href = `https://wa.me/994778002223?text=Salam, ${encodeURIComponent(name)} haqqında məlumat almaq istəyirəm.`;
        
        productDetailModal.classList.add("active");
        productDetailModal.setAttribute("aria-hidden", "false");
    }

    function closeProductDetail() {
        productDetailModal.classList.remove("active");
        productDetailModal.setAttribute("aria-hidden", "true");
    }

    /* ======================================== */
    /* 19. SƏBƏTƏ ƏLAVƏ ET DÜYMƏLƏRİ           */
    /* ======================================== */
    document.querySelectorAll(".add-to-cart").forEach(function (button) {
        button.addEventListener("click", function () {
            const productCardEl = button.closest(".product-card");
            addToCart(productCardEl.getAttribute("data-id"), productCardEl.getAttribute("data-name"), productCardEl.getAttribute("data-price"));
        });
    });

    /* ======================================== */
    /* 20. SƏBƏTDƏ MİQDAR DƏYİŞİKLİYİ (+, -, sil) */
    /* ======================================== */
    cartItemsContainer?.addEventListener("click", function (event) {
        const target = event.target;
        const id = target.getAttribute("data-id");
        if (!id) return;
        const item = cart.find(cartItem => cartItem.id === id);
        if (target.classList.contains("decrease") && item) {
            item.quantity > 1 ? item.quantity -= 1 : cart = cart.filter(cartItem => cartItem.id !== id);
        }
        if (target.classList.contains("increase") && item) item.quantity += 1;
        if (target.classList.contains("remove-item")) cart = cart.filter(cartItem => cartItem.id !== id);
        saveCart();
        updateCartUI();
    });

    /* ======================================== */
    /* 21. SƏBƏT MODALINI AÇ/BAGLA             */
    /* ======================================== */
    cartBtn?.addEventListener("click", function () {
        cartModal?.classList.add("active");
        cartModal?.setAttribute("aria-hidden", "false");
    });
    closeCart?.addEventListener("click", function () {
        cartModal?.classList.remove("active");
        cartModal?.setAttribute("aria-hidden", "true");
    });
    cartModal?.addEventListener("click", event => {
        if (event.target === cartModal) cartModal.classList.remove("active");
    });

    /* ======================================== */
    /* 22. CHECKOUT (WHATSAPP İLƏ SİFARİŞ)     */
    /* ======================================== */
    checkoutBtn?.addEventListener("click", function () {
        if (cart.length === 0) {
            alert("Səbətiniz boşdur!");
            return;
        }
        window.open(`https://wa.me/994778002223?text=${buildWhatsappMessage()}`, "_blank");
    });

    /* ======================================== */
    /* 23. KATEQORİYA TABLARI (FILTER)         */
    /* ======================================== */
    categoryTabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            categoryTabs.forEach(item => item.classList.remove("active"));
            tab.classList.add("active");
            activeCategory = tab.getAttribute("data-category");
            applyProductFilters();
            document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
        });
    });

    /* ======================================== */
    /* 24. AXTARIŞ FUNKSİYASI                  */
    /* ======================================== */
    function runSearch() {
        if (!searchInput) return;
        activeSearch = searchInput.value.trim().toLowerCase();
        applyProductFilters();
        document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
    }

    searchBtn?.addEventListener("click", runSearch);
    searchInput?.addEventListener("keydown", event => {
        if (event.key === "Enter") runSearch();
    });
    searchInput?.addEventListener("input", function () {
        activeSearch = searchInput.value.trim().toLowerCase();
        applyProductFilters();
    });

    /* ======================================== */
    /* 25. KATALOQ DÜYMƏSİ (KATEQORİYALARA APARIR) */
    /* ======================================== */
    catalogBtn?.addEventListener("click", function () {
        document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" });
    });

    /* ======================================== */
    /* 26. NAVİQASİYA LİNKLƏRİ (AKTİV SƏHİFƏ)  */
    /* ======================================== */
    navLinks.forEach(link => link.addEventListener("click", () => {
        navLinks.forEach(item => item.classList.remove("active"));
        link.classList.add("active");
    }));

    /* ======================================== */
    /* 27. ANKER LİNKLƏR (#contact, #campaigns) */
    /* ======================================== */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        const hash = anchor.getAttribute('href');
        if (hash === "#" || hash === "#contact" || hash === "#campaigns") {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const currentPage = window.location.pathname;
                if (!currentPage.endsWith("index.html") && currentPage !== "/") {
                    window.location.href = `index.html${hash}`;
                } else {
                    const target = document.querySelector(hash);
                    if (target) target.scrollIntoView({ behavior: "smooth" });
                }
            });
        }
    });

    /* ======================================== */
    /* 28. BAŞLATMA FUNKSİYALARI               */
    /* ======================================== */
    loadCart();
    renderProducts();
    applyProductFilters();
    setupProductDetails();
});