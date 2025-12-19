// Backend API Configuration
const API_URL = "http://localhost:8081/api";
let product = null;

// Load product from backend
async function loadProduct() {
  const params = new URLSearchParams(window.location.search);
  const productId = Number(params.get("id"));

  if (!productId) {
    alert("Product not found");
    window.location.href = "consumer-marketplace.html";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/products/${productId}`);
    const data = await response.json();
    
    if (data.success && data.data) {
      product = {
        id: data.data.id,
        name: data.data.name,
        partner: data.data.partnerName,
        image: data.data.imageUrl || "placeholder.jpg",
        address: data.data.partnerAddress || "Address not available",
        distance: "Calculating..."
      };
      
      // Fill UI
      document.getElementById("productImage").src = product.image;
      document.getElementById("productName").textContent = product.name;
      document.getElementById("storeName").textContent = product.partner;
      document.getElementById("storeAddress").textContent = product.address;
      document.getElementById("storeDistance").textContent = product.distance;
      
      // Setup buttons after product is loaded
      setupButtons();
      
    } else {
      alert("Product not found");
      window.location.href = "consumer-marketplace.html";
    }
  } catch (error) {
    console.error('Error loading product:', error);
    alert("Failed to load product directions.");
  }
}

function setupButtons() {
  const openMapsBtn = document.getElementById("openMapsBtn");

  // ---- Google Maps link ----
  openMapsBtn.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(product.partner)}`;
}

// Initialize on page load
loadProduct();
