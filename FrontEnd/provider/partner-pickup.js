// ===== AUTH GUARD =====
if (!localStorage.getItem("authToken") || localStorage.getItem("userRole") !== "partner") {
  window.location.href = "../login/login-partner.html";
}

const PRODUCTS_API = 'http://localhost:8081/api/products';
const ORDERS_API = 'http://localhost:8081/api/orders';

function unwrapData(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

function normalizeStatus(rawStatus) {
  const s = String(rawStatus || '').trim().toUpperCase().replace(/[-\s]+/g, '_');
  if (!s) return 'PENDING';

  if (s === 'READY') return 'READY_FOR_PICKUP';
  if (s === 'PICKED_UP') return 'COMPLETED';
  if (s === 'PICKEDUP') return 'COMPLETED';

  const allowed = new Set(['PENDING', 'CONFIRMED', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED']);
  return allowed.has(s) ? s : 'PENDING';
}

function statusLabel(status) {
  switch (status) {
    case 'PENDING': return 'Pending';
    case 'CONFIRMED': return 'Confirmed';
    case 'READY_FOR_PICKUP': return 'Ready for Pickup';
    case 'COMPLETED': return 'Completed';
    case 'CANCELLED': return 'Cancelled';
    default: return 'Pending';
  }
}

// Load partner's orders (claims/pickups)
async function loadPickups() {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) return [];

    const [productsRes, ordersRes] = await Promise.all([
      fetch(PRODUCTS_API),
      fetch(`${ORDERS_API}/partner/${userId}`)
    ]);

    const productsJson = productsRes.ok ? await productsRes.json() : null;
    const ordersJson = ordersRes.ok ? await ordersRes.json() : null;

    const allProducts = unwrapData(productsJson);
    const partnerOrders = unwrapData(ordersJson);

    const productById = new Map(allProducts.map(p => [p.id, p]));

    return partnerOrders.map(order => {
      const product = productById.get(order.productId) || {
        id: order.productId,
        name: order.productName,
        imageUrl: '',
        unit: 'pcs'
      };
      const normalized = normalizeStatus(order.status);
      return {
        ...order,
        status: normalized,
        rawStatus: order.status,
        product
      };
    });
  } catch (error) {
    console.error('Error loading pickups:', error);
    return [];
  }
}

// Update order status
async function updateOrderStatus(orderId, status) {
  try {
    const response = await fetch(`${ORDERS_API}/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: normalizeStatus(status) })
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
        'providerLoggedIn',
        'ngoLoggedIn',
        'adminLoggedIn'
      ].forEach(k => localStorage.removeItem(k));
      sessionStorage.clear();
      window.location.href = "../login/login-partner.html";
    });
  }

  // ===== DATA & ELEMENTS =====
  let claims = await loadPickups();

  const container = document.getElementById("claimsContainer");
  const tabButtons = document.querySelectorAll(".claim-tab");

  let activeFilter = "PENDING";

  function renderClaims() {
    container.innerHTML = "";

    const filtered = claims.filter((c) => {
      return normalizeStatus(c.status) === normalizeStatus(activeFilter);
    });

    if (filtered.length === 0) {
      container.innerHTML = "<p>No orders/pickups found for this category.</p>";
      return;
    }

    filtered.forEach((claim) => {
      const product = claim.product;
      if (!product) return;

      const card = document.createElement("article");
      card.className = `claim-card`;

      const orderDateRaw = claim.orderDate || claim.createdAt || claim.dateCreated;
      const orderDateText = orderDateRaw ? new Date(orderDateRaw).toLocaleDateString() : '—';
      const customerLabel = claim.consumerName || `#${claim.consumerId || claim.userId || '—'}`;
      const statusText = statusLabel(normalizeStatus(claim.status));

      card.innerHTML = `
      <img src="${product.imageUrl || 'https://via.placeholder.com/150'}" alt="${product.name || claim.productName || 'Item'}" class="claim-image" />

      <div class="claim-main">
        <div class="claim-title">${product.name || claim.productName || 'Item'}</div>
        <div class="claim-meta">Order #${claim.orderNumber || claim.id || '—'} • Customer: ${customerLabel} • Qty: ${claim.quantity || 0} ${product.unit || 'pcs'} • Date: ${orderDateText} • Status: ${statusText}</div>

        <div class="claim-actions">
        ${renderActions(claim)}
        </div>
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
        newStatus = "CONFIRMED";
        message = "Order approved!";
        break;

      case "ready":
        newStatus = "READY_FOR_PICKUP";
        message = "Order marked as ready for pickup.";
        break;

      case "complete":
        newStatus = "COMPLETED";
        message = "Order completed successfully!";
        break;

      case "cancel":
        newStatus = "CANCELLED";
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
      claim.status = normalizeStatus(newStatus);
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
    const status = normalizeStatus(claim.status);
    
    switch (status) {
      case "PENDING":
        return `
          <button class="claim-btn claim-approve" data-action="approve">Accept</button>
          <button class="claim-btn claim-cancel" data-action="cancel">Reject</button>
        `;
      case "CONFIRMED":
        return `
          <button class="claim-btn claim-ready" data-action="ready">Mark Ready</button>
          <button class="claim-btn claim-cancel" data-action="cancel">Cancel</button>
        `;
      case "READY_FOR_PICKUP":
        return `
          <button class="claim-btn claim-complete" data-action="complete">Complete</button>
          <button class="claim-btn claim-view" data-action="view">View Details</button>
        `;
      case "COMPLETED":
      case "CANCELLED":
        return `
          <button class="claim-btn claim-view" data-action="view">View Details</button>
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

  // Make sure one tab is active on initial load
  const defaultTab = Array.from(tabButtons).find(b => normalizeStatus(b.dataset.status) === normalizeStatus(activeFilter));
  if (defaultTab) {
    tabButtons.forEach((b) => b.classList.remove("active"));
    defaultTab.classList.add("active");
  }

  // Initial render
  renderClaims();
});