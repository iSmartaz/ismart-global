const ADMIN_USER = "admin";
const ADMIN_PASS = "iSmart2026";

const currencySymbols = { AZN: "₼", USD: "$", EUR: "€", TRY: "₺" };
const currencyNames = { AZN: "AZN", USD: "USD", EUR: "EUR", TRY: "TL" };

const modelsByBrand = {
    "Apple": ["iPhone 17 Pro Max", "iPhone 17 Pro", "iPhone 17", "iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16", "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15", "iPhone 14 Pro Max", "iPhone 14 Pro", "iPhone 14", "iPhone 13 Pro Max", "iPhone 13 Pro", "iPhone 13"],
    "Samsung": ["Galaxy S25 Ultra", "Galaxy S25+", "Galaxy S25", "Galaxy S24 Ultra", "Galaxy S24+", "Galaxy S24", "Galaxy A16", "Galaxy A55", "Galaxy Z Fold 6", "Galaxy Z Flip 6"],
    "Xiaomi": ["Xiaomi 15 Pro", "Xiaomi 15", "Xiaomi 14 Pro", "Xiaomi 14", "Redmi Note 13 Pro+", "POCO F6 Pro"],
    "Google": ["Pixel 9 Pro XL", "Pixel 9 Pro", "Pixel 9", "Pixel 8 Pro", "Pixel 8"],
    "OnePlus": ["OnePlus 12", "OnePlus Nord 4"]
};

const phoneSpecs = {
    "iPhone 17 Pro Max": { storage: ["256GB", "512GB", "1TB"], colors: ["Deep Blue", "Orange", "Silver", "Space Black"] },
    "iPhone 17 Pro": { storage: ["256GB", "512GB", "1TB"], colors: ["Deep Blue", "Orange", "Silver", "Space Black"] },
    "iPhone 17": { storage: ["128GB", "256GB", "512GB"], colors: ["Black", "White", "Blue", "Pink", "Green"] },
    "iPhone 16 Pro Max": { storage: ["256GB", "512GB", "1TB"], colors: ["Black Titanium", "White Titanium", "Natural Titanium"] },
    "iPhone 16 Pro": { storage: ["128GB", "256GB", "512GB", "1TB"], colors: ["Black Titanium", "White Titanium", "Natural Titanium"] },
    "iPhone 16": { storage: ["128GB", "256GB", "512GB"], colors: ["Black", "White", "Blue", "Green", "Pink"] },
    "iPhone 15 Pro Max": { storage: ["256GB", "512GB", "1TB"], colors: ["Black Titanium", "White Titanium", "Blue Titanium", "Natural Titanium"] },
    "iPhone 15 Pro": { storage: ["128GB", "256GB", "512GB", "1TB"], colors: ["Black Titanium", "White Titanium", "Blue Titanium", "Natural Titanium"] },
    "iPhone 15": { storage: ["128GB", "256GB", "512GB"], colors: ["Black", "White", "Blue", "Green", "Yellow"] },
    "iPhone 14 Pro Max": { storage: ["128GB", "256GB", "512GB", "1TB"], colors: ["Space Black", "Silver", "Gold", "Deep Purple"] },
    "iPhone 14 Pro": { storage: ["128GB", "256GB", "512GB", "1TB"], colors: ["Space Black", "Silver", "Gold", "Deep Purple"] },
    "iPhone 14": { storage: ["128GB", "256GB", "512GB"], colors: ["Midnight", "Starlight", "Blue", "Purple"] },
    "Galaxy S25 Ultra": { storage: ["256GB", "512GB", "1TB"], colors: ["Titanium Black", "Titanium Gray", "Titanium Violet"] },
    "Galaxy S25+": { storage: ["256GB", "512GB"], colors: ["Black", "Gray", "Violet"] },
    "Galaxy S25": { storage: ["128GB", "256GB", "512GB"], colors: ["Black", "Gray", "Violet"] },
    "Galaxy S24 Ultra": { storage: ["256GB", "512GB", "1TB"], colors: ["Titanium Black", "Titanium Gray", "Titanium Violet"] },
    "Galaxy S24+": { storage: ["256GB", "512GB"], colors: ["Black", "Gray", "Violet"] },
    "Galaxy S24": { storage: ["128GB", "256GB", "512GB"], colors: ["Black", "Gray", "Violet"] }
};

const DEFAULT_PRODUCTS_ADMIN = [
    { id: "1", category: "phones", name: "iPhone 15 Pro 128GB Natural Titanium", price: 2499, currency: "AZN", meta: "128GB · Natural Titanium", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/IPhone_15_pro.png/300px-IPhone_15_pro.png", specs: "6.1 ekran, 48 MP, iOS", badge: "✨ Yeni | 0% 12 ay (13% faiz)", stock: "Stokda var", brand: "Apple", model: "iPhone 15 Pro", storage: "128GB", color: "Natural Titanium", installment: "12 ay", installmentRate: "13%", warranty: "1 il", condition: "yeni" }
];

// Default kampaniyalar
const DEFAULT_CAMPAIGNS = [
    { id: "1", title: "0% Faiz 12 Ay", description: "Bütün telefonlarda 12 ay ərzində 0% faiz imkanı", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/IPhone_15_pro.png/150px-IPhone_15_pro.png", link: "telefonlar.html", status: "active", order: 1 },
    { id: "2", title: "Yeni iPhone 17 Pro", description: "Ən yeni Titanium dizayn, A19 Bionic çip", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/IPhone_15_pro.png/150px-IPhone_15_pro.png", link: "telefonlar.html", status: "active", order: 2 },
    { id: "3", title: "AirPods Pro 2 Endirim", description: "Aktiv səs izolyasiyası, USB-C şarj", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/AirPods_Pro_2nd_generation.png/150px-AirPods_Pro_2nd_generation.png", link: "aksesuarlar.html", status: "active", order: 3 }
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

const categorySelect = document.getElementById("productCategory");
const phoneFields = document.getElementById("phoneFields");
const accessoryFields = document.getElementById("accessoryFields");
const repairFields = document.getElementById("repairFields");
const autoNameGroup = document.getElementById("autoNameGroup");
const productNameInput = document.getElementById("productName");
const productPrice = document.getElementById("productPrice");
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
document.querySelectorAll('input[name="currency"]').forEach(radio => {
    radio.addEventListener("change", function() { if (this.checked) selectedCurrency = this.value; });
});

// ========== MƏHSULLAR ==========
function getProducts() {
    const saved = localStorage.getItem("ismartProducts");
    if (!saved) {
        localStorage.setItem("ismartProducts", JSON.stringify(DEFAULT_PRODUCTS_ADMIN));
        return DEFAULT_PRODUCTS_ADMIN;
    }
    return JSON.parse(saved);
}
function saveProducts(products) { localStorage.setItem("ismartProducts", JSON.stringify(products)); }
function showDashboard() { loginPanel.hidden = true; adminDashboard.hidden = false; renderProducts(); renderCampaigns(); }

function renderProducts() {
    const products = getProducts();
    productList.innerHTML = products.map(p => `
        <article class="admin-product-row">
            <img src="${p.image}">
            <div><strong>${escapeHtml(p.name)}</strong><span>${p.category} · ${currencySymbols[p.currency] || "₼"}${p.price}</span></div>
            <button data-edit="${p.id}">✏️ Redaktə</button>
            <button data-delete="${p.id}">🗑️ Sil</button>
        </article>
    `).join("");
}

function updateModelsByBrand() {
    const brand = phoneBrand.value;
    phoneModel.innerHTML = '<option value="">Seçin...</option>';
    if (brand && modelsByBrand[brand]) {
        modelsByBrand[brand].forEach(m => { let opt = document.createElement("option"); opt.value = m; opt.textContent = m; phoneModel.appendChild(opt); });
        phoneModel.disabled = false;
    } else phoneModel.disabled = true;
    phoneStorage.innerHTML = '<option value="">Seçin...</option>';
    phoneColor.innerHTML = '<option value="">Seçin...</option>';
    phoneStorage.disabled = true;
    phoneColor.disabled = true;
}

function updateStorageAndColor() {
    const model = phoneModel.value;
    phoneStorage.innerHTML = '<option value="">Seçin...</option>';
    phoneColor.innerHTML = '<option value="">Seçin...</option>';
    if (model && phoneSpecs[model]) {
        phoneSpecs[model].storage.forEach(s => { let opt = document.createElement("option"); opt.value = s; opt.textContent = s; phoneStorage.appendChild(opt); });
        phoneSpecs[model].colors.forEach(c => { let opt = document.createElement("option"); opt.value = c; opt.textContent = c; phoneColor.appendChild(opt); });
        phoneStorage.disabled = false;
        phoneColor.disabled = false;
    } else { phoneStorage.disabled = true; phoneColor.disabled = true; }
    updatePhoneName();
}

function updatePhoneName() {
    const brand = phoneBrand.value, model = phoneModel.value, storage = phoneStorage.value, color = phoneColor.value, installmentValue = phoneInstallment.value;
    const conditionValue = productCondition?.value || "yeni";
    let installmentMonth = "12 ay", installmentRate = "13%", badgeText = "0% 12 ay (13% faiz)";
    if (installmentValue) { let parts = installmentValue.split(","); if (parts.length === 2) { installmentMonth = parts[0]; installmentRate = parts[1]; badgeText = installmentMonth === "0 ay" ? "Birdəfəlik ödəniş" : `0% ${installmentMonth} (${installmentRate} faiz)`; } }
    let conditionText = conditionValue === "yeni" ? "✨ Yeni | " : conditionValue === "ikinci" ? "🔄 İkinci əl | " : "🔧 Təmirli | ";
    if (brand && model && storage && color) {
        productNameInput.value = `${model} ${storage} ${color}`;
        productMeta.value = `${storage} · ${color}`;
        if (!document.getElementById("productBadge")) { let badge = document.createElement("input"); badge.id = "productBadge"; badge.type = "hidden"; document.getElementById("productForm").appendChild(badge); }
        document.getElementById("productBadge").value = conditionText + badgeText;
    }
}

function updateAccessoryName() {
    const type = accessoryType.value, installmentValue = accessoryInstallment.value;
    const conditionValue = productCondition?.value || "yeni";
    let badgeText = "0% 6 ay (9% faiz)";
    if (installmentValue) { let parts = installmentValue.split(","); if (parts.length === 2 && parts[0] !== "0 ay") badgeText = `0% ${parts[0]} (${parts[1]} faiz)`; else if (parts[0] === "0 ay") badgeText = "Birdəfəlik ödəniş"; }
    let conditionText = conditionValue === "yeni" ? "✨ Yeni | " : conditionValue === "ikinci" ? "🔄 İkinci əl | " : "🔧 Təmirli | ";
    if (type) {
        productNameInput.value = type;
        if (!productMeta.value) productMeta.value = `Original ${type}`;
        if (!document.getElementById("productBadge")) { let badge = document.createElement("input"); badge.id = "productBadge"; badge.type = "hidden"; document.getElementById("productForm").appendChild(badge); }
        document.getElementById("productBadge").value = conditionText + badgeText;
    }
}

function updateRepairName() { let type = repairType.value; if (type) { productNameInput.value = type; if (!productMeta.value) productMeta.value = "Peşəkar servis xidməti"; } }

function toggleCategoryFields() {
    let cat = categorySelect.value;
    phoneFields.style.display = "none"; accessoryFields.style.display = "none"; repairFields.style.display = "none"; autoNameGroup.style.display = "none";
    if (cat === "phones") {
        phoneFields.style.display = "block"; autoNameGroup.style.display = "block";
        phoneBrand.onchange = () => { updateModelsByBrand(); updatePhoneName(); };
        phoneModel.onchange = () => { updateStorageAndColor(); };
        phoneStorage.onchange = updatePhoneName; phoneColor.onchange = updatePhoneName;
        phoneInstallment.onchange = updatePhoneName; if (productCondition) productCondition.onchange = updatePhoneName;
        updateModelsByBrand();
    } else if (cat === "accessories") {
        accessoryFields.style.display = "block"; autoNameGroup.style.display = "block";
        accessoryType.onchange = updateAccessoryName; accessoryInstallment.onchange = updateAccessoryName; if (productCondition) productCondition.onchange = updateAccessoryName;
    } else if (cat === "repair") { repairFields.style.display = "block"; autoNameGroup.style.display = "block"; repairType.onchange = updateRepairName; }
}

function fillForm(p) {
    document.getElementById("productId").value = p.id;
    categorySelect.value = p.category;
    selectedCurrency = p.currency || "AZN";
    let cr = document.querySelector(`input[name="currency"][value="${selectedCurrency}"]`); if (cr) cr.checked = true;
    if (productCondition) productCondition.value = p.condition || "yeni";
    toggleCategoryFields();
    if (p.category === "phones") {
        phoneBrand.value = p.brand || ""; updateModelsByBrand();
        setTimeout(() => { if (p.model) { phoneModel.value = p.model; updateStorageAndColor(); }
            setTimeout(() => { phoneStorage.value = p.storage || ""; phoneColor.value = p.color || "";
                let iv = p.installment === "0 ay" ? "0 ay,0%" : `${p.installment || "12 ay"},${p.installmentRate || "13%"}`;
                if (phoneInstallment.querySelector(`option[value="${iv}"]`)) phoneInstallment.value = iv;
                phoneWarranty.value = p.warranty || "1 il"; updatePhoneName(); }, 50); }, 50);
    } else if (p.category === "accessories") {
        accessoryType.value = p.accessoryType || "";
        let iv = p.installment === "0 ay" ? "0 ay,0%" : `${p.installment || "6 ay"},${p.installmentRate || "9%"}`;
        if (accessoryInstallment.querySelector(`option[value="${iv}"]`)) accessoryInstallment.value = iv;
        updateAccessoryName();
    } else if (p.category === "repair") { repairType.value = p.repairType || ""; updateRepairName(); }
    productPrice.value = p.price; productMeta.value = p.meta || ""; productSpecs.value = p.specs || ""; productStock.value = p.stock || "";
    document.getElementById("productImage").value = p.image || ""; selectedImageData = p.image || ""; renderImagePreview(selectedImageData);
    if (p.badge && document.getElementById("productBadge")) document.getElementById("productBadge").value = p.badge;
}

function clearForm() {
    productForm.reset(); document.getElementById("productId").value = ""; selectedImageData = ""; renderImagePreview("");
    phoneFields.style.display = "none"; accessoryFields.style.display = "none"; repairFields.style.display = "none"; autoNameGroup.style.display = "none";
    productNameInput.value = ""; document.querySelector('input[name="currency"][value="AZN"]').checked = true; selectedCurrency = "AZN";
    if (productCondition) productCondition.value = "yeni";
    phoneStorage.innerHTML = '<option value="">Seçin...</option>'; phoneColor.innerHTML = '<option value="">Seçin...</option>';
    phoneStorage.disabled = true; phoneColor.disabled = true;
}

function renderImagePreview(src) { if (!src) { imagePreview.innerHTML = "🖼️ Şəkil önizləməsi"; imagePreview.classList.remove("has-image"); return; } imagePreview.innerHTML = `<img src="${src}">`; imagePreview.classList.add("has-image"); }
function readSelectedFile() { let f = imageFileInput.files && imageFileInput.files[0]; if (!f) return Promise.resolve(""); return new Promise((resolve, reject) => { let r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(f); }); }
function escapeHtml(s) { if (!s) return ""; return s.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'); }

loginForm.addEventListener("submit", (e) => { e.preventDefault(); if (document.getElementById("adminUser").value.trim() === ADMIN_USER && document.getElementById("adminPass").value === ADMIN_PASS) { sessionStorage.setItem("ismartAdmin", "true"); showDashboard(); } else loginError.textContent = "İstifadəçi adı və ya parol yanlışdır."; });
categorySelect.addEventListener("change", toggleCategoryFields);
imageInput.addEventListener("input", () => { selectedImageData = imageInput.value.trim(); renderImagePreview(selectedImageData); if (imageInput.value.trim()) imageFileInput.value = ""; });
imageFileInput.addEventListener("change", async () => { let fd = await readSelectedFile(); if (fd) { selectedImageData = fd; imageInput.value = ""; renderImagePreview(fd); } });
productForm.addEventListener("submit", async (e) => {
    e.preventDefault(); let products = getProducts(); let id = document.getElementById("productId").value || String(Date.now()); let category = categorySelect.value;
    let fd = await readSelectedFile(); let img = fd || imageInput.value.trim() || selectedImageData;
    if (!img) { alert("Şəkil əlavə edin!"); return; }
    let product = { id, category, name: productNameInput.value, price: Number(productPrice.value), currency: selectedCurrency, meta: productMeta.value.trim(), image: img, specs: productSpecs.value.trim(), badge: document.getElementById("productBadge")?.value.trim() || "", stock: productStock.value.trim(), condition: productCondition?.value || "yeni" };
    if (category === "phones") {
        product.brand = phoneBrand.value; product.model = phoneModel.value; product.storage = phoneStorage.value; product.color = phoneColor.value;
        let parts = phoneInstallment.value.split(","); product.installment = parts[0]; product.installmentRate = parts[1] || "0%"; product.warranty = phoneWarranty.value;
    } else if (category === "accessories") { product.accessoryType = accessoryType.value; let parts = accessoryInstallment.value.split(","); product.installment = parts[0]; product.installmentRate = parts[1] || "0%";
    } else if (category === "repair") { product.repairType = repairType.value; }
    let idx = products.findIndex(i => i.id === id); if (idx >= 0) products[idx] = product; else products.push(product);
    saveProducts(products); clearForm(); renderProducts(); alert("✅ Məhsul yadda saxlanıldı!");
});
productList.addEventListener("click", (e) => { let edit = e.target.getAttribute("data-edit"), del = e.target.getAttribute("data-delete"), prods = getProducts();
    if (edit) { let p = prods.find(i => i.id === edit); if (p) fillForm(p); }
    if (del && confirm("Silmək istəyirsiniz?")) { saveProducts(prods.filter(i => i.id !== del)); renderProducts(); } });
document.getElementById("resetFormBtn").addEventListener("click", clearForm);
document.getElementById("logoutBtn").addEventListener("click", () => { sessionStorage.removeItem("ismartAdmin"); location.reload(); });
document.getElementById("resetProductsBtn").addEventListener("click", () => { if (confirm("Standarta qayıtsın?")) { saveProducts(DEFAULT_PRODUCTS_ADMIN); clearForm(); renderProducts(); } });

// ========== KAMPANİYALAR ==========
function getCampaigns() { const saved = localStorage.getItem("ismartCampaigns"); if (!saved) { localStorage.setItem("ismartCampaigns", JSON.stringify(DEFAULT_CAMPAIGNS)); return DEFAULT_CAMPAIGNS; } return JSON.parse(saved); }
function saveCampaigns(data) { localStorage.setItem("ismartCampaigns", JSON.stringify(data)); }

function renderCampaigns() {
    const campaigns = getCampaigns();
    const container = document.getElementById("adminCampaigns");
    if (!container) return;
    container.innerHTML = campaigns.sort((a,b) => a.order - b.order).map(c => `
        <div class="campaign-row" data-id="${c.id}">
            <img src="${c.image}">
            <div class="campaign-info"><h4>${escapeHtml(c.title)}</h4><p>${escapeHtml(c.description)}</p><span class="campaign-badge ${c.status}">${c.status === "active" ? "✅ Aktiv" : "❌ Deaktiv"}</span><small style="margin-left:10px;">Sıra: ${c.order}</small></div>
            <div class="campaign-actions"><button class="edit-campaign" data-id="${c.id}">✏️ Redaktə</button><button class="delete-campaign" data-id="${c.id}">🗑️ Sil</button></div>
        </div>
    `).join("");
    document.querySelectorAll(".edit-campaign").forEach(btn => btn.addEventListener("click", () => editCampaign(btn.getAttribute("data-id"))));
    document.querySelectorAll(".delete-campaign").forEach(btn => btn.addEventListener("click", () => deleteCampaign(btn.getAttribute("data-id"))));
}

let selectedCampaignImage = "";
function editCampaign(id) { let campaigns = getCampaigns(); let c = campaigns.find(c => c.id === id); if (!c) return;
    document.getElementById("campaignId").value = c.id; document.getElementById("campaignTitle").value = c.title; document.getElementById("campaignDesc").value = c.description;
    document.getElementById("campaignImage").value = c.image; document.getElementById("campaignLink").value = c.link; document.getElementById("campaignStatus").value = c.status;
    document.getElementById("campaignOrder").value = c.order; document.getElementById("campaignModalTitle").textContent = "Kampaniya redaktə et";
    document.getElementById("campaignModal").classList.add("active"); renderCampaignPreview(c.image);
}
function deleteCampaign(id) { if (confirm("Sil?")) { let campaigns = getCampaigns().filter(c => c.id !== id); saveCampaigns(campaigns); renderCampaigns(); } }
function renderCampaignPreview(src) { let preview = document.getElementById("campaignPreview"); if (!src) { preview.innerHTML = "Şəkil önizləməsi"; return; } preview.innerHTML = `<img src="${src}">`; }

document.getElementById("addCampaignBtn")?.addEventListener("click", () => {
    document.getElementById("campaignId").value = ""; document.getElementById("campaignTitle").value = ""; document.getElementById("campaignDesc").value = "";
    document.getElementById("campaignImage").value = ""; document.getElementById("campaignLink").value = "telefonlar.html"; document.getElementById("campaignStatus").value = "active";
    document.getElementById("campaignOrder").value = "0"; document.getElementById("campaignModalTitle").textContent = "Yeni kampaniya";
    document.getElementById("campaignModal").classList.add("active"); document.getElementById("campaignPreview").innerHTML = "Şəkil önizləməsi"; selectedCampaignImage = "";
});
document.getElementById("closeCampaignModalBtn")?.addEventListener("click", () => document.getElementById("campaignModal").classList.remove("active"));
document.getElementById("campaignImage")?.addEventListener("input", (e) => { selectedCampaignImage = e.target.value; renderCampaignPreview(selectedCampaignImage); });
document.getElementById("campaignImageFile")?.addEventListener("change", async (e) => { let file = e.target.files[0]; if (file) { let reader = new FileReader(); reader.onload = (ev) => { selectedCampaignImage = ev.target.result; renderCampaignPreview(selectedCampaignImage); document.getElementById("campaignImage").value = ""; }; reader.readAsDataURL(file); } });
document.getElementById("saveCampaignBtn")?.addEventListener("click", () => {
    let id = document.getElementById("campaignId").value || String(Date.now()); let title = document.getElementById("campaignTitle").value.trim(); let desc = document.getElementById("campaignDesc").value.trim();
    let image = selectedCampaignImage || document.getElementById("campaignImage").value.trim(); let link = document.getElementById("campaignLink").value; let status = document.getElementById("campaignStatus").value; let order = parseInt(document.getElementById("campaignOrder").value) || 0;
    if (!title || !image) { alert("Başlıq və şəkil tələb olunur!"); return; }
    let campaigns = getCampaigns(); let idx = campaigns.findIndex(c => c.id === id);
    if (idx >= 0) campaigns[idx] = { id, title, description: desc, image, link, status, order };
    else campaigns.push({ id, title, description: desc, image, link, status, order });
    saveCampaigns(campaigns); renderCampaigns(); document.getElementById("campaignModal").classList.remove("active"); alert("Kampaniya yadda saxlanıldı!");
});

if (sessionStorage.getItem("ismartAdmin") === "true") showDashboard();