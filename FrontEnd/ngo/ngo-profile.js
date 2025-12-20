// ===== AUTH GUARD (Check if NGO user is logged in) =====
if (localStorage.getItem("ngoLoggedIn") !== "true") {
    window.location.href = "login-ngo.html";
}

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


document.addEventListener("DOMContentLoaded", () => {
    // --- Initial Setup (Avatar and Logout) ---
    let ngoData = {};
    try {
        ngoData = JSON.parse(localStorage.getItem("ngoSession")) || {};
    } catch {}

    const avatarInitial = document.getElementById("avatarInitial");
    if (avatarInitial && ngoData.organizationName) {
        avatarInitial.textContent = ngoData.organizationName.charAt(0).toUpperCase();
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("ngoLoggedIn");
            localStorage.removeItem("ngoSession");
            window.location.href = "login-ngo.html";
        });
    }
    // ------------------------------------------

    const profileForm = document.getElementById("profileForm");
    const passwordForm = document.getElementById("passwordForm");
    const resetProfileBtn = document.getElementById("resetProfile");

    // --- 1. Load Data into Forms ---
    function loadProfileData() {
        if (!ngoData.id) return;

        document.getElementById("organizationName").value = ngoData.organizationName || '';
        document.getElementById("contactPerson").value = ngoData.name || '';
        document.getElementById("email").value = ngoData.email || '';
        document.getElementById("phone").value = ngoData.phone || '';
        document.getElementById("address").value = ngoData.address || '';
        document.getElementById("about").value = ngoData.about || ''; 
        
        // Update the large avatar placeholder
        const largeAvatar = document.querySelector('.profile-avatar-large');
        if (largeAvatar) {
            largeAvatar.textContent = ngoData.organizationName.charAt(0).toUpperCase();
        }
    }
    
    loadProfileData();

    // --- 2. Handle Profile Update (Save) ---
    profileForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // 1. Collect form data
        const newOrgName = document.getElementById("organizationName").value.trim();
        const newContactPerson = document.getElementById("contactPerson").value.trim();
        const newPhone = document.getElementById("phone").value.trim();
        const newAddress = document.getElementById("address").value.trim();
        const newAbout = document.getElementById("about").value.trim();

        // 2. Update session data object
        ngoData.organizationName = newOrgName;
        ngoData.name = newContactPerson; 
        ngoData.phone = newPhone;
        ngoData.address = newAddress;
        ngoData.about = newAbout;
        
        // Update both avatars
        avatarInitial.textContent = ngoData.organizationName.charAt(0).toUpperCase();
        document.querySelector('.profile-avatar-large').textContent = ngoData.organizationName.charAt(0).toUpperCase();

        // 3. Persist to localStorage
        localStorage.setItem("ngoSession", JSON.stringify(ngoData));
        
        showToast("Profile updated successfully!");
    });
    
    // --- 3. Handle Reset Button ---
    resetProfileBtn.addEventListener("click", () => {
        profileForm.reset();
        loadProfileData(); // Reloads data from localStorage
        showToast("Profile changes discarded.", "error");
    });
    
    // --- 4. Handle Password Change ---
    passwordForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const currentPass = document.getElementById("currentPassword").value;
        const newPass = document.getElementById("newPassword").value;
        const confirmPass = document.getElementById("confirmPassword").value;

        // Basic validation
        if (newPass.length < 6) {
            showToast("New password must be at least 6 characters long.", "error");
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

        // Success (MOCK)
        showToast("Password successfully changed!", "success");
        passwordForm.reset();
    });
});