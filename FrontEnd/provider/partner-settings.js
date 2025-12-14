// ===== AUTH GUARD (Check if user is logged in) =====
if (localStorage.getItem("partnerLoggedIn") !== "true") {
    window.location.href = "login-partner.html";
}

// Global function for utility (showToast)
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
    let partnerData = {};
    try {
        partnerData = JSON.parse(localStorage.getItem("partnerSession")) || {};
    } catch {}

    const avatarInitial = document.getElementById("avatarInitial");
    if (avatarInitial && partnerData.name) {
        avatarInitial.textContent = partnerData.name.charAt(0).toUpperCase();
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("partnerLoggedIn");
            localStorage.removeItem("partnerSession");
            window.location.href = "login-partner.html";
        });
    }
    // ------------------------------------------

    const profileForm = document.getElementById("profileForm");
    const passwordForm = document.getElementById("passwordForm");
    const resetProfileBtn = document.getElementById("resetProfile");

    // --- 1. Load Data into Forms ---
    function loadProfileData() {
        if (!partnerData.id) return;

        document.getElementById("storeName").value = partnerData.storeName || '';
        document.getElementById("contactName").value = partnerData.name || '';
        document.getElementById("email").value = partnerData.email || '';
        document.getElementById("phone").value = partnerData.phone || '';
        document.getElementById("address").value = partnerData.address || '';
        document.getElementById("about").value = partnerData.about || ''; // New 'about' field
        
        // Update the large avatar placeholder
        const largeAvatar = document.querySelector('.profile-avatar-large');
        if (largeAvatar) {
            largeAvatar.textContent = (partnerData.storeName || partnerData.name).charAt(0).toUpperCase();
        }
    }
    
    loadProfileData();

    // --- 2. Handle Profile Update ---
    profileForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // 1. Collect form data
        const newStoreName = document.getElementById("storeName").value.trim();
        const newContactName = document.getElementById("contactName").value.trim();
        const newPhone = document.getElementById("phone").value.trim();
        const newAddress = document.getElementById("address").value.trim();
        const newAbout = document.getElementById("about").value.trim();

        // 2. Update session data object
        partnerData.storeName = newStoreName;
        partnerData.name = newContactName;
        partnerData.phone = newPhone;
        partnerData.address = newAddress;
        partnerData.about = newAbout;
        
        // Update both avatars
        avatarInitial.textContent = partnerData.name.charAt(0).toUpperCase();
        document.querySelector('.profile-avatar-large').textContent = partnerData.storeName.charAt(0).toUpperCase();

        // 3. Persist to localStorage
        localStorage.setItem("partnerSession", JSON.stringify(partnerData));
        
        showToast("Profile updated successfully!");
    });
    
    // --- 3. Handle Reset Button ---
    resetProfileBtn.addEventListener("click", () => {
        profileForm.reset();
        loadProfileData(); // Reloads data from localStorage, effectively resetting the form
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
        
        // Mock Security Check (Replace with real backend/local storage validation)
        if (!currentPass) { // Simple check to ensure a current password was entered
             showToast("Please enter your current password.", "error");
             return;
        }


        // Success
        showToast("Password successfully changed!", "success");
        passwordForm.reset();
    });
});