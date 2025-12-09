// ========= SAMPLE DATA =========
const products = [
  {
    id: 1,
    name: "BreadTalk Croissant",
    partner: "BreadTalk",
    price: 60,
    oldPrice: 120,
    discountPercent: 50,
    category: "breads",
    image: "croissant.png",
    description: "Buttery croissant, best consumed within 24 hours.",
    expiry: "Today • 8 PM",
    pickupWindow: "4:00 PM – 7:30 PM"
  },
  {
    id: 2,
    name: "Goldilocks Cake Slice",
    partner: "Goldilocks",
    price: 28,
    oldPrice: 45,
    discountPercent: 35,
    category: "breads",
    image: "goldilocks-slice.jpg",
    description: "Moist cake slice, perfect with coffee. Near best-before date.",
    expiry: "Tomorrow • 10 AM",
    pickupWindow: "3:00 PM – 8:00 PM"
  },
  {
    id: 3,
    name: "Gardenia Classic Bread",
    partner: "Gardenia",
    price: 95,
    oldPrice: 105,
    discountPercent: 10,
    category: "breads",
    image: "gardenia.jpg",
    description: "Classic loaf, still fresh. Best-before in 2 days.",
    expiry: "In 2 days",
    pickupWindow: "Anytime within store hours"
  },
  {
    id: 4,
    name: "Stop N Shop Fruit Cup",
    partner: "Stop N Shop",
    price: 85,
    oldPrice: 120,
    discountPercent: 30,
    category: "drinks",
    image: "fruit-cup.jpg",
    description: "Mixed fruits in syrup. Slightly bruised but perfectly edible.",
    expiry: "Tomorrow • 6 PM",
    pickupWindow: "2:00 PM – 6:00 PM"
  },
  {
    id: 5,
    name: "Stop N Shop Mango Juice",
    partner: "Stop N Shop",
    price: 30,
    oldPrice: 50,
    discountPercent: 40,
    category: "drinks",
    image: "mango-juice.jpg",
    description: "Chilled mango drink from near-expiry stock.",
    expiry: "Today • 9 PM",
    pickupWindow: "5:00 PM – 8:30 PM"
  },
  {
    id: 6,
    name: "Assorted Pastry Box",
    partner: "SM Supermarket",
    price: 95,
    oldPrice: 150,
    discountPercent: 37,
    category: "breads",
    image: "pastry-box.jpg",
    description: "Assorted bread and pastries from today’s unsold items.",
    expiry: "Today • 10 PM",
    pickupWindow: "5:30 PM – 9:30 PM"
  },
  {
  id: 7,
  name: "Jollibee Chickenjoy Meal",
  partner: "Jollibee",
  price: 75,
  oldPrice: 150,
  discountPercent: 50,
  category: "meals",
  image: "chickenjoy.jpg", 
  description: "1pc Chickenjoy with rice. Near end-of-day surplus but perfectly safe and delicious.",
  expiry: "Today • 7 PM",
  pickupWindow: "4:00 PM – 6:30 PM"
},
{
  id: 8,
  name: "Jollibee Jolly Spaghetti",
  partner: "Jollibee",
  price: 40,
  oldPrice: 60,
  discountPercent: 33,
  category: "meals",
  image: "jolly-spaghetti.jpg", 
  description: "Sweet-style Jolly Spaghetti from end-of-day batch. Best consumed within the hour.",
  expiry: "Today • 7 PM",
  pickupWindow: "4:30 PM – 6:45 PM"
}
];

// ========= DOM ELEMENTS =========
const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const filterChips = document.querySelectorAll(".filter-chip");
const partnerChips = document.querySelectorAll(".partner-chip");
const resultsText = document.getElementById("resultsText");
const avatarInitial = document.getElementById("avatarInitial");
const logoutBtn = document.getElementById("logoutBtn");

// ========= SESSION =========
(function checkConsumerSession() {
  try {
    const session = JSON.parse(localStorage.getItem("consumerSession"));
    if (session && session.name && avatarInitial) {
      avatarInitial.textContent = session.name.charAt(0).toUpperCase();
    }
  } catch (err) {
    console.warn("Invalid session", err);
  }
})();

// ========= STATE =========
let activePartner = "All";
let activeFilter = "all";
let searchTerm = "";

// ========= RENDER PRODUCTS =========
function renderProducts() {
  productGrid.innerHTML = "";

  const filtered = products.filter((p) => {
    // partner filter
    if (activePartner !== "All" && p.partner !== activePartner) return false;

    // search filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      const matches =
        p.name.toLowerCase().includes(term) ||
        p.partner.toLowerCase().includes(term) ||
        (p.category && p.category.toLowerCase().includes(term));
      if (!matches) return false;
    }

    // filter chips
    switch (activeFilter) {
      case "high-discount":
        if (p.discountPercent < 30) return false;
        break;
      case "under-50":
        if (p.price >= 50) return false;
        break;
      case "breads":
        if (p.category !== "breads") return false;
        break;
      case "drinks":
        if (p.category !== "drinks") return false;
        break;
      case "all":
      default:
        break;
    }

    return true;
  });

  // Update text
  if (filtered.length === 0) {
    resultsText.textContent = "No results. Try adjusting filters.";
  } else {
    resultsText.textContent =
      activePartner === "All" && activeFilter === "all" && !searchTerm
        ? "Showing all deals"
        : `Showing ${filtered.length} item${filtered.length > 1 ? "s" : ""}`;
  }

  // Create cards
  filtered.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";

    card.innerHTML = `
      <div class="discount-badge">${product.discountPercent}% Off</div>
      <img src="${product.image}" alt="${product.name}">
      <div class="product-name">${product.name}</div>
      <div class="product-meta">${product.partner} • ${product.expiry}</div>
      <div class="product-price-row">
        <span class="product-price">₱${product.price}</span>
        ${product.oldPrice ? `<span class="product-old-price">₱${product.oldPrice}</span>` : ""}
      </div>
      <div class="product-arrow">›</div>
    `;

    // ⬇ Navigate to product page
    card.addEventListener("click", () => {
      window.location.href = `product.html?id=${product.id}`;
    });

    productGrid.appendChild(card);
  });
}

// ========= HANDLERS =========
function onSearchInput(e) {
  searchTerm = e.target.value;
  renderProducts();
}

function onFilterChipClick(e) {
  filterChips.forEach((chip) => chip.classList.remove("active"));
  e.currentTarget.classList.add("active");
  activeFilter = e.currentTarget.dataset.filter;
  renderProducts();
}

function onPartnerChipClick(e) {
  partnerChips.forEach((chip) => chip.classList.remove("active"));
  e.currentTarget.classList.add("active");
  activePartner = e.currentTarget.dataset.partner;
  renderProducts();
}

// ========= LOGOUT =========
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("consumerSession");
    alert("Logged out!");
  });
}

// ========= EVENT LISTENERS =========
searchInput.addEventListener("input", onSearchInput);
filterChips.forEach((chip) => chip.addEventListener("click", onFilterChipClick));
partnerChips.forEach((chip) => chip.addEventListener("click", onPartnerChipClick));

// ========= INITIAL RENDER =========
renderProducts();