// This file assumes NGO login is handled separately and the dashboard is in the 'ngo' folder.

// === AUTH CHECK ===
// Redirects to NGO login if no session data is found
if (!localStorage.getItem("authToken") || localStorage.getItem("userRole") !== "ngo") {
    // Redirect path: Up one level (to FrontEnd/), then down into 'login'
    window.location.href = "../login/login-ngo.html";
}

function normalizeStatus(status) {
    if (!status) return "Pending Provider Confirmation";
    return String(status).trim();
}

function formatPickupTime(pickupValue) {
    if (!pickupValue) return "TBD";

    // If it's already a human string like "Today • 3:00 PM", keep it
    if (typeof pickupValue === "string" && /\bToday\b|\bYesterday\b|\bMon\b|\bTue\b|\bWed\b|\bThu\b|\bFri\b|\bSat\b|\bSun\b/.test(pickupValue)) {
        return pickupValue;
    }

    const date = new Date(pickupValue);
    if (Number.isNaN(date.getTime())) return "TBD";

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    if (date.toDateString() === today.toDateString()) return `Today • ${time}`;
    if (date.toDateString() === yesterday.toDateString()) return `Yesterday • ${time}`;

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return `${dayNames[date.getDay()]} • ${time}`;
}

function isTodayPickup(pickupDisplay) {
    return typeof pickupDisplay === "string" && pickupDisplay.startsWith("Today");
}

function statusToPill(status) {
    const s = normalizeStatus(status).toLowerCase();
    if (s.includes("completed")) return { label: "Completed", className: "status-complete" };
    if (s.includes("ready")) return { label: "Pickup", className: "status-confirm" };
    if (s.includes("cancel")) return { label: "Cancelled", className: "status-pending" };
    return { label: "Pending", className: "status-pending" };
}

function getNgoName() {
    return localStorage.getItem("ngoName") || localStorage.getItem("userName") || "NGO";
}

function updateHeader() {
    const ngoName = getNgoName();
    const nameEl = document.getElementById("ngo-name-display");
    if (nameEl) nameEl.textContent = `${ngoName}!`;

    const avatarEl = document.querySelector(".topbar-actions .avatar");
    if (avatarEl) avatarEl.textContent = ngoName.charAt(0).toUpperCase();
}

function loadRequests() {
    // Current NGO claims/request flow stores requests locally
    // (same source as ngo-claims page)
    return JSON.parse(localStorage.getItem("ngoRequests") || "[]");
}

function updateSummaryFromRequests(requests) {
    const normalized = (requests || []).map((r) => ({ ...r, status: normalizeStatus(r.status) }));

    const receivedDonations = normalized.filter((r) => r.status === "Completed").length;
    const pendingRequests = normalized.filter((r) => r.status === "Pending Provider Confirmation").length;
    const activeRequests = normalized.filter((r) => r.status !== "Completed" && r.status !== "Cancelled").length;

    const activeEl = document.getElementById("ngoActiveRequests");
    const receivedEl = document.getElementById("ngoReceivedDonations");
    const pendingEl = document.getElementById("ngoPendingRequests");

    if (activeEl) activeEl.textContent = String(activeRequests);
    if (receivedEl) receivedEl.textContent = String(receivedDonations);
    if (pendingEl) pendingEl.textContent = String(pendingRequests);
}

function renderTodaysPickups(requests) {
    const listEl = document.getElementById("ngoTodaysPickups");
    if (!listEl) return;

    const items = (requests || [])
        .map((r) => {
            const pickupDisplay = formatPickupTime(r.pickup);
            return {
                company: r.company || r.provider || "Provider",
                location: r.location || `${r.company || "Provider"} Store`,
                item: r.item || "Item",
                qty: r.qty || r.quantity || "",
                pickupDisplay
            };
        })
        .filter((x) => isTodayPickup(x.pickupDisplay));

    if (!items.length) {
        listEl.innerHTML = `
            <div class="pickup-item">
                <span class="pickup-detail">No pickups today</span>
                <span class="pickup-store"></span>
                <span class="pickup-time"></span>
                <span class="pickup-time-slot"></span>
            </div>
        `;
        return;
    }

    listEl.innerHTML = items
        .slice(0, 6)
        .map((p) => {
            const timeSlot = p.pickupDisplay.includes("•") ? p.pickupDisplay.split("•")[1].trim() : "";
            const qtyText = p.qty ? `${p.qty}` : "";
            const itemText = qtyText ? `${qtyText} ${p.item}` : `${p.item}`;
            return `
                <div class="pickup-item">
                    <span class="pickup-detail">${p.company}</span>
                    <span class="pickup-store">${p.location}</span>
                    <span class="pickup-time">${itemText}</span>
                    <span class="pickup-time-slot">${timeSlot}</span>
                </div>
            `;
        })
        .join("");
}

function renderRecentClaims(requests) {
    const bodyEl = document.getElementById("ngoRecentClaimsBody");
    if (!bodyEl) return;

    const rows = (requests || [])
        .slice()
        .reverse()
        .slice(0, 8)
        .map((r) => {
            const provider = r.company || r.provider || "Provider";
            const item = r.item || "Item";
            const pickupDisplay = formatPickupTime(r.pickup);
            const pill = statusToPill(r.status);

            return `
                <tr>
                    <td>${provider}</td>
                    <td>${item}</td>
                    <td>${pickupDisplay}</td>
                    <td><span class="status-pill ${pill.className}">${pill.label}</span></td>
                </tr>
            `;
        })
        .join("");

    bodyEl.innerHTML = rows || '<tr><td colspan="4" style="text-align:center; opacity:0.7;">No recent claims</td></tr>';
}


// Event listener for Logout
document.querySelector(".logout-btn").addEventListener("click", () => {
    localStorage.removeItem("ngoName");
    localStorage.removeItem("ngoLoggedIn");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    // Redirect to NGO login page
    window.location.href = "../login/login-ngo.html"; 
});


// Initialization
window.addEventListener("DOMContentLoaded", () => {
    updateHeader();

    const requests = loadRequests();
    updateSummaryFromRequests(requests);
    renderTodaysPickups(requests);
    renderRecentClaims(requests);
});