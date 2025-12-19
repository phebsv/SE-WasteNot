// ===== AUTH GUARD (Check if NGO user is logged in) =====
if (!localStorage.getItem("authToken") || localStorage.getItem("userRole") !== "ngo") {
    window.location.href = "../login/login-ngo.html";
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
    const userId = localStorage.getItem("userId") || "";
    const userName = localStorage.getItem("userName") || "";
    const ngoName = localStorage.getItem("ngoName") || "";
    const userEmail = localStorage.getItem("userEmail") || localStorage.getItem("email") || "";

    let ngoData = {};
    try {
        ngoData = JSON.parse(localStorage.getItem("ngoSession")) || {};
    } catch {
        ngoData = {};
    }

    // Seed missing fields from the login session so the profile page can load/save reliably
    ngoData = {
        id: ngoData.id || userId || null,
        organizationName: ngoData.organizationName || ngoName || userName || "",
        name: ngoData.name || userName || "",
        email: ngoData.email || userEmail || "",
        phone: ngoData.phone || "",
        address: ngoData.address || "",
        about: ngoData.about || ""
    };

    const avatarInitial = document.getElementById("avatarInitial");
    if (avatarInitial) {
        const initial = (ngoData.organizationName || ngoData.name || "N").charAt(0).toUpperCase();
        avatarInitial.textContent = initial;
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
                'ngoLoggedIn',
                'adminLoggedIn'
            ].forEach(k => localStorage.removeItem(k));
            sessionStorage.clear();
            window.location.href = "../login/login-ngo.html";
        });
    }
    // ------------------------------------------

    const profileForm = document.getElementById("profileForm");
    const passwordForm = document.getElementById("passwordForm");
    const resetProfileBtn = document.getElementById("resetProfile");

    // --- 1. Load Data into Forms ---
    function loadProfileData() {
        document.getElementById("organizationName").value = ngoData.organizationName || '';
        document.getElementById("contactPerson").value = ngoData.name || '';
        document.getElementById("email").value = ngoData.email || '';
        document.getElementById("phone").value = ngoData.phone || '';
        document.getElementById("address").value = ngoData.address || '';
        document.getElementById("about").value = ngoData.about || ''; 
        
        // Update the large avatar placeholder
        const largeAvatar = document.querySelector('.profile-avatar-large');
        if (largeAvatar) {
            const initial = (ngoData.organizationName || ngoData.name || "N").charAt(0).toUpperCase();
            largeAvatar.textContent = initial;
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
        ngoData.id = ngoData.id || userId || null;
        ngoData.organizationName = newOrgName;
        ngoData.name = newContactPerson; 
        ngoData.phone = newPhone;
        ngoData.address = newAddress;
        ngoData.about = newAbout;
        
        // Update both avatars
        const newInitial = (ngoData.organizationName || ngoData.name || "N").charAt(0).toUpperCase();
        avatarInitial.textContent = newInitial;
        const largeAvatar = document.querySelector('.profile-avatar-large');
        if (largeAvatar) largeAvatar.textContent = newInitial;

        // 3. Persist to localStorage
        localStorage.setItem("ngoSession", JSON.stringify(ngoData));
        // Keep shared keys in sync with the rest of the NGO pages
        localStorage.setItem("ngoName", ngoData.organizationName);
        // NGO dashboard currently reads userName as a fallback
        localStorage.setItem("userName", ngoData.organizationName);
        
        showToast("Profile updated successfully!");
    });
    
    // --- 3. Handle Reset Button ---
    resetProfileBtn.addEventListener("click", () => {
        profileForm.reset();
        // Reload from persisted session
        try {
            ngoData = JSON.parse(localStorage.getItem("ngoSession")) || ngoData;
        } catch {}
        loadProfileData();
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