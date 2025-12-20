document.addEventListener("DOMContentLoaded", () => {
    // ===== AUTH GUARD =====
    if (localStorage.getItem("partnerLoggedIn") !== "true") {
        window.location.href = "login-partner.html";
    }

    // --- Logout and Avatar Setup (Retained from previous files) ---
    let session = {};
    try {
        session = JSON.parse(localStorage.getItem("partnerSession")) || {};
    } catch {}

    const avatarInitial = document.getElementById("avatarInitial");
    if (avatarInitial && session.name) {
        avatarInitial.textContent = session.name.charAt(0).toUpperCase();
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("partnerLoggedIn");
            localStorage.removeItem("partnerSession");
            window.location.href = "login-partner.html";
        });
    }

    // --- Placeholder Data & Aggregates ---
    // In a real app, these values would be computed from your listings and claims data.
    const weeklyWaste = [4, 10, 5, 2]; // kg
    const categories = {
        "Bread / Pastry": 48.4,
        "Prepared Meals": 32.3,
        "Drinks": 19.3
    };
    const weeklySales = [300, 1000, 500, 200]; // ₱
    const weeklyDonations = [5, 15, 8, 4]; // count

    // Function to replace dummy stats (assuming getInventoryStats exists in partner-data.js)
    function updateKPIs() {
        const stats = window.getInventoryStats ? window.getInventoryStats() : { 
            totalItems: 32, 
            wasteReducedKg: 18.4, 
            co2SavedKg: 23,
            totalRevenue: "₱2,100" // Simplified for display
        };

        // Note: The HTML hardcodes "donationCount" and "revenue", using the existing IDs
        document.getElementById("wasteKg").innerText = `${stats.wasteReducedKg} kg`;
        document.getElementById("co2Saved").innerText = `${stats.co2SavedKg} kg`;
        document.getElementById("donationCount").innerText = stats.totalItems; // Using totalItems as donation count placeholder
        document.getElementById("revenue").innerText = stats.totalRevenue;
    }

    // --- CHART CONFIGURATION ---

    // 1. Waste Bar Chart
    new Chart(document.getElementById("wasteBar"), {
        type: "bar",
        data: {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            datasets: [{
                label: "Waste Reduced (kg)",
                data: weeklyWaste,
                backgroundColor: "#15803d",
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Kilograms' } },
            },
            plugins: { legend: { display: false }, title: { display: false } }
        }
    });

    // 2. Category Pie Chart
    new Chart(document.getElementById("categoryPie"), {
        type: "pie",
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: ["#15803d", "#7fd16b", "#bfe0b8", "#f4faef"]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'right' },
                title: { display: false }
            }
        }
    });

    // 3. Sales Line Chart
    new Chart(document.getElementById("salesLine"), {
        type: "line",
        data: {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            datasets: [{
                label: "Revenue (₱)",
                data: weeklySales,
                borderColor: "#15803d",
                tension: 0.4,
                fill: true,
                backgroundColor: "rgba(21, 128, 61, 0.1)"
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Revenue (₱)' } },
            },
            plugins: { legend: { display: false }, title: { display: false } }
        }
    });

    // 4. Donations Bar Chart
    new Chart(document.getElementById("donationBar"), {
        type: "bar",
        data: {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            datasets: [{
                label: "Donation Count",
                data: weeklyDonations,
                backgroundColor: "#7fd16b",
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Count' } },
            },
            plugins: { legend: { display: false }, title: { display: false } }
        }
    });

    // --- INITIALIZATION ---
    updateKPIs();
});

// Global function stub for PDF export
function exportPDF() {
    alert("Impact Report exported as PDF!");
    // Logic for generating and downloading the report would go here
}