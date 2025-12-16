// ===== AUTH GUARD =====
if (!localStorage.getItem("authToken") || localStorage.getItem("userRole") !== "partner") {
  window.location.href = "../login/login-consumer.html";
}

const PRODUCTS_API = 'http://localhost:8081/api/products';
const ORDERS_API = 'http://localhost:8081/api/orders';

// Load partner's orders (claims/pickups)
async function loadPickups() {
  try {
    const userId = localStorage.getItem('userId');
    const [productsRes, ordersRes] = await Promise.all([
      fetch(PRODUCTS_API),
      fetch(ORDERS_API)
    ]);
    
    const allProducts = productsRes.ok ? await productsRes.json() : [];
    const allOrders = ordersRes.ok ? await ordersRes.json() : [];
    
    const myProducts = allProducts.filter(p => p.partnerId == userId);
    const claims = allOrders.filter(o => myProducts.some(p => p.id === o.productId));
    
    // Add product info to each claim
    return claims.map(claim => {
      const product = myProducts.find(p => p.id === claim.productId);
      return { ...claim, product };
    });
  } catch (error) {
    console.error('Error loading pickups:', error);
    return [];
  }
}

// Update order status
async function updateOrderStatus(orderId, status) {
  try {
    const response = await fetch(`${ORDERS_API}/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return response.ok;
  } catch (error) {
    console.error('Error updating order:', error);
    return false;
  }
}

// Global functions for utility
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.className = "toast";
  }, 2500);
}

document.addEventListener("DOMContentLoaded", async () => {
  // Avatar
  const avatarInitial = document.getElementById("avatarInitial");
  const userName = localStorage.getItem('userName');
  if (avatarInitial && userName) {
    avatarInitial.textContent = userName.charAt(0).toUpperCase();
  }

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "../login/login-consumer.html";
    });
  }

  // ===== DATA & ELEMENTS =====
  let claims = await loadPickups();

  const container = document.getElementById("claimsContainer");
  const tabButtons = document.querySelectorAll(".claim-tab");

  let activeFilter = "all";

  function renderClaims() {
    container.innerHTML = "";

    const filtered = claims.filter((c) => {
      if (activeFilter === "all") return true;
      return c.status === activeFilter;
    });

    if (filtered.length === 0) {
      container.innerHTML = "<p>No orders/pickups found for this category.</p>";
      return;
    }

    filtered.forEach((claim) => {
      const product = claim.product;
      if (!product) return;

      const card = document.createElement("article");
      card.className = `claim-card status-${claim.status}`;

      card.innerHTML = `
        <div class="claim-image-wrapper">
            <img src="${product.imageUrl || 'https://via.placeholder.com/150'}" alt="${product.name}" class="claim-image" />
        </div>

        <div class="claim-header">
            <h2 class="claim-title">${product.name}</h2>
            <span class="claim-id">#O-${claim.id}</span>
        </div>

        <div class="claim-details">
            <p>
                <span class="detail-label">Customer ID:</span>
                <span class="detail-value">#${claim.userId}</span>
            </p>
            <p>
                <span class="detail-label">Quantity:</span>
                <span class="detail-value">${claim.quantity} ${product.unit || 'pcs'}</span>
            </p>
            <p>
                <span class="detail-label">Order Date:</span>
                <span class="detail-value">${new Date(claim.orderDate).toLocaleDateString()}</span>
            </p>
            <p>
                <span class="detail-label">Status:</span>
                <span class="status-badge status-${claim.status}">${claim.status}</span>
            </p>
        </div>
        
        <div class="claim-actions">
            ${renderActions(claim)}
        </div>
      `;

      // --- ACTION BUTTONS LISTENER ---
      card.querySelectorAll(".claim-actions button").forEach((btn) => {
        btn.addEventListener("click", () => handleAction(btn.dataset.action, claim));
      });

      container.appendChild(card);
    });
  }

  async function handleAction(action, claim) {
    let newStatus = claim.status;
    let message = "";
    let type = "success";

    switch (action) {
      case "approve":
        newStatus = "confirmed";
        message = "Order approved!";
        break;

      case "ready":
        newStatus = "ready";
        message = "Order marked as ready for pickup.";
        break;

      case "complete":
        newStatus = "completed";
        message = "Order completed successfully!";
        break;

      case "cancel":
        newStatus = "cancelled";
        message = "Order cancelled.";
        type = "error";
        break;

      case "view":
        alert(`Order Details:\n\nOrder ID: ${claim.id}\nProduct: ${claim.product?.name}\nQuantity: ${claim.quantity}\nCustomer ID: ${claim.userId}\nStatus: ${claim.status}`);
        return;
    }

    // Update status in backend
    const success = await updateOrderStatus(claim.id, newStatus);
    if (success) {
      claim.status = newStatus;
      showToast(message, type);
      claims = await loadPickups();
      renderClaims();
    } else {
      showToast("Failed to update order status", "error");
    }
  }

  function formatPickup(dt) {
    if (!dt) return "N/A";
    const d = new Date(dt);
    return d.toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).replace(/,/, ' @'); // Format: 11/25/2025 @ 3:00 PM
  }

  function renderActions(claim) {
    const status = claim.status;
    
    switch (status) {
      case "pending":
        return `
          <button class="btn-primary" data-action="approve">Accept</button>
          <button class="btn-secondary" data-action="cancel">Reject</button>
        `;
      case "confirmed":
        return `
          <button class="btn-primary" data-action="ready">Mark Ready</button>
          <button class="btn-secondary" data-action="cancel">Cancel</button>
        `;
      case "ready":
        return `
          <button class="btn-primary" data-action="complete">Complete Order</button>
          <button class="btn-secondary" data-action="view">View Details</button>
        `;
      case "completed":
      case "cancelled":
        return `
          <button class="btn-secondary" data-action="view">View Details</button>
        `;
      default:
        return "";
    }
  }

  // ===== TAB FILTER EVENTS =====
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.status;
      renderClaims();
    });
  });

  // Initial render
  renderClaims();
});