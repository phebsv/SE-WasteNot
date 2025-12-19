// Guard
if (!localStorage.getItem("authToken") || localStorage.getItem("userRole") !== "partner") {
  window.location.href = "../login/login-partner.html";
}

const PRODUCTS_API = 'http://localhost:8081/api/products';

// Local toast fallback for partner pages that only have a legacy #toast element.
// This prevents JS from crashing when showToast is not provided by another script.
if (typeof window.showToast !== 'function') {
  window.showToast = (message, type = 'info') => {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = String(message);
    toast.classList.remove('success', 'error');
    if (type === 'success') toast.classList.add('success');
    if (type === 'error') toast.classList.add('error');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  };
}

function unwrapData(payload) {
  if (payload && typeof payload === 'object' && Array.isArray(payload.data)) return payload.data;
  return Array.isArray(payload) ? payload : [];
}

function toIsoStartOfDay(dateStr) {
  if (!dateStr) return null;
  return `${dateStr}T00:00:00`;
}

// Load partner's products
async function loadListings() {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) return [];

    // Prefer server-side filtering.
    const response = await fetch(`${PRODUCTS_API}/partner/${encodeURIComponent(userId)}`);
    if (response.ok) {
      const payload = await response.json();
      const data = unwrapData(payload);
      if (data.length > 0) return data;
    } else {
      console.warn('Partner products endpoint failed:', response.status);
    }

    // Fallback: load all active products and filter by partnerId client-side.
    const allRes = await fetch(PRODUCTS_API);
    if (!allRes.ok) return [];
    const allPayload = await allRes.json();
    const all = unwrapData(allPayload);
    return all.filter(p => String(p?.partnerId) === String(userId));
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

  // Load listings from backend
  let listings = await loadListings();

  // Ensure newly-created listing appears immediately after redirect.
  try {
    const raw = sessionStorage.getItem('lastCreatedProduct');
    if (raw) {
      const created = JSON.parse(raw);
      if (created && created.id != null) {
        const exists = listings.some(p => String(p?.id) === String(created.id));
        if (!exists) {
          listings = [created, ...listings];
        }
      }
      sessionStorage.removeItem('lastCreatedProduct');
    }
  } catch (e) {
    console.warn('Could not apply lastCreatedProduct:', e);
  }

  const container = document.getElementById("listingsContainer");
  // partner-listings.html uses #search
  const searchInput = document.getElementById("search") || document.getElementById("searchListings");
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
      typeInput.value = "sale";
      priceInput.value = "";
      categoryInput.value = "";
      qtyInput.value = "";
      expiryInput.value = "";
      imageInput.value = "";
    } else if (mode === "edit" && listing) {
      modalTitle.textContent = "Edit Listing";
      editingId = listing.id;

      titleInput.value = listing.name || "";
      typeInput.value = listing.listingType || listing.type || "sale";
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
      const hay = (l.name + " " + (l.category || "") + " " + (l.listingType || l.type || "")).toLowerCase();
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
        String(listing.listingType || listing.type || '').toLowerCase() === 'donation' || Number(listing.price) === 0
          ? "Donation"
          : "₱" + listing.price + " · Discounted";

      const status = String(listing.status || 'ACTIVE');
      const isAvailable = status === 'ACTIVE';

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
            <button class="listing-btn listing-btn-primary" data-action="toggle" data-id="${listing.id}" ${!isAvailable ? 'disabled' : ''}>
              ${isAvailable ? 'Mark As Claimed' : 'Claimed'}
            </button>
            <div class="listing-actions">
              <button class="listing-btn listing-btn-outline" data-action="edit" data-id="${listing.id}">
                Edit Listing
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
        // Mark as claimed by switching status to SOLD
        const nextStatus = 'SOLD';
        const success = await saveProduct({ ...listing, status: nextStatus });
        if (success) {
          showToast('Listing marked as claimed!', "success");
          try {
            const partnerId = Number(localStorage.getItem('userId'));
            if (window.WasteNotNotifications?.notifyTargets && Number.isFinite(partnerId) && partnerId > 0) {
              window.WasteNotNotifications.notifyTargets(
                [{ role: 'partner', userId: partnerId }],
                {
                  title: 'Listing marked as claimed',
                  body: `"${listing.name}" was marked as claimed.`,
                  link: '/provider/partner-listings.html'
                }
              );
            }
          } catch (_) {
            // ignore
          }
          listings = await loadListings();
          renderListings(searchInput.value);
        }
        break;
      case "edit":
        openModal("edit", listing);
        return;
      case "delete":
        if (confirm(`Delete "${listing.name}"?`)) {
          const deleted = await deleteProduct(id);
          if (deleted) {
            showToast("Listing deleted!", "success");
            try {
              const partnerId = Number(localStorage.getItem('userId'));
              if (window.WasteNotNotifications?.notifyTargets && Number.isFinite(partnerId) && partnerId > 0) {
                window.WasteNotNotifications.notifyTargets(
                  [{ role: 'partner', userId: partnerId }],
                  {
                    title: 'Listing deleted',
                    body: `"${listing.name}" was deleted.`,
                    link: '/provider/partner-listings.html'
                  }
                );
              }
            } catch (_) {
              // ignore
            }
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
      listingType: typeInput.value,
      price: Number(priceInput.value) || 0,
      category: categoryInput.value.trim() || "General",
      quantity: Number(qtyInput.value) || 0,
      imageUrl: imageInput.value.trim() || "",
      expiryDate: toIsoStartOfDay(expiryInput.value),
      partnerId: Number(localStorage.getItem('userId')),
      partnerName: localStorage.getItem('userName'),
      status: 'ACTIVE'
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
        try {
          const partnerId = Number(localStorage.getItem('userId'));
          const partnerName = String(localStorage.getItem('userName') || 'Partner');
          const isDonation = String(productData?.listingType || '').toLowerCase() === 'donation' || Number(productData?.price) === 0;

          if (window.WasteNotNotifications?.notifyTargets) {
            // Partner (personal)
            if (Number.isFinite(partnerId) && partnerId > 0) {
              window.WasteNotNotifications.notifyTargets(
                [{ role: 'partner', userId: partnerId }],
                {
                  title: 'Listing created',
                  body: `You created "${productData.name}".`,
                  link: '/provider/partner-listings.html'
                }
              );
            }

            // Consumer (broadcast)
            window.WasteNotNotifications.notifyTargets(
              [{ role: 'consumer', userId: 'all' }],
              {
                title: 'New listing available',
                body: `${partnerName} posted "${productData.name}".`,
                link: '/consumer/consumer-marketplace.html'
              }
            );

            // NGO (broadcast, donation only)
            if (isDonation) {
              window.WasteNotNotifications.notifyTargets(
                [{ role: 'ngo', userId: 'all' }],
                {
                  title: 'New donation available',
                  body: `${partnerName} posted a donation: "${productData.name}".`,
                  link: '/ngo/ngo-marketplace.html'
                }
              );
            }
          }
        } catch (_) {
          // ignore
        }
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
        try {
          const partnerId = Number(localStorage.getItem('userId'));
          if (window.WasteNotNotifications?.notifyTargets && Number.isFinite(partnerId) && partnerId > 0) {
            window.WasteNotNotifications.notifyTargets(
              [{ role: 'partner', userId: partnerId }],
              {
                title: 'Listing updated',
                body: `You updated "${productData.name}".`,
                link: '/provider/partner-listings.html'
              }
            );
          }
        } catch (_) {
          // ignore
        }
        listings = await loadListings();
      } else {
        showToast("Failed to update listing", "error");
      }
    }

    closeModal();
    renderListings(searchInput ? searchInput.value : "");
  });

  // Initial render
  renderListings();
});