// This file assumes NGO login is handled separately and the dashboard is in the 'ngo' folder.

// === AUTH CHECK ===
// Redirects to NGO login if no session data is found
if (!localStorage.getItem("ngoName")) {
    // Redirect path: Up one level (to FrontEnd/), then down into 'login'
    window.location.href = "../login/login-ngo.html";
}

// Static data mirroring the screenshot
const staticSummary = {
    activeRequests: 3,
    receivedDonations: 5,
    pendingRequests: 3
};


// Function to update the summary boxes (using the new class names)
function updateSummary() {
    document.querySelector(".summary-card:nth-child(1) .summary-value").textContent = staticSummary.activeRequests;
    document.querySelector(".summary-card:nth-child(2) .summary-value").textContent = staticSummary.receivedDonations;
    document.querySelector(".summary-card:nth-child(3) .summary-value").textContent = staticSummary.pendingRequests;

    // Optional: Update the welcome name
    const ngoName = localStorage.getItem("ngoName") || "Hope Foundation";
    const welcomeTitle = document.querySelector(".topbar-title .accent");
    if (welcomeTitle) {
        welcomeTitle.textContent = ngoName + "!";
    }
}


// Event listener for Logout
document.querySelector(".logout-btn").addEventListener("click", () => {
    localStorage.removeItem("ngoName");
    localStorage.removeItem("ngoLoggedIn");
    // Redirect to NGO login page
    window.location.href = "../login/login-ngo.html"; 
});


// Initialization
window.addEventListener("DOMContentLoaded", () => {
    updateSummary();
    // Note: Recent Claims and Today's Pickups are static in the HTML for this version.
});