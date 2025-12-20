// // ===== AUTH GUARD (Check if admin is logged in) =====
// if (localStorage.getItem("adminLoggedIn") !== "true") {
//     window.location.href = "login-admin.html";
// }

// Mock Data
const mockProviders = [
    { id: 'P101', name: 'Fresh Foods Inc.', contact: 'Sarah Chen', email: 'sarah@fresh.com', status: 'Active', location: 'City Center' },
    { id: 'P102', name: 'Bakery Delights', contact: 'Tom Wilson', email: 'tom@bakery.com', status: 'Pending', location: 'North District' },
    { id: 'P103', name: 'Meat & Produce Co.', contact: 'Rajesh Nair', email: 'raj@meatco.com', status: 'Suspended', location: 'Industrial Park' },
];

const mockNgos = [
    { id: 'N201', name: 'Community Kitchen', contact: 'Maria Lopez', email: 'maria@ck.org', status: 'Active', area: 'Southside' },
    { id: 'N202', name: 'Hope Relief Foundation', contact: 'David Lee', email: 'david@hope.org', status: 'Pending', area: 'West End' },
    { id: 'N203', name: 'Green Hands Org.', contact: 'Emily Clark', email: 'emily@gh.org', status: 'Active', area: 'Citywide' },
];

const mockCustomers = [
    { id: 'C301', name: 'John Doe', email: 'john@example.com', date: '2025-01-15', status: 'Active' },
    { id: 'C302', name: 'Alice Smith', email: 'alice@test.com', date: '2025-03-22', status: 'Active' },
    { id: 'C303', name: 'Bob Johnson', email: 'bob@mail.com', date: '2025-05-01', status: 'Suspended' },
];

// Map tab names to data arrays
const dataMap = {
    providers: { data: mockProviders, tbodyId: 'providersTbody', render: renderProviders },
    ngos: { data: mockNgos, tbodyId: 'ngosTbody', render: renderNgos },
    customers: { data: mockCustomers, tbodyId: 'customersTbody', render: renderCustomers },
};

let activeTab = 'providers'; // Default active tab

document.addEventListener("DOMContentLoaded", () => {
    
    const tabs = document.querySelectorAll('.tab-btn');
    const searchInput = document.getElementById('userSearch');
    const statusFilter = document.getElementById('statusFilter');

    // --- Tab Switching Logic ---
    tabs.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            if (activeTab === targetTab) return;

            // 1. Update button classes
            document.querySelector('.tab-btn.active').classList.remove('active');
            button.classList.add('active');

            // 2. Update content visibility
            document.querySelector('.tab-content.active').classList.remove('active');
            document.getElementById(targetTab).classList.add('active');

            activeTab = targetTab;
            // Reset filters and render new tab content
            searchInput.value = '';
            statusFilter.value = '';
            filterAndRender();
        });
    });

    // --- Rendering Functions ---
    function createActions(id) {
        return `
            <button class="btn-secondary btn-sm" onclick="viewDetails('${activeTab}', '${id}')">View</button>
            <button class="btn-sm btn-danger" onclick="suspendUser('${activeTab}', '${id}')">Suspend</button>
        `;
    }

    function renderProviders(data) {
        const tbody = document.getElementById('providersTbody');
        tbody.innerHTML = '';
        data.forEach(p => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td>${p.contact}</td>
                <td>${p.email}</td>
                <td><span class="status-badge status-${p.status}">${p.status}</span></td>
                <td>${createActions(p.id)}</td>
            `;
        });
    }

    function renderNgos(data) {
        const tbody = document.getElementById('ngosTbody');
        tbody.innerHTML = '';
        data.forEach(n => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${n.id}</td>
                <td>${n.name}</td>
                <td>${n.contact}</td>
                <td>${n.area}</td>
                <td><span class="status-badge status-${n.status}">${n.status}</span></td>
                <td>${createActions(n.id)}</td>
            `;
        });
    }

    function renderCustomers(data) {
        const tbody = document.getElementById('customersTbody');
        tbody.innerHTML = '';
        data.forEach(c => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${c.id}</td>
                <td>${c.name}</td>
                <td>${c.email}</td>
                <td>${c.date}</td>
                <td><span class="status-badge status-${c.status}">${c.status}</span></td>
                <td>${createActions(c.id)}</td>
            `;
        });
    }

    // --- Filtering Logic ---
    function filterAndRender() {
        const searchText = searchInput.value.toLowerCase();
        const statusText = statusFilter.value;
        const currentData = dataMap[activeTab].data;
        const renderer = dataMap[activeTab].render;

        const filteredData = currentData.filter(user => {
            // Filter 1: Status
            const matchesStatus = !statusText || user.status === statusText;

            // Filter 2: Search (Name, Contact, Email, etc.)
            const searchableFields = Object.values(user).join(' ').toLowerCase();
            const matchesSearch = searchableFields.includes(searchText);

            return matchesStatus && matchesSearch;
        });

        renderer(filteredData);
    }
    
    // --- Global Actions (Mock) ---
    window.viewDetails = (type, id) => {
        alert(`Viewing details for ${type.slice(0, -1)} ID: ${id}`);
    };

    window.suspendUser = (type, id) => {
        if(confirm(`Are you sure you want to suspend ${type.slice(0, -1)} ID: ${id}?`)) {
            // MOCK: Update data in the array and re-render
            const userArray = dataMap[type].data;
            const user = userArray.find(u => u.id === id);
            if (user) user.status = 'Suspended';
            filterAndRender();
            showToast(`User ${id} has been suspended.`, "danger");
        }
    };
    
    // Utility for toasts (Assumes showToast exists)
    function showToast(message, type = "success") {
        const toast = document.createElement('div'); // Mock toast creation
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }

    // --- Event Listeners and Initial Load ---
    searchInput.addEventListener('input', filterAndRender);
    statusFilter.addEventListener('change', filterAndRender);
    
    // Initial render for the default 'providers' tab
    filterAndRender();

    // Logout Handler
    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("adminLoggedIn");
        window.location.href = "login-admin.html";
    });
});