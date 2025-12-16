// ==== AUTH GUARD ====
if (!localStorage.getItem("authToken") || localStorage.getItem("userRole") !== "partner") {
  window.location.href = "../login/login-consumer.html";
}

const PRODUCTS_API = 'http://localhost:8081/api/products';
const ORDERS_API = 'http://localhost:8081/api/orders';

// Load partner's products and orders
async function loadPartnerData() {
  try {
    const userId = localStorage.getItem('userId');
    const [productsRes, ordersRes] = await Promise.all([
      fetch(PRODUCTS_API),
      fetch(ORDERS_API)
    ]);
    
    const allProducts = productsRes.ok ? await productsRes.json() : [];
    const allOrders = ordersRes.ok ? await ordersRes.json() : [];
    
    // Filter products by this partner
    const listings = allProducts.filter(p => p.partnerId == userId);
    const claims = allOrders.filter(o => listings.some(l => l.id === o.productId));
    
    return { listings, claims };
  } catch (error) {
    console.error('Error loading partner data:', error);
    return { listings: [], claims: [] };
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // ---- Session / profile ----
  const partnerNameEl = document.getElementById("partnerName");
  const avatarInitial = document.getElementById("avatarInitial");
  const logoutBtn = document.getElementById("logoutBtn");

  const partnerName = localStorage.getItem('userName') || "Partner";
  if (partnerNameEl) partnerNameEl.textContent = partnerName;
  if (avatarInitial) avatarInitial.textContent = partnerName.charAt(0).toUpperCase();

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "../login/login-consumer.html";
    });
  }

  // ========= STATS FROM BACKEND =========
  const { listings, claims } = await loadPartnerData();

  const totalListings = listings.length;
  const activeListings = listings.filter(l => l.status === "active").length;

  const donatedListings = listings.filter(l => l.type === "Donation");
  const donatedCount = donatedListings.reduce(
    (sum, l) => sum + (l.originalQty - l.remainingQty),
    0
  );

  // very simple earnings / sold value demo
  const discountListings = listings.filter(l => l.type === "Discount");
  const earningsValue = discountListings.reduce(
    (sum, l) => sum + (l.price * (l.originalQty - l.remainingQty)),
    0
  );
  const soldValue = discountListings.reduce(
    (sum, l) => sum + (l.price * l.originalQty),
    0
  );

  // Fill stat text
  const byId = id => document.getElementById(id);

  if (byId("totalListings")) byId("totalListings").textContent = totalListings;
  if (byId("activeListings")) byId("activeListings").textContent = activeListings;
  if (byId("donatedCount")) byId("donatedCount").textContent = donatedCount;
  if (byId("earningsValue")) byId("earningsValue").textContent = earningsValue;
  if (byId("soldValue")) byId("soldValue").textContent = soldValue;

  // demo change % values (you can compute real ones later)
  if (byId("donatedChange")) byId("donatedChange").textContent = "+24%";
  if (byId("earningsChange")) byId("earningsChange").textContent = "-8%";
  if (byId("soldChange")) byId("soldChange").textContent = "-5%";
  if (byId("wasteKg")) byId("wasteKg").textContent = "18.4 kg Waste Diverted";
  if (byId("bagsSaved")) byId("bagsSaved").textContent = "3 bags of trash saved";
  if (byId("impactChange")) byId("impactChange").textContent = "+12% vs last month";
  if (byId("monthLabel")) byId("monthLabel").textContent = "Month of November";

  // ==== Charts using Chart.js ====
  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];

  const listingsPerWeek = [1, 0, 0, 0];
  const claimsPerWeek = [0, 0, 0, 0];

  listings.forEach(l => {
    const w = Math.min(Math.max(l.week || 1, 1), 4);
    listingsPerWeek[w - 1] += 1;
  });

  claims.forEach(c => {
    const w = Math.min(Math.max(c.week || 1, 1), 4);
    claimsPerWeek[w - 1] += c.qty;
  });

  const listingsCtx = document.getElementById("listingsChart");
  if (listingsCtx) {
    new Chart(listingsCtx, {
      type: "bar",
      data: {
        labels: weeks,
        datasets: [{
          label: "Listings",
          data: listingsPerWeek,
          borderRadius: 6,
          backgroundColor: "#22c55e"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            grid: { color: "#e5e7eb" }
          }
        }
      }
    });
  }

  const claimsCtx = document.getElementById("claimsChart");
  if (claimsCtx) {
    new Chart(claimsCtx, {
      type: "bar",
      data: {
        labels: weeks,
        datasets: [{
          label: "Claims / Items",
          data: claimsPerWeek,
          borderRadius: 6,
          backgroundColor: "#4ade80"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 2 },
            grid: { color: "#e5e7eb" }
          }
        }
      }
    });
  }
});