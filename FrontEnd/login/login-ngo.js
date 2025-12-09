// === AUTO-LOGIN CHECK (STAY LOGGED IN) ===
if (localStorage.getItem("ngoLoggedIn") === "true") {
    // Redirect to the dashboard which is in the ../ngo/ folder
    window.location.href = "../ngo/ngo-dashboard.html";
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    // Add password toggle functionality (handled by register-validation.js if included)
    // If register-validation.js is NOT included, you would add the toggle logic here.

    form.addEventListener("submit", function(e) {
        e.preventDefault();

        const organizationName = document.getElementById("organizationName").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (organizationName === "" || email === "" || password === "") {
            alert("Please fill in all fields.");
            return;
        }

        // Save login identity
        localStorage.setItem("ngoName", organizationName);
        localStorage.setItem("ngoEmail", email);
        localStorage.setItem("ngoLoggedIn", "true");

        // Redirect to NGO Dashboard (up one level, then into 'ngo')
        window.location.href = "../ngo/ngo-dashboard.html";
        window.history.forward();
    });
});