// ===== AUTH GUARD =====
if (!localStorage.getItem("authToken") || localStorage.getItem("userRole") !== "partner") {
    window.location.href = "../login/login-consumer.html";
}

const PRODUCTS_API = 'http://localhost:8081/api/products';
const ORDERS_API = 'http://localhost:8081/api/orders';

// Load partner's impact data
async function loadImpactData() {
    try {
        const userId = localStorage.getItem('userId');
        const [productsRes, ordersRes] = await Promise.all([
            fetch(PRODUCTS_API),
            fetch(ORDERS_API)
        ]);
        
        const allProducts = productsRes.ok ? await productsRes.json() : [];
        const allOrders = ordersRes.ok ? await ordersRes.json() : [];
        
        const myProducts = allProducts.filter(p => p.partnerId == userId);
        const myOrders = allOrders.filter(o => myProducts.some(p => p.id === o.productId));
        
        // Calculate impact metrics
        const totalDonations = myProducts.filter(p => p.type === 'donation').length;
        const totalSold = myOrders.filter(o => o.status === 'completed').length;
        const wasteReduced = myOrders.reduce((sum, o) => sum + (o.quantity || 0), 0) * 0.6;
        const revenue = myOrders.filter(o => o.status === 'completed').reduce((sum, o) => {
            const product = myProducts.find(p => p.id === o.productId);
            return sum + ((product?.price || 0) * (o.quantity || 0));
        }, 0);
        
        return {
            totalDonations,
            totalSold,
            wasteReduced: wasteReduced.toFixed(1),
            co2Saved: (wasteReduced * 1.2).toFixed(1),
            revenue: revenue.toFixed(2)
        };
    } catch (error) {
        console.error('Error loading impact data:', error);
        return {
            totalDonations: 0,
            totalSold: 0,
            wasteReduced: '0',
            co2Saved: '0',
            revenue: '0'
        };
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    // --- Logout and Avatar Setup ---
    const avatarInitial = document.getElementById("avatarInitial");
    const userName = localStorage.getItem('userName');
    if (avatarInitial && userName) {
        avatarInitial.textContent = userName.charAt(0).toUpperCase();
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "../login/login-consumer.html";
        });
    }
    
    // Load impact data from backend
    const impactData = await loadImpactData();

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