// ---- SAME PRODUCTS ARRAY YOU USE IN MARKETPLACE ----

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

// ---- Get product from URL ----
const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));
const product = products.find(p => p.id === id);

// ---- DOM Elements ----
const productImage = document.getElementById("productImage");
const productName = document.getElementById("productName");
const storeName = document.getElementById("storeName");
const storeAddress = document.getElementById("storeAddress");
const storeDistance = document.getElementById("storeDistance");
const mapPreview = document.getElementById("mapPreview");
const openMapsBtn = document.getElementById("openMapsBtn");
const claimBtn = document.getElementById("claimBtn");
const otherProductsGrid = document.getElementById("otherProductsGrid");

// ---- If product not found ----
if (!product) {
    productName.textContent = "Product not found";
}

// ---- Fill product info ----
productImage.src = product.image;
productName.textContent = product.name;
storeName.textContent = product.partner;
storeAddress.textContent = "123 Example Street, Cebu City"; // Optional: change later
storeDistance.textContent = "You are 2.1 km away";

// ---- Google Maps link ----
openMapsBtn.href =
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(storeName.textContent)}`;

// ---- Go to claim page ----
claimBtn.onclick = () => {
    window.location.href = `claim.html?id=${product.id}`;
};

// ---- Show other products from same partner ----
const others = products.filter(p => p.partner === product.partner && p.id !== product.id);

others.forEach(item => {
    const div = document.createElement("div");
    div.className = "other-item";

    div.innerHTML = `
        <img src="${item.image}">
        <p>${item.name}</p>
        <span>₱${item.price}</span>
    `;

    div.onclick = () => {
        window.location.href = `product.html?id=${item.id}`;
    };

    otherProductsGrid.appendChild(div);
});
