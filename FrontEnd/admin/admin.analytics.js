// ===== AUTH GUARD (Check if admin is logged in) =====
if (localStorage.getItem("adminLoggedIn") !== "true") {
    window.location.href = "login-admin.html";
}

document.addEventListener("DOMContentLoaded", () => {
    
    // --- Element References ---
    const timeFilter = document.getElementById('timeFilter');
    const mainKpisContainer = document.getElementById('mainKpis');
    const topProvidersTbody = document.getElementById('topProvidersTbody');
    
    // --- MOCK DATA (Data would change based on the selected timeFilter) ---
    const mockData = {
        '30d': {
            totalDonations: 450,
            donationsClaimed: 380,
            newProviders: 12,
            totalUsers: 1520,
            totalWasteDiverted: '12.5 T', // Tons
            topProviders: [
                { name: 'Fresh Foods Inc.', count: 85 },
                { name: 'Bakery Delights', count: 72 },
                { name: 'MegaStore', count: 60 },
                { name: 'Local Fresh Market', count: 48 },
                { name: 'City Diner', count: 35 },
            ]
        },
        // In a real app, you'd have data objects for '7d', '90d', '12m' too
        // ...
    };

    // --- 1. Rendering Functions ---

    function renderKpis(data) {
        mainKpisContainer.innerHTML = ''; // Clear previous KPIs

        const kpiStructure = [
            { label: 'Donations Posted', value: data.totalDonations, id: 'statTotalDonations' },
            { label: 'Donations Claimed', value: data.donationsClaimed, id: 'statClaimedDonations' },
            { label: 'Waste Diverted (Est.)', value: data.totalWasteDiverted, id: 'statWasteDiverted', highlight: true },
            { label: 'New Providers', value: data.newProviders, id: 'statNewProviders' },
        ];

        kpiStructure.forEach(kpi => {
            const card = document.createElement('div');
            card.className = `kpi-card ${kpi.highlight ? 'kpi-highlight' : ''}`;
            card.innerHTML = `
                <p class="kpi-label">${kpi.label}</p>
                <p class="kpi-value" id="${kpi.id}">${kpi.value}</p>
            `;
            mainKpisContainer.appendChild(card);
        });
    }
    
    function renderTopProviders(providers) {
        topProvidersTbody.innerHTML = '';
        providers.forEach(p => {
            const row = topProvidersTbody.insertRow();
            row.innerHTML = `
                <td>${p.name}</td>
                <td>${p.count}</td>
            `;
        });
    }

    // --- 2. Main Data Loader ---
    function loadAnalytics(timeframe) {
        const data = mockData[timeframe] || mockData['30d']; // Default to 30d mock data

        // Update KPIs
        renderKpis(data);
        
        // Update Top Providers List
        renderTopProviders(data.topProviders);

        // NOTE: In a real application, you would initialize Chart.js/D3.js here
        // e.g., initUserGrowthChart(data.userGrowth);
        // e.g., initDonationVolumeChart(data.donationVolume);

        showToast(`Analytics loaded for ${timeFilter.options[timeFilter.selectedIndex].text}.`, 'info');
    }

    // --- 3. Event Listeners and Initial Load ---
    timeFilter.addEventListener('change', (e) => {
        loadAnalytics(e.target.value);
    });

    // Initial load (default to 30 days)
    loadAnalytics(timeFilter.value);
    
    // Logout Handler
    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("adminLoggedIn");
        window.location.href = "login-admin.html";
    });

    // Utility for toasts 
    function showToast(message, type = "success") {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }
});