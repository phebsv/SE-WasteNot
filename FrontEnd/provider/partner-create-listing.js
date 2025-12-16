// ===== AUTH GUARD =====
if (!localStorage.getItem("authToken") || localStorage.getItem("userRole") !== "partner") {
  window.location.href = "../login/login-consumer.html";
}

const PRODUCTS_API = 'http://localhost:8081/api/products';

async function createProduct(productData) {
  try {
    const response = await fetch(PRODUCTS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error creating product:', error);
    return false;
  }
}

async function createListing(type) {
  const productData = {
    name: document.getElementById("name").value,
    quantity: Number(document.getElementById("quantity").value),
    unit: document.getElementById("unit")?.value || 'pcs',
    category: document.getElementById("category").value,
    productionDate: document.getElementById("productionDate").value,
    expiryDate: document.getElementById("expiryDate").value,
    pickupInstructions: document.getElementById("pickupWindow").value,
    price: type === "sale" ? Number(document.getElementById("price").value) : 0,
    type: type === "sale" ? "marketplace" : "donation",
    partnerId: Number(localStorage.getItem("userId")),
    partnerName: localStorage.getItem("userName"),
    available: true
  };

  const success = await createProduct(productData);
  
  if (success) {
    showToast("Listing created successfully!");
    setTimeout(() => {
      window.location.href = "partner-listings.html";
    }, 1000);
  } else {
    showToast("Failed to create listing", "error");
  }
}

// BUTTON EVENTS
document.getElementById("createSaleBtn")?.addEventListener("click", () => {
  createListing("sale");
});

document.getElementById("createDonationBtn")?.addEventListener("click", () => {
  createListing("donation");
});

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.className = "toast";
  }, 2500);
}
