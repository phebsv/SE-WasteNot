// ===== AUTH GUARD (Check if admin is logged in) =====
// if (localStorage.getItem("adminLoggedIn") !== "true") {
//     window.location.href = "login-admin.html";
// }

// Global function for utility 
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.className = "toast";
    }, 2500);
}

// Mock system settings data store (Replace with a real database/API call)
let systemSettings = JSON.parse(localStorage.getItem("adminSystemSettings")) || {
    siteName: "WasteNot Donation Platform",
    defaultPickupRadius: 15,
    maintenance: "off",
    adminEmail: "admin@wastenot.com"
};

document.addEventListener("DOMContentLoaded", () => {
    
    // --- Initial Setup ---
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("adminLoggedIn");
            localStorage.removeItem("adminSession");
            window.location.href = "login-admin.html";
        });
    }
    
    const systemForm = document.getElementById("systemForm");
    const passwordForm = document.getElementById("passwordForm");
    const resetSystemBtn = document.getElementById("resetSystem");

    // --- 1. Load Data into Forms ---
    function loadSystemData() {
        document.getElementById("siteName").value = systemSettings.siteName;
        document.getElementById("defaultPickupRadius").value = systemSettings.defaultPickupRadius;
        document.getElementById("maintenance").value = systemSettings.maintenance;
        document.getElementById("adminEmail").value = systemSettings.adminEmail;
    }
    
    loadSystemData();

    // --- 2. Handle System Settings Update (Save) ---
    systemForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Update settings object
        systemSettings.siteName = document.getElementById("siteName").value.trim();
        systemSettings.defaultPickupRadius = parseInt(document.getElementById("defaultPickupRadius").value.trim());
        systemSettings.maintenance = document.getElementById("maintenance").value;
        
        // Persist to localStorage (MOCK)
        localStorage.setItem("adminSystemSettings", JSON.stringify(systemSettings));
        
        showToast("System settings updated successfully!", "success");
    });
    
    // --- 3. Handle System Reset Button ---
    resetSystemBtn.addEventListener("click", () => {
        // Reloads the initial settings data
        systemSettings = JSON.parse(localStorage.getItem("adminSystemSettings")) || {
            siteName: "WasteNot Donation Platform",
            defaultPickupRadius: 15,
            maintenance: "off",
            adminEmail: "admin@wastenot.com"
        };
        loadSystemData();
        showToast("System changes discarded.", "error");
    });
    
    // --- 4. Handle Password Change ---
    passwordForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const currentPass = document.getElementById("currentPassword").value;
        const newPass = document.getElementById("newPassword").value;
        const confirmPass = document.getElementById("confirmPassword").value;

        // Basic validation
        if (newPass.length < 8) {
            showToast("New password must be at least 8 characters long.", "error");
            return;
        }

        if (newPass !== confirmPass) {
            showToast("New passwords do not match.", "error");
            return;
        }
        
        if (!currentPass) { 
             showToast("Please enter your current password.", "error");
             return;
        }

        // Success (MOCK - actual password change requires backend logic)
        showToast("Admin password successfully changed!", "success");
        passwordForm.reset();
    });
});