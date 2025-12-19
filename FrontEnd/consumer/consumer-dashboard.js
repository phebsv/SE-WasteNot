// === AUTH CHECK ===
if (!localStorage.getItem("consumerLoggedIn") || localStorage.getItem("consumerLoggedIn") !== "true") {
    window.location.href = "../login/login-consumer.html";
}

// Claims will be loaded from backend API
let claims = [];
let allOrders = [];

// ================================
// UPDATE DASHBOARD STATISTICS
// ================================
function updateDashboardStats() {
  // Update username and avatar
  const userName = localStorage.getItem('userName') || localStorage.getItem('userId') || 'User';
  const userNameElement = document.getElementById('userName');
  const avatarElement = document.getElementById('userAvatar');
  
  if (userNameElement) {
    userNameElement.textContent = userName;
  }
  
  if (avatarElement) {
    avatarElement.textContent = userName.charAt(0).toUpperCase();
  }

  // Calculate statistics from orders
  const completedOrders = allOrders.filter(order => 
    order.status === 'COMPLETED' || order.status === 'completed'
  );
  
  const activeOrders = allOrders.filter(order => 
    order.status === 'PENDING' || order.status === 'pending' || 
    order.status === 'CONFIRMED' || order.status === 'confirmed' ||
    order.status === 'READY' || order.status === 'ready'
  );

  // Calculate total savings (sum of all completed orders)
  const totalSavings = completedOrders.reduce((sum, order) => {
    return sum + (order.totalAmount || 0);
  }, 0);

  // Calculate total meals rescued (sum of all quantities)
  const mealsRescued = allOrders.reduce((sum, order) => {
    return sum + (order.quantity || 0);
  }, 0);

  // Update UI with animation
  const totalSavingsEl = document.getElementById('totalSavings');
  const mealsRescuedEl = document.getElementById('mealsRescued');
  const activeClaimsEl = document.getElementById('activeClaims');
  
  if (totalSavingsEl) {
    totalSavingsEl.textContent = `₱ ${totalSavings.toLocaleString()}`;
    totalSavingsEl.style.animation = 'fadeIn 0.5s ease-in';
  }
  
  if (mealsRescuedEl) {
    mealsRescuedEl.textContent = mealsRescued;
    mealsRescuedEl.style.animation = 'fadeIn 0.6s ease-in';
  }
  
  if (activeClaimsEl) {
    activeClaimsEl.textContent = activeOrders.length;
    activeClaimsEl.style.animation = 'fadeIn 0.7s ease-in';
  }
}

// ================================
// LOAD CLAIMS FROM BACKEND
// ================================
async function loadClaims() {
  // Show loading state
  const totalSavingsEl = document.getElementById('totalSavings');
  const mealsRescuedEl = document.getElementById('mealsRescued');
  const activeClaimsEl = document.getElementById('activeClaims');
  
  if (totalSavingsEl) totalSavingsEl.innerHTML = '<span style="opacity: 0.5;">...</span>';
  if (mealsRescuedEl) mealsRescuedEl.innerHTML = '<span style="opacity: 0.5;">...</span>';
  if (activeClaimsEl) activeClaimsEl.innerHTML = '<span style="opacity: 0.5;">...</span>';
  
  try {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");
    
    if (!userId || !authToken) {
      console.error("User ID or auth token not found");
      return;
    }

    const response = await fetch(`http://localhost:8081/api/orders/consumer/${userId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to load orders: ${response.status}`);
    }

    const result = await response.json();
    const orders = result.success ? result.data : result;
    
    // Load completed orders from localStorage first
    const completedOrdersJSON = localStorage.getItem('completedOrders');
    const completedOrders = completedOrdersJSON ? JSON.parse(completedOrdersJSON) : [];

    const getOrderKey = (order) => {
      if (!order) return null;
      return order.orderId || order.orderNumber || order.id || null;
    };

    const normalizeBackendStatus = (status) => {
      if (status == null) return '';
      return String(status)
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '_');
    };

    // Create a Set of completed order keys for faster lookup (handles API vs localStorage key differences)
    const completedOrderKeys = new Set(
      completedOrders
        .map((o) => getOrderKey(o))
        .filter((k) => k !== null && k !== undefined)
        .map((k) => String(k))
    );

    // Filter out any API orders that are already marked as completed in localStorage
    const activeApiOrders = (orders || []).filter((order) => {
      const key = getOrderKey(order);
      if (key === null || key === undefined) return true;
      return !completedOrderKeys.has(String(key));
    });

    // Combine active API orders with completed orders from localStorage
    allOrders = [...activeApiOrders, ...completedOrders];

    // Normalize field mappings + status for consistent downstream rendering
    allOrders = allOrders.map((order) => {
      const key = getOrderKey(order);
      return {
        id: key,
        orderId: key,
        productName: order.productName || order.name,
        partnerName: order.partnerName || order.partner || order.providerName,
        pickupDate: order.pickupDate,
        pickupTime: order.pickupTime,
        quantity: order.quantity,
        totalAmount: order.totalAmount || order.totalPrice,
        status: normalizeBackendStatus(order.status)
      };
    });
    
    // Transform backend data to match existing claims structure
    claims = allOrders.map(order => ({
      id: order.orderId || order.id,
      provider: order.partnerName || order.providerName || "Unknown Provider",
      item: order.productName,
      pickup: formatPickupTime(order.pickupDate || order.pickupTime),
      status: mapOrderStatus(order.status)
    }));

    // Update dashboard statistics
    updateDashboardStats();
    
    renderClaims();
    loadTodaysPickups();

  } catch (error) {
    console.error("Error loading claims:", error);
    // Fallback: show completed claims from localStorage even if API is down
    const completedOrdersJSON = localStorage.getItem('completedOrders');
    const completedOrders = completedOrdersJSON ? JSON.parse(completedOrdersJSON) : [];

    const normalizeBackendStatus = (status) => {
      if (status == null) return '';
      return String(status)
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '_');
    };

    allOrders = (completedOrders || []).map((order) => ({
      id: order.orderId || order.orderNumber || order.id || null,
      orderId: order.orderId || order.orderNumber || order.id || null,
      productName: order.productName || order.name,
      partnerName: order.partnerName || order.partner || order.providerName,
      pickupDate: order.pickupDate,
      pickupTime: order.pickupTime,
      quantity: order.quantity,
      totalAmount: order.totalAmount || order.totalPrice,
      status: normalizeBackendStatus(order.status)
    }));

    claims = allOrders.map((order) => ({
      id: order.orderId || order.id,
      provider: order.partnerName || "Unknown Provider",
      item: order.productName,
      pickup: formatPickupTime(order.pickupDate || order.pickupTime),
      status: mapOrderStatus(order.status)
    }));

    updateDashboardStats();
    renderClaims();
    loadTodaysPickups();
  }
}

// Helper: Format pickup time
function formatPickupTime(timestamp) {
  if (!timestamp) return "TBD";
  
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  
  // Check if today
  if (date.toDateString() === today.toDateString()) {
    return `Today • ${time}`;
  }
  // Check if yesterday
  else if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday • ${time}`;
  }
  // Format as day of week
  else {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${dayNames[date.getDay()]} • ${time}`;
  }
}

// Helper: Map backend status to frontend status
function mapOrderStatus(backendStatus) {
  const key = (backendStatus == null)
    ? ''
    : String(backendStatus).trim().toUpperCase().replace(/\s+/g, '_');

  const statusMap = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    READY_FOR_PICKUP: 'confirm',
    READY: 'confirm',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  };

  // If the backend already sent lowercase statuses, normalize them too
  if (statusMap[key]) return statusMap[key];
  if (key === 'COMPLETED_ORDER' || key === 'DONE' || key === 'PAID') return 'completed';
  return 'pending';
}


// ================================
// FUNCTION: SAVE TO LOCAL STORAGE
// ================================
function saveData() {
  localStorage.setItem("claimsData", JSON.stringify(claims));
}


// ================================
// RENDER CLAIMS TABLE
// ================================
function renderClaims() {
  const tableBody = document.getElementById("recentClaimsBody");
  if (!tableBody) return;
  
  tableBody.innerHTML = ""; // Clear old rows

  if (claims.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="4" style="text-align: center;">No recent claims</td>';
    tableBody.appendChild(row);
    updateSummaryCounters();
    return;
  }

  claims.forEach((claim) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${claim.provider}</td>
      <td>${claim.item}</td>
      <td>${claim.pickup}</td>
      <td>
        <span class="status-pill ${getStatusClass(claim.status)}" data-id="${claim.id}">
          ${formatStatus(claim.status)}
        </span>
      </td>
    `;

    tableBody.appendChild(row);
  });

  attachStatusEvents();
  updateSummaryCounters();
}


// ================================
// STATUS HELPER FUNCTIONS
// ================================
function getStatusClass(status) {
  return {
    pending: "status-pending",
    confirm: "status-confirm",
    completed: "status-complete"
  }[status];
}

function formatStatus(status) {
  return {
    pending: "Pending",
    confirm: "Confirm Pickup",
    completed: "Completed"
  }[status];
}


// ================================
// HANDLE CLICK EVENTS ON STATUS
// ================================
function attachStatusEvents() {
  const pills = document.querySelectorAll(".status-pill");

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const id = parseInt(pill.getAttribute("data-id"));
      const claim = claims.find((c) => c.id === id);

      if (claim.status === "pending") {
        claim.status = "confirm";
      } else if (claim.status === "confirm") {
        claim.status = "completed";
      } else {
        return; // completed -> no action
      }

      saveData();
      renderClaims();
    });
  });
}


// ================================
// UPDATE TOTALS (TOP SUMMARY ROW)
// ================================
function updateSummaryCounters() {
  const totalSavingsElem = document.querySelector(".summary-row .summary-card:nth-child(1) .summary-value");
  const mealsElem = document.querySelector(".summary-row .summary-card:nth-child(2) .summary-value");
  const activeElem = document.querySelector(".summary-row .summary-card:nth-child(3) .summary-value");

  // Meals rescued = completed + active
  const completedMeals = claims.filter(c => c.status === "completed").length;
  const activeClaims = claims.filter(c => c.status !== "completed").length;

  // Fake formula for savings
  const fakeSavings = completedMeals * 60 + activeClaims * 20;

  totalSavingsElem.textContent = `₱ ${fakeSavings}`;
  mealsElem.textContent = completedMeals;
  activeElem.textContent = activeClaims;
}


// ================================
// LOAD TODAY'S PICKUPS
// ================================
function loadTodaysPickups() {
  const list = document.getElementById("todaysPickupsList");
  if (!list) return;
  
  list.innerHTML = "";

  const todayClaims = claims.filter(c => c.pickup.includes("Today"));

  if (todayClaims.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.textContent = "No pickups scheduled for today";
    emptyMsg.style.textAlign = "center";
    emptyMsg.style.color = "#999";
    emptyMsg.style.padding = "20px";
    list.appendChild(emptyMsg);
    return;
  }

  todayClaims.forEach((claim) => {
    const item = document.createElement("div");
    item.classList.add("pickup-item");

    item.innerHTML = `
      <div>
        <p class="pickup-store">${claim.provider}</p>
        <p class="pickup-detail">${claim.item}</p>
      </div>
      <p class="pickup-time">${claim.pickup.replace("Today • ", "")}</p>
    `;

    list.appendChild(item);
  });
}


// ================================
// INITIAL PAGE LOAD
// ================================
window.addEventListener("DOMContentLoaded", () => {
  // Display user name
  const userName = localStorage.getItem("userName") || "User";
  const userNameElement = document.querySelector(".topbar-title .accent");
  if (userNameElement) {
    userNameElement.textContent = userName;
  }
  
  // Load claims from backend
  loadClaims();
});

document.querySelector(".logout-btn").addEventListener("click", () => {
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