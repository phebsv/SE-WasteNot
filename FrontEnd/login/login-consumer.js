// === AUTO-LOGIN CHECK (STAY LOGGED IN) ===
// Corrected path: Need to go up one folder, then into the consumer folder.
if (localStorage.getItem("consumerLoggedIn") === "true") {
    window.location.href = "../consumer/consumer-dashboard.html"; // FIX APPLIED HERE
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
        localStorage.setItem("consumerName", fullname);
        localStorage.setItem("consumerEmail", email);
        localStorage.setItem("consumerLoggedIn", "true");

        // Redirect - This path is correct for a script in the 'login' folder.
        window.location.href = "../consumer/consumer-dashboard.html"; 
        window.history.forward();
    });
});