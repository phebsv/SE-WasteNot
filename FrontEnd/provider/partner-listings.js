// Guard
if (!localStorage.getItem("authToken") || localStorage.getItem("userRole") !== "partner") {
  window.location.href = "../login/login-consumer.html";
}

const PRODUCTS_API = 'http://localhost:8081/api/products';

// Load partner's products
async function loadListings() {
  try {
    const userId = localStorage.getItem('userId');
    const response = await fetch(PRODUCTS_API);
    if (response.ok) {
      const allProducts = await response.json();
      return allProducts.filter(p => p.partnerId == userId);
    }
    return [];
  } catch (error) {
    console.error('Error loading listings:', error);
    return [];
  }
}

// Create or update product
async function saveProduct(productData) {
  try {
    const method = productData.id ? 'PUT' : 'POST';
    const url = productData.id ? `${PRODUCTS_API}/${productData.id}` : PRODUCTS_API;
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error saving product:', error);
    return false;
  }
}

// Delete product
async function deleteProduct(productId) {
  try {
    const response = await fetch(`${PRODUCTS_API}/${productId}`, { method: 'DELETE' });
    return response.ok;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const avatarInitial = document.getElementById("avatarInitial");
  const userName = localStorage.getItem('userName');
  if (avatarInitial && userName) {
    avatarInitial.textContent = userName.charAt(0).toUpperCase();
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "../login/login-consumer.html";
    });
  }

  // Load listings from backend
  let listings = await loadListings();

  const container = document.getElementById("listingsContainer");
  const searchInput = document.getElementById("searchListings");
  const createBtn = document.getElementById("createListingBtn");

  // Modal elements
  const modalBackdrop = document.getElementById("listingModalBackdrop");
  const modalTitle = document.getElementById("listingModalTitle");
  const modalClose = document.getElementById("listingModalClose");
  const modalCancel = document.getElementById("listingCancelBtn");
  const listingForm = document.getElementById("listingForm");

  const titleInput = document.getElementById("listingTitle");
  const typeInput = document.getElementById("listingType");
  const priceInput = document.getElementById("listingPrice");
  const categoryInput = document.getElementById("listingCategory");
  const qtyInput = document.getElementById("listingQtyLeft");
  const expiryInput = document.getElementById("listingExpiry");
  const imageInput = document.getElementById("listingImage");

  let editingId = null;

  function openModal(mode, listing) {
    modalBackdrop.classList.remove("hidden");
    if (mode === "add") {
      modalTitle.textContent = "New Listing";
      editingId = null;

      titleInput.value = "";
      typeInput.value = "marketplace";
      priceInput.value = "";
      categoryInput.value = "";
      qtyInput.value = "";
      expiryInput.value = "";
      imageInput.value = "";
    } else if (mode === "edit" && listing) {
      modalTitle.textContent = "Edit Listing";
      editingId = listing.id;

      titleInput.value = listing.name || "";
      typeInput.value = listing.type || "marketplace";
      priceInput.value = listing.price || 0;
      categoryInput.value = listing.category || "";
      qtyInput.value = listing.quantity ?? 0;
      expiryInput.value = listing.expiryDate ? listing.expiryDate.substring(0, 10) : "";
      imageInput.value = listing.imageUrl || "";
    }
  }

  function closeModal() {
    modalBackdrop.classList.add("hidden");
  }

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalCancel) modalCancel.addEventListener("click", closeModal);

  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  function formatDate(isoStr) {
    if (!isoStr) return "";
    const d = new Date(isoStr);
    return d.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric"
    });
  }

  function renderListings(filterText = "") {
    container.innerHTML = "";

    const filtered = listings.filter(l => {
      const hay = (l.name + " " + (l.category || "") + " " + (l.type || "")).toLowerCase();
      return hay.includes(filterText.toLowerCase());
    });

    if (filtered.length === 0) {
      container.innerHTML = "<p>No listings found.</p>";
      return;
    }

    filtered.forEach(listing => {
      const card = document.createElement("article");
      card.className = "listing-card";

      const priceLabel =
        listing.type === "donation" || listing.price === 0
          ? "Donation"
          : "₱" + listing.price + " · Discounted";
          
      const status = listing.available ? "Available" : "Claimed";

      card.innerHTML = `
        <img src="${listing.imageUrl || 'https://via.placeholder.com/150'}" alt="${listing.name}" class="listing-image">
        <div class="listing-main">
          <div class="listing-title">${listing.name}</div>
          <div class="listing-meta">
            ${priceLabel}
            · ${listing.category || "General"}
            · Status: ${status}<br>
            ${listing.quantity} ${listing.unit || 'pcs'} · Expiry: ${formatDate(listing.expiryDate)}
          </div>
          <div class="listing-bottom">
            <button class="listing-btn listing-btn-primary" data-action="toggle" data-id="${listing.id}" ${!listing.available ? 'disabled' : ''}>
              ${listing.available ? 'Mark As Claimed' : 'Claimed'}
            </button>
            <div class="listing-actions">
              <button class="listing-btn listing-btn-outline" data-action="edit" data-id="${listing.id}">
                Edit Listing
              </button>
              <button class="listing-icon-btn" data-action="more" data-id="${listing.id}">
                ☰
              </button>
              <button class="listing-icon-btn delete" data-action="delete" data-id="${listing.id}">
                🗑
              </button>
            </div>
          </div>
        </div>
      `;

      container.appendChild(card);
    });
  }

  // Button actions inside listing cards
  container.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;
    const listing = listings.find(l => l.id === id);
    if (!listing) return;

    switch (action) {
      case "toggle":
        // Toggle availability
        const newAvailable = !listing.available;
        const success = await saveProduct({ ...listing, available: newAvailable });
        if (success) {
          listing.available = newAvailable;
          showToast(`Listing ${newAvailable ? 'reactivated' : 'marked as claimed'}!`, "success");
          listings = await loadListings();
          renderListings(searchInput.value);
        }
        break;
      case "edit":
        openModal("edit", listing);
        return;
      case "more":
        alert(`More actions for: ${listing.name} (demo only).`);
        break;
      case "delete":
        if (confirm(`Delete "${listing.name}"?`)) {
          const deleted = await deleteProduct(id);
          if (deleted) {
            showToast("Listing deleted!", "success");
            listings = await loadListings();
            renderListings(searchInput.value);
          }
        }
        return;
    }
  });

  // Search
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderListings(searchInput.value);
    });
  }

  // Create new listing
  if (createBtn) {
    createBtn.addEventListener("click", () => {
      openModal("add");
    });
  }

  // Handle form submit (add/edit)
  listingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const productData = {
      name: titleInput.value.trim(),
      type: typeInput.value,
      price: Number(priceInput.value) || 0,
      category: categoryInput.value.trim() || "General",
      quantity: Number(qtyInput.value) || 0,
      unit: 'pcs',
      imageUrl: imageInput.value.trim() || "",
      expiryDate: expiryInput.value || null,
      partnerId: Number(localStorage.getItem('userId')),
      partnerName: localStorage.getItem('userName'),
      available: true
    };

    if (!productData.name) {
      alert("Please enter a product name.");
      return;
    }

    if (editingId == null) {
      // Add new product
      const success = await saveProduct(productData);
      if (success) {
        showToast("Listing created!", "success");
        listings = await loadListings();
      } else {
        showToast("Failed to create listing", "error");
      }
    } else {
      // Edit existing product
      productData.id = editingId;
      const success = await saveProduct(productData);
      if (success) {
        showToast("Listing updated!", "success");
        listings = await loadListings();
      } else {
        showToast("Failed to update listing", "error");
      }
    }

    closeModal();
    renderListings(searchInput.value);
  });

  // Initial render
  renderListings();
});

showToast("Listing deleted.", "info");

  const idx = partnerListings.findIndex(l => l.id === id);
  if (idx !== -1) {
    partnerListings.splice(idx, 1);
    localStorage.setItem("partnerListings", JSON.stringify(partnerListings));
  }

  const searchInput = document.getElementById("searchListings");
  if (searchInput) {
    const listingsContainer = document.getElementById("listingsContainer");
    if (listingsContainer) {
      // simple re-render
      document.dispatchEvent(new Event("DOMContentLoaded"));
    }
  }
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.className = "toast";
  }, 2500);
}

let listings = JSON.parse(localStorage.getItem("partnerListings")) || [];
let editingId = null;

// OPEN EDIT MODAL
function openEditModal(id) {
  const item = listings.find(l => l.id === id);
  editingId = id;

  document.getElementById("editName").value = item.name;
  document.getElementById("editQty").value = item.qtyLeft;
  document.getElementById("editPrice").value = item.price;
  document.getElementById("editPickup").value = item.pickup;
  document.getElementById("editExpiry").value = item.expiry;

  document.getElementById("editModal").classList.remove("hidden");
}

// CLOSE MODAL
// Toast notification
function showToast(message, type = "success") {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  toast.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #15803d; color: white; padding: 12px 20px; border-radius: 8px; z-index: 10000;';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// DELETE LISTING
function deleteListing(id) {
  listings = listings.filter(l => l.id !== id);
  localStorage.setItem("partnerListings", JSON.stringify(listings));
  showToast("Listing Deleted", "error");
  loadListings();
}