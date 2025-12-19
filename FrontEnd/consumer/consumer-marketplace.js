// ========= AUTH GUARD =========
if (!localStorage.getItem("authToken") || localStorage.getItem("userRole") !== "consumer") {
  window.location.href = "../login/login-consumer.html";
}

// ========= BACKEND API CONFIGURATION =========
const PRODUCTS_API = "http://localhost:8081/api/products";
const ORDERS_API = "http://localhost:8081/api/orders";

// ========= GLOBAL STATE =========
let allProducts = [];
let filteredProducts = [];
let selectedCategories = new Set();
let selectedPartners = new Set();
let searchQuery = "";

function isDonationProduct(product) {
  const listingType = String(product?.listingType || product?.type || '').toLowerCase();
  if (listingType.includes('donation') || listingType.includes('donate') || listingType.includes('free')) return true;
  return Number(product?.price) === 0;
}

function formatConsumerPrice(product) {
  if (isDonationProduct(product)) return 'Free';
  const price = Number(product?.price);
  if (!Number.isFinite(price)) return '₱0';
  return `₱${price}`;
}

// ========= FETCH PRODUCTS FROM BACKEND =========
async function loadProducts() {
  try {
    console.log('Fetching products from:', PRODUCTS_API);
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
        listingType: product.listingType,
        type: product.type,
        category: product.category || 'general',
        imageUrl: product.imageUrl || 'https://via.placeholder.com/200',
        description: product.description,
        expiryDisplay: product.expiryDisplay || 'Check with provider',
        pickupWindow: product.pickupWindow || 'Contact provider',
        pickupAddress: product.pickupAddress || 'Contact partner for location',
        pickupCity: product.pickupCity || '',
        pickupCoordinates: product.pickupCoordinates || '',
        quantity: product.quantity || 0,
        status: product.status || 'ACTIVE'
      }));
      
      console.log('Loaded products:', allProducts);
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
  
  console.log('Categories:', categories);
  console.log('Partners:', partners);
  
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
  
  console.log('Filtered products:', filteredProducts);
  renderProducts();
}

// ========= RENDER PRODUCTS =========
function renderProducts() {
  const productGrid = document.getElementById("productGrid");
  const resultsText = document.getElementById("resultsText");
  
  if (!productGrid) return;
  
  if (filteredProducts.length === 0) {
    productGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">No products found. Try adjusting your filters.</div>';
    if (resultsText) resultsText.textContent = `Showing 0 results`;
    return;
  }
  
  productGrid.innerHTML = filteredProducts.map(product => `
    <article class="product-card" data-product-id="${product.id}">
      <div class="product-image">
        <img src="${product.imageUrl}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/200'">
        ${(!isDonationProduct(product) && product.discountPercent) ? `<span class="discount-badge">${product.discountPercent}% OFF</span>` : ''}
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
            ${isDonationProduct(product) ? '' : (product.oldPrice ? `<span class="old-price">₱${product.oldPrice}</span>` : '')}
            <span class="current-price">${formatConsumerPrice(product)}</span>
          </div>
          <div class="product-actions">
            <button class="product-action-btn secondary" onclick="viewProductDetails(${product.id})" title="View full details">
              <span>📋</span> Details
            </button>
            <button class="product-action-btn" onclick="claimProduct(${product.id}, '${product.name}')">
              ${isDonationProduct(product) ? 'Claim' : (product.discountPercent ? 'Buy Now' : 'Claim')}
            </button>
          </div>
        </div>
      </div>
    </article>
  `).join('');
  
  if (resultsText) {
    resultsText.textContent = `Showing ${filteredProducts.length} of ${allProducts.length} products`;
  }
}

// ========= VIEW PRODUCT DETAILS - SPECIFICATIONS MODAL =========
function viewProductDetails(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) {
    showError('Product not found');
    return;
  }
  
  showProductDetailsModal(product);
}

function showProductDetailsModal(product) {
  const modal = document.getElementById('productDetailsModal');
  if (!modal) {
    createProductDetailsModal();
    return showProductDetailsModal(product);
  }
  
  const donation = isDonationProduct(product);
  // Calculate discounted price if applicable
  const basePrice = Number(product.price);
  const discountPercent = Number(product.discountPercent);
  const discountedPrice = (!donation && Number.isFinite(discountPercent) && discountPercent > 0 && Number.isFinite(basePrice))
    ? (basePrice * (1 - discountPercent / 100)).toFixed(2)
    : basePrice;
  
  // Populate modal with product details
  document.getElementById('detailProductImage').src = product.imageUrl;
  document.getElementById('detailProductImage').onerror = function() { this.src='https://via.placeholder.com/400'; };
  document.getElementById('detailProductName').textContent = product.name;
  document.getElementById('detailProductCategory').textContent = product.category.charAt(0).toUpperCase() + product.category.slice(1);
  document.getElementById('detailProductPartner').textContent = product.partner;
  document.getElementById('detailProductDescription').textContent = product.description || 'No description available';
  document.getElementById('detailProductPrice').textContent = donation ? 'Free' : `₱${product.price}`;
  
  if (!donation && product.discountPercent) {
    document.getElementById('detailDiscountBadge').style.display = 'inline-block';
    document.getElementById('detailDiscountBadge').textContent = `${product.discountPercent}% OFF`;
    document.getElementById('detailDiscountedPrice').style.display = 'block';
    document.getElementById('detailDiscountedPrice').textContent = `Discounted: ₱${discountedPrice}`;
  } else {
    document.getElementById('detailDiscountBadge').style.display = 'none';
    document.getElementById('detailDiscountedPrice').style.display = 'none';
  }
  
  document.getElementById('detailProductExpiry').textContent = product.expiryDisplay;
  document.getElementById('detailProductPickup').textContent = product.pickupWindow;
  document.getElementById('detailProductQuantity').textContent = `${product.quantity} units available`;
  document.getElementById('detailProductStatus').textContent = product.status;
  
  // Display pickup location (where partner is located)
  const pickupLocationText = product.pickupAddress 
    ? `${product.pickupAddress}${product.pickupCity ? ', ' + product.pickupCity : ''}`
    : 'Contact partner for exact location';
  document.getElementById('detailPickupLocation').textContent = pickupLocationText;
  
  // Set up claim button in modal
  const claimBtn = document.getElementById('detailClaimBtn');
  claimBtn.onclick = () => {
    closeProductDetailsModal();
    claimProduct(product.id, product.name);
  };
  
  // Show modal
  modal.style.display = 'flex';
  
  // Close modal when clicking outside
  modal.onclick = function(e) {
    if (e.target === modal) closeProductDetailsModal();
  };
}

function createProductDetailsModal() {
  const modalHTML = `
    <div id="productDetailsModal" class="modal-overlay">
      <div class="modal-content details-modal">
        <div class="modal-header">
          <h2>Product Details</h2>
          <button class="modal-close-btn" onclick="closeProductDetailsModal()">×</button>
        </div>
        <div class="modal-body details-body">
          <div class="details-image-section">
            <img id="detailProductImage" src="" alt="Product Image" class="details-product-image">
            <span id="detailDiscountBadge" class="details-discount-badge"></span>
          </div>
          <div class="details-info-section">
            <div class="details-header-info">
              <h3 id="detailProductName" class="details-product-name"></h3>
              <span id="detailProductCategory" class="details-category-badge"></span>
            </div>
            <div class="details-partner">
              <strong>Provider:</strong> <span id="detailProductPartner"></span>
            </div>
            <div class="details-description">
              <strong>Description:</strong>
              <p id="detailProductDescription"></p>
            </div>
            <div class="details-pricing-section">
              <div class="details-price-row">
                <span class="details-price-label">Price:</span>
                <span id="detailProductPrice" class="details-price"></span>
              </div>
              <div id="detailDiscountedPrice" class="details-price-row discounted" style="display: none;">
                <span class="details-price-label"></span>
                <span class="details-final-price"></span>
              </div>
            </div>
            <div class="details-specifications">
              <h4>Specifications</h4>
              <div class="spec-grid">
                <div class="spec-item">
                  <span class="spec-label">📅 Expiry Date:</span>
                  <span id="detailProductExpiry" class="spec-value"></span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">⏰ Pickup Window:</span>
                  <span id="detailProductPickup" class="spec-value"></span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">📦 Quantity:</span>
                  <span id="detailProductQuantity" class="spec-value"></span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">✓ Status:</span>
                  <span id="detailProductStatus" class="spec-value"></span>
                </div>
                <div class="spec-item pickup-location-highlight">
                  <span class="spec-label">📍 Pickup Location:</span>
                  <span id="detailPickupLocation" class="spec-value location-text"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="modal-btn-secondary" onclick="closeProductDetailsModal()">Close</button>
          <button id="detailClaimBtn" type="button" class="modal-btn-primary">Proceed to Claim</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeProductDetailsModal() {
  const modal = document.getElementById('productDetailsModal');
  if (modal) modal.style.display = 'none';
}

// ========= CLAIM/BUY PRODUCT - OPEN MODAL FORM =========
let selectedProduct = null;

function claimProduct(productId, productName) {
  // Find the product details
  selectedProduct = allProducts.find(p => p.id === productId);
  if (!selectedProduct) {
    showError('Product not found');
    return;
  }
  
  // Open modal with form
  showClaimModal(selectedProduct);
}

function showClaimModal(product) {
  const modal = document.getElementById('claimModal');
  if (!modal) {
    createClaimModal();
    return showClaimModal(product);
  }
  
  // Populate modal with product details
  document.getElementById('modalProductName').textContent = product.name;
  document.getElementById('modalProductPrice').textContent = `₱${product.price}`;
  document.getElementById('modalProductPartner').textContent = product.partner;
  document.getElementById('modalProductExpiry').textContent = product.expiryDisplay;
  
  // Display pickup location (where partner is located)
  const pickupLocationText = product.pickupAddress 
    ? `${product.pickupAddress}${product.pickupCity ? ', ' + product.pickupCity : ''}`
    : 'Contact partner for exact pickup address';
  document.getElementById('modalProductPickupLocation').textContent = pickupLocationText;
  
  // Reset form
  document.getElementById('claimForm').reset();
  document.getElementById('claimQuantity').max = product.quantity;
  document.getElementById('claimQuantity').value = 1;
  
  // Update total price
  updateClaimTotal(product.price);
  
  // Show modal
  modal.style.display = 'flex';
  
  // Close modal when clicking outside
  modal.onclick = function(e) {
    if (e.target === modal) closeClaimModal();
  }
}

function createClaimModal() {
  const modalHTML = `
    <div id="claimModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Claim / Buy Item</h2>
          <button class="close-btn" onclick="closeClaimModal()">&times;</button>
        </div>
        
        <div class="modal-product-info">
          <div><strong>Item:</strong> <span id="modalProductName"></span></div>
          <div><strong>Partner:</strong> <span id="modalProductPartner"></span></div>
          <div><strong>Price:</strong> <span id="modalProductPrice"></span></div>
          <div><strong>Expiry:</strong> <span id="modalProductExpiry"></span></div>
          <div class="pickup-location-info"><strong>📍 Pickup at:</strong> <span id="modalProductPickupLocation"></span></div>
        </div>

        <form id="claimForm" class="claim-form">
          <div class="form-group">
            <label for="claimQuantity">Quantity</label>
            <input type="number" id="claimQuantity" name="quantity" min="1" required onchange="updateClaimTotal(selectedProduct.price)">
          </div>

          <div class="form-group">
            <label for="claimPickupDate">Preferred Pickup Date</label>
            <input type="date" id="claimPickupDate" name="pickupDate" required>
          </div>

          <div class="form-group">
            <label for="claimNotes">Special Notes (Optional)</label>
            <textarea id="claimNotes" name="notes" rows="3" placeholder="Any special instructions..."></textarea>
          </div>

          <div class="form-group">
            <label for="claimPaymentMethod">Payment Method</label>
            <select id="claimPaymentMethod" name="paymentMethod" required>
              <option value="">Select payment method</option>
              <option value="cash">Cash on Pickup</option>
              <option value="gcash">GCash</option>
              <option value="card">Debit/Credit Card</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>

          <div class="modal-summary">
            <div class="summary-row">
              <span>Unit Price:</span>
              <span id="summaryUnitPrice">₱0</span>
            </div>
            <div class="summary-row">
              <span>Quantity:</span>
              <span id="summaryQuantity">0</span>
            </div>
            <div class="summary-row summary-total">
              <strong>Total Amount:</strong>
              <strong id="summaryTotal">₱0</strong>
            </div>
          </div>

          <div class="modal-actions">
            <button type="submit" class="btn-primary" style="flex: 1;">Submit Claim</button>
            <button type="button" class="btn-secondary" onclick="closeClaimModal()" style="flex: 1;">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  // Add modal to page
  const container = document.createElement('div');
  container.innerHTML = modalHTML;
  document.body.appendChild(container.firstElementChild);
  
  // Attach form submission handler
  document.getElementById('claimForm').addEventListener('submit', handleClaimSubmit);
}

function updateClaimTotal(unitPrice) {
  const quantity = parseInt(document.getElementById('claimQuantity').value) || 0;
  const total = unitPrice * quantity;
  
  document.getElementById('summaryUnitPrice').textContent = `₱${unitPrice.toFixed(2)}`;
  document.getElementById('summaryQuantity').textContent = quantity;
  document.getElementById('summaryTotal').textContent = `₱${total.toFixed(2)}`;
}

function closeClaimModal() {
  const modal = document.getElementById('claimModal');
  if (modal) {
    modal.style.display = 'none';
  }
  selectedProduct = null;
}

async function handleClaimSubmit(event) {
  event.preventDefault();
  
  if (!selectedProduct) {
    showError('Error: Product not found');
    return;
  }
  
  const consumerId = localStorage.getItem('userId');
  const consumerName = localStorage.getItem('userName');
  const quantity = parseInt(document.getElementById('claimQuantity').value);
  const pickupDate = document.getElementById('claimPickupDate').value;
  const notes = document.getElementById('claimNotes').value;
  const paymentMethod = document.getElementById('claimPaymentMethod').value;
  
  // Use partner's pickup location (where partner is located)
  const pickupLocation = selectedProduct.pickupAddress 
    ? `${selectedProduct.pickupAddress}${selectedProduct.pickupCity ? ', ' + selectedProduct.pickupCity : ''}`
    : 'Partner location';
  
  // Validate
  if (!pickupDate || !paymentMethod) {
    showError('Please fill in all required fields');
    return;
  }
  
  const totalAmount = selectedProduct.price * quantity;
  
  const orderData = {
    consumerId: parseInt(consumerId),
    consumerName: consumerName,
    productId: selectedProduct.id,
    productName: selectedProduct.name,
    partnerId: selectedProduct.partnerId,
    partnerName: selectedProduct.partner,
    quantity: quantity,
    price: selectedProduct.price,
    totalAmount: totalAmount,
    paymentMethod: paymentMethod,
    pickupDate: pickupDate + 'T10:00:00',
    pickupLocation: pickupLocation,
    notes: notes,
    status: 'PENDING',
    paymentStatus: 'PENDING'
  };
  
  console.log('Submitting claim:', orderData);
  
  try {
    const response = await fetch(ORDERS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(orderData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      showSuccess('Claim submitted successfully! Order #' + data.data.orderNumber);
      closeClaimModal();
      // Role-based notifications (consumer + the specific partner)
      try {
        const consumerIdNum = parseInt(consumerId);
        const partnerIdNum = parseInt(String(selectedProduct.partnerId));
        const isDonation = String(selectedProduct?.listingType || selectedProduct?.type || '').toLowerCase() === 'donation' || Number(selectedProduct?.price) === 0;
        const itemLabel = String(selectedProduct?.name || 'Item');
        const partnerLabel = String(selectedProduct?.partner || selectedProduct?.partnerName || 'Partner');

        if (window.WasteNotNotifications?.notifyTargets) {
          window.WasteNotNotifications.notifyTargets(
            [
              { role: 'consumer', userId: consumerIdNum },
              { role: 'partner', userId: partnerIdNum }
            ],
            {
              title: isDonation ? 'Donation claim submitted' : 'Claim submitted',
              body: `You submitted a request for "${itemLabel}" from ${partnerLabel}.`,
              link: '/consumer/consumer-orders.html'
            }
          );

          window.WasteNotNotifications.notifyTargets(
            [{ role: 'partner', userId: partnerIdNum }],
            {
              title: 'New claim request',
              body: `${consumerName || 'A consumer'} requested "${itemLabel}".`,
              link: '/provider/partner-pickups.html'
            }
          );
        }
      } catch (_) {
        // Ignore notification errors
      }

      // Immediately reload products to update availability
      loadProducts();
    } else {
      showError('Error: ' + (data.message || 'Failed to submit claim'));
    }
  } catch (error) {
    console.error('Error submitting claim:', error);
    showError('Error submitting claim. Please try again.');
  }
}

function showSuccess(message) {
  const successDiv = document.createElement('div');
  successDiv.style.cssText = 'padding: 20px; background: #d4edda; color: #155724; border-radius: 8px; margin: 20px; text-align: center; border: 1px solid #c3e6cb;';
  successDiv.textContent = message;
  document.body.insertBefore(successDiv, document.body.firstChild);
  setTimeout(() => successDiv.remove(), 3000);
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
      // Clear only auth/session flags; keep cached profile + app data.
      [
        'authToken',
        'userId',
        'userRole',
        'userName',
        'userEmail',
        'ngoName',
        'consumerLoggedIn',
        'partnerLoggedIn',
        'ngoLoggedIn',
        'adminLoggedIn'
      ].forEach(k => localStorage.removeItem(k));
      sessionStorage.clear();
      window.location.href = '../login/login-consumer.html';
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