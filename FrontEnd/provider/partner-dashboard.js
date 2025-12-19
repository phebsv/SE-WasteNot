// ==== AUTH GUARD ====
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
  if (s === 'PICKED_UP' || s === 'PICKEDUP') return 'COMPLETED';

  const allowed = new Set(['PENDING', 'CONFIRMED', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED']);
  return allowed.has(s) ? s : 'PENDING';
}

function getDateValue(obj) {
  const raw = obj?.orderDate || obj?.createdAt || obj?.dateCreated || obj?.updatedAt || obj?.date;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function clampWeekIndex(dayOfMonth) {
  // UI shows 4 weeks; fold any week 5 into week 4
  const w = Math.ceil(dayOfMonth / 7);
  return Math.min(Math.max(w, 1), 4);
}

function formatMoney(value) {
  const n = Number(value) || 0;
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function isDonationProduct(product) {
  const type = String(product?.type || product?.listingType || '').trim().toLowerCase();
  const price = Number(product?.price);
  return type === 'donation' || price === 0;
}

function getProductQuantity(product) {
  const candidates = [product?.quantity, product?.remainingQty, product?.remainingQuantity, product?.stock, product?.availableQuantity];
  for (const v of candidates) {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

// Load partner's products and orders
async function loadPartnerData() {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) return { listings: [], orders: [] };
    const [productsRes, ordersRes] = await Promise.all([
      fetch(PRODUCTS_API),
      fetch(`${ORDERS_API}/partner/${userId}`)
    ]);
    
    const productsJson = productsRes.ok ? await productsRes.json() : null;
    const ordersJson = ordersRes.ok ? await ordersRes.json() : null;
    
    // Filter products by this partner
    const allProducts = unwrapData(productsJson);
    const listings = allProducts.filter(p => String(p.partnerId) === String(userId));

    // Orders already partner-scoped by backend
    const orders = unwrapData(ordersJson).map(o => ({
      ...o,
      status: normalizeStatus(o.status)
    }));
    
    return { listings, orders };
  } catch (error) {
    console.error('Error loading partner data:', error);
    return { listings: [], orders: [] };
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

  // ========= STATS FROM BACKEND =========
  const { listings, orders } = await loadPartnerData();

  const productById = new Map(listings.map(p => [p.id, p]));

  const completedOrders = orders.filter(o => normalizeStatus(o.status) === 'COMPLETED');
  const completedPaidOrders = completedOrders.filter(o => {
    const product = productById.get(o.productId);
    if (!product) return false;
    return !isDonationProduct(product);
  });
  const completedDonationOrders = completedOrders.filter(o => {
    const product = productById.get(o.productId);
    if (!product) return false;
    return isDonationProduct(product);
  });

  const totalListings = listings.length;
  const activeListings = listings.filter(l => {
    const qty = getProductQuantity(l);
    const status = String(l?.status || '').trim().toUpperCase();
    if (status === 'INACTIVE' || status === 'HIDDEN' || status === 'DISABLED') return false;
    if (qty == null) return true; // no quantity field -> assume active
    return qty > 0;
  }).length;

  const donatedCount = completedDonationOrders.reduce((sum, o) => sum + (Number(o.quantity) || 0), 0);

  // Earnings from completed paid orders
  const earningsValue = completedPaidOrders.reduce((sum, o) => {
    if (Number.isFinite(Number(o.totalAmount))) return sum + Number(o.totalAmount);
    const product = productById.get(o.productId);
    const price = Number(product?.price) || 0;
    return sum + (price * (Number(o.quantity) || 0));
  }, 0);

  // Sold value (estimate) = same as earnings unless retail/original price exists
  const soldValue = completedPaidOrders.reduce((sum, o) => {
    const product = productById.get(o.productId);
    const price = Number(product?.originalPrice) || Number(product?.retailPrice) || Number(product?.price) || 0;
    return sum + (price * (Number(o.quantity) || 0));
  }, 0);

  // Impact: simple assumption 0.6kg per item
  const wasteKg = completedOrders.reduce((sum, o) => sum + (Number(o.quantity) || 0), 0) * 0.6;
  const bagsSaved = wasteKg / 6; // ~6kg per bag

  // Fill stat text
  const byId = id => document.getElementById(id);

  if (byId("totalListings")) byId("totalListings").textContent = totalListings;
  if (byId("activeListings")) byId("activeListings").textContent = activeListings;
  if (byId("donatedCount")) byId("donatedCount").textContent = donatedCount;
  if (byId("earningsValue")) byId("earningsValue").textContent = formatMoney(earningsValue);
  if (byId("soldValue")) byId("soldValue").textContent = formatMoney(soldValue);

  // Remove hardcoded “change %” placeholders (not computable without historical baseline)
  if (byId("donatedChange")) byId("donatedChange").textContent = "";
  if (byId("earningsChange")) byId("earningsChange").textContent = "";
  if (byId("soldChange")) byId("soldChange").textContent = "";
  if (byId("impactChange")) byId("impactChange").textContent = "";

  if (byId("wasteKg")) byId("wasteKg").textContent = wasteKg.toFixed(1);
  if (byId("bagsSaved")) byId("bagsSaved").textContent = `${bagsSaved.toFixed(1)} bags`;

  const now = new Date();
  const monthName = now.toLocaleString(undefined, { month: 'long' });
  if (byId("monthLabel")) byId("monthLabel").textContent = `Month of ${monthName}`;

  // ==== Charts using Chart.js ====
  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];

  const listingsPerWeek = [0, 0, 0, 0];
  const claimsPerWeek = [0, 0, 0, 0];

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  listings.forEach(l => {
    const d = getDateValue(l);
    if (!d) return;
    if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) return;
    const w = clampWeekIndex(d.getDate());
    listingsPerWeek[w - 1] += 1;
  });

  orders.forEach(o => {
    const d = getDateValue(o);
    if (!d) return;
    if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) return;
    const w = clampWeekIndex(d.getDate());
    const qty = Number(o.quantity) || 0;
    claimsPerWeek[w - 1] += qty;
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