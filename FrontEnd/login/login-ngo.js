// login-ngo.js

document.addEventListener("DOMContentLoaded", () => {
    
    // --- Element References ---
    const loginForm = document.getElementById('ngoLoginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordField = document.getElementById('password');
    const newPasswordGroup = document.getElementById('newPasswordGroup');
    const newPasswordField = document.getElementById('newPassword');
    const confirmNewPasswordField = document.getElementById('confirmNewPassword');
    const loginHeading = document.getElementById('loginHeading');
    const loginSubheading = document.getElementById('loginSubheading');
    const loginButton = document.getElementById('loginButton');

    // Check URL for reset parameter (simulates clicking the link in the approval email)
    const urlParams = new URLSearchParams(window.location.search);
    const isFirstTimeLogin = urlParams.get('reset') === 'true';

    let currentStep = isFirstTimeLogin ? 1 : 0; // 0=Normal Login, 1=Temporary Auth, 2=Reset

    // --- API Configuration ---
    const API_URL = 'http://localhost/wastenot-api/api/login.php';

    // --- Utility for showing status messages ---
    function showAuthMessage(message, isError = false) {
        let messageElement = document.getElementById('auth-message');
        
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'auth-message';
            messageElement.classList.add('auth-message');
            loginForm.prepend(messageElement);
        }

        messageElement.textContent = message;
        messageElement.classList.toggle('error', isError);
        messageElement.style.display = 'block';
    }

    // --- Backend Login Function ---
    async function authenticateUser(email, password, role) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role })
            });

            const data = await response.json();
            
            if (data.success) {
                let existingNgoSession = {};
                try {
                    existingNgoSession = JSON.parse(localStorage.getItem('ngoSession')) || {};
                } catch {
                    existingNgoSession = {};
                }

                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userId', data.user.id);
                localStorage.setItem('userRole', data.user.role);
                const displayName = data.user.full_name || data.user.name || '';
                const resolvedEmail = data.user.email || email;

                localStorage.setItem('userName', displayName);
                localStorage.setItem('ngoName', displayName);
                localStorage.setItem('userEmail', resolvedEmail);
                localStorage.setItem('ngoLoggedIn', 'true');

                // Keep NGO session data consistent with the profile page
                const ngoSession = {
                    id: data.user.id,
                    organizationName: displayName || existingNgoSession.organizationName || existingNgoSession.name || '',
                    name: displayName || existingNgoSession.name || existingNgoSession.organizationName || '',
                    email: resolvedEmail,
                    phone: data.user.phone || existingNgoSession.phone || '',
                    address: data.user.address || existingNgoSession.address || '',
                    about: data.user.about || existingNgoSession.about || ''
                };
                localStorage.setItem('ngoSession', JSON.stringify(ngoSession));
                return { success: true, user: data.user };
            } else {
                return { success: false, message: data.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Connection error. Please try again.' };
        }
    }

    // --- UI Update Function ---
    function updateUIForResetStep() {
        if (currentStep === 2) {
            loginHeading.textContent = "Security Check: Reset Password";
            loginSubheading.textContent = "Your temporary password was accepted. Please set a secure, permanent password.";
            loginButton.textContent = "Set New Password";

            // Hide old password field and show new ones
            passwordField.setAttribute('required', false);
            passwordField.parentNode.parentNode.style.display = 'none'; 
            
            newPasswordGroup.style.display = 'block';
            newPasswordField.setAttribute('required', true);
            confirmNewPasswordField.setAttribute('required', true);
        }
    }

    // --- Initial Check and UI Load ---
    if (currentStep === 1) {
        // Run UI update logic after mock login passes (Step 1 -> Step 2 transition)
    }
    updateUIForResetStep(); // Ensure UI reflects the initial state (if reset=true)

    // --- Form Submission Handler ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const inputCredential = document.getElementById('accountID').value.trim();
            const password = passwordField.value.trim();

            if (currentStep === 0) {
                // --- STEP 0: STANDARD LOGIN ---
                const email = inputCredential; // Use email instead of ID
                
                showAuthMessage('Authenticating...', false);
                
                authenticateUser(email, password, 'ngo').then(result => {
                    if (result.success) {
                        showAuthMessage("Login successful! Redirecting to NGO Dashboard...", false);
                        setTimeout(() => window.location.href = "../ngo/ngo-dashboard.html", 1000);
                    } else {
                        showAuthMessage(result.message || "Invalid credentials.", true);
                    }
                }).catch(error => {
                    showAuthMessage('Authentication error. Please try again.', true);
                });

            } else if (currentStep === 1) {
                // --- STEP 1: TEMPORARY PASSWORD AUTHENTICATION ---
                if (inputCredential === MOCK_CREDENTIAL && password === MOCK_TEMP_PASSWORD) {
                    showAuthMessage("Temporary password accepted. Please set your new password now.", false);
                    currentStep = 2; // Move to reset step
                    updateUIForResetStep();
                } else {
                    showAuthMessage("Invalid temporary ID or password.", true);
                }

            } else if (currentStep === 2) {
                // --- STEP 2: PASSWORD RESET ---
                const newPass = newPasswordField.value;
                const confirmPass = confirmNewPasswordField.value;

                if (newPass.length < 8) {
                    showAuthMessage("New password must be at least 8 characters.", true);
                    return;
                }
                if (newPass !== confirmPass) {
                    showAuthMessage("New passwords do not match.", true);
                    return;
                }

                // --- Mock Success Action (Simulate server update) ---
                showAuthMessage("Password updated successfully! Redirecting to dashboard.", false);
                localStorage.setItem("ngoLoggedIn", "true");
                
                setTimeout(() => window.location.href = "../ngo/ngo-dashboard.html", 1000);
            }
        });
    }

    // --- Toggle Password Visibility ---
    if (togglePassword && passwordField) {
        togglePassword.addEventListener('click', () => {
            const currentType = passwordField.getAttribute('type');
            const newType = currentType === 'password' ? 'text' : 'password';

            passwordField.setAttribute('type', newType);
            if (newPasswordField && newPasswordField.parentNode.parentNode.style.display !== 'none') {
                newPasswordField.setAttribute('type', newType);
                confirmNewPasswordField.setAttribute('type', newType);
            }
            togglePassword.textContent = newType === 'password' ? 'Show' : 'Hide';
        });
    }

    // --- Initial Check (Prevent going back to login if already logged in) ---
    if (localStorage.getItem("ngoLoggedIn") === "true" && !isFirstTimeLogin) {
        window.location.href = "../ngo/ngo-dashboard.html";
    }
});