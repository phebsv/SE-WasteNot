// Guard
if (localStorage.getItem("partnerLoggedIn") !== "true") {
  window.location.href = "login-partner.html";
}

document.addEventListener("DOMContentLoaded", () => {
  let session = {};
  try {
    session = JSON.parse(localStorage.getItem("partnerSession")) || {};
  } catch (e) {}

  const avatarInitial = document.getElementById("avatarInitial");
  if (avatarInitial && session.name) {
    avatarInitial.textContent = session.name.charAt(0).toUpperCase();
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("partnerLoggedIn");
      localStorage.removeItem("partnerSession");
      window.location.href = "login-partner.html";
    });
  }

  // base data from partner-data.js
  const listings = window.partnerListings || [];

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
      typeInput.value = "Marketplace";
      priceInput.value = "";
      categoryInput.value = "";
      qtyInput.value = "";
      expiryInput.value = "";
      imageInput.value = "";
    } else if (mode === "edit" && listing) {
      modalTitle.textContent = "Edit Listing";
      editingId = listing.id;

      titleInput.value = listing.title || "";
      typeInput.value = listing.type || "Marketplace";
      priceInput.value = listing.price || 0;
      categoryInput.value = listing.category || "";
      qtyInput.value = listing.qtyLeft ?? 0;
      expiryInput.value = listing.expiryDate ? listing.expiryDate.substring(0, 10) : "";
      imageInput.value = listing.image || "";
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
      const hay = (l.title + " " + (l.category || "") + " " + (l.type || "")).toLowerCase();
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
        listing.type === "Donation" || listing.price === 0
          ? "Donation"
          : "₱" + listing.price + " · Discounted";

      card.innerHTML = `
        <img src="${listing.image}" alt="${listing.title}" class="listing-image">
        <div class="listing-main">
          <div class="listing-title">${listing.title}</div>
          <div class="listing-meta">
            ${priceLabel}
            · ${listing.category || "Mixed items"}
            · Listed on ${formatDate(listing.listedDate)}<br>
            ${(listing.qtyLeft ?? 0)} pcs left · Expiry Date: ${formatDate(listing.expiryDate)}
          </div>
          <div class="listing-bottom">
            <button class="listing-btn listing-btn-primary" data-action="claim" data-id="${listing.id}">
              Mark As Claimed
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
  container.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;
    const listing = listings.find(l => l.id === id);
    if (!listing) return;

    switch (action) {
      case "claim":
        listing.status = "claimed";
        showToast(`"${listing.title}" marked as claimed!`, "success");
        break;
      case "edit":
        openModal("edit", listing);
        return;
      case "more":
        alert(`More actions for: ${listing.title} (demo only).`);
        break;
      case "delete":
        deleteListing(id);
        return;
    }

    renderListings(searchInput.value);
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
  listingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const base = {
      title: titleInput.value.trim(),
      type: typeInput.value,
      price: Number(priceInput.value) || 0,
      category: categoryInput.value.trim() || "Uncategorized",
      qtyLeft: Number(qtyInput.value) || 0,
      image: imageInput.value.trim() || "placeholder.jpg",
      expiryDate: expiryInput.value || null
    };

    if (!base.title) {
      alert("Please enter a title.");
      return;
    }

    if (editingId == null) {
      // Add
      const newListing = {
        id: Date.now(),
        listedDate: new Date().toISOString(),
        week: 1,
        ...base
      };
      partnerListings.push(newListing);
      showToast("New listing created!", "success");
    } else {
      // Edit
      const idx = partnerListings.findIndex(l => l.id === editingId);
      if (idx !== -1) {
        partnerListings[idx] = {
          ...partnerListings[idx],
          ...base
        };
        showToast("Listing updated successfully!", "success");
      }
    }

    // Persist
    localStorage.setItem("partnerListings", JSON.stringify(partnerListings));

    closeModal();
    renderListings(searchInput.value);
  });

  // Initial render
  renderListings();
});

// Delete helper
function deleteListing(id) {
  if (!confirm("Delete this listing?")) {
    showToast("Delete cancelled.", "info");
    return;
}

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
function closeEditModal() {
  document.getElementById("editModal").classList.add("hidden");
}

// SAVE EDITS
function saveEditListing() {
  let idx = listings.findIndex(l => l.id === editingId);

  listings[idx].name = document.getElementById("editName").value;
  listings[idx].qtyLeft = Number(document.getElementById("editQty").value);
  listings[idx].price = Number(document.getElementById("editPrice").value);
  listings[idx].pickup = document.getElementById("editPickup").value;
  listings[idx].expiry = document.getElementById("editExpiry").value;

  localStorage.setItem("partnerListings", JSON.stringify(listings));

  showToast("Listing Updated Successfully!");
  closeEditModal();
  loadListings();
}

// DELETE LISTING
function deleteListing(id) {
  listings = listings.filter(l => l.id !== id);
  localStorage.setItem("partnerListings", JSON.stringify(listings));
  showToast("Listing Deleted", "error");
  loadListings();
}