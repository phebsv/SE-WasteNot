// ===== AUTH GUARD =====
if (!localStorage.getItem("authToken") || localStorage.getItem("userRole") !== "ngo") {
    window.location.href = "../login/login-ngo.html";
}

// ========= BACKEND API CONFIGURATION =========
const PRODUCTS_API = 'http://localhost:8081/api/products';

// ========= GLOBAL STATE =========
let allProducts = [];
let filteredProducts = [];
let selectedCategories = new Set();
let selectedPartners = new Set();
let searchQuery = "";

// ========= FETCH PRODUCTS FROM BACKEND =========
async function loadProducts() {
  try {
    console.log('NGO Marketplace: Fetching products from:', PRODUCTS_API);
    const response = await fetch(PRODUCTS_API);
    const data = await response.json();
    
    console.log('API Response:', data);
    
    if (data.success && data.data && Array.isArray(data.data)) {
      allProducts = data.data.map(product => ({
        id: product.id,
        name: product.name,
        partner: product.partnerName,
        partnerId: product.partnerId,
        price: product.price,
        oldPrice: product.oldPrice,
        discountPercent: product.discountPercent,
        category: product.category || 'general',
        imageUrl: product.imageUrl || 'https://via.placeholder.com/200',
        description: product.description,
        expiryDisplay: product.expiryDisplay || 'Check with provider',
        pickupWindow: product.pickupWindow || 'Contact provider',
        quantity: product.quantity || 0,
        status: product.status || 'ACTIVE'
      }));
      
      console.log('Loaded products for NGO:', allProducts);
      populateFilters();
      applyFilters();
    } else {
      console.error('Invalid response format:', data);
      showError('Failed to load products from backend.');
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    showError('Could not connect to server. Please ensure backend is running on port 8081.');
  }
}

// ========= POPULATE FILTER OPTIONS =========
function populateFilters() {
  const categories = [...new Set(allProducts.map(p => p.category))].sort();
  const partners = [...new Set(allProducts.map(p => p.partner))].sort();
  
  console.log('NGO Marketplace - Categories:', categories);
  console.log('NGO Marketplace - Partners:', partners);
  
  const categoryContainer = document.getElementById("categoryFilters");
  const partnerContainer = document.getElementById("partnerFilters");
  
  if (categoryContainer) {
    categoryContainer.innerHTML = categories.map(cat => `
      <label class="filter-checkbox">
        <input type="checkbox" class="category-filter" value="${cat}" data-category="${cat}">
        <span>${cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
      </label>
    `).join('');
    
    document.querySelectorAll('.category-filter').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          selectedCategories.add(e.target.value);
        } else {
          selectedCategories.delete(e.target.value);
        }
        applyFilters();
      });
    });
  }
  
  if (partnerContainer) {
    partnerContainer.innerHTML = partners.map(partner => `
      <label class="filter-checkbox">
        <input type="checkbox" class="partner-filter" value="${partner}" data-partner="${partner}">
        <span>${partner}</span>
      </label>
    `).join('');
    
    document.querySelectorAll('.partner-filter').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          selectedPartners.add(e.target.value);
        } else {
          selectedPartners.delete(e.target.value);
        }
        applyFilters();
      });
    });
  }
}

// ========= FILTER AND SEARCH LOGIC =========
function applyFilters() {
  filteredProducts = allProducts.filter(product => {
    // Category filter
    if (selectedCategories.size > 0 && !selectedCategories.has(product.category)) {
      return false;
    }
    
    // Partner filter
    if (selectedPartners.size > 0 && !selectedPartners.has(product.partner)) {
      return false;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matches = product.name.toLowerCase().includes(query) ||
                     product.description.toLowerCase().includes(query) ||
                     product.partner.toLowerCase().includes(query);
      if (!matches) return false;
    }
    
    // Status filter - only show active products
    if (product.status !== 'ACTIVE') {
      return false;
    }
    
    return true;
  });
  
  console.log('NGO Filtered products:', filteredProducts);
  renderProducts();
}

// ========= RENDER PRODUCTS =========
function renderProducts() {
  const productGrid = document.getElementById("productGrid") || document.querySelector('.cards-container') || document.querySelector('.marketplace-grid');
  const resultsText = document.getElementById("resultsText");
  
  if (!productGrid) {
    console.error('Product grid container not found');
    return;
  }
  
  if (filteredProducts.length === 0) {
    productGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">No products available. Check back later!</div>';
    if (resultsText) resultsText.textContent = `Showing 0 results`;
    return;
  }
  
  productGrid.innerHTML = filteredProducts.map(product => `
    <article class="product-card" data-product-id="${product.id}">
      <div class="product-image">
        <img src="${product.imageUrl}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/200'">
        ${product.discountPercent ? `<span class="discount-badge">${product.discountPercent}% OFF</span>` : ''}
      </div>
      <div class="product-content">
        <div class="product-partner">${product.partner}</div>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description || 'No description available'}</p>
        <div class="product-meta">
          <div class="meta-item">
            <span class="meta-label">Category:</span>
            <span>${product.category}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Pickup:</span>
            <span>${product.pickupWindow}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Expiry:</span>
            <span>${product.expiryDisplay}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Available:</span>
            <span>${product.quantity} units</span>
          </div>
        </div>
        <div class="product-footer">
          <div class="product-pricing">
            ${product.oldPrice ? `<span class="old-price">₱${product.oldPrice}</span>` : ''}
            <span class="current-price">₱${product.price}</span>
          </div>
          <button class="product-action-btn" onclick="requestProduct(${product.id}, '${product.name}')">
            Request Item
          </button>
        </div>
      </div>
    </article>
  `).join('');
  
  if (resultsText) {
    resultsText.textContent = `Showing ${filteredProducts.length} of ${allProducts.length} products`;
  }
}

// ========= REQUEST PRODUCT =========
function requestProduct(productId, productName) {
  alert(`Feature coming soon: You would request "${productName}" (Product ID: ${productId}) for your NGO`);
  // TODO: Implement request creation endpoint
}

// ========= SEARCH HANDLER =========
function handleSearch(event) {
  searchQuery = event.target.value;
  applyFilters();
}

// ========= ERROR DISPLAY =========
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'padding: 20px; background: #fee; color: #c00; border-radius: 8px; margin: 20px; text-align: center;';
  errorDiv.textContent = message;
  document.body.insertBefore(errorDiv, document.body.firstChild);
}

// ========= INITIALIZE PAGE =========
document.addEventListener('DOMContentLoaded', () => {
  // Setup logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.clear();
      window.location.href = '../login/login-ngo.html';
    });
  }
  
  // Setup avatar
  const avatarInitial = document.getElementById('avatarInitial');
  const userName = localStorage.getItem('userName');
  if (avatarInitial && userName) {
    avatarInitial.textContent = userName.charAt(0).toUpperCase();
  }
  
  // Setup search handler
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }
  
  // Load products
  loadProducts();
});
