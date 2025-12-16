// ========= BACKEND API CONFIGURATION =========
const API_URL = "http://localhost:8081/api";

// ========= GLOBAL PRODUCTS ARRAY =========
let products = [];

// ========= FETCH PRODUCTS FROM BACKEND =========
async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    const data = await response.json();
    
    if (data.success) {
      // Transform backend data to frontend format
      products = data.data.map(product => ({
        id: product.id,
        name: product.name,
        partner: product.partnerName,
        price: product.price,
        oldPrice: product.oldPrice,
        discountPercent: product.discountPercent,
        category: product.category,
        image: product.imageUrl || "placeholder.jpg",
        description: product.description,
        expiry: product.expiryDisplay || "Check with provider",
        pickupWindow: product.pickupWindow || "Contact provider"
      }));
      
      // Initialize the page after products are loaded
      initializePage();
    } else {
      console.error('Failed to load products:', data.message);
      showError('Failed to load products from backend.');
      products = [];
      initializePage();
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    showError('Could not connect to server. Please ensure backend is running on port 8081.');
    products = [];
    initializePage();
  }
}

// ========= DOM ELEMENTS =========
const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const filterChips = document.querySelectorAll(".filter-chip");
const partnerChips = document.querySelectorAll(".partner-chip");
const resultsText = document.getElementById("resultsText");
const avatarInitial = document.getElementById("avatarInitial");
const logoutBtn = document.getElementById("logoutBtn");

// ========= SESSION =========
(function checkConsumerSession() {
  try {
    const session = JSON.parse(localStorage.getItem("consumerSession"));
    if (session && session.name && avatarInitial) {
      avatarInitial.textContent = session.name.charAt(0).toUpperCase();
    }
  } catch (err) {
    console.warn("Invalid session", err);
  }
})();

// ========= STATE =========
let activePartner = "All";
let activeFilter = "all";
let searchTerm = "";

// ========= RENDER PRODUCTS =========
function renderProducts() {
  productGrid.innerHTML = "";

  const filtered = products.filter((p) => {
    // partner filter
    if (activePartner !== "All" && p.partner !== activePartner) return false;

    // search filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      const matches =
        p.name.toLowerCase().includes(term) ||
        p.partner.toLowerCase().includes(term) ||
        (p.category && p.category.toLowerCase().includes(term));
      if (!matches) return false;
    }

    // filter chips
    switch (activeFilter) {
      case "high-discount":
        if (p.discountPercent < 30) return false;
        break;
      case "under-50":
        if (p.price >= 50) return false;
        break;
      case "breads":
        if (p.category !== "breads") return false;
        break;
      case "drinks":
        if (p.category !== "drinks") return false;
        break;
      case "all":
      default:
        break;
    }

    return true;
  });

  // Update text
  if (filtered.length === 0) {
    resultsText.textContent = "No results. Try adjusting filters.";
  } else {
    resultsText.textContent =
      activePartner === "All" && activeFilter === "all" && !searchTerm
        ? "Showing all deals"
        : `Showing ${filtered.length} item${filtered.length > 1 ? "s" : ""}`;
  }

  // Create cards
  filtered.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";

    card.innerHTML = `
      <div class="discount-badge">${product.discountPercent}% Off</div>
      <img src="${product.image}" alt="${product.name}">
      <div class="product-name">${product.name}</div>
      <div class="product-meta">${product.partner} • ${product.expiry}</div>
      <div class="product-price-row">
        <span class="product-price">₱${product.price}</span>
        ${product.oldPrice ? `<span class="product-old-price">₱${product.oldPrice}</span>` : ""}
      </div>
      <div class="product-arrow">›</div>
    `;

    // ⬇ Navigate to product page
    card.addEventListener("click", () => {
      window.location.href = `product.html?id=${product.id}`;
    });

    productGrid.appendChild(card);
  });
}

// ========= HANDLERS =========
function onSearchInput(e) {
  searchTerm = e.target.value;
  renderProducts();
}

function onFilterChipClick(e) {
  filterChips.forEach((chip) => chip.classList.remove("active"));
  e.currentTarget.classList.add("active");
  activeFilter = e.currentTarget.dataset.filter;
  renderProducts();
}

function onPartnerChipClick(e) {
  partnerChips.forEach((chip) => chip.classList.remove("active"));
  e.currentTarget.classList.add("active");
  activePartner = e.currentTarget.dataset.partner;
  renderProducts();
}

// ========= LOGOUT =========
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("consumerSession");
    alert("Logged out!");
  });
}

// ========= GENERATE PARTNER CHIPS =========
function generatePartnerChips() {
  const partnerList = document.getElementById("partnerList");
  if (!partnerList) return;

  // Get unique partners from products
  const uniquePartners = [...new Set(products.map(p => p.partner))];
  
  // Clear existing chips
  partnerList.innerHTML = '';
  
  // Add "All" chip
  const allChip = document.createElement('button');
  allChip.className = 'partner-chip active';
  allChip.dataset.partner = 'All';
  allChip.innerHTML = '<span>All Partners</span>';
  partnerList.appendChild(allChip);
  
  // Add partner chips
  uniquePartners.forEach(partner => {
    const chip = document.createElement('button');
    chip.className = 'partner-chip';
    chip.dataset.partner = partner;
    chip.innerHTML = `<span>${partner}</span>`;
    partnerList.appendChild(chip);
  });
}

// ========= INITIALIZE PAGE =========
function initializePage() {
  generatePartnerChips();
  
  searchInput.addEventListener("input", onSearchInput);
  filterChips.forEach((chip) => chip.addEventListener("click", onFilterChipClick));
  
  // Re-query partner chips after generating them
  const partnerChips = document.querySelectorAll(".partner-chip");
  partnerChips.forEach((chip) => chip.addEventListener("click", onPartnerChipClick));
  
  renderProducts();
}

function showError(message) {
  const productGrid = document.querySelector(".product-grid");
  if (productGrid) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'grid-column: 1/-1; text-align: center; padding: 20px; color: #ff6b6b;';
    errorDiv.textContent = message;
    productGrid.prepend(errorDiv);
  }
}

// ========= START APPLICATION =========
loadProducts();