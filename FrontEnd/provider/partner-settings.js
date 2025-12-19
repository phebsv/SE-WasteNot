// ===== AUTH GUARD =====
if (!localStorage.getItem("authToken") || localStorage.getItem("userRole") !== "partner") {
    window.location.href = "../login/login-partner.html";
}

const PROFILE_API = 'http://localhost/wastenot-api/api/profile.php';
const SESSION_KEY = 'partnerSession';

function safeJsonParse(raw, fallback) {
    try {
        return JSON.parse(raw) ?? fallback;
    } catch {
        return fallback;
    }
}

function getSessionSeed() {
    const userId = localStorage.getItem('userId') || '';
    const userName = localStorage.getItem('userName') || '';
    const userEmail = localStorage.getItem('userEmail') || '';

    const stored = safeJsonParse(localStorage.getItem(SESSION_KEY), {});
    return {
        id: stored.id || userId || null,
        business_name: stored.business_name || stored.businessName || stored.store_name || stored.storeName || '',
        full_name: stored.full_name || userName || '',
        email: stored.email || userEmail || '',
        phone: stored.phone || '',
        location: stored.location || '',
        bio: stored.bio || ''
    };
}

function setSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    if (session?.full_name) localStorage.setItem('userName', session.full_name);
    if (session?.email) localStorage.setItem('userEmail', session.email);
}

// Load profile from backend
async function loadProfile() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(PROFILE_API, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            // profile.php typically returns: { success: true, user: {...} }
            const user = result?.user || result?.data || null;
            if (!user) return {};

            return {
                ...user,
                // normalize common field name variants
                business_name: user.business_name || user.businessName || user.store_name || user.storeName || '',
                full_name: user.full_name || user.fullName || '',
                email: user.email || '',
                // keep frontend field names consistent
                location: user.location || user.address || '',
                bio: user.bio || user.about || ''
            };
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
    
    // Load profile data (prefill from local cache immediately)
    let partnerData = getSessionSeed();
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

    // Refresh from backend and persist to session (best effort)
    const backendProfile = await loadProfile();
    if (backendProfile && Object.keys(backendProfile).length > 0) {
        partnerData = {
            ...partnerData,
            ...backendProfile,
            // keep consistent fields
            business_name: backendProfile.business_name || partnerData.business_name,
            full_name: backendProfile.full_name || partnerData.full_name,
            email: backendProfile.email || partnerData.email
        };
        setSession(partnerData);
        loadProfileData();
    } else {
        // Ensure we at least persist the seeded session
        setSession(partnerData);
    }

    // --- 2. Handle Profile Update ---
    profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const storeNameInput = document.getElementById("storeName").value.trim();
        const contactNameInput = document.getElementById("contactName").value.trim();

        // Your current auth DB schema stores the partner's display/store name in `full_name`.
        // So we treat Store Name as the primary source of `full_name`.
        const fullNameToSave = storeNameInput || contactNameInput;

        // 1. Collect form data
        const profileUpdate = {
            business_name: storeNameInput,
            full_name: fullNameToSave,
            phone: document.getElementById("phone").value.trim(),
            // API expects "address"; frontend also uses "location" internally
            address: document.getElementById("address").value.trim(),
            location: document.getElementById("address").value.trim(),
            bio: document.getElementById("about").value.trim()
        };

        // 2. Save to backend
        const success = await saveProfile(profileUpdate);
        
        if (success) {
            // Update local data
            Object.assign(partnerData, profileUpdate);
            
            // Update localStorage
            if (profileUpdate.full_name) localStorage.setItem('userName', profileUpdate.full_name);
            setSession({ ...partnerData });
            
            // Update avatars
            if (profileUpdate.full_name) {
                avatarInitial.textContent = profileUpdate.full_name.charAt(0).toUpperCase();
            }
            document.querySelector('.profile-avatar-large')?.textContent = 
                (profileUpdate.business_name || profileUpdate.full_name || 'P').charAt(0).toUpperCase();
            
            showToast("Profile updated successfully!");
        } else {
            showToast("Failed to update profile", "error");
        }
    });
    
    // --- 3. Handle Reset Button ---
    resetProfileBtn.addEventListener("click", () => {
        profileForm.reset();
        partnerData = getSessionSeed();
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