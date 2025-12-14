// login-consumer.js

document.addEventListener("DOMContentLoaded", () => {
    
    // --- Element References ---
    const loginForm = document.getElementById('consumerLoginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordField = document.getElementById('password');
    
    // --- Mock User Credentials ---
    // NOTE: In a real application, credentials would be checked against a server database.
    const MOCK_EMAIL = "consumer@wastenot.com";
    const MOCK_PASSWORD = "password123";

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

    // --- Form Submission Handler ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = passwordField.value.trim();

            if (email === MOCK_EMAIL && password === MOCK_PASSWORD) {
                
                showAuthMessage("Login successful! Redirecting...", false);
                
                // Set flag and redirect to the Consumer Dashboard
                localStorage.setItem("consumerLoggedIn", "true");
                setTimeout(() => {
                    window.location.href = "../consumer/consumer-dashboard.html";
                }, 1000);

            } else {
                showAuthMessage("Invalid email or password. Please try again.", true);
            }
        });
    }

    // --- Toggle Password Visibility ---
    if (togglePassword && passwordField) {
        togglePassword.addEventListener('click', () => {
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            togglePassword.textContent = type === 'password' ? 'Show' : 'Hide';
        });
    }

    // --- Initial Check (Prevent going back to login if already logged in) ---
    if (localStorage.getItem("consumerLoggedIn") === "true") {
        window.location.href = "../consumer/consumer-dashboard.html";
    }

});