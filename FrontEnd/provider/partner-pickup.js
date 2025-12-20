// ===== AUTH GUARD (Keep this at the top of the file) =====
if (localStorage.getItem("partnerLoggedIn") !== "true") {
  window.location.href = "login-partner.html";
}

// Global functions for utility
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  // Use status classes for toast styling (e.g., toast.success, toast.error)
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.className = "toast";
  }, 2500);
}

document.addEventListener("DOMContentLoaded", () => {
  let session = {};
  try {
    session = JSON.parse(localStorage.getItem("partnerSession")) || {};
  } catch {}

  // Avatar
  const avatarInitial = document.getElementById("avatarInitial");
  if (avatarInitial && session.name) {
    avatarInitial.textContent = session.name.charAt(0).toUpperCase();
  }

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("partnerLoggedIn");
      localStorage.removeItem("partnerSession");
      window.location.href = "login-partner.html";
    });
  }

  // ===== DATA & ELEMENTS =====
  // Retrieve data directly from localStorage if available, otherwise fall back to window global
  const listings = JSON.parse(localStorage.getItem("partnerListings")) || window.partnerListings || [];
  const claims = JSON.parse(localStorage.getItem("partnerClaims")) || window.partnerClaims || [];

  const container = document.getElementById("claimsContainer");
  const tabButtons = document.querySelectorAll(".claim-tab");

  let activeFilter = "all";

  function getListing(claim) {
    return listings.find((l) => l.id === claim.listingId);
  }

  function renderClaims() {
    container.innerHTML = "";

    const filtered = claims.filter((c) => {
      if (activeFilter === "all") return true;
      return c.status === activeFilter;
    });

    if (filtered.length === 0) {
      container.innerHTML = "<p>No claims found for this category.</p>";
      return;
    }

    filtered.forEach((claim) => {
      const listing = getListing(claim);
      if (!listing) return;

      const card = document.createElement("article");
      // Add the status class to the card for background highlighting
      card.className = `claim-card status-${claim.status}`;

      // --- NEW HTML STRUCTURE (Matches the UI and detailed design) ---
      card.innerHTML = `
        <div class="claim-image-wrapper">
            <img src="${listing.image || 'path/to/placeholder.jpg'}" alt="${listing.title}" class="claim-image" />
        </div>

        <div class="claim-header">
            <h2 class="claim-title">${listing.title}</h2>
            <span class="claim-id">#C-${claim.id}</span>
        </div>

        <div class="claim-details">
            <p>
                <span class="detail-label">Requested By:</span>
                <span class="detail-value">${claim.customerName}</span>
            </p>
            <p>
                <span class="detail-label">Quantity:</span>
                <span class="detail-value">${claim.qty} ${listing.unit || 'units'}</span>
            </p>
            <p>
                <span class="detail-label">Pickup Date:</span>
                <span class="detail-value">${formatPickup(claim.pickupSchedule)}</span>
            </p>
            <p>
                <span class="detail-label">Status:</span>
                <span class="status-badge status-${claim.status}">${formatStatus(claim.status)}</span>
            </p>
        </div>
        
        <div class="claim-actions">
            ${renderActions(claim.status)}
        </div>
      `;
      // -----------------------------------------------------------------

      // --- ACTION BUTTONS LISTENER ---
      card.querySelectorAll(".claim-actions button").forEach((btn) => {
        btn.addEventListener("click", () => handleAction(btn.dataset.action, claim));
      });

      container.appendChild(card);
    });
  }

  function handleAction(action, claim) {
    let message = "";
    let type = "success";

    switch (action) {
      case "approve":
        claim.status = "confirmed";
        message = "Claim approved! Customer notified.";
        break;

      case "ready":
        claim.status = "ready";
        message = "Items marked as ready for pickup.";
        break;

      case "complete":
        claim.status = "picked-up";
        message = "Pickup successfully completed and logged.";
        
        // Update Inventory/Listing stock
        const listing = listings.find(l => l.id === claim.listingId);
        if (listing) {
            listing.qtyLeft = Math.max(0, (listing.qtyLeft || 0) - (claim.qty || 0));
        }
        break;

      case "cancel":
        claim.status = "cancelled";
        message = "Claim cancelled. Listing availability restored.";
        type = "error";
        break;

      case "view":
        alert(`Viewing Details for Claim ID: #C-${claim.id}\nCustomer: ${claim.customerName}\nItem: ${getListing(claim).title}`);
        return; // Exit without persisting status/inventory change
    }

    // Persist updates to localStorage
    localStorage.setItem("partnerClaims", JSON.stringify(claims));
    localStorage.setItem("partnerListings", JSON.stringify(listings));
    
    showToast(message, type);
    renderClaims(); // Re-render the list to show status change/filtering
  }

  function formatPickup(dt) {
    const d = new Date(dt);
    return d.toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).replace(/,/, ' @'); // Format: 11/25/2025 @ 3:00 PM
  }

  function formatStatus(s) {
    const map = {
      pending: "Pending Approval",
      confirmed: "Confirmed",
      ready: "Ready for Pickup",
      "picked-up": "Completed",
      cancelled: "Cancelled",
    };
    return map[s] || s;
  }

  function renderActions(status) {
    switch (status) {
      case "pending":
        return `
          <button class="btn-primary" data-action="approve">Accept</button>
          <button class="btn-secondary" data-action="cancel">Reject</button>
        `;
      case "confirmed":
        return `
          <button class="btn-primary" data-action="ready">Mark Ready</button>
          <button class="btn-secondary" data-action="cancel">Cancel</button>
        `;
      case "ready":
        return `
          <button class="btn-primary" data-action="complete">Complete Pickup</button>
          <button class="btn-secondary" data-action="view">View Details</button>
        `;
      case "picked-up":
      case "cancelled":
        return `
          <button class="btn-secondary" data-action="view">View Details</button>
        `;
      default:
        return "";
    }
  }

  // ===== TAB FILTER EVENTS =====
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.status;
      renderClaims();
    });
  });

  // Initial render
  renderClaims();
});