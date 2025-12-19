// ========= AUTH CHECK =========
if (localStorage.getItem("consumerLoggedIn") !== "true") {
  window.location.href = "../login/login-consumer.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
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
      window.location.href = "../login/login-consumer.html";
    });
  }

  // ========= API CONFIGURATION =========
  const API_URL = 'http://localhost:8081/api/orders';
  let orders = [];

  // ========= LOAD ORDERS FROM BACKEND =========
  async function loadOrders() {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('User ID not found');
        document.getElementById('ordersContainer').innerHTML = '<p style="text-align: center; padding: 2rem; color: #6b7280;">Please log in to view your orders.</p>';
        return;
      }

      console.log('Fetching orders for user:', userId);
      const response = await fetch(`${API_URL}/consumer/${userId}`);
      
      const result = await response.json();
      console.log('Orders API response:', result);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch orders');
      }
      
      // Transform backend data to match frontend format
      let backendOrders = (result.data || []).map(order => ({
        orderId: order.orderNumber || `ORD-${String(order.id).padStart(3, '0')}`,
        orderNumber: order.orderNumber,
        productId: order.productId,
        productName: order.productName,
        image: 'https://via.placeholder.com/150', // Will be replaced with actual product images
        name: order.productName,
        partner: order.partnerName,
        quantity: order.quantity,
        priceEach: order.price,
        totalPrice: order.totalAmount,
        pickupLocation: order.pickupLocation,
        pickupDate: formatPickupDate(order.pickupDate),
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        notes: order.notes,
        status: order.status.toLowerCase(),
        createdAt: formatDate(order.createdAt)
      }));
      
      // Load completed orders from localStorage
      const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
      
      // Merge backend orders with completed orders from localStorage
      // Filter out any backend orders that are already in completed
      const completedOrderIds = new Set(completedOrders.map(o => o.orderId));
      const activeBackendOrders = backendOrders.filter(o => !completedOrderIds.has(o.orderId));
      
      // Combine active orders with completed orders
      orders = [...activeBackendOrders, ...completedOrders];
      
      console.log('Transformed orders:', orders);
      renderOrders(currentFilter);
    } catch (error) {
      console.error('Error loading orders:', error);
      
      // Still try to load completed orders from localStorage
      const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
      orders = completedOrders;
      renderOrders(currentFilter);
      
      if (orders.length === 0) {
        document.getElementById('ordersContainer').innerHTML = '<p style="text-align: center; padding: 2rem; color: #dc2626;">Failed to load orders. Please try refreshing the page.</p>';
      }
    }
  }
  
  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatPickupDate(dateString) {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  const ordersContainer = document.getElementById("ordersContainer");
  const tabs = document.querySelectorAll(".tab");
  const searchInput = document.getElementById("searchInput");

  let currentFilter = "pending";

  // ========= RENDER ORDERS =========
  function renderOrders(filter = "all", search = "") {
    ordersContainer.innerHTML = "";

    const filtered = orders.filter((o) => {
      const matchFilter = filter === "all" || o.status === filter;
      const haystack = (o.name + " " + o.partner).toLowerCase();
      const matchSearch = haystack.includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });

    if (filtered.length === 0) {
      ordersContainer.innerHTML = `<p>No orders found.</p>`;
      return;
    }

    filtered.forEach((order) => {
      const card = document.createElement("div");
      card.className = "order-card";

      card.innerHTML = `
        <div class="order-header">
          <div>
            <h3>${order.orderNumber || order.orderId}</h3>
            <p class="order-date">${order.createdAt || 'Recent order'}</p>
          </div>
          <span class="status-badge ${order.status}">${formatStatus(order.status)}</span>
        </div>
        
        <div class="order-content">
          <div class="product-section">
            <img src="${order.image}" alt="${order.name}" class="product-image">
            <div class="product-details">
              <h4 class="product-name">${order.name}</h4>
              <p class="provider-name"><i class="fas fa-store"></i> ${order.partner}</p>
              <p class="quantity-info"><i class="fas fa-box"></i> Quantity: ${order.quantity} × ₱${order.priceEach ? order.priceEach.toFixed(2) : '0.00'}</p>
            </div>
          </div>
          
          <div class="details-grid">
            <div class="detail-item">
              <h5><i class="fas fa-map-marker-alt"></i> Pickup Location</h5>
              <p>${order.pickupLocation || order.partner + ' Store'}</p>
            </div>
            
            <div class="detail-item">
              <h5><i class="fas fa-calendar"></i> Pickup Date</h5>
              <p>${order.pickupDate}</p>
            </div>
            
            <div class="detail-item">
              <h5><i class="fas fa-credit-card"></i> Payment Method</h5>
              <p>${order.paymentMethod || 'Cash on Pickup'}</p>
            </div>
            
            <div class="detail-item">
              <h5><i class="fas fa-wallet"></i> Payment Status</h5>
              <p><span class="payment-status ${order.paymentStatus || 'pending'}">${order.paymentStatus || 'Pending'}</span></p>
            </div>
            
            ${order.notes ? `
            <div class="detail-item full-width">
              <h5><i class="fas fa-sticky-note"></i> Order Notes</h5>
              <p>${order.notes}</p>
            </div>
            ` : ''}
            
            <div class="detail-item total-section">
              <h5>Total Amount</h5>
              <p class="total-amount">₱${order.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}</p>
            </div>
          </div>
        </div>
        
        <div class="order-actions">
          ${
            order.status === "pending"
              ? `<button class="btn btn-primary" onclick="confirmPickup('${order.orderId}')"><i class="fas fa-check"></i> Confirm Pickup</button>`
              : ""
          }
          ${
            order.status === "ready"
              ? `<button class="btn btn-success" onclick="completeOrder('${order.orderId}')"><i class="fas fa-check-circle"></i> Mark Complete</button>`
              : ""
          }
          ${
            order.status === "pending" || order.status === "ready"
              ? `<button class="btn btn-danger" onclick="cancelOrder('${order.orderId}')"><i class="fas fa-times"></i> Cancel Order</button>`
              : ""
          }
        </div>
      `;

      ordersContainer.appendChild(card);
    });
  }

  // ========= STATUS LABELS =========
  function formatStatus(status) {
    switch (status) {
      case "pending":
        return "Pending Provider Confirmation";
      case "ready":
        return "Ready for Pickup";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  }

  // ========= ACTIONS (make global for inline onclick) =========
  window.confirmPickup = (orderId) => {
    const order = orders.find((o) => o.orderId === orderId);
    if (!order) return;
    order.status = "ready";
    renderOrders(currentFilter, searchInput.value);
  };

  window.cancelOrder = (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    const order = orders.find((o) => o.orderId === orderId);
    if (!order) return;
    order.status = "cancelled";
    renderOrders(currentFilter, searchInput.value);
    alert('Order cancelled successfully');
  };

  window.completeOrder = (orderId) => {
    const order = orders.find((o) => o.orderId === orderId);
    if (!order) return;
    order.status = "completed";
    order.paymentStatus = "Paid"; // Update payment status to Paid
    
    // Save completed orders to localStorage
    const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
    completedOrders.push({
      ...order,
      completedDate: new Date().toISOString(),
      paymentStatus: "Paid"
    });
    localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
    
    renderOrders(currentFilter, searchInput.value);
    alert('Order marked as complete! Thank you for using WasteNot.');
  };

  window.viewDetails = (productId) => {
    // Goes to the same product details page used by the marketplace
    window.location.href = `product.html?id=${productId}`;
  };

  // ========= FILTER TABS =========
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentFilter = tab.dataset.filter;
      renderOrders(currentFilter, searchInput.value);
    });
  });

  // ========= SEARCH =========
  searchInput.addEventListener("input", () => {
    renderOrders(currentFilter, searchInput.value);
  });

  // Initial render - load from backend
  loadOrders();
});
