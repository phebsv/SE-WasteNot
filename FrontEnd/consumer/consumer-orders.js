// ========= AUTH CHECK =========
if (localStorage.getItem("consumerLoggedIn") !== "true") {
  window.location.href = "login-consumer.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "login-consumer.html";
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
        return;
      }

      const response = await fetch(`${API_URL}/consumer/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      
      // Transform backend data to match frontend format
      orders = data.map(order => ({
        orderId: `ORD-${String(order.id).padStart(3, '0')}`,
        productId: order.productId,
        image: order.product?.imageUrl || 'default-product.png',
        name: order.product?.name || 'Unknown Product',
        partner: order.product?.providerName || 'WasteNot Partner',
        quantity: order.quantity,
        priceEach: order.product?.price || 0,
        totalPrice: order.totalPrice,
        pickupWindow: order.product?.pickupTime || 'Flexible',
        pickupDate: formatPickupDate(order.pickupDate),
        status: order.status.toLowerCase()
      }));
      
      renderOrders(currentFilter);
    } catch (error) {
      console.error('Error loading orders:', error);
      // Show sample orders as fallback
      orders = [];
      renderOrders(currentFilter);
    }
  }

  function formatPickupDate(dateString) {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  const ordersContainer = document.getElementById("ordersContainer");
  const tabs = document.querySelectorAll(".tab");
  const searchInput = document.getElementById("searchInput");

  let currentFilter = "all";

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
        <img src="${order.image}" alt="${order.name}">
        <div class="order-info">
          <h3>${order.name}</h3>
          <p><strong>Provider:</strong> ${order.partner}</p>
          <p>Qty: ${order.quantity} • ₱${order.totalPrice} total</p>
          <p><strong>Pickup:</strong> ${order.pickupDate}, ${order.pickupWindow}</p>
          <p>Status: <strong>${formatStatus(order.status)}</strong></p>

          <div class="order-actions">
            ${
              order.status === "pending"
                ? `<button class="btn btn-primary" onclick="confirmPickup('${order.orderId}')">Confirm Pickup</button>`
                : ""
            }
            ${
              order.status === "ready"
                ? `<button class="btn btn-danger" onclick="cancelOrder('${order.orderId}')">Cancel Request</button>`
                : ""
            }
            <button class="btn" onclick="viewDetails(${order.productId})">View Details</button>
          </div>
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
    const order = orders.find((o) => o.orderId === orderId);
    if (!order) return;
    order.status = "cancelled";
    renderOrders(currentFilter, searchInput.value);
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
