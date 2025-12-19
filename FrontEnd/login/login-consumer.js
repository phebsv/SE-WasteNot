// login-consumer.js

document.addEventListener("DOMContentLoaded", () => {
    
    // --- Element References ---
    const loginForm = document.getElementById('consumerLoginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordField = document.getElementById('password');
    
    // --- Backend API Configuration ---
    const API_URL = "http://localhost/wastenot-api/api";

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
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = passwordField.value.trim();

            try {
                showAuthMessage("Logging in...", false);
                
                console.log('Attempting login to:', `${API_URL}/login.php`);
                console.log('Request body:', { email, password: '***' });
                
                const response = await fetch(`${API_URL}/login.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                        // Role is detected automatically by backend
                    })
                });

                console.log('Response received:', response.status, response.statusText);
                const data = await response.json();
                console.log('Backend response:', data);
                console.log('Response status:', response.status);

                if (data.success) {
                    showAuthMessage("Login successful! Redirecting...", false);
                    
                    // Store user data
                    const userRole = data.user.role;
                    localStorage.setItem("authToken", data.token);
                    localStorage.setItem("userId", data.user.id);
                    localStorage.setItem("userName", data.user.full_name);
                    localStorage.setItem("userEmail", data.user.email);
                    localStorage.setItem("userPhone", data.user.phone || "");
                    localStorage.setItem("userAddress", data.user.address || "");
                    localStorage.setItem("userRole", userRole);

                    // Seed role profile cache so profile pages are prefilled (even offline)
                    if (userRole === 'consumer') {
                        const existing = (() => { try { return JSON.parse(localStorage.getItem('consumerSession')) || {}; } catch { return {}; } })();
                        const session = {
                            ...existing,
                            id: data.user.id,
                            fullName: existing.fullName || data.user.full_name || '',
                            email: existing.email || data.user.email || '',
                            phone: existing.phone || data.user.phone || '',
                            address: existing.address || data.user.address || '',
                            prefs: existing.prefs || ''
                        };
                        localStorage.setItem('consumerSession', JSON.stringify(session));
                    }
                    
                    // Set role-specific login flag
                    if (userRole === 'consumer') {
                        localStorage.setItem("consumerLoggedIn", "true");
                    } else if (userRole === 'admin') {
                        localStorage.setItem("adminLoggedIn", "true");
                    } else if (userRole === 'ngo') {
                        localStorage.setItem("ngoLoggedIn", "true");
                    } else if (userRole === 'partner') {
                        localStorage.setItem("partnerLoggedIn", "true");
                    }
                    
                    // Redirect based on role
                    setTimeout(() => {
                        let redirectUrl;
                        switch(userRole) {
                            case 'admin':
                                redirectUrl = "../admin/admin-dashboard.html";
                                break;
                            case 'ngo':
                                redirectUrl = "../ngo/ngo-dashboard.html";
                                break;
                            case 'partner':
                                redirectUrl = "../provider/partner-dashboard.html";
                                break;
                            case 'consumer':
                            default:
                                redirectUrl = "../consumer/consumer-dashboard.html";
                                break;
                        }
                        window.location.href = redirectUrl;
                    }, 1000);
                } else {
                    showAuthMessage(data.message || "Invalid email or password. Please try again.", true);
                }
            } catch (error) {
                console.error('Login error:', error);
                console.error('Error type:', error.name);
                console.error('Error message:', error.message);
                console.error('Full error:', error);
                showAuthMessage("Connection error: " + error.message + ". Please check console (F12).", true);
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