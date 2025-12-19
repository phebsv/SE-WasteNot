// ===== AUTH GUARD =====
if (!localStorage.getItem("authToken") || localStorage.getItem("userRole") !== "admin") {
    window.location.href = "../login/login-consumer.html";
}

const USERS_API = 'http://localhost/wastenot-api/api/users.php';
const PRODUCTS_API = 'http://localhost:8081/api/products';

// ===== LOAD ANALYTICS DATA =====
async function loadAnalyticsData() {
    try {
        const token = localStorage.getItem('authToken');
        const [usersRes, productsRes] = await Promise.all([
            fetch(USERS_API, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(PRODUCTS_API)
        ]);
        
        const users = usersRes.ok ? (await usersRes.json()).users || [] : [];
        const products = productsRes.ok ? await productsRes.json() : [];
        
        return {
            totalUsers: users.length,
            totalProviders: users.filter(u => u.role === 'partner').length,
            totalNGOs: users.filter(u => u.role === 'ngo').length,
            totalConsumers: users.filter(u => u.role === 'consumer').length,
            totalDonations: products.filter(p => p.type === 'donation').length,
            donationsClaimed: products.filter(p => p.type === 'donation' && !p.available).length,
            totalProducts: products.length,
            availableProducts: products.filter(p => p.available).length
        };
    } catch (error) {
        console.error('Error loading analytics:', error);
        return {};
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    
    // --- Element References ---
    const timeFilter = document.getElementById('timeFilter');
    const mainKpisContainer = document.getElementById('mainKpis');
    const topProvidersTbody = document.getElementById('topProvidersTbody');
    
    // Load real data
    const analyticsData = await loadAnalyticsData();

    // --- 1. Rendering Functions ---

    function renderKpis(data) {
        mainKpisContainer.innerHTML = '';

        const kpiStructure = [
            { label: 'Total Users', value: data.totalUsers || 0, id: 'statTotalUsers' },
            { label: 'Total Providers', value: data.totalProviders || 0, id: 'statProviders' },
            { label: 'Total NGOs', value: data.totalNGOs || 0, id: 'statNGOs' },
            { label: 'Total Products', value: data.totalProducts || 0, id: 'statProducts', highlight: true },
            { label: 'Donations Posted', value: data.totalDonations || 0, id: 'statDonations' },
            { label: 'Donations Claimed', value: data.donationsClaimed || 0, id: 'statClaimed' },
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
    
    function renderTopProviders(users) {
        topProvidersTbody.innerHTML = '';
        const providers = users.filter(u => u.role === 'partner').slice(0, 5);
        if (providers.length === 0) {
            topProvidersTbody.innerHTML = '<tr><td colspan="2" style="text-align: center; padding: 20px;">No providers found</td></tr>';
            return;
        }
        providers.forEach((p, index) => {
            const row = topProvidersTbody.insertRow();
            row.innerHTML = `
                <td>${p.full_name}</td>
                <td>${p.email}</td>
            `;
        });
    }

    // --- 2. Main Data Loader ---
    async function loadAnalytics() {
        const data = await loadAnalyticsData();
        renderKpis(data);
        
        // Load users for top providers
        const token = localStorage.getItem('authToken');
        const usersRes = await fetch(USERS_API, { headers: { 'Authorization': `Bearer ${token}` } });
        if (usersRes.ok) {
            const usersData = await usersRes.json();
            renderTopProviders(usersData.users || []);
        }
    }

    // --- 3. Event Listeners and Initial Load ---
    timeFilter?.addEventListener('change', () => {
        loadAnalytics();
    });

    // Initial load
    loadAnalytics();
    
    // Logout Handler
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        [
            'authToken',
            'userId',
            'userRole',
            'userName',
            'userEmail',
            'ngoName',
            'consumerLoggedIn',
            'partnerLoggedIn',
            'ngoLoggedIn',
            'adminLoggedIn'
        ].forEach(k => localStorage.removeItem(k));
        sessionStorage.clear();
        window.location.href = "../login/login.html";
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