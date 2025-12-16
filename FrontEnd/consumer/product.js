// ---- BACKEND API CONFIGURATION ----
const API_URL = "http://localhost:8081/api";
let product = null;

// ---- LOAD PRODUCT FROM BACKEND ----
async function loadProduct() {
  const params = new URLSearchParams(window.location.search);
  const productId = Number(params.get("id"));

  if (!productId) {
    showProductNotFound();
    return;
  }

  try {
    const response = await fetch(`${API_URL}/products/${productId}`);
    const data = await response.json();
    
    if (data.success && data.data) {
      // Transform backend data to frontend format
      product = {
        id: data.data.id,
        name: data.data.name,
        partner: data.data.partnerName,
        price: data.data.price,
        oldPrice: data.data.oldPrice,
        discountPercent: data.data.discountPercent,
        category: data.data.category,
        image: data.data.imageUrl || "placeholder.jpg",
        description: data.data.description,
        expiry: data.data.expiryDisplay || "Check with provider",
        pickupWindow: data.data.pickupWindow || "Contact provider",
        store: data.data.partnerName,
        distance: "Loading..."
      };
      
      renderProduct();
    } else {
      showProductNotFound();
    }
  } catch (error) {
    console.error('Error loading product:', error);
    showProductNotFound();
  }
}

// ---- GET CONTAINER ----
const container = document.getElementById("productContainer");

function showProductNotFound() {
  container.innerHTML = `
    <div class="not-found-box">
        <h2>Product Not Found</h2>
        <p>The product you're looking for no longer exists.</p>
        <a class="back-btn" href="consumer-marketplace.html">← Back to Marketplace</a>
    </div>
  `;
}

// ---- GENERATE PRODUCT PAGE ----
function renderProduct() {
  if (!product) {
    showProductNotFound();
    return;
  }
  
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
}

// ---- NAVIGATION ----
function goDirections(id) {
  window.location.href = `directions.html?id=${id}`;
}

function goClaim(id) {
  window.location.href = `claim.html?id=${id}`;
}

// ---- INITIALIZE ON PAGE LOAD ----
loadProduct();
