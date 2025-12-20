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

  // ========= ORDER DATA (aligned with consumer-marketplace.js) =========
  // status: "pending" | "ready" | "completed" | "cancelled"
  // productId must match the products[] id in consumer-marketplace.js

  let orders = [
    {
      orderId: "ORD-001",
      productId: 1,
      image: "croissant.png",
      name: "BreadTalk Croissant",
      partner: "BreadTalk",
      quantity: 2,
      priceEach: 60,
      totalPrice: 120,
      pickupWindow: "4:00 PM – 7:30 PM",
      pickupDate: "October 7, 2025",
      status: "ready" // Ready for Pickup
    },
    {
      orderId: "ORD-002",
      productId: 8,
      image: "jolly-spaghetti.jpg",
      name: "Jollibee Jolly Spaghetti",
      partner: "Jollibee",
      quantity: 1,
      priceEach: 40,
      totalPrice: 40,
      pickupWindow: "4:30 PM – 6:45 PM",
      pickupDate: "October 8, 2025",
      status: "pending" // Pending Provider Confirmation
    },
    {
      orderId: "ORD-003",
      productId: 3,
      image: "gardenia.jpg",
      name: "Gardenia Classic Bread",
      partner: "Gardenia",
      quantity: 1,
      priceEach: 95,
      totalPrice: 95,
      pickupWindow: "Anytime within store hours",
      pickupDate: "October 4, 2025",
      status: "completed" // Completed
    },
    {
      orderId: "ORD-004",
      productId: 7,
      image: "chickenjoy.jpg",
      name: "Jollibee Chickenjoy Meal",
      partner: "Jollibee",
      quantity: 2,
      priceEach: 75,
      totalPrice: 150,
      pickupWindow: "4:00 PM – 6:30 PM",
      pickupDate: "October 7, 2025",
      status: "cancelled" // Cancelled example
    }
  ];

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

  // Initial render
  renderOrders();
});