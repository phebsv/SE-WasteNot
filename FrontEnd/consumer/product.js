// ---- IMPORT PRODUCTS FROM MARKETPLACE ----
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

// ---- GET PRODUCT ID FROM URL ----
const params = new URLSearchParams(window.location.search);
const productId = Number(params.get("id"));

const product = products.find(p => p.id === productId);

// ---- GET CONTAINER ----
const container = document.getElementById("productContainer");

// ---- IF PRODUCT DOES NOT EXIST ----
if (!product) {
  container.innerHTML = `
    <div class="not-found-box">
        <h2>Product Not Found</h2>
        <p>The product you're looking for no longer exists.</p>
        <a class="back-btn" href="consumer-marketplace.html">← Back to Marketplace</a>
    </div>
  `;
  console.warn("Product ID not found:", productId);
  throw new Error("Invalid product ID");
}

// ---- GENERATE PRODUCT PAGE ----
container.innerHTML = `
    <div class="product-top">
        <div class="discount-box">
            <div class="percent">${product.discountPercent}% Off</div>
            <img src="${product.image}">
            <div id="countdown" class="countdown">Loading...</div>
        </div>

        <div class="product-info">
            <h2 class="product-title">${product.name}</h2>
            <div class="product-sub">${product.partner} • Cooked</div>

            <div class="product-price">
                ₱${product.price}
                <span class="old-price">₱${product.oldPrice}</span>
            </div>

            <div class="detail-list">
                <p><b>Expiry date:</b> ${product.expiry}</p>
                <p><b>Pickup Window:</b> ${product.pickupWindow}</p>
                <p><b>Store:</b> ${product.store}</p>
                <p><i>You are ${product.distance} from the shop. Claim Now!</i></p>
            </div>

            <div class="action-row">
                <button class="btn directions-btn" onclick="goDirections(${product.id})">View Directions</button>
                <button class="btn claim-btn" onclick="goClaim(${product.id})">Claim</button>
            </div>
        </div>
    </div>
`;

// ---- COUNTDOWN TIMER ----
let seconds = 24 * 60 * 60; // 24 hours
const countdownEl = document.getElementById("countdown");

setInterval(() => {
  seconds--;
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  countdownEl.textContent = `${h}h ${m}m ${s}s`;
}, 1000);

// ---- NAVIGATION ----
function goDirections(id) {
  window.location.href = `directions.html?id=${id}`;
}

function goClaim(id) {
  window.location.href = `claim.html?id=${id}`;
}