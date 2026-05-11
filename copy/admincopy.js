const ADMIN_USER = "admin";
const ADMIN_PASS = "iSmart2026";

const DEFAULT_PRODUCTS_ADMIN = [
    { id: "1", category: "phones", name: "iPhone 15 Pro", price: 2499, priceText: "2 499 AZN", meta: "128 GB · Natural Titanium", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/IPhone_15_pro.png/300px-IPhone_15_pro.png", specs: "6.1 ekran, 48 MP, iOS", badge: "0% 12 ay", stock: "Stokda var" },
    { id: "2", category: "phones", name: "Samsung Galaxy S24 Ultra", price: 2699, priceText: "2 699 AZN", meta: "256 GB · Titanium Gray", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Samsung_Galaxy_S24_Ultra_in_Titanium_Gray.png/300px-Samsung_Galaxy_S24_Ultra_in_Titanium_Gray.png", specs: "6.8 ekran, 200 MP, S Pen", badge: "0% 18 ay", stock: "Top model" },
    { id: "3", category: "phones", name: "Xiaomi 14 Pro", price: 1599, priceText: "1 599 AZN", meta: "512 GB · Black", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Xiaomi_14_Pro.jpg/300px-Xiaomi_14_Pro.jpg", specs: "AMOLED, Leica, 120W", badge: "0% 12 ay", stock: "Sərfəli" },
    { id: "4", category: "phones", name: "iPhone 14 Pro Max", price: 2199, priceText: "2 199 AZN", meta: "256 GB · Deep Purple", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/IPhone_14_Pro_Max.png/300px-IPhone_14_Pro_Max.png", specs: "6.7 ekran, Face ID, 5G", badge: "0% 12 ay", stock: "Populyar" },
    { id: "10", category: "accessories", name: "AirPods Pro 2", price: 399, priceText: "399 AZN", meta: "USB-C · Aktiv səs izolyasiyası", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/AirPods_Pro_2nd_generation.png/300px-AirPods_Pro_2nd_generation.png", specs: "ANC, USB-C, Apple", badge: "0% 6 ay", stock: "Original" },
    { id: "11", category: "accessories", name: "Samsung Galaxy Buds 2 Pro", price: 349, priceText: "349 AZN", meta: "Graphite · Wireless", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Samsung_Galaxy_Buds_2_Pro.png/300px-Samsung_Galaxy_Buds_2_Pro.png", specs: "ANC, Hi-Fi, Samsung", badge: "0% 6 ay", stock: "Bluetooth" },
    { id: "12", category: "accessories", name: "MagSafe şarj cihazı", price: 149, priceText: "149 AZN", meta: "Wireless · iPhone üçün", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/MagSafe_charger.png/300px-MagSafe_charger.png", specs: "15W, USB-C, MagSafe", badge: "0% 3 ay", stock: "15W" },
    { id: "13", category: "accessories", name: "Apple 20W USB-C Adapter", price: 69, priceText: "69 AZN", meta: "Sürətli şarj · USB-C", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Apple_USB-C_Power_Adapter_20W.png/300px-Apple_USB-C_Power_Adapter_20W.png", specs: "20W, USB-C, Adapter", badge: "Aksesuar", stock: "Yeni" },
    { id: "20", category: "repair", name: "Ekran dəyişimi", price: 199, priceText: "199 AZN-dən", meta: "Modelə görə qiymət dəyişir", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Smartphone_cracked_screen.jpg/300px-Smartphone_cracked_screen.jpg", specs: "iPhone, Samsung, Xiaomi", badge: "Təmir", stock: "Diaqnostika" },
    { id: "21", category: "repair", name: "Batareya dəyişimi", price: 99, priceText: "99 AZN-dən", meta: "Batareya zəifləməsi və şişməsi", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Cell_Phone_Repair.jpg/300px-Cell_Phone_Repair.jpg", specs: "Test, Servis, Zəmanət", badge: "Təmir", stock: "Sürətli" },
    { id: "22", category: "repair", name: "Kamera təmiri", price: 149, priceText: "149 AZN-dən", meta: "Ön və arxa kamera xidməti", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Cell_Phone_Repair.jpg/300px-Cell_Phone_Repair.jpg", specs: "Kamera, Şüşə, Test", badge: "Təmir", stock: "Servis" },
    { id: "23", category: "repair", name: "Proqram təminatı və diaqnostika", price: 29, priceText: "29 AZN-dən", meta: "Yavaşlama, yaddaş və sistem yoxlanışı", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Cell_Phone_Repair.jpg/300px-Cell_Phone_Repair.jpg", specs: "Android, iOS, Backup", badge: "Servis", stock: "Tez baxış" }
];

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

function getProducts() {
    const saved = localStorage.getItem("ismartProducts");
    if (!saved) {
        localStorage.setItem("ismartProducts", JSON.stringify(DEFAULT_PRODUCTS_ADMIN));
        return DEFAULT_PRODUCTS_ADMIN;
    }
    return JSON.parse(saved);
}

function saveProducts(products) {
    localStorage.setItem("ismartProducts", JSON.stringify(products));
}

function showDashboard() {
    loginPanel.hidden = true;
    adminDashboard.hidden = false;
    renderProducts();
}

function renderProducts() {
    const products = getProducts();
    productList.innerHTML = products.map(product => `
        <article class="admin-product-row">
            <img src="${product.image}" alt="${product.name}">
            <div>
                <strong>${escapeHtml(product.name)}</strong>
                <span>${product.category} · ${product.priceText || product.price + " AZN"}</span>
            </div>
            <button type="button" data-edit="${product.id}">Redaktə</button>
            <button type="button" data-delete="${product.id}">Sil</button>
        </article>
    `).join("");
}

function fillForm(product) {
    document.getElementById("productId").value = product.id;
    document.getElementById("productCategory").value = product.category;
    document.getElementById("productName").value = product.name;
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productPriceText").value = product.priceText || "";
    document.getElementById("productMeta").value = product.meta || "";
    document.getElementById("productImage").value = product.image || "";
    selectedImageData = product.image || "";
    renderImagePreview(selectedImageData);
    document.getElementById("productSpecs").value = product.specs || "";
    document.getElementById("productBadge").value = product.badge || "";
    document.getElementById("productStock").value = product.stock || "";
}

function clearForm() {
    productForm.reset();
    document.getElementById("productId").value = "";
    document.getElementById("productPriceText").value = "";
    selectedImageData = "";
    renderImagePreview("");
}

function renderImagePreview(src) {
    if (!src) {
        imagePreview.innerHTML = "Şəkil önizləməsi";
        imagePreview.classList.remove("has-image");
        return;
    }
    imagePreview.innerHTML = `<img src="${src}" alt="Məhsul şəkli">`;
    imagePreview.classList.add("has-image");
}

function readSelectedFile() {
    const file = imageFileInput.files && imageFileInput.files[0];
    if (!file) return Promise.resolve("");

    return new Promise(function (resolve, reject) {
        const reader = new FileReader();
        reader.onload = function () {
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const user = document.getElementById("adminUser").value.trim();
    const pass = document.getElementById("adminPass").value;
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        sessionStorage.setItem("ismartAdmin", "true");
        showDashboard();
    } else {
        loginError.textContent = "İstifadəçi adı və ya parol yanlışdır.";
    }
});

imageInput.addEventListener("input", function () {
    selectedImageData = imageInput.value.trim();
    renderImagePreview(selectedImageData);
    if (imageInput.value.trim()) {
        imageFileInput.value = "";
    }
});

imageFileInput.addEventListener("change", async function () {
    const fileData = await readSelectedFile();
    if (fileData) {
        selectedImageData = fileData;
        imageInput.value = "";
        renderImagePreview(fileData);
    }
});

productForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const products = getProducts();
    const id = document.getElementById("productId").value || String(Date.now());
    const fileData = await readSelectedFile();
    const imageValue = fileData || imageInput.value.trim() || selectedImageData;

    if (!imageValue) {
        alert("Şəkil üçün ya link əlavə edin, ya da fayldan şəkil seçin.");
        return;
    }

    const product = {
        id,
        category: document.getElementById("productCategory").value,
        name: document.getElementById("productName").value.trim(),
        price: Number(document.getElementById("productPrice").value),
        priceText: document.getElementById("productPriceText").value.trim(),
        meta: document.getElementById("productMeta").value.trim(),
        image: imageValue,
        specs: document.getElementById("productSpecs").value.trim(),
        badge: document.getElementById("productBadge").value.trim(),
        stock: document.getElementById("productStock").value.trim()
    };
    const index = products.findIndex(item => item.id === id);
    if (index >= 0) products[index] = product;
    else products.push(product);
    saveProducts(products);
    clearForm();
    renderProducts();
});

productList.addEventListener("click", function (event) {
    const editId = event.target.getAttribute("data-edit");
    const deleteId = event.target.getAttribute("data-delete");
    const products = getProducts();
    if (editId) {
        const product = products.find(item => item.id === editId);
        if (product) fillForm(product);
    }
    if (deleteId && confirm("Bu məhsulu silmək istəyirsiniz?")) {
        saveProducts(products.filter(item => item.id !== deleteId));
        renderProducts();
    }
});

document.getElementById("resetFormBtn").addEventListener("click", clearForm);
document.getElementById("logoutBtn").addEventListener("click", function () {
    sessionStorage.removeItem("ismartAdmin");
    location.reload();
});
document.getElementById("resetProductsBtn").addEventListener("click", function () {
    if (confirm("Bütün məhsullar standart siyahıya qayıtsın?")) {
        saveProducts(DEFAULT_PRODUCTS_ADMIN);
        clearForm();
        renderProducts();
    }
});

if (sessionStorage.getItem("ismartAdmin") === "true") {
    showDashboard();
}