
function showError(input, message) {
    let error = input.parentElement.querySelector(".error-message");
    if (!error) {
        error = document.createElement("div");
        error.className = "error-message";
        input.parentElement.appendChild(error);
    }
    error.innerText = message;
    input.classList.add("input-error");
}

function clearError(input) {
    let error = input.parentElement.querySelector(".error-message");
    if (error) error.innerText = "";
    input.classList.remove("input-error");
}

function addLiveValidation(input, validator) {
    input.addEventListener("input", () => validator(input));
}

function validateEmail(input) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!input.value.trim()) {
        showError(input, "Email is required.");
        return false;
    }
    if (!emailRegex.test(input.value)) {
        showError(input, "Invalid email address.");
        return false;
    }
    clearError(input);
    return true;
}

function validateAccountNumber(input) {
    const accRegex = /^[A-Za-z0-9\-]{4,}$/;

    if (!input) return true; 

    if (!input.value.trim()) {
        showError(input, "Account Number / Org ID required.");
        return false;
    }
    if (!accRegex.test(input.value)) {
        showError(input, "Use at least 4 characters (letters, numbers, dashes).");
        return false;
    }
    clearError(input);
    return true;
}

function validatePassword(input) {
    if (input.value.length < 8) {
        showError(input, "Password must be at least 8 characters.");
        return false;
    }
    clearError(input);
    return true;
}

function validateConfirmPassword(confirmInput, passwordInput) {
    if (confirmInput.value !== passwordInput.value) {
        showError(confirmInput, "Passwords do not match.");
        return false;
    }
    clearError(confirmInput);
    return true;
}

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("toggle-password")) {
        const input = e.target.previousElementSibling;
        input.type = input.type === "password" ? "text" : "password";
        e.target.innerText = input.type === "password" ? "Show" : "Hide";
    }
});
// Backend API Configuration
const API_URL = "http://localhost/wastenot-api/api";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".auth-form");
    if (!form) return;

    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const accountNumber = document.getElementById("accountNumber");
    const terms = document.getElementById("termsConsumer") || document.getElementById("termsNGO") || document.getElementById("termsPartner");

    // Add live validation
    if (email) addLiveValidation(email, validateEmail);
    if (accountNumber) addLiveValidation(accountNumber, validateAccountNumber);
    if (password) addLiveValidation(password, validatePassword);
    if (confirmPassword) {
        addLiveValidation(confirmPassword, (input) => validateConfirmPassword(input, password));
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        let valid = true;

        if (email && !validateEmail(email)) valid = false;
        if (accountNumber && !validateAccountNumber(accountNumber)) valid = false;
        if (password && !validatePassword(password)) valid = false;
        if (confirmPassword && !validateConfirmPassword(confirmPassword, password)) valid = false;
        if (terms && !terms.checked) {
            alert("You must agree to the Terms and Conditions.");
            valid = false;
        }

        if (!valid) {
            return;
        }

        // Determine role from page
        const currentPath = window.location.pathname;
        let role = 'consumer';
        let redirectPath = '../login/login-consumer.html';
        
        if (currentPath.includes('ngo')) {
            role = 'ngo';
            redirectPath = '../../login/login-ngo.html';
        } else if (currentPath.includes('partner')) {
            role = 'partner';
            redirectPath = '../../login/login-partner.html';
        }

        // Prepare registration data
        const registrationData = {
            email: email.value.trim(),
            password: password.value,
            full_name: email.value.split('@')[0], // Default name from email
            role: role,
            phone: '',
            address: ''
        };

        try {
            const response = await fetch(`${API_URL}/register.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registrationData)
            });

            const data = await response.json();

            if (data.success) {
                alert('Registration successful! Please login.');
                window.location.href = redirectPath;
            } else {
                alert(data.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Connection error. Please check if backend is running.');
        }
    });
});