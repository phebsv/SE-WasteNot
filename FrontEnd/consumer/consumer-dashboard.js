// === AUTH CHECK ===
if (!localStorage.getItem("consumerName")) {
    window.location.href = "login-consumer.html";
}

let claims = [
  {
    id: 1,
    provider: "FreshLeaf Cafe",
    item: "Green Salad Bowl",
    pickup: "Today • 5:30 PM",
    status: "pending"
  },
  {
    id: 2,
    provider: "EatSmart",
    item: "Vegetable Fried Rice",
    pickup: "Today • 3:00 PM",
    status: "pending"
  },
  {
    id: 3,
    provider: "BreadTalk",
    item: "Croissant",
    pickup: "Yesterday • 1:00 PM",
    status: "confirm"
  },
  {
    id: 4,
    provider: "Stop N Snack",
    item: "Tuna Wrap",
    pickup: "Mon • 4:45 PM",
    status: "completed"
  },
  {
    id: 5,
    provider: "EatSmart",
    item: "Spaghetti Meal Box",
    pickup: "Sun • 6:20 PM",
    status: "completed"
  }
];

// Load saved data if it exists (simulates database persistence)
if (localStorage.getItem("claimsData")) {
  claims = JSON.parse(localStorage.getItem("claimsData"));
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
  const tableBody = document.querySelector(".claims-table tbody");
  tableBody.innerHTML = ""; // Clear old rows

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
  const list = document.querySelector(".pickup-list");
  list.innerHTML = "";

  const todayClaims = claims.filter(c => c.pickup.includes("Today"));

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
  renderClaims();
  loadTodaysPickups();
});

document.querySelector(".logout-btn").addEventListener("click", () => {
    localStorage.clear(); // removes login data
    window.location.href = "login-consumer.html"; // or partner/ngo
});