// ===== AUTH GUARD =====
if (!localStorage.getItem("authToken") || localStorage.getItem("userRole") !== "partner") {
    window.location.href = "../login/login-consumer.html";
}

const PROFILE_API = 'http://localhost/wastenot-api/api/profile.php';

// Load profile from backend
async function loadProfile() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(PROFILE_API, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            return await response.json();
        }
        return {};
    } catch (error) {
        console.error('Error loading profile:', error);
        return {};
    }
}

// Save profile to backend
async function saveProfile(profileData) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(PROFILE_API, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });
        
        return response.ok;
    } catch (error) {
        console.error('Error saving profile:', error);
        return false;
    }
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

document.addEventListener("DOMContentLoaded", async () => {
    // --- Initial Setup (Avatar and Logout) ---
    const avatarInitial = document.getElementById("avatarInitial");
    const userName = localStorage.getItem('userName');
    if (avatarInitial && userName) {
        avatarInitial.textContent = userName.charAt(0).toUpperCase();
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "../login/login-consumer.html";
        });
    }
    
    // Load profile data from backend
    let partnerData = await loadProfile();
    // ------------------------------------------

    const profileForm = document.getElementById("profileForm");
    const passwordForm = document.getElementById("passwordForm");
    const resetProfileBtn = document.getElementById("resetProfile");

    // --- 1. Load Data into Forms ---
    function loadProfileData() {
        document.getElementById("storeName").value = partnerData.business_name || partnerData.full_name || '';
        document.getElementById("contactName").value = partnerData.full_name || '';
        document.getElementById("email").value = partnerData.email || '';
        document.getElementById("phone").value = partnerData.phone || '';
        document.getElementById("address").value = partnerData.location || '';
        document.getElementById("about").value = partnerData.bio || '';
        
        // Update the large avatar placeholder
        const largeAvatar = document.querySelector('.profile-avatar-large');
        if (largeAvatar) {
            const name = partnerData.business_name || partnerData.full_name || 'P';
            largeAvatar.textContent = name.charAt(0).toUpperCase();
        }
    }
    
    loadProfileData();

    // --- 2. Handle Profile Update ---
    profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // 1. Collect form data
        const profileUpdate = {
            business_name: document.getElementById("storeName").value.trim(),
            full_name: document.getElementById("contactName").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            location: document.getElementById("address").value.trim(),
            bio: document.getElementById("about").value.trim()
        };

        // 2. Save to backend
        const success = await saveProfile(profileUpdate);
        
        if (success) {
            // Update local data
            Object.assign(partnerData, profileUpdate);
            
            // Update localStorage
            localStorage.setItem('userName', profileUpdate.full_name);
            
            // Update avatars
            avatarInitial.textContent = profileUpdate.full_name.charAt(0).toUpperCase();
            document.querySelector('.profile-avatar-large')?.textContent = 
                (profileUpdate.business_name || profileUpdate.full_name).charAt(0).toUpperCase();
            
            showToast("Profile updated successfully!");
        } else {
            showToast("Failed to update profile", "error");
        }
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