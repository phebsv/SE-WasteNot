// === AUTO-LOGIN CHECK ===
if (localStorage.getItem("partnerLoggedIn") === "true") {
    window.location.href = "partner-dashboard.html";
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    form.addEventListener("submit", function(e) {
        e.preventDefault();

        const fullname = document.getElementById("fullname").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (fullname === "" || email === "" || password === "") {
            alert("Please fill in all fields.");
            return;
        }

        // Save login identity
        localStorage.setItem("partnerName", fullname);
        localStorage.setItem("partnerEmail", email);
        localStorage.setItem("partnerLoggedIn", "true");

        // Redirect
        window.location.href = "partner-dashboard.html";
        window.history.forward();
    });
});