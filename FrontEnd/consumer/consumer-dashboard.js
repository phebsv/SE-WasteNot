// === AUTH CHECK ===
if (!localStorage.getItem("consumerLoggedIn") || localStorage.getItem("consumerLoggedIn") !== "true") {
    window.location.href = "../login/login-consumer.html";
}

// Claims will be loaded from backend API
let claims = [];

// ================================
// LOAD CLAIMS FROM BACKEND
// ================================
async function loadClaims() {
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

    const orders = await response.json();
    
    // Transform backend data to match existing claims structure
    claims = orders.map(order => ({
      id: order.orderId,
      provider: order.providerName || "Unknown Provider",
      item: order.productName,
      pickup: formatPickupTime(order.pickupTime),
      status: mapOrderStatus(order.status)
    }));

    renderClaims();
    loadTodaysPickups();

  } catch (error) {
    console.error("Error loading claims:", error);
    // Keep empty claims array if API fails
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
  const statusMap = {
    'PENDING': 'pending',
    'CONFIRMED': 'confirmed',
    'READY_FOR_PICKUP': 'confirm',
    'COMPLETED': 'completed',
    'CANCELLED': 'cancelled'
  };
  return statusMap[backendStatus] || 'pending';
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
    localStorage.clear(); // removes login data
    window.location.href = "../login/login-consumer.html"; // or partner/ngo
});