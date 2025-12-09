
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
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".auth-form");
    if (!form) return;

    // ... (Your live validation setup code remains the same here) ...
    // ... (The live validation listeners are correct) ...

    form.addEventListener("submit", (e) => {
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
            e.preventDefault();
            return;
        }

        e.preventDefault();

        // --- ROLE-BASED REDIRECTION LOGIC (IMPROVED) ---
        const role = document.body.getAttribute("data-role");
        
        // Consumer Register is in frontend/consumer/. Needs: ../login/login-consumer.html
        if (role === "consumer-register") {
            window.location.href = "../login/login-consumer.html";
        }
        
        // NGO Register is in frontend/ngo/. Needs: ../../login/login-ngo.html
        else if (role === "ngo-register") {
            window.location.href = "../../login/login-ngo.html"; // CORRECTED PATH
        }
        
        // Partner Register is in frontend/partner/ (Assuming). Needs: ../../login/login-partner.html
        else if (role === "partner-register") {
            window.location.href = "../../login/login-partner.html"; 
        }   
    });
});