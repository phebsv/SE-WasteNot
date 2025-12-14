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

    // --- Mock User Credentials ---
    const MOCK_CREDENTIAL = "NGO987";
    const MOCK_TEMP_PASSWORD = "ngo_temp123"; // Password sent via email

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
                // --- STEP 0: STANDARD LOGIN (Assuming a user is already set up) ---
                if (inputCredential === MOCK_CREDENTIAL && password === "a_standard_ngo_password") { 
                    showAuthMessage("Login successful! Redirecting to NGO Dashboard...", false);
                    localStorage.setItem("ngoLoggedIn", "true");
                    setTimeout(() => window.location.href = "../ngo/ngo-dashboard.html", 1000);
                } else {
                    showAuthMessage("Invalid credentials.", true);
                }

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