// ===== AUTH GUARD =====
if (localStorage.getItem("partnerLoggedIn") !== "true") {
  window.location.href = "login-partner.html";
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

  // ===== DATA =====
  const listings = window.partnerListings || [];
  const claims = window.partnerClaims || [];

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
      card.className = "claim-card";

      card.innerHTML = `
        <img src="${listing.image}" class="claim-image" alt="${listing.title}">
        
        <div class="claim-main">
          <div class="claim-title">${listing.title}</div>

          <div class="claim-meta">
            Claimed by: <strong>${claim.customerName}</strong><br>
            Qty: ${claim.qty} • Pickup: ${formatPickup(claim.pickupSchedule)}<br>
            Status: <strong>${formatStatus(claim.status)}</strong>
          </div>

          <div class="claim-actions">
            ${renderActions(claim.status)}
          </div>
        </div>
      `;

      // --- ACTION BUTTONS ---
      card.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => handleAction(btn.dataset.action, claim));
      });

      container.appendChild(card);
    });
  }

  function handleAction(action, claim) {
    switch (action) {
      case "approve":
        // partner approves the request; move to "confirmed"
        claim.status = "confirmed";
        break;

      case "ready":
        // partner prepares the items; mark as ready for pickup
        claim.status = "ready";
        break;

      case "complete":
        // pickup completed: mark as picked-up and reduce stock
        claim.status = "picked-up";
        const listing = partnerListings.find(l => l.id === claim.listingId);
        if (listing) {
          listing.qtyLeft = Math.max(0, (listing.qtyLeft || 0) - (claim.qty || 0));
        }
        break;

      case "cancel":
        // partner cancels the request
        claim.status = "cancelled";
        break;

      case "view":
        alert(`Viewing Details for Claim #${claim.id}`);
        // no status or inventory change
        break;
    }

    if (action !== "view") {
      // persist updates
      localStorage.setItem("partnerClaims", JSON.stringify(partnerClaims));
      localStorage.setItem("partnerListings", JSON.stringify(partnerListings));
    }

    renderClaims();
  }

  function formatPickup(dt) {
    const d = new Date(dt);
    return d.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
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
          <button class="claim-btn claim-approve" data-action="approve">Approve</button>
          <button class="claim-btn claim-cancel" data-action="cancel">Cancel</button>
          <button class="claim-btn claim-view" data-action="view">View Details</button>
        `;
      case "confirmed":
        return `
          <button class="claim-btn claim-ready" data-action="ready">Mark Ready</button>
          <button class="claim-btn claim-cancel" data-action="cancel">Cancel</button>
          <button class="claim-btn claim-view" data-action="view">View Details</button>
        `;
      case "ready":
        return `
          <button class="claim-btn claim-complete" data-action="complete">Complete Pickup</button>
          <button class="claim-btn claim-view" data-action="view">View Details</button>
        `;
      case "picked-up":
      case "cancelled":
        return `
          <button class="claim-btn claim-view" data-action="view">View Details</button>
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

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.className = "toast";
  }, 2500);
}

function confirmClaim(claimId) {
  let claims = JSON.parse(localStorage.getItem("partnerClaims")) || [];
  let listings = JSON.parse(localStorage.getItem("partnerListings")) || [];

  let claim = claims.find(c => c.claimId === claimId);
  let listing = listings.find(l => l.id === claim.listingId);

  listing.qtyLeft -= claim.quantity;

  if (listing.qtyLeft < 1) listing.active = false;

  claim.status = "completed";

  localStorage.setItem("partnerListings", JSON.stringify(listings));
  localStorage.setItem("partnerClaims", JSON.stringify(claims));

  showToast("Pickup Confirmed!");
  loadClaims();
}
