function saveListingToStorage(listing) {
  let listings = JSON.parse(localStorage.getItem("partnerListings")) || [];
  listings.push(listing);
  localStorage.setItem("partnerListings", JSON.stringify(listings));
}

function createListing(type) {
  const listing = {
    id: Date.now(),
    name: document.getElementById("name").value,
    qtyLeft: Number(document.getElementById("quantity").value),
    category: document.getElementById("category").value,
    production: document.getElementById("productionDate").value,
    expiry: document.getElementById("expiryDate").value,
    pickup: document.getElementById("pickupWindow").value,
    price: type === "sale" ? Number(document.getElementById("price").value) : 0,
    listingType: type
  };

  saveListingToStorage(listing);

  window.location.href = "partner-listings.html";
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